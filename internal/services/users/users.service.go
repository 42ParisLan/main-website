package usersservice

import (
	"context"
	"fmt"
	"slices"
	"strconv"

	"base-website/ent"
	"base-website/ent/predicate"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	intraservice "base-website/internal/services/intra"
	rbacservice "base-website/internal/services/rbac"
	usersmodels "base-website/internal/services/users/models"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type UserService interface {
	// This method is used to create a new user from intra data.
	UpsertUserFromIntra(ctx context.Context, id int) (*usersmodels.User, error)
	// This method is used to get a user by its login.
	GetUserByLogin(ctx context.Context, login string) (*usersmodels.User, error)
	// This method is used to get a user by its ID.
	GetUserByID(ctx context.Context, id int) (*usersmodels.User, error)
	// This method is used get user by its ID or login.
	GetUserByIDOrLogin(ctx context.Context, idOrLogin string) (*usersmodels.User, error)
	// This method is user to change user roles by its ID
	ChangeUserRolesByID(ctx context.Context, id int, roles []string) (*usersmodels.User, error)
	// This method is used to search users
	SearchUsers(
		ctx context.Context,
		params *usersmodels.SearchUsersParams,
	) (*usersmodels.SearchResult, error)
}

type usersService struct {
	configService   configservice.ConfigService
	databaseService databaseservice.DatabaseService
	intraService    intraservice.IntraService
	errorFilter     errorfilters.ErrorFilter
	rbacService     rbacservice.RBACService
}

func NewProvider() func(i *do.Injector) (UserService, error) {
	return func(i *do.Injector) (UserService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[intraservice.IntraService](i),
			do.MustInvoke[rbacservice.RBACService](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	databaseService databaseservice.DatabaseService,
	intraService intraservice.IntraService,
	rbacService rbacservice.RBACService,
) (UserService, error) {
	return &usersService{
		configService:   configService,
		databaseService: databaseService,
		intraService:    intraService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("user"),
		rbacService:     rbacService,
	}, nil
}

func (svc *usersService) UpsertUserFromIntra(
	ctx context.Context,
	id int,
) (*usersmodels.User, error) {
	intraUser, err := svc.intraService.Client.GetUserById(id)
	if err != nil {
		return nil, err
	}

	_, err = svc.databaseService.User.Get(ctx, intraUser.ID)
	if err == nil {
		// The user already exists, we update it
		updateQuery := svc.databaseService.User.UpdateOneID(intraUser.ID).
			SetUsername(intraUser.Login).
			SetEmail(intraUser.Email).
			SetFirstName(intraUser.FirstName).
			SetLastName(intraUser.LastName).
			SetEmail(intraUser.Email).
			SetUsualFullName(intraUser.UsualFullName).
			SetNillableUsualFirstName(intraUser.UsualFirstName)
		if intraUser.Image != nil {
			updateQuery.SetPicture(intraUser.Image.Versions.Medium)
		}
		_, err = updateQuery.Save(ctx)
		if err != nil {
			return nil, svc.errorFilter.Filter(err, "update")
		}
		return svc.GetUserByID(ctx, intraUser.ID)
	}

	userCreateQuery := svc.databaseService.User.Create().
		SetID(intraUser.ID).
		SetUsername(intraUser.Login).
		SetEmail(intraUser.Email).
		SetFirstName(intraUser.FirstName).
		SetLastName(intraUser.LastName).
		SetEmail(intraUser.Email).
		SetUsualFullName(intraUser.UsualFullName).
		SetNillableUsualFirstName(intraUser.UsualFirstName)

	if intraUser.ID == svc.configService.GetConfig().SuperAdminUser {
		userCreateQuery.SetKind(user.KindAdmin)
		userCreateQuery.SetRoles([]string{"super_admin"})
	}

	if intraUser.Image != nil {
		userCreateQuery.SetPicture(
			intraUser.Image.Versions.Medium,
		) // it can happen that the image is nil
	}

	user, err := userCreateQuery.Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}

	return svc.GetUserByID(ctx, user.ID)
}

func (svc *usersService) GetUserByLogin(
	ctx context.Context,
	login string,
) (*usersmodels.User, error) {
	user, err := svc.newQuery().
		Where(user.Username(login)).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	return usersmodels.NewUserFromEnt(user), nil
}

func (svc *usersService) GetUserByID(ctx context.Context, id int) (*usersmodels.User, error) {
	user, err := svc.newQuery().
		Where(user.ID(id)).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return usersmodels.NewUserFromEnt(user), nil
}

func (svc *usersService) GetUserByIDOrLogin(
	ctx context.Context,
	idOrLogin string,
) (*usersmodels.User, error) {
	query := svc.newQuery()
	orPredicate := make([]predicate.User, 0)
	userID, err := strconv.Atoi(idOrLogin)
	if err == nil {
		orPredicate = append(orPredicate, user.ID(userID))
	}
	orPredicate = append(orPredicate, user.Username(idOrLogin))
	query = query.Where(user.Or(orPredicate...))
	user, err := query.First(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return usersmodels.NewUserFromEnt(user), nil
}

func (svc *usersService) SearchUsers(
	ctx context.Context,
	params *usersmodels.SearchUsersParams,
) (*usersmodels.SearchResult, error) {
	query := svc.databaseService.User.Query()

	if params.Query != "" {
		query.Where(
			user.Or(
				user.UsernameContains(params.Query),
				user.FirstNameContains(params.Query),
				user.LastNameContains(params.Query),
				user.UsualFullNameContains(params.Query),
			),
		)
	}

	if params.Kind != "" {
		query.Where(user.KindEQ(user.Kind(params.Kind)))
	}

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc("id"))
	} else {
		query = query.Order(ent.Desc("id"))
	}

	users, err := query.All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	return &usersmodels.SearchResult{
		Users: lightmodels.NewLightUsersFromEnt(users),
		Response: paging.Response{
			Total: total,
		},
	}, nil
}

func (svc *usersService) newQuery() *ent.UserQuery {
	return svc.databaseService.User.Query()
}

func (svc *usersService) ChangeUserRolesByID(ctx context.Context, id int, roles []string) (*usersmodels.User, error) {
	if id == svc.configService.GetConfig().SuperAdminUser {
		return nil, huma.Error403Forbidden("can't change roles of super admin user")
	}

	kind := user.KindAdmin
	if len(roles) == 0 {
		roles = append(roles, "user")
		kind = user.KindUser
	}

	rbacRoles := svc.rbacService.ListRoles()
	err := checkRoles(rbacRoles, roles)
	if err != nil {
		return nil, err
	}

	updatedUser, err := svc.databaseService.User.UpdateOneID(id).
		SetKind(kind).
		SetRoles(roles).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}
	return usersmodels.NewUserFromEnt(updatedUser), nil
}

//// HELPERS ////

func checkRoles(rbacRoles []string, roles []string) error {
	for _, role := range roles {
		found := slices.Contains(rbacRoles, role)
		if !found {
			return huma.Error403Forbidden(
				fmt.Sprintf(
					"role %s doesn't exist",
					role,
				),
			)
		}
	}
	return nil
}
