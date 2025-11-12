package tournamentsmodels

import (
	"base-website/pkg/paging"
)

type ListTournamentsParams struct {
	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
	// Filter by visibility. "all" returns all votes, "visible" returns only visible votes.
	Visible string `query:"visible" default:"visible" enum:"all,visible" example:"visible" description:"Filter by visibility"`
}
