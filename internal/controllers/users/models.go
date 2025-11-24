package userscontroller

import (
	"base-website/internal/lightmodels"
	usersmodels "base-website/internal/services/users/models"
	"base-website/pkg/paging"
	"net/http"
)

type userByIDOrLoginInput struct {
	IDOrLogin string `path:"id_or_login" required:"true" example:"froz" description:"The user ID or login"`
}

type oneUserOutput struct {
	Body *usersmodels.User `required:"true"`
}

type anonymizeOutput struct {
	Body *usersmodels.User `required:"true"`

	AuthCookie http.Cookie `header:"Set-Cookie"`
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
