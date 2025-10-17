package rbacservice

import (
	"context"
	"os"

	"base-website/ent/user"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	"base-website/pkg/rbac"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type RBACService interface {
	// This method is used to check if a user has the permission to access a path with a verb.
	Can(roles []string, path string, verb string) bool
	// GetRoles
	GetPermissions(roles []string) []*rbac.Permission
	// GetPermissionsFromClaims
	GetPermissionsFromUserID(ctx context.Context, userID int) ([]*rbac.Permission, error)
	// List
	List(ctx context.Context) ([]*rbac.Role, error)
}

type rbacService struct {
	rbac            *rbac.Rbac
	databaseService databaseservice.DatabaseService
}

func NewProvider() func(i *do.Injector) (RBACService, error) {
	return func(i *do.Injector) (RBACService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[databaseservice.DatabaseService](i),
		)
	}
}

func New(
	config configservice.ConfigService,
	databaseService databaseservice.DatabaseService,
) (RBACService, error) {
	file, err := os.Open(config.GetConfig().RBACConfigPath)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	rbac, err := rbac.New(file)
	if err != nil {
		panic(err)
	}
	return &rbacService{
		rbac:            rbac,
		databaseService: databaseService,
	}, nil
}

func (svc *rbacService) Can(roles []string, path string, verb string) bool {
	return svc.rbac.Can(roles, path, verb)
}

func (svc *rbacService) GetPermissions(roles []string) []*rbac.Permission {
	return svc.rbac.GetPermissions(roles)
}

func (svc *rbacService) GetPermissionsFromUserID(
	ctx context.Context,
	userID int,
) ([]*rbac.Permission, error) {
	user, err := svc.databaseService.User.Query().Where(user.ID(userID)).
		Select(user.FieldRoles).
		Only(ctx)
	if err != nil {
		return nil, huma.Error404NotFound(
			"user not found",
		)
	}
	return svc.GetPermissions(user.Roles), nil
}

func (svc *rbacService) List(ctx context.Context) ([]*rbac.Role, error) {
	roles := make([]*rbac.Role, len(svc.rbac.Roles))
	i := 0
	for _, role := range svc.rbac.Roles {
		roles[i] = role
		i++
	}
	return roles, nil
}
