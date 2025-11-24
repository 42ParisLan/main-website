package invitationsmodels

import "base-website/pkg/paging"

type ListInvitationsParams struct {
	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
}
