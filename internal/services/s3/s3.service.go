package s3service

import (
	"context"
	"io"
	"net/url"
	"time"

	configservice "base-website/internal/services/config"
	"base-website/pkg/logger"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/samber/do"
)

type S3Service interface {
	Client() *minio.Client
	EnsureBucket(ctx context.Context) error
	UploadObject(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) error
	PresignedGet(ctx context.Context, objectName string, expiry time.Duration) (string, error)
}

type s3 struct {
	client *minio.Client
	cfg    configservice.Config
	logger *logger.Logger
}

func NewProvider() func(i *do.Injector) (S3Service, error) {
	return func(i *do.Injector) (S3Service, error) {
		return New(do.MustInvoke[configservice.ConfigService](i))
	}
}

func New(configService configservice.ConfigService) (S3Service, error) {
	cfg := configService.GetConfig()

	minioClient, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, err
	}

	s := &s3{
		client: minioClient,
		cfg:    cfg,
		logger: logger.New().WithContext("S3Service"),
	}

	// try ensure bucket at startup (best-effort)
	go func() {
		_ = s.EnsureBucket(context.Background())
	}()

	return s, nil
}

func (s *s3) Client() *minio.Client {
	return s.client
}

func (s *s3) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.cfg.MinioBucket)
	if err != nil {
		return err
	}
	if !exists {
		return s.client.MakeBucket(ctx, s.cfg.MinioBucket, minio.MakeBucketOptions{})
	}
	return nil
}

func (s *s3) UploadObject(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(ctx, s.cfg.MinioBucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (s *s3) PresignedGet(ctx context.Context, objectName string, expiry time.Duration) (string, error) {
	reqParams := make(url.Values)
	u, err := s.client.PresignedGetObject(ctx, s.cfg.MinioBucket, objectName, expiry, reqParams)
	if err != nil {
		return "", err
	}
	return u.String(), nil
}
