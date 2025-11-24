package lightmodels

import (
	"base-website/ent"
	s3service "base-website/internal/services/s3"
	"context"
	"time"
)

type Invitation struct {
	ID        int        `json:"id" description:"Id of the invitation"`
	Message   string     `json:"message" description:"Message of the invitation"`
	Role      string     `json:"role" description:"Role in the team"`
	CreatedAt time.Time  `json:"created_at" description:"invitation created_at"`
	Team      *LightTeam `json:"team" description:"The team of the invitation"`
	User      *LightUser `json:"user" description:"The user invited in the team"`
}

func NewInvitationFromEnt(ctx context.Context, entInvitation *ent.Invitation, S3Service s3service.S3Service) *Invitation {
	if entInvitation == nil {
		return nil
	}

	var user *LightUser
	if entInvitation.Edges.Invitee != nil {
		user = NewLightUserFromEnt(entInvitation.Edges.Invitee)
	}

	var team *LightTeam
	if entInvitation.Edges.Team != nil {
		team = NewLightTeamFromEnt(ctx, entInvitation.Edges.Team, S3Service)
	}

	return &Invitation{
		ID:        entInvitation.ID,
		Message:   entInvitation.Message,
		Role:      entInvitation.Role,
		CreatedAt: entInvitation.CreatedAt,
		User:      user,
		Team:      team,
	}
}

func NewInvitationsFromEnt(ctx context.Context, entInvitations []*ent.Invitation, S3Service s3service.S3Service) []*Invitation {
	invitations := make([]*Invitation, len(entInvitations))
	for i, t := range entInvitations {
		invitations[i] = NewInvitationFromEnt(ctx, t, S3Service)
	}
	return invitations
}
