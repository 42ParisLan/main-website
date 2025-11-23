package invitationscontroller

import (
	"base-website/internal/security"
	invitationsservice "base-website/internal/services/invitations"
	invitationsmodels "base-website/internal/services/invitations/models"
	pubsubservice "base-website/internal/services/pubsub"
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type invitationController struct {
	invitationsService invitationsservice.InvitationsService
	pubsubService      pubsubservice.PubSubService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &invitationController{
		invitationsService: do.MustInvoke[invitationsservice.InvitationsService](injector),
		pubsubService:      do.MustInvoke[pubsubservice.PubSubService](injector),
	}
	authController.Register(api)
}

func (ctrl *invitationController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/teams/{id}/invitations",
		Summary:     "Get Invitations For Team",
		Description: `This endpoint is used to get invitations that belong to a team.`,
		Tags:        []string{"Invitations"},
		OperationID: "getInvitationsForTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.getInvitationsForTeam)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/teams/{id}/invitations",
		Summary:     "Create Invitation For Team",
		Description: `This endpoint is used to create invitation that belong to a team.`,
		Tags:        []string{"Invitations"},
		OperationID: "createInvitationForTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.createInvitationForTeam)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/invitations/{id}",
		Summary:     "Delete Invitation",
		Description: `This endpoint is used to delete an invitation.`,
		Tags:        []string{"Invitations"},
		OperationID: "deleteInvitation",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteInvitation)

	// huma.Register(api, huma.Operation{
	// 	Method:      "POST",
	// 	Path:        "/invitations/{id}/accept",
	// 	Summary:     "Accept An Invitation",
	// 	Description: `This endpoint is used to accept an invitation.`,
	// 	Tags:        []string{"Invitations"},
	// 	OperationID: "acceptInvitation",
	// 	Security:    security.WithAuth("profile"),
	// }, ctrl.acceptInvitation)

	// huma.Register(api, huma.Operation{
	// 	Method:      "GET",
	// 	Path:        "/users/{id}/invitations",
	// 	Summary:     "Get Invitations For User",
	// 	Description: `This endpoint is used to get invitations that belong to a user.`,
	// 	Tags:        []string{"Invitations"},
	// 	OperationID: "getInvitationsForUser",
	// 	Security:    security.WithAuth("profile"),
	// }, ctrl.getInvitationsForUser)
}

func (ctrl *invitationController) getInvitationsForTeam(
	ctx context.Context,
	input *invitationsmodels.ListInvitationsParams,
) (*multipleInvitationsOutput, error) {
	result, err := ctrl.invitationsService.ListInvitationsForTeam(ctx, input)
	if err != nil {
		return nil, err
	}
	return &multipleInvitationsOutput{
		Body: result,
	}, nil
}

func (ctrl *invitationController) createInvitationForTeam(
	ctx context.Context,
	input *createInvitationInput,
) (*oneInvitationOutput, error) {
	result, err := ctrl.invitationsService.CreateInvitationForTeam(ctx, input.TeamID, input.Body)
	if err != nil {
		return nil, err
	}
	return &oneInvitationOutput{
		Body: result,
	}, nil
}

func (ctrl *invitationController) deleteInvitation(
	ctx context.Context,
	input *invitationIDInput,
) (*BodyMessage, error) {
	err := ctrl.invitationsService.DeleteInvitation(ctx, input.InvitationID)
	if err != nil {
		return nil, err
	}
	return &BodyMessage{
		Body: "invitation succefully deleted",
	}, nil
}
