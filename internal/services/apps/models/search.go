package appsmodels

import "base-website/pkg/paging"

type SearchAppsParams struct {
	// The query to search for
	Query string `query:"query" example:"tmatis" description:"The query to search for"`

	// Filters on
	OwnerID string `query:"owner_id,omitempty" example:"1" description:"The owner ID to filter on"`

	//// PAGINATION AND ORDER ////
	paging.Input
}
