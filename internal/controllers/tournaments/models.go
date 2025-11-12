package tournamentscontroller

import (
	"base-website/internal/lightmodels"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"base-website/pkg/paging"
)

type BodyMessage struct {
	Body string `required:"true"`
}

type TournamentIDInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`
}

type oneTournamentOutput struct {
	Body *lightmodels.Tournament `required:"true"`
}

type multipleTournamentsOutput struct {
	Body *paging.Response[*lightmodels.LightTournament] `nullable:"false"`
}

type createTournamentInput struct {
	Body *tournamentsmodels.CreateTournament `required:"true"`
}

type updateTournamentInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`

	Body *tournamentsmodels.UpdateTournament `required:"true"`
}
