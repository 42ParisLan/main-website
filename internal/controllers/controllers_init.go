package controllers

import (
	appsccontroller "base-website/internal/controllers/apps"
	authcontroller "base-website/internal/controllers/auth"
	consentscontroller "base-website/internal/controllers/consents"
	envcontroller "base-website/internal/controllers/env"
	rbaccrontroller "base-website/internal/controllers/rbac"
	teamscontroller "base-website/internal/controllers/teams"
	tournamentscontroller "base-website/internal/controllers/tournaments"
	userscontroller "base-website/internal/controllers/users"
	votescontroller "base-website/internal/controllers/votes"

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
		votescontroller.Init,
		tournamentscontroller.Init,
		teamscontroller.Init,
		consentscontroller.Init,
		appsccontroller.Init,
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
