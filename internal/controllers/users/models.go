package userscontroller

import (
	"base-website/internal/lightmodels"
	usersmodels "base-website/internal/services/users/models"
)

type userByIDOrLoginInput struct {
	IDOrLogin string `path:"id_or_login" required:"true" example:"froz" description:"The user ID or login"`
}

type oneUserOutput struct {
	Body *usersmodels.User `required:"true"`
}

type searchUsersInput struct {
	usersmodels.SearchUsersParams
}

type searchUsersOutput struct {
	Body []*lightmodels.LightUser `nullable:"false"`

	Total int `header:"X-Total" description:"The total number of users" example:"42"`
}

type changeUserRolesInput struct {
	UserID int      `path:"id" required:"true" example:"42" description:"The User ID"`
	Body   []string `required:"true"`
}
