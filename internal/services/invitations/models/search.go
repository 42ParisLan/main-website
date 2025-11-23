package invitationsmodels

import "base-website/pkg/paging"

type ListInvitationsParams struct {
	TeamID int `path:"id" required:"true" example:"42" description:"The team ID"`

	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
}
