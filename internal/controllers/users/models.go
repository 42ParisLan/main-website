package userscontroller

import (
	"base-website/internal/lightmodels"
	usersmodels "base-website/internal/services/users/models"
	"base-website/pkg/paging"
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
	Body *paging.Response[*lightmodels.LightUser] `nullable:"false"`
}

type changeUserRolesInput struct {
	UserID int      `path:"id" required:"true" example:"42" description:"The User ID"`
	Body   []string `required:"true"`
}
