package authz

import (
	"base-website/ent/user"
	databaseservice "base-website/internal/services/database"
	"context"
	"slices"

	"github.com/danielgtaylor/huma/v2"
)

// CheckRoles verifies if a user has at least one of the required roles
func CheckRoles(ctx context.Context, databaseService databaseservice.DatabaseService, userID int, requiredRoles ...string) error {
	if len(requiredRoles) == 0 {
		return nil
	}

	userRoles, err := GetUserRoles(ctx, databaseService, userID)
	if err != nil {
		return huma.Error404NotFound("user not found", err)
	}

	// Check if user has any of the required roles
	for _, userRole := range userRoles {
		if slices.Contains(requiredRoles, userRole) {
			return nil
		}
	}

	return huma.Error403Forbidden("insufficient permissions")
}

// GetUserRoles implements the authz.UserGetter interface
func GetUserRoles(ctx context.Context, databaseService databaseservice.DatabaseService, userID int) ([]string, error) {
	user, err := databaseService.User.Query().
		Where(user.ID(userID)).
		Select(user.FieldRoles).
		Only(ctx)
	if err != nil {
		return nil, err
	}
	return user.Roles, nil
}
