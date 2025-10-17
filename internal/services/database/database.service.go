package databaseservice

import (
	"context"
	"fmt"

	"base-website/ent"
	configservice "base-website/internal/services/config"
	"base-website/pkg/logger"

	_ "github.com/lib/pq" // postgres driver
	"github.com/samber/do"
)

type DatabaseService *ent.Client

func NewProvider() func(i *do.Injector) (DatabaseService, error) {
	return func(i *do.Injector) (DatabaseService, error) {
		return New(do.MustInvoke[configservice.ConfigService](i))
	}
}

// New creates a new instance of the database service.
func New(configService configservice.ConfigService) (DatabaseService, error) {
	logger := logger.New().WithContext("DatabaseService")
	config := configService.GetConfig()

	logger.Info("Connecting to database host=%s port=%s user=%s dbname=%s",
		config.DBHost,
		config.DBPort,
		config.DBUser,
		config.DBName,
	)
	client, err := ent.Open(
		"postgres",
		fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			config.DBHost,
			config.DBPort,
			config.DBUser,
			config.DBPass,
			config.DBName,
		),
	)
	if err != nil {
		return nil, err
	}
	// test connection\
	err = client.Ping(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Connected to database")
	return client, nil
}
