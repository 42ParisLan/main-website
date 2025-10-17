package controllers

import (
	authcontroller "base-website/internal/controllers/auth"
	envcontroller "base-website/internal/controllers/env"
	rbaccrontroller "base-website/internal/controllers/rbac"
	userscontroller "base-website/internal/controllers/users"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/autopatch"
	"github.com/samber/do"
)

// Every controller must have a function that initializes it
type controllerInitFunc func(api huma.API, injector *do.Injector)

// controllersList returns a list of all controllers init functions
func controllersList() []controllerInitFunc {
	return []controllerInitFunc{
		authcontroller.Init,
		userscontroller.Init,
		rbaccrontroller.Init,
		envcontroller.Init,
	}
}

// ControllersInit initializes all controllers
func ControllersInit(api huma.API, injector *do.Injector) error {
	controllerList := controllersList()
	for _, controller := range controllerList {
		controller(api, injector)
	}

	autopatch.AutoPatch(api)
	return nil
}
