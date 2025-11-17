package teamsmodels

import (
	"base-website/pkg/paging"
)

type ListTeamsParams struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`

	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
}
