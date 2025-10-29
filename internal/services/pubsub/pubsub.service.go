package pubsubservice

import (
	"context"

	configservice "base-website/internal/services/config"
	"base-website/pkg/logger"

	"github.com/samber/do"
	"github.com/valkey-io/valkey-go"
)

type PubSubService interface {
	Publish(ctx context.Context, channel string, message []byte) error
	Subscribe(ctx context.Context, channel string, handler func(message []byte) error) error
}

type valkeyService struct {
	valkeyClient valkey.Client
	logger       *logger.Logger
}

func NewProvider() func(i *do.Injector) (PubSubService, error) {
	return func(i *do.Injector) (PubSubService, error) {
		return New(do.MustInvoke[configservice.ConfigService](i))
	}
}

func New(configService configservice.ConfigService) (PubSubService, error) {
	config := configService.GetConfig()
	valkeyClient, err := valkey.NewClient(valkey.MustParseURL(config.ValkeyAddress))
	if err != nil {
		return nil, err
	}
	return &valkeyService{
		valkeyClient: valkeyClient,
		logger:       logger.New().WithContext("PubSubService"),
	}, nil
}

func (s *valkeyService) Publish(ctx context.Context, channel string, message []byte) error {
	return s.valkeyClient.Do(ctx, s.valkeyClient.B().
		Publish().
		Channel(channel).
		Message(string(message)).
		Build()).
		Error()
}

func (s *valkeyService) Subscribe(ctx context.Context, channel string, handler func(message []byte) error) error {
	return s.valkeyClient.Receive(ctx, s.valkeyClient.B().Subscribe().Channel(channel).Build(), func(msg valkey.PubSubMessage) {
		handler([]byte(msg.Message))
	})
}
