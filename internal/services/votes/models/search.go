package votesmodels

import (
	"base-website/internal/lightmodels"
	"base-website/pkg/paging"
)

type ListVotesParams struct {
	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
	// Filter by visibility. "all" returns all votes, "visible" returns only visible votes.
	Visible string `query:"visible" default:"visible" enum:"all,visible" example:"visible" description:"Filter by visibility"`
}

type ListResult struct {
	paging.Response
	Votes []*lightmodels.LightVote `json:"votes" description:"The votes"`
}
