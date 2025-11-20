package tournamentscontroller

import (
	"base-website/internal/lightmodels"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
)

type BodyMessage struct {
	Body string `required:"true"`
}

type TournamentIDOrSlugInput struct {
	TournamentIDOrSlug string `path:"id_or_slug" required:"true" example:"42" description:"The tournament ID or slug"`
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
	RawBody huma.MultipartFormFiles[tournamentsmodels.CreateTournament] `required:"true"`
}

type updateTournamentInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`

	RawBody huma.MultipartFormFiles[tournamentsmodels.UpdateTournament] `required:"true"`
}

type addTournamentAdminBody struct {
	UserID int    `json:"user_id" required:"true" example:"42" description:"ID of the user to add as admin"`
	Role   string `json:"role" required:"true" example:"ADMIN" enum:"ADMIN,SUPER_ADMIN" description:"Role for the admin: ADMIN or SUPER_ADMIN"`
}

type addTournamentAdminInput struct {
	TournamentID int                     `path:"id" required:"true" example:"42" description:"The tournament ID"`
	Body         *addTournamentAdminBody `required:"true"`
}
type editTournamentAdminInput struct {
	TournamentID int    `path:"id" required:"true" example:"42" description:"The tournament ID"`
	AdminID      int    `path:"admin_id" required:"true" example:"42" description:"ID of the user to edit"`
	Body         string `required:"true" example:"ADMIN" enum:"ADMIN,SUPER_ADMIN" description:"Role for the admin: ADMIN or SUPER_ADMIN"`
}

type deleteTournamentAdminInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`
	AdminID      int `path:"admin_id" required:"true" example:"42" description:"ID of the user to edit"`
}
