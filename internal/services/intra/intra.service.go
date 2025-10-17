package intraservice

import (
	"context"

	configservice "base-website/internal/services/config"
	"base-website/pkg/intraclient"

	"github.com/samber/do"
)

type IntraService *intraService

type intraService struct {
	*intraclient.Client
}

func NewProvider() func(i *do.Injector) (IntraService, error) {
	return func(i *do.Injector) (IntraService, error) {
		return New(do.MustInvoke[configservice.ConfigService](i))
	}
}

func New(configService configservice.ConfigService) (IntraService, error) {
	config := configService.GetConfig()
	intraClient, err := intraclient.NewClient(context.Background(), &intraclient.ClientConfig{
		ClientID:     config.IntraClientID,
		ClientSecret: config.IntraClientSecret,
	})
	if err != nil {
		return nil, err
	}
	return &intraService{
		Client: intraClient,
	}, nil
}
