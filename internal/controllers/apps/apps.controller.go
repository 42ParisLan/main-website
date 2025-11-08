package appsccontroller

import (
	"context"
	"strconv"

	"base-website/internal/security"
	appsservice "base-website/internal/services/apps"
	appsmodels "base-website/internal/services/apps/models"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type appsController struct {
	appsService appsservice.AppsService
}

func Init(api huma.API, injector *do.Injector) {
	controller := &appsController{
		appsService: do.MustInvoke[appsservice.AppsService](injector),
	}
	controller.Register(api)
}

func (ctrl *appsController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/apps",
		Summary:     "Create App",
		Description: `This endpoint is used to create a new app. **Users only.**`,
		Tags:        []string{"Apps"},
		OperationID: "createApp",
		Security:    security.WithAuth("security"),
	}, ctrl.create)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/apps/{id}",
		Summary:     "Get App by ID",
		Description: `This endpoint is used to get an app by its ID. **Users only.**`,
		Tags:        []string{"Apps"},
		OperationID: "getAppByID",
		Security:    security.WithAuth("security"),
	}, ctrl.get)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/apps",
		Summary:     "Search Apps",
		Description: `This endpoint is used to search apps.`,
		Tags:        []string{"Apps"},
		OperationID: "searchApps",
		Security:    security.WithAuth("profile"),
	}, ctrl.search)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/users/{id}/apps",
		Summary:     "Get User Apps",
		Description: `This endpoint is used to get all apps for a user by their ID. **Users only.**`,
		Tags:        []string{"Apps", "Users"},
		OperationID: "getUserApps",
		Security:    security.WithAuth("profile"),
	}, ctrl.getUserApps)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me/apps",
		Summary:     "Get My Apps",
		Description: `This endpoint is used to get all apps for the current user. **Users only.**`,
		Tags:        []string{"Apps", "Users"},
		OperationID: "getMyApps",
		Security:    security.WithAuth("profile"),
	}, ctrl.getMeApps)

	huma.Register(api, huma.Operation{
		Method:      "PUT",
		Path:        "/apps/{id}",
		Summary:     "Update App",
		Description: `This endpoint is used to update an app by its ID. **Users only.**`,
		Tags:        []string{"Apps"},
		OperationID: "updateApp",
		Security:    security.WithAuth("security"),
	}, ctrl.update)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/apps/{id}",
		Summary:     "Delete App",
		Description: `This endpoint is used to delete an app by its ID. **Users only.**`,
		Tags:        []string{"Apps"},
		OperationID: "deleteApp",
		Security:    security.WithAuth("security"),
	}, ctrl.delete)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/apps/{id}/rotate-secret",
		Summary:     "Rotate App Secret",
		Description: `This endpoint is used to rotate an app's secret by its ID. **Users only.**`,
		Tags:        []string{"Apps"},
		OperationID: "rotateAppSecret",
		Security:    security.WithAuth("security"),
	}, ctrl.rotateSecret)
}

func (ctrl *appsController) create(ctx context.Context, input *appInput) (*appOutput, error) {
	app, err := ctrl.appsService.Create(ctx, *input.Body)
	if err != nil {
		return nil, err
	}

	return &appOutput{Body: app}, nil
}

func (ctrl *appsController) get(ctx context.Context, input *appByIDInput) (*appOutput, error) {
	app, err := ctrl.appsService.Get(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	return &appOutput{Body: app}, nil
}

func (ctrl *appsController) search(
	ctx context.Context,
	input *appSearchInput,
) (*appSearchOutput, error) {
	result, err := ctrl.appsService.Search(ctx, input.SearchAppsParams)
	if err != nil {
		return nil, err
	}

	return &appSearchOutput{Body: result}, nil
}

func (ctrl *appsController) getUserApps(
	ctx context.Context,
	input *appUserAppsInput,
) (*appSearchOutput, error) {
	result, err := ctrl.appsService.Search(
		ctx,
		appsmodels.SearchAppsParams{OwnerID: strconv.Itoa(input.ID)},
	)
	if err != nil {
		return nil, err
	}

	return &appSearchOutput{Body: result}, nil
}

func (ctrl *appsController) getMeApps(
	ctx context.Context,
	input *struct{},
) (*appSearchOutput, error) {
	userId, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	result, err := ctrl.appsService.Search(
		ctx,
		appsmodels.SearchAppsParams{OwnerID: strconv.Itoa(userId)},
	)
	if err != nil {
		return nil, err
	}

	return &appSearchOutput{Body: result}, nil
}

func (ctrl *appsController) update(ctx context.Context, input *appUpdateInput) (*appOutput, error) {
	app, err := ctrl.appsService.Update(ctx, input.ID, *input.Body)
	if err != nil {
		return nil, err
	}

	return &appOutput{Body: app}, nil
}

func (ctrl *appsController) delete(ctx context.Context, input *appByIDInput) (*struct{}, error) {
	err := ctrl.appsService.Delete(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (ctrl *appsController) rotateSecret(
	ctx context.Context,
	input *appByIDInput,
) (*appOutput, error) {
	app, err := ctrl.appsService.RotateSecret(ctx, input.ID)
	if err != nil {
		return nil, err
	}

	return &appOutput{Body: app}, nil
}
