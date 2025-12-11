package invitationscontroller

import (
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	invitationsservice "base-website/internal/services/invitations"
	invitationsmodels "base-website/internal/services/invitations/models"
	pubsubservice "base-website/internal/services/pubsub"
	"context"
	"encoding/json"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/sse"
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
	sse.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me/invitations/live",
		Summary:     "Live invitations stream",
		Description: `Server-Sent Events stream that first sends the latest invitations, then pushes new invitations in real-time.`,
		Tags:        []string{"Invitations"},
		OperationID: "liveInvitations",
		Security:    security.WithAuth("profile"),
	}, map[string]any{
		"message": lightmodels.Invitation{},
	}, ctrl.liveInvitations)

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

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/invitations/{id}/accept",
		Summary:     "Accept An Invitation",
		Description: `This endpoint is used to accept an invitation.`,
		Tags:        []string{"Invitations"},
		OperationID: "acceptInvitation",
		Security:    security.WithAuth("profile"),
	}, ctrl.acceptInvitation)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me/invitations",
		Summary:     "Get Invitations For Me",
		Description: `This endpoint is used to get invitations that belong to a user.`,
		Tags:        []string{"Invitations"},
		OperationID: "getInvitationsForMe",
		Security:    security.WithAuth("profile"),
	}, ctrl.getInvitationsForMe)
}

func (ctrl *invitationController) getInvitationsForTeam(
	ctx context.Context,
	input *getInvitationForTeam,
) (*multipleInvitationsOutput, error) {
	result, err := ctrl.invitationsService.ListInvitationsForTeam(ctx, input.TeamID, &input.ListInvitationsParams)
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

func (ctrl *invitationController) acceptInvitation(
	ctx context.Context,
	input *invitationIDInput,
) (*BodyMessage, error) {
	err := ctrl.invitationsService.AcceptInvitation(ctx, input.InvitationID)
	if err != nil {
		return nil, err
	}
	return &BodyMessage{
		Body: "invitation succefully accepted",
	}, nil
}

func (ctrl *invitationController) getInvitationsForMe(
	ctx context.Context,
	input *invitationsmodels.ListInvitationsParams,
) (*multipleInvitationsOutput, error) {
	result, err := ctrl.invitationsService.ListInvitationsForMe(ctx, input)
	if err != nil {
		return nil, err
	}
	return &multipleInvitationsOutput{
		Body: result,
	}, nil
}

func (ctrl *invitationController) liveInvitations(
	ctx context.Context,
	input *struct{},
	send sse.Sender,
) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return
	}

	// Send initial batch (latest 10 invitations for the current user)
	initial, err := ctrl.invitationsService.ListLastInvitationsForMe(ctx, 3)
	if err == nil && initial != nil {
		for _, inv := range initial {
			if inv != nil {
				_ = send.Data(inv)
			}
		}
	}

	// Subscribe to user-specific invitation channel
	_ = ctrl.pubsubService.Subscribe(ctx, fmt.Sprintf("Invitation:%d", userID), func(message []byte) error {
		var invitation lightmodels.Invitation
		if err := json.Unmarshal(message, &invitation); err != nil {
			return err
		}

		return send.Data(invitation)
	})
}
