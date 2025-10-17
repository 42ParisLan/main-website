package paging

type Input struct {
	Page  int    `query:"page" example:"0" description:"The page of the search" minimum:"0" default:"0"`
	Limit int    `query:"limit" example:"10" description:"The limit of the search" maximum:"100" minimum:"1" default:"20"`
	Order string `query:"order" example:"asc" description:"The order of the search" enum:"asc,desc" default:"asc"`
}

type Response struct {
	Total int `header:"total" example:"42" description:"The total number of results"`
}
