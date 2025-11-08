package consentscontroller

import (
	"context"
	"strconv"

	"base-website/internal/security"
	consentsservice "base-website/internal/services/consents"
	consentsmodels "base-website/internal/services/consents/models"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type consentsController struct {
	consentsService consentsservice.ConsentService
}

func Init(api huma.API, injector *do.Injector) {
	consentsController := &consentsController{
		consentsService: do.MustInvoke[consentsservice.ConsentService](injector),
	}
	consentsController.Register(api)
}

func (ctrl *consentsController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/consents/{id}",
		Summary:     "Get Consent by ID",
		Description: `This endpoint is used to get a consent by its ID.`,
		Tags:        []string{"Consents"},
		OperationID: "getConsentByID",
		Security:    security.WithAuth("security"),
	}, ctrl.getConsentByID)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/consents/{id}",
		Summary:     "Delete Consent",
		Description: `This endpoint is used to delete a consent by its ID.`,
		Tags:        []string{"Consents"},
		OperationID: "deleteConsent",
		Security:    security.WithAuth("security"),
	}, ctrl.deleteConsent)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/consents",
		Summary:     "Search Consents",
		Description: `This endpoint is used to search consents.`,
		Tags:        []string{"Consents"},
		OperationID: "searchConsents",
		Security:    security.WithAuth("security"),
	}, ctrl.searchConsents)

	huma.Register(api, huma.Operation{
		Path:        "/me/consents",
		Method:      "GET",
		Summary:     "Get my consents",
		Description: `This endpoint is used to get the consents of the current user.`,
		Tags:        []string{"Consents"},
		OperationID: "getMyConsents",
		Security:    security.WithAuth("profile"),
	}, ctrl.getMyConsents)

	huma.Register(api, huma.Operation{
		Path:        "/apps/{app_id}/me/consent",
		Method:      "GET",
		Summary:     "Get my consent for an app",
		Description: `This endpoint is used to get the consent of the current user for an app.`,
		Tags:        []string{"Consents", "Apps"},
		OperationID: "getMyConsentForApp",
		Security:    security.WithAuth("profile"),
	}, ctrl.getMyConsentForApp)

}

func (ctrl *consentsController) getConsentByID(
	ctx context.Context,
	input *consentByIDInput,
) (*oneConsentOutput, error) {
	consent, err := ctrl.consentsService.Get(ctx, input.ID)
	if err != nil {
		return nil, err
	}
	return &oneConsentOutput{
		Body: consent,
	}, nil
}

func (ctrl *consentsController) searchConsents(
	ctx context.Context,
	input *searchConsentsInput,
) (*consentsOutput, error) {
	result, err := ctrl.consentsService.Search(ctx, &input.SearchConsentsParams)
	if err != nil {
		return nil, err
	}
	return &consentsOutput{
		Body: result,
	}, nil
}

func (ctrl *consentsController) getMyConsents(
	ctx context.Context,
	input *struct{},
) (*consentsOutput, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	result, err := ctrl.consentsService.Search(ctx, &consentsmodels.SearchConsentsParams{
		UserID: strconv.Itoa(userID),
		Input: paging.Input{
			Order: "asc",
		},
	})
	if err != nil {
		return nil, err
	}
	return &consentsOutput{
		Body: result,
	}, nil
}

func (ctrl *consentsController) getMyConsentForApp(
	ctx context.Context,
	input *getMyConsentForAppInput,
) (*oneConsentOutput, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	result, err := ctrl.consentsService.Search(ctx, &consentsmodels.SearchConsentsParams{
		UserID:        strconv.Itoa(userID),
		ApplicationID: input.AppID,
		Input: paging.Input{
			Order: "asc",
		},
	})
	if err != nil {
		return nil, err
	}
	if len(result.Items) == 0 {
		return nil, huma.Error404NotFound("No consent found for this app")
	}
	return &oneConsentOutput{
		Body: result.Items[0],
	}, nil
}

func (ctrl *consentsController) deleteConsent(
	ctx context.Context,
	input *consentByIDInput,
) (*struct{}, error) {
	err := ctrl.consentsService.Delete(ctx, input.ID)
	if err != nil {
		return nil, err
	}
	return &struct{}{}, nil
}
