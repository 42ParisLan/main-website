package invitationscontroller

import (
	"base-website/internal/lightmodels"
	invitationsmodels "base-website/internal/services/invitations/models"
	"base-website/pkg/paging"
)

type BodyMessage struct {
	Body string `required:"true"`
}

type multipleInvitationsOutput struct {
	Body *paging.Response[*lightmodels.Invitation] `nullable:"false"`
}

type createInvitationInput struct {
	TeamID int `path:"id" required:"true" example:"42" description:"The team ID"`

	Body invitationsmodels.CreateInvitation `required:"true"`
}

type oneInvitationOutput struct {
	Body *lightmodels.Invitation `required:"true"`
}

type invitationIDInput struct {
	InvitationID int `path:"id" required:"true" example:"42" description:"The invitation ID"`
}

type getInvitationForTeam struct {
	TeamID int `path:"id" required:"true" example:"42" description:"The team ID"`

	invitationsmodels.ListInvitationsParams
}
