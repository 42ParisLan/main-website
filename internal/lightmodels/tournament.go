package lightmodels

import (
	"context"
	"encoding/json"
	"time"

	"base-website/ent"
	s3service "base-website/internal/services/s3"
)

type TeamStructure struct {
	Min int `json:"min" minimum:"0"`
	Max int `json:"max" minimum:"1"`
}

type LightTournament struct {
	ID                  int                      `json:"id" example:"42" description:"The ID of the tournament"`
	Slug                string                   `json:"slug" example:"spring-cup-2025" description:"Unique slug of the tournament"`
	Name                string                   `json:"name" example:"Spring Cup 2025" description:"The name of the tournament"`
	Description         string                   `json:"description,omitempty" example:"School-wide League of Legends tournament" description:"Description of the tournament"`
	ImageUrl            *string                  `json:"iamge_url" description:"Image url of the tournament"`
	IsVisible           bool                     `json:"is_visible" description:"Whether the tournament is visible to users"`
	RegistrationStart   time.Time                `json:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts"`
	RegistrationEnd     time.Time                `json:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends"`
	TournamentStart     time.Time                `json:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament"`
	TournamentEnd       *time.Time               `json:"tournament_end" example:"2025-03-20T23:59:59Z" description:"End date of tournament"`
	MaxTeams            int                      `json:"max_teams" example:"32" description:"Maximum number of teams allowed"`
	TeamStructure       map[string]TeamStructure `json:"team_structure" description:"JSON describing team roles, min/max players, etc."`
	CustomPageComponent *string                  `json:"custom_page_component,omitempty" description:"Optional React component for custom tournament page"`
	ExternalLinks       *map[string]string       `json:"external_links,omitempty" description:"Optional external link for the tournament"`
	Creator             *LightUser               `json:"creator" description:"The creator of the tournament"`
	Status              string                   `json:"status" example:"upcoming" description:"Status of the tournament" enum:"upcoming,registration_open,registration_closed,ongoing,completed"`
	CreatedAt           time.Time                `json:"created_at"`
}

func NewLightTournamentFromEnt(ctx context.Context, entTournament *ent.Tournament, S3Service s3service.S3Service) *LightTournament {
	if entTournament == nil {
		return nil
	}

	var ts map[string]TeamStructure
	if entTournament.TeamStructure != nil {
		if b, err := json.Marshal(entTournament.TeamStructure); err == nil {
			_ = json.Unmarshal(b, &ts)
		}
	}

	var imageUrl *string
	if entTournament.ImageURL != nil {
		u, err := S3Service.PresignedGet(ctx, *entTournament.ImageURL, time.Hour)
		if err == nil {
			imageUrl = &u
		}
	}

	return &LightTournament{
		ID:                  entTournament.ID,
		Slug:                entTournament.Slug,
		Name:                entTournament.Name,
		Description:         entTournament.Description,
		ImageUrl:            imageUrl,
		IsVisible:           entTournament.IsVisible,
		RegistrationStart:   entTournament.RegistrationStart,
		RegistrationEnd:     entTournament.RegistrationEnd,
		TournamentStart:     entTournament.TournamentStart,
		TournamentEnd:       entTournament.TournamentEnd,
		MaxTeams:            entTournament.MaxTeams,
		TeamStructure:       ts,
		CustomPageComponent: &entTournament.CustomPageComponent,
		ExternalLinks:       &entTournament.ExternalLinks,
		Creator:             NewLightUserFromEnt(entTournament.Edges.Creator),
		Status:              calculateTournamentStatus(entTournament.RegistrationStart, entTournament.RegistrationEnd, entTournament.TournamentStart, entTournament.TournamentEnd),
		CreatedAt:           entTournament.CreatedAt,
	}
}

func NewLightTournamentsFromEnt(ctx context.Context, entTournaments []*ent.Tournament, S3Service s3service.S3Service) []*LightTournament {
	tournaments := make([]*LightTournament, len(entTournaments))
	for i, t := range entTournaments {
		tournaments[i] = NewLightTournamentFromEnt(ctx, t, S3Service)
	}
	return tournaments
}

