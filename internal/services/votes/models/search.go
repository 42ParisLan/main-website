package votesmodels

import (
	"base-website/pkg/paging"
)

type ListVotesParams struct {
	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
	// Filter by visibility. "all" returns all votes, "visible" returns only visible votes.
	Visible string `query:"visible" default:"visible" enum:"all,visible" example:"visible" description:"Filter by visibility"`

	// Filter by status. "all" returns all votes, "ongoing" returns ongoing votes, "finish" returns finished votes, "not_started" returns vortes that has not started.
	Status string `query:"status" default:"all" example:"ongoing" enum:"all,ongoing,finish,not_started" description:"Filter by vote status" `
}
