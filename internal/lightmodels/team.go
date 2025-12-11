package lightmodels

import (
	"context"
	"time"

	"base-website/ent"
	s3service "base-website/internal/services/s3"
)

type LightTeamMember struct {
	ID                int        `json:"id" example:"42" description:"The ID of the team member"`
	User              *LightUser `json:"user" description:"The user information of the team member"`
	Role              string     `json:"role" example:"player" description:"The role of the user in the team, e.g., player, coach, substitute"`
	CanReceiveTeamElo bool       `json:"can_receive_team_elo" example:"true" description:"Whether this member receives team ELO"`
}

func NewLightTeamMemberFromEnt(entTeamMember *ent.TeamMember) *LightTeamMember {
	if entTeamMember == nil {
		return nil
	}

	var user *LightUser
	if entTeamMember.Edges.User != nil {
		user = NewLightUserFromEnt(entTeamMember.Edges.User)
	}

	return &LightTeamMember{
		ID:                entTeamMember.ID,
		User:              user,
		Role:              entTeamMember.Role,
		CanReceiveTeamElo: entTeamMember.CanReceiveTeamElo,
	}
}

func NewLightTeamMembersFromEnt(entTeamMembers []*ent.TeamMember) []*LightTeamMember {
	members := make([]*LightTeamMember, len(entTeamMembers))
	for i, t := range entTeamMembers {
		members[i] = NewLightTeamMemberFromEnt(t)
	}
	return members
}

type LightTeam struct {
	ID               int                `json:"id" example:"42"`
	Name             string             `json:"name" example:"Team Phoenix"`
	ImageURL         *string            `json:"image_url,omitempty"`
	IsLocked         bool               `json:"is_locked"`
	IsRegistered     bool               `json:"is_registered"`
	IsWaitlisted     bool               `json:"is_waitlisted"`
	Score            *int               `json:"score,omitempty"`
	Elo              *int               `json:"elo,omitempty" description:"Team ELO rating"`
	RankGroup        *LightRankGroup    `json:"rank_group,omitempty"`
	Members          []*LightTeamMember `json:"members,omitempty"`
	Creator          *LightUser         `json:"creator,omitempty"`
	WaitlistPosition *int               `json:"waitlist_position,omitempty"`
	CreatedAt        time.Time          `json:"created_at"`
}

func NewLightTeamFromEnt(ctx context.Context, entTeam *ent.Team, S3Service s3service.S3Service) *LightTeam {
	if entTeam == nil {
		return nil
	}

	var members []*LightTeamMember
	if entTeam.Edges.Members != nil {
		members = NewLightTeamMembersFromEnt(entTeam.Edges.Members)
	}

	var creator *LightUser
	if entTeam.Edges.Creator != nil {
		creator = NewLightUserFromEnt(entTeam.Edges.Creator)
	}

	var rankGroup *LightRankGroup
	if entTeam.Edges.RankGroup != nil {
		rankGroup = NewLightRankGroupFromEnt(entTeam.Edges.RankGroup)
	}

	var imageUrl *string
	if entTeam.ImageURL != nil {
		u, err := S3Service.PresignedGet(ctx, *entTeam.ImageURL, time.Hour)
		if err == nil {
			imageUrl = &u
		}
	}

	return &LightTeam{
		ID:               entTeam.ID,
		Name:             entTeam.Name,
		ImageURL:         imageUrl,
		IsLocked:         entTeam.IsLocked,
		IsRegistered:     entTeam.IsRegistered,
		IsWaitlisted:     entTeam.IsWaitlisted,
		Score:            &entTeam.Score,
		Elo:              entTeam.Elo,
		RankGroup:        rankGroup,
		Members:          members,
		Creator:          creator,
		WaitlistPosition: entTeam.WaitlistPosition,
		CreatedAt:        entTeam.CreatedAt,
	}
}

func NewLightTeamsFromEnt(ctx context.Context, entTeams []*ent.Team, S3Service s3service.S3Service) []*LightTeam {
	teams := make([]*LightTeam, len(entTeams))
	for i, t := range entTeams {
		teams[i] = NewLightTeamFromEnt(ctx, t, S3Service)
	}
	return teams
}
