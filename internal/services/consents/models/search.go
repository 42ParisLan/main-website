package consentsmodels

import "base-website/pkg/paging"

type SearchConsentsParams struct {
	// Filters on
	UserID        string `query:"user_id,omitempty" example:"1" description:"The user ID to filter on"`
	ApplicationID string `query:"application_id,omitempty" example:"1" description:"The application ID to filter on"`

	//// PAGINATION AND ORDER ////
	paging.Input
}