type Tournament struct {
	ID                  int                      `json:"id" example:"42"`
	Slug                string                   `json:"slug" example:"spring-cup-2025"`
	Name                string                   `json:"name" example:"Spring Cup 2025"`
	Description         string                   `json:"description"`
	ImageUrl            *string                  `json:"iamge_url" description:"Image url of the tournament"`
	IsVisible           bool                     `json:"is_visible"`
	RegistrationStart   time.Time                `json:"registration_start"`
	RegistrationEnd     time.Time                `json:"registration_end"`
	TournamentStart     time.Time                `json:"tournament_start"`
	TournamentEnd       *time.Time               `json:"tournament_end"`
	MaxTeams            int                      `json:"max_teams"`
	TeamStructure       map[string]TeamStructure `json:"team_structure"`
	CustomPageComponent string                   `json:"custom_page_component"`
	ExternalLinks       *map[string]string       `json:"external_links,omitempty"`
	Creator             *LightUser               `json:"creator"`
	Admins              []*LightTournamentAdmin  `json:"admins"`
	Teams               []*LightTeam             `json:"teams,omitempty"`
	RankGroups          []*LightRankGroup        `json:"rank_groups,omitempty"`
	Status              string                   `json:"status" example:"upcoming" enum:"upcoming,registration_open,registration_closed,ongoing,completed"`
	CreatedAt           time.Time                `json:"created_at"`
}

func NewTournamentFromEnt(ctx context.Context, entTournament *ent.Tournament, S3Service s3service.S3Service) *Tournament {
	if entTournament == nil {
		return nil
	}

	// Convert admins if edges are loaded
	var admins []*LightTournamentAdmin
	if entTournament.Edges.Admins != nil {
		admins = NewLightTournamentAdminsFromEnt(entTournament.Edges.Admins)
	}

	// Convert teams if edges are loaded
	var teams []*LightTeam
	if entTournament.Edges.Teams != nil {
		teams = NewLightTeamsFromEnt(ctx, entTournament.Edges.Teams, S3Service)
	}

	// Convert rank groups if edges are loaded
	var rankGroups []*LightRankGroup
	if entTournament.Edges.RankGroups != nil {
		rankGroups = NewLightRankGroupsFromEnt(entTournament.Edges.RankGroups)
	}

	// Convert TeamStructure to typed map
	var ts map[string]TeamStructure
	if entTournament.TeamStructure != nil {
		if b, err := json.Marshal(entTournament.TeamStructure); err == nil {
			_ = json.Unmarshal(b, &ts)
		}
	}

	var imageUrl *string
	if entTournament.ImageURL != nil {
		u, err := S3Service.PresignedGet(ctx, *entTournament.ImageURL, time.Hour)
		if err == nil {
			imageUrl = &u
		}
	}

	return &Tournament{
		ID:                  entTournament.ID,
		Slug:                entTournament.Slug,
		Name:                entTournament.Name,
		Description:         entTournament.Description,
		ImageUrl:            imageUrl,
		IsVisible:           entTournament.IsVisible,
		RegistrationStart:   entTournament.RegistrationStart,
		RegistrationEnd:     entTournament.RegistrationEnd,
		TournamentStart:     entTournament.TournamentStart,
		TournamentEnd:       entTournament.TournamentEnd,
		MaxTeams:            entTournament.MaxTeams,
		TeamStructure:       ts,
		CustomPageComponent: entTournament.CustomPageComponent,
		ExternalLinks:       &entTournament.ExternalLinks,
		Creator:             NewLightUserFromEnt(entTournament.Edges.Creator),
		Admins:              admins,
		Teams:               teams,
		RankGroups:          rankGroups,
		Status:              calculateTournamentStatus(entTournament.RegistrationStart, entTournament.RegistrationEnd, entTournament.TournamentStart, entTournament.TournamentEnd),
		CreatedAt:           entTournament.CreatedAt,
	}
}

func NewTournamentsFromEnt(ctx context.Context, entTournaments []*ent.Tournament, S3Service s3service.S3Service) []*Tournament {
	tournaments := make([]*Tournament, len(entTournaments))
	for i, t := range entTournaments {
		tournaments[i] = NewTournamentFromEnt(ctx, t, S3Service)
	}
	return tournaments
}

func calculateTournamentStatus(regStart time.Time, regEnd time.Time, tournStart time.Time, tournEnd *time.Time) string {
	now := time.Now()
	if now.Before(regStart) {
		return "upcoming"
	}
	if now.Before(regEnd) {
		return "registration_open"
	}
	if now.Before(tournStart) {
		return "registration_closed"
	}
	if tournEnd != nil && now.After(*tournEnd) {
		return "completed"
	}
	return "ongoing"
}
