package openapi

import (
	configservice "base-website/internal/services/config"

	"github.com/danielgtaylor/huma/v2"
)

func WithServers(humaConfig huma.Config, config configservice.Config) huma.Config {
	humaConfig.Servers = []*huma.Server{
		{
			URL:         config.APIPrefix,
			Description: "Current Server",
		},
	}
	return humaConfig
}
