package openidservice

import (
	"crypto/sha256"
	"fmt"
	"io"
	"log/slog"
	"time"

	"github.com/samber/do"
	"github.com/zitadel/oidc/v3/pkg/op"
	"golang.org/x/text/language"

	"base-website/ent"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	"base-website/internal/services/openid/storage"
)

const (
	pathLoggedOut = "/logged-out"
)

type OpenIDService op.OpenIDProvider

type openIDService struct {
	op.OpenIDProvider
}

func NewProvider() func(i *do.Injector) (OpenIDService, error) {
	return func(injector *do.Injector) (OpenIDService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](injector),
			do.MustInvoke[databaseservice.DatabaseService](injector),
		)
	}
}

func New(
	configService configservice.ConfigService,
	databaseService databaseservice.DatabaseService,
) (OpenIDService, error) {
	config := configService.GetConfig()
	storage, err := storage.NewStorage(
		(*ent.Client)(databaseService),
		&config,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenID storage: %w", err)
	}
	key := sha256.Sum256([]byte(config.JWTSecret))
	opConfig := &op.Config{
		CryptoKey:                key,
		DefaultLogoutRedirectURI: pathLoggedOut,
		CodeMethodS256:           true,
		AuthMethodPost:           true,
		AuthMethodPrivateKeyJWT:  false,
		GrantTypeRefreshToken:    true,
		RequestObjectSupported:   true,
		SupportedUILocales:       []language.Tag{language.English},
		DeviceAuthorization: op.DeviceAuthorizationConfig{
			Lifetime:     5 * time.Minute,
			PollInterval: 5 * time.Second,
			UserFormPath: "/device",
			UserCode:     op.UserCodeBase20,
		},
	}
	provider, err := op.NewProvider(
		opConfig,
		storage,
		op.StaticIssuer(config.OpenIDIssuer),
		op.WithAllowInsecure(),
		op.WithLogger(slog.New(slog.NewJSONHandler(io.Discard, nil))),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create OpenID provider: %w", err)
	}
	return &openIDService{
		OpenIDProvider: provider,
	}, nil
}
