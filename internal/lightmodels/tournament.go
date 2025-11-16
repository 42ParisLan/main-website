package lightmodels

import (
	"encoding/json"
	"time"

	"base-website/ent"
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
	IsVisible           bool                     `json:"is_visible" description:"Whether the tournament is visible to users"`
	RegistrationStart   time.Time                `json:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts"`
	RegistrationEnd     time.Time                `json:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends"`
	TournamentStart     time.Time                `json:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament"`
	TournamentEnd       time.Time                `json:"tournament_end" example:"2025-03-20T23:59:59Z" description:"End date of tournament"`
	MaxTeams            int                      `json:"max_teams" example:"32" description:"Maximum number of teams allowed"`
	TeamStructure       map[string]TeamStructure `json:"team_structure" description:"JSON describing team roles, min/max players, etc."`
	CustomPageComponent *string                  `json:"custom_page_component,omitempty" description:"Optional React component for custom tournament page"`
	ExternalLink        *string                  `json:"external_link,omitempty" description:"Optional external link for the tournament"`
	Creator             *LightUser               `json:"creator" description:"The creator of the tournament"`
	CreatedAt           time.Time                `json:"created_at"`
}

func NewLightTournamentFromEnt(entTournament *ent.Tournament) *LightTournament {
	if entTournament == nil {
		return nil
	}

	var ts map[string]TeamStructure
	if entTournament.TeamStructure != nil {
		if b, err := json.Marshal(entTournament.TeamStructure); err == nil {
			_ = json.Unmarshal(b, &ts)
		}
	}

	return &LightTournament{
		ID:                  entTournament.ID,
		Slug:                entTournament.Slug,
		Name:                entTournament.Name,
		Description:         entTournament.Description,
		IsVisible:           entTournament.IsVisible,
		RegistrationStart:   entTournament.RegistrationStart,
		RegistrationEnd:     entTournament.RegistrationEnd,
		TournamentStart:     entTournament.TournamentStart,
		TournamentEnd:       entTournament.TournamentEnd,
		MaxTeams:            entTournament.MaxTeams,
		TeamStructure:       ts,
		CustomPageComponent: &entTournament.CustomPageComponent,
		ExternalLink:        &entTournament.ExternalLink,
		Creator:             NewLightUserFromEnt(entTournament.Edges.Creator),
		CreatedAt:           entTournament.CreatedAt,
	}
}

func NewLightTournamentsFromEnt(entTournaments []*ent.Tournament) []*LightTournament {
	tournaments := make([]*LightTournament, len(entTournaments))
	for i, t := range entTournaments {
		tournaments[i] = NewLightTournamentFromEnt(t)
	}
	return tournaments
}

type Tournament struct {
	ID                  int                      `json:"id" example:"42"`
	Slug                string                   `json:"slug" example:"spring-cup-2025"`
	Name                string                   `json:"name" example:"Spring Cup 2025"`
	Description         string                   `json:"description"`
	IsVisible           bool                     `json:"is_visible"`
	RegistrationStart   time.Time                `json:"registration_start"`
	RegistrationEnd     time.Time                `json:"registration_end"`
	TournamentStart     time.Time                `json:"tournament_start"`
	TournamentEnd       time.Time                `json:"tournament_end"`
	MaxTeams            int                      `json:"max_teams"`
	TeamStructure       map[string]TeamStructure `json:"team_structure"`
	CustomPageComponent string                   `json:"custom_page_component"`
	ExternalLink        *string                  `json:"external_link,omitempty"`
	Creator             *LightUser               `json:"creator"`
	Admins              []*LightTournamentAdmin  `json:"admins"`
	Teams               []*LightTeam             `json:"teams,omitempty"`
	RankGroups          []*LightRankGroup        `json:"rank_groups,omitempty"`
	CreatedAt           time.Time                `json:"created_at"`
}

func NewTournamentFromEnt(entTournament *ent.Tournament) *Tournament {
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
		teams = NewLightTeamsFromEnt(entTournament.Edges.Teams)
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

	return &Tournament{
		ID:                  entTournament.ID,
		Slug:                entTournament.Slug,
		Name:                entTournament.Name,
		Description:         entTournament.Description,
		IsVisible:           entTournament.IsVisible,
		RegistrationStart:   entTournament.RegistrationStart,
		RegistrationEnd:     entTournament.RegistrationEnd,
		TournamentStart:     entTournament.TournamentStart,
		TournamentEnd:       entTournament.TournamentEnd,
		MaxTeams:            entTournament.MaxTeams,
		TeamStructure:       ts,
		CustomPageComponent: entTournament.CustomPageComponent,
		ExternalLink:        &entTournament.ExternalLink,
		Creator:             NewLightUserFromEnt(entTournament.Edges.Creator),
		Admins:              admins,
		Teams:               teams,
		RankGroups:          rankGroups,
		CreatedAt:           entTournament.CreatedAt,
	}
}

func NewTournamentsFromEnt(entTournaments []*ent.Tournament) []*Tournament {
	tournaments := make([]*Tournament, len(entTournaments))
	for i, t := range entTournaments {
		tournaments[i] = NewTournamentFromEnt(t)
	}
	return tournaments
}
