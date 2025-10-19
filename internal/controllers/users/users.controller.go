package userscontroller

import (
	"context"
	"strconv"

	"base-website/internal/security"
	usersservice "base-website/internal/services/users"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type userController struct {
	usersService usersservice.UserService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &userController{
		usersService: do.MustInvoke[usersservice.UserService](injector),
	}
	authController.Register(api)
}

func (ctrl *userController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/users/{id_or_login}",
		Summary:     "Get User by ID or Login",
		Description: `This endpoint is used to get a user by its ID or login.`,
		Tags:        []string{"Users"},
		OperationID: "getUserByIDOrLogin",
		Security:    security.WithAuth("profile"),
	}, ctrl.getUserByID)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/users",
		Summary:     "Search Users",
		Description: `This endpoint is used to search users.`,
		Tags:        []string{"Users"},
		OperationID: "searchUsers",
		Security:    security.WithAuth("profile"),
	}, ctrl.searchUsers)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me",
		Summary:     "Get current user",
		Description: `This endpoint is used to get the current user.`,
		Tags:        []string{"Users"},
		OperationID: "getCurrentUser",
		Security:    security.WithAuth("profile"),
	}, ctrl.getCurrentUser)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/users/{id}/roles",
		Summary:     "Change user roles",
		Description: `This endpoint is used to change user roles.`,
		Tags:        []string{"Users"},
		OperationID: "changeUserRoles",
		Security:    security.WithAuth("profile"),
	}, ctrl.changeUserRoles)
}

func (ctrl *userController) getUserByID(
	ctx context.Context,
	input *userByIDOrLoginInput,
) (*oneUserOutput, error) {
	// we check if this is a login or an ID
	id, err := strconv.Atoi(input.IDOrLogin)
	if err == nil {
		user, err := ctrl.usersService.GetUserByID(ctx, id)
		if err != nil {
			return nil, err
		}
		return &oneUserOutput{
			Body: user,
		}, nil
	}
	user, err := ctrl.usersService.GetUserByLogin(ctx, input.IDOrLogin)
	if err != nil {
		return nil, err
	}
	return &oneUserOutput{
		Body: user,
	}, nil
}

func (ctrl *userController) searchUsers(
	ctx context.Context,
	input *searchUsersInput,
) (*searchUsersOutput, error) {
	result, err := ctrl.usersService.SearchUsers(ctx, &input.SearchUsersParams)
	if err != nil {
		return nil, err
	}
	return &searchUsersOutput{
		Body:  result.Users,
		Total: result.Total,
	}, nil
}

func (ctrl *userController) getCurrentUser(
	ctx context.Context,
	input *struct{},
) (*oneUserOutput, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	user, err := ctrl.usersService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &oneUserOutput{
		Body: user,
	}, nil
}

func (ctrl *userController) changeUserRoles(
	ctx context.Context,
	input *changeUserRolesInput,
) (*oneUserOutput, error) {
	user, err := ctrl.usersService.ChangeUserRolesByID(ctx, input.UserID, input.Body)
	if err != nil {
		return nil, err
	}
	return &oneUserOutput{
		Body: user,
	}, nil
}
