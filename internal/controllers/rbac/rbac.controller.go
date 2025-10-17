package rbaccrontroller

import (
	"context"

	"base-website/internal/security"
	rbacservice "base-website/internal/services/rbac"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type rbacController struct {
	rbacService rbacservice.RBACService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &rbacController{
		rbacService: do.MustInvoke[rbacservice.RBACService](injector),
	}
	authController.Register(api)
}

func (ctrl *rbacController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me/permissions",
		Summary:     "Get current user RBAC permissions",
		Description: `This endpoint is used to get the current user RBAC permissions.`,
		Tags:        []string{"RBAC", "Users"},
		OperationID: "getCurrentUserRBACPermissions",
		Security:    security.WithAuth("profile"),
	}, ctrl.getCurrentUserRBACPermissions)
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/users/{id}/permissions",
		Summary:     "Get user RBAC permissions",
		Description: `This endpoint is used to get the user RBAC permissions.`,
		Tags:        []string{"RBAC", "Users"},
		OperationID: "getUserRBACPermissions",
		Security:    security.WithAuth("profile"),
	}, ctrl.getUserRBACPermissions)
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/roles",
		Summary:     "Get roles",
		Description: `This endpoint is used to get the roles.`,
		Tags:        []string{"RBAC", "Roles"},
		OperationID: "getRoles",
		Security:    security.WithAuth("profile"),
	}, ctrl.getRoles)
}

func (ctrl *rbacController) getCurrentUserRBACPermissions(
	ctx context.Context,
	input *struct{}) (*userRbacOutput, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	output := &userRbacOutput{}
	output.Body, err = ctrl.rbacService.GetPermissionsFromUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return output, nil
}

func (ctrl *rbacController) getUserRBACPermissions(
	ctx context.Context,
	input *userRbacInput) (*userRbacOutput, error) {
	output := &userRbacOutput{}
	var err error
	output.Body, err = ctrl.rbacService.GetPermissionsFromUserID(ctx, input.UserID)
	if err != nil {
		return nil, err
	}
	return output, nil
}

func (ctrl *rbacController) getRoles(
	ctx context.Context,
	input *struct{}) (*rolesOutput, error) {
	output := &rolesOutput{}
	var err error
	output.Body, err = ctrl.rbacService.List(ctx)
	if err != nil {
		return nil, err
	}
	return output, nil
}
