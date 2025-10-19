package votesservice

import (
	"base-website/ent/user"
	"base-website/internal/security"
	"context"

	"github.com/danielgtaylor/huma/v2"
)

func (svc *votesService) CheckModo(
	ctx context.Context,
) error {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}
	user, err := svc.databaseService.User.Query().Where(user.ID(userID)).
		Select(user.FieldRoles).
		Only(ctx)
	if err != nil {
		return huma.Error404NotFound(
			"user not found",
		)
	}
	hasRole := false
	for _, role := range user.Roles {
		if role == "vote_admin" || role == "super_admin" {
			hasRole = true
			break
		}
	}
	if !hasRole {
		return huma.Error401Unauthorized(
			"can't access this route with this params",
		)
	}
	return nil
}
