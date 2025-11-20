package teamscontroller

import (
	"base-website/internal/lightmodels"
	teamsmodels "base-website/internal/services/teams/models"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
)

type BodyMessage struct {
	Body string `required:"true"`
}

type tournamentIDInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`
}

type teamIDInput struct {
	TeamID int `path:"id" required:"true" example:"42" description:"The team ID"`
}

type oneTeamOutput struct {
	Body *lightmodels.LightTeam `required:"true"`
}

type multipleTeamsOutput struct {
	Body *paging.Response[*lightmodels.LightTeam] `nullable:"false"`
}

type createTeamInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`

	RawBody huma.MultipartFormFiles[teamsmodels.CreateTeam] `required:"true"`
}

type updateTeamInput struct {
	TeamID int `path:"id" required:"true" example:"42" description:"The team ID"`

	RawBody huma.MultipartFormFiles[teamsmodels.UpdateTeam] `required:"true"`
}
