package rbaccrontroller

import "base-website/pkg/rbac"

type userRbacOutput struct {
	Body []*rbac.Permission `nullable:"false"`
}

type userRbacInput struct {
	UserID int `path:"id" description:"The user ID to get the RBAC permissions for." example:"1"`
}

type rolesOutput struct {
	Body []*rbac.Role `nullable:"false"`
}
