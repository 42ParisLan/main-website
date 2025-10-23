package paging

type Input struct {
	Page  int    `query:"page" example:"0" description:"The page of the search" minimum:"0" default:"0"`
	Limit int    `query:"limit" example:"10" description:"The limit of the search" maximum:"100" minimum:"1" default:"20"`
	Order string `query:"order" example:"asc" description:"The order of the search" enum:"asc,desc" default:"desc"`
}

type Response[T any] struct {
	Items      []T `json:"items" description:"List of items for the current page"`
	Page       int `json:"page" example:"1" description:"Current page number"`
	TotalPages int `json:"total_pages" example:"10" description:"Total number of pages available"`
	Limit      int `json:"limit" example:"10" description:"Number of items per page"`
	Total      int `json:"total" example:"100" description:"Total number of items across all pages"`
}
