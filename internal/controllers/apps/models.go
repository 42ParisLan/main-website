package appsccontroller

import (
	appsmodels "base-website/internal/services/apps/models"
	"base-website/pkg/paging"
)

type appInput struct {
	Body *appsmodels.AppPayload
}

type appOutput struct {
	Body *appsmodels.App
}

type appByIDInput struct {
	ID string `path:"id" description:"The ID of the app to get."`
}

type appSearchInput struct {
	appsmodels.SearchAppsParams
}

type appSearchOutput struct {
	Body *paging.Response[*appsmodels.App] `nullable:"false"`
}

type appUserAppsInput struct {
	ID int `path:"id" description:"The ID of the user to get apps for."`
}

type appUpdateInput struct {
	ID string `path:"id" description:"The ID of the app to update."`
	appInput
}
