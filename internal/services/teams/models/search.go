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
	Status       string `query:"status" example:"all" default:"all" enum:"all,locked,draft,register,waitlist" description:"Get team by status"`
	HasRankGroup string `query:"has_rank_group" example:"all" default:"all" enum:"all,yes,no" description:"Filter teams by rank group assignment"`
}
