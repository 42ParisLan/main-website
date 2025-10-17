package userscontroller

import (
	"base-website/ent/user"
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

type changeUserKindInput struct {
	UserID int       `path:"id" required:"true" example:"42" description:"The User ID"`
	Kind   user.Kind `query:"kind" required:"true" example:"admin" description:"The Kind to give to user" enum:"basic,admin"`
}
