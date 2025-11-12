package tournamentsmodels

import "time"

type CreateTournament struct {
	Slug                string      `json:"slug" example:"spring-cup-2025" description:"Unique slug of the tournament" required:"true" validate:"min=3"`
	Name                string      `json:"name" example:"Spring Cup 2025" description:"The name of the tournament" required:"true" validate:"min=3"`
	Description         string      `json:"description" example:"School-wide League of Legends tournament" description:"The description of the tournament"`
	RegistrationStart   time.Time   `json:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts" required:"true"`
	RegistrationEnd     time.Time   `json:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends" required:"true"`
	TournamentStart     time.Time   `json:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament" required:"true"`
	TournamentEnd       time.Time   `json:"tournament_end" example:"2025-03-20T23:59:59Z" description:"End date of tournament" required:"true"`
	MaxTeams            int         `json:"max_teams" example:"32" description:"Maximum number of teams allowed" required:"true"`
	TeamStructure       interface{} `json:"team_structure" description:"JSON describing team roles, min/max players, etc."`
	CustomPageComponent *string     `json:"custom_page_component,omitempty" description:"Optional React component for custom tournament page"`
	ExternalLink        *string     `json:"external_link,omitempty" description:"Optional external link for the tournament"`
}

type UpdateTournament struct {
	Name                *string     `json:"name" example:"Spring Cup 2025" description:"The name of the tournament" validate:"min=3"`
	Description         *string     `json:"description" example:"School-wide League of Legends tournament" description:"The description of the tournament"`
	IsVisible           *bool       `json:"is_visible" example:"true" description:"Whether the tournament is visible"`
	RegistrationStart   *time.Time  `json:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts"`
	RegistrationEnd     *time.Time  `json:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends"`
	TournamentStart     *time.Time  `json:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament"`
	TournamentEnd       *time.Time  `json:"tournament_end" example:"2025-03-20T23:59:59Z" description:"End date of tournament"`
	MaxTeams            *int        `json:"max_teams" example:"32" description:"Maximum number of teams allowed"`
	TeamStructure       interface{} `json:"team_structure" description:"JSON describing team roles, min/max players, etc."`
	CustomPageComponent *string     `json:"custom_page_component,omitempty" description:"Optional React component for custom tournament page"`
	ExternalLink        *string     `json:"external_link,omitempty" description:"Optional external link for the tournament"`
}
