package envcontroller

import (
	"context"

	configservice "base-website/internal/services/config"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type envController struct {
	config configservice.Config
}

func Init(api huma.API, injector *do.Injector) {
	controller := &envController{
		config: do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
	}
	controller.Register(api)
}

func (ctrl *envController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/env",
		Summary:     "Frontend Env Vars",
		Description: "Returns frontend environment variables needed for OAuth",
		Tags:        []string{"Env"},
	}, ctrl.getEnv)
}

func (ctrl *envController) getEnv(
	ctx context.Context,
	input *struct{},
) (*getEnv, error) {
	return &getEnv{
		Body: envResponse{
			OAuthAuthorizeURL: "https://api.intra.42.fr/oauth/authorize",
			OAuthClientID:     ctrl.config.IntraClientID,
		},
	}, nil
}
