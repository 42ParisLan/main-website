package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"base-website/internal/controllers"
	"base-website/internal/middlewares"
	"base-website/internal/openapi"
	"base-website/internal/services"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	openidservice "base-website/internal/services/openid"
	rbacservice "base-website/internal/services/rbac"
	"base-website/pkg/logger"
	"base-website/spa"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/samber/do"

	_ "github.com/danielgtaylor/huma/v2/formats/cbor"
)

func main() {
	apiBootstrap()
}

// apiBootstrap initializes the API server
func apiBootstrap() {
	loggerAPIBootstrap := logger.New().WithContext("APIBootstrap")
	injector := do.New()
	err := services.InitServices(injector)
	if err != nil {
		loggerAPIBootstrap.Fatal("Failed to initialize services: %v", err)
	}

	config := do.MustInvoke[configservice.ConfigService](injector).GetConfig()
	logger.SetGlobalLevel(
		logger.LevelFromString(config.LogLevel),
	)

	loggerAPIBootstrap.Info("Services initialized")

	router := chi.NewRouter()
	spa, err := spa.NewSPAHandler("public", "index.html", spa.SPAFS)
	if err != nil {
		loggerAPIBootstrap.Fatal("Failed to initialize SPA handler: %v", err)
	}

	router.Handle("/*", spa)

	router.Mount(fmt.Sprintf("%s/openid", config.APIPrefix), http.Handler(
		do.MustInvoke[openidservice.OpenIDService](injector),
	))
	router.Route(config.APIPrefix, apiMux(loggerAPIBootstrap, injector))

	loggerAPIBootstrap.Info("listening HTTP on :%d", config.HTTPPort)
	err = http.ListenAndServe(fmt.Sprintf(":%d", config.HTTPPort), router)
	if err != nil {
		loggerAPIBootstrap.Fatal("Failed to start server: %v", err)
	}
}

// apiMux returns a function that initializes the API routes
func apiMux(
	loggerAPIBootstrap *logger.Logger,
	injector *do.Injector,
) func(chi.Router) {
	return func(router chi.Router) {
		config := do.MustInvoke[configservice.ConfigService](injector).GetConfig()
		humaConfig := huma.DefaultConfig("42Lan API", "1.2.0")
		humaConfig = openapi.WithAuthSchemes(humaConfig)
		humaConfig = openapi.WithOverviewDoc(humaConfig)
		humaConfig = openapi.WithServers(humaConfig, config)
		api := humachi.New(router, humaConfig)
		api.UseMiddleware(
			middlewares.CorsMiddleware(),
			middlewares.NewAuthMiddleware(
				api,
				do.MustInvoke[configservice.ConfigService](injector),
				do.MustInvoke[databaseservice.DatabaseService](injector),
				do.MustInvoke[openidservice.OpenIDService](injector),
			),
			middlewares.NewRbacMiddleware(
				api,
				do.MustInvoke[databaseservice.DatabaseService](injector),
				do.MustInvoke[rbacservice.RBACService](injector),
			),
			middlewares.RequestLoggerMiddleware(
				logger.New().WithContext("ReqLogMiddleware"),
			))

		err := controllers.ControllersInit(api, injector)
		if err != nil {
			log.Fatalf("Failed to initialize controllers: %v", err)
		}

		loggerAPIBootstrap.Info("Controllers initialized")

		router.Get("/docs", openapi.ScalarDocHandler(config))

		// Generate api spec after routes are initialized
		yaml, err := api.OpenAPI().DowngradeYAML()
		if err != nil {
			loggerAPIBootstrap.Error("error generating OpenAPI spec: %v", err)
			return
		}

		specFilePath := "./docs/42lan-api.yaml"
		err = os.MkdirAll(filepath.Dir(specFilePath), 0755)
		if err != nil {
			loggerAPIBootstrap.Error("Error creating docs directory: %v", err)
			return
		}

		err = os.WriteFile(specFilePath, yaml, 0644)
		if err != nil {
			loggerAPIBootstrap.Error("Error writing OpenAPI spec to file: %v", err)
			return
		}

		loggerAPIBootstrap.Info("OpenAPI spec written to %s", specFilePath)
	}
}
