package tournamentsmodels

import (
	"base-website/pkg/paging"
)

type ListTournamentsParams struct {
	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
	// Filter by visibility. "all" returns all tournaments, "visible" returns only visible tournaments.
	Visible string `query:"visible" default:"visible" enum:"all,visible" example:"visible" description:"Filter by visibility"`

	Status string `query:"status" default:"all" example:"ongoing" enum:"all,ongoing,finish" description:"Filter by tournament status" `
}
