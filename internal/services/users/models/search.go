package usersmodels

import (
	"base-website/internal/lightmodels"
	"base-website/pkg/paging"
)

type SearchUsersParams struct {
	// The query to search for
	Query string `query:"query" example:"froz" description:"The query to search for"`

	//// PAGINATION AND ORDER ////
	// The offset of the search
	paging.Input

	//// FILTERS ////
	// The kind of the user
	Kind string `query:"kind" example:"basic" description:"The kind of the user" enum:"basic,admin,super-admin"`
}

type SearchResult struct {
	paging.Response
	Users []*lightmodels.LightUser `json:"users" description:"The users"`
}
