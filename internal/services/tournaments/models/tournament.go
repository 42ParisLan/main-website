package tournamentsmodels

import (
	"time"

	"github.com/danielgtaylor/huma/v2"
)

type CreateTournament struct {
	Slug                string        `form:"slug" example:"spring-cup-2025" description:"Unique slug of the tournament" required:"true" validate:"min=3"`
	Name                string        `form:"name" example:"Spring Cup 2025" description:"The name of the tournament" required:"true" validate:"min=3"`
	Description         string        `form:"description" example:"School-wide League of Legends tournament" description:"The description of the tournament"`
	RegistrationStart   time.Time     `form:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts" required:"true"`
	RegistrationEnd     time.Time     `form:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends" required:"true"`
	TournamentStart     time.Time     `form:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament" required:"true"`
	MaxTeams            int           `form:"max_teams" example:"32" description:"Maximum number of teams allowed" required:"true" minimum:"3"`
	TeamStructure       string        `form:"team_structure" description:"JSON describing team roles, min/max players, etc."`
	CustomPageComponent string        `form:"custom_page_component" description:"Optional React component for custom tournament page"`
	Image               huma.FormFile `form:"image" contentType:"image/*" description:"The uploaded image file"`
}

type UpdateTournament struct {
	IsVisible           bool          `form:"is_visible" description:"Visibility of the tournament"`
	Description         string        `form:"description" example:"School-wide League of Legends tournament" description:"The description of the tournament"`
	RegistrationStart   time.Time     `form:"registration_start" example:"2025-03-01T00:00:00Z" description:"When registration starts"`
	RegistrationEnd     time.Time     `form:"registration_end" example:"2025-03-10T23:59:59Z" description:"When registration ends"`
	TournamentStart     time.Time     `form:"tournament_start" example:"2025-03-15T00:00:00Z" description:"Start date of tournament"`
	MaxTeams            int           `form:"max_teams" example:"32" default:"-1" description:"Maximum number of teams allowed"`
	CustomPageComponent string        `form:"custom_page_component" description:"Optional React component for custom tournament page"`
	ExternalLinks       string        `form:"external_links" description:"Optional external links for the tournament (JSON string)"`
	Image               huma.FormFile `form:"image" contentType:"image/*" description:"The uploaded image file"`
}
