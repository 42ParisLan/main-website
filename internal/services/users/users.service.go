package usersservice

import (
	"context"
	"fmt"
	"slices"
	"strconv"
	"time"

	"base-website/ent"
	"base-website/ent/predicate"
	"base-website/ent/teammember"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	intraservice "base-website/internal/services/intra"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
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
	// This method is used to get top users ordered by elo.
	GetTopUsersByElo(ctx context.Context) ([]*lightmodels.LightUser, error)
	// This method is used get user by its ID or login.
	GetUserByIDOrLogin(ctx context.Context, idOrLogin string) (*usersmodels.User, error)
	// This method is used to get all teams for a user.
	GetUserTeams(ctx context.Context, userID int, params *usersmodels.GetUserTeamsParams) (*paging.Response[*lightmodels.LightTeam], error)
	// This method is user to change user roles by its ID
	ChangeUserRolesByID(ctx context.Context, id int, roles []string) (*usersmodels.User, error)
	// This method is used to anonymize a user by its ID (remove personal data)
	AnonymizeUserByID(ctx context.Context, id int) (*usersmodels.User, error)
	// This method is used to search users
	SearchUsers(ctx context.Context, params *usersmodels.SearchUsersParams) (*paging.Response[*lightmodels.LightUser], error)
}

type usersService struct {
	configService   configservice.ConfigService
	databaseService databaseservice.DatabaseService
	intraService    intraservice.IntraService
	errorFilter     errorfilters.ErrorFilter
	rbacService     rbacservice.RBACService
	s3service       s3service.S3Service
}

func NewProvider() func(i *do.Injector) (UserService, error) {
	return func(i *do.Injector) (UserService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[intraservice.IntraService](i),
			do.MustInvoke[rbacservice.RBACService](i),
			do.MustInvoke[s3service.S3Service](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	databaseService databaseservice.DatabaseService,
	intraService intraservice.IntraService,
	rbacService rbacservice.RBACService,
	s3service s3service.S3Service,
) (UserService, error) {
	return &usersService{
		configService:   configService,
		databaseService: databaseService,
		intraService:    intraService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("user"),
		rbacService:     rbacService,
		s3service:       s3service,
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

	entUser, err := svc.databaseService.User.Query().Where(user.IntraIDEQ(intraUser.ID)).Only(ctx)
	if err == nil {
		updateQuery := svc.databaseService.User.UpdateOneID(entUser.ID).
			SetUsername(intraUser.Login).
			SetEmail(intraUser.Email).
			SetNillableIntraID(&intraUser.ID)
		if intraUser.Image != nil {
			updateQuery.SetPicture(intraUser.Image.Versions.Medium)
		}
		_, err = updateQuery.Save(ctx)
		if err != nil {
			return nil, svc.errorFilter.Filter(err, "update")
		}
		return svc.GetUserByID(ctx, entUser.ID)
	}

	userCreateQuery := svc.databaseService.User.Create().
		SetUsername(intraUser.Login).
		SetEmail(intraUser.Email).
		SetNillableIntraID(&intraUser.ID)

	if intraUser.ID == svc.configService.GetConfig().SuperAdminUser {
		userCreateQuery.SetKind(user.KindAdmin)
		userCreateQuery.SetRoles([]string{"basic_admin", "super_admin"})
	}

	if intraUser.Image != nil {
		userCreateQuery.SetPicture(
			intraUser.Image.Versions.Medium,
		)
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

func (svc *usersService) GetTopUsersByElo(ctx context.Context) ([]*lightmodels.LightUser, error) {
	users, err := svc.databaseService.User.Query().
		Where(
			user.AnonymizedAtIsNil(),
			user.EloGT(0),
		).
		Order(
			ent.Desc(user.FieldElo),
			ent.Desc(user.FieldID),
		).
		Limit(10).
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	return lightmodels.NewLightUsersFromEnt(users), nil
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

func (svc *usersService) GetUserTeams(ctx context.Context, userID int, params *usersmodels.GetUserTeamsParams) (*paging.Response[*lightmodels.LightTeam], error) {
	query := svc.databaseService.TeamMember.Query().
		Where(teammember.HasUserWith(user.IDEQ(userID))).
		WithTeam(func(tq *ent.TeamQuery) {
			tq.WithCreator().
				WithMembers(func(tmq *ent.TeamMemberQuery) {
					tmq.WithUser()
				}).
				WithRankGroup().
				WithTournament()
		})

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count teams")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc("id"))
	} else {
		query = query.Order(ent.Desc("id"))
	}

	teamMembers, err := query.All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get teams")
	}

	teams := make([]*lightmodels.LightTeam, 0, len(teamMembers))
	for _, tm := range teamMembers {
		if tm.Edges.Team != nil {
			teams = append(teams, lightmodels.NewLightTeamFromEnt(ctx, tm.Edges.Team, svc.s3service))
		}
	}

	return paging.CreatePagingResponse(teams, total, params.Page, params.Limit), nil
}

func (svc *usersService) SearchUsers(
	ctx context.Context,
	params *usersmodels.SearchUsersParams,
) (*paging.Response[*lightmodels.LightUser], error) {
	query := svc.databaseService.User.Query()

	query = query.Where(user.AnonymizedAtIsNil())

	if params.Query != "" {
		query.Where(
			user.Or(
				user.UsernameContains(params.Query),
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

	return paging.CreatePagingResponse(lightmodels.NewLightUsersFromEnt(users), total, params.Page, params.Limit), nil
}

func (svc *usersService) newQuery() *ent.UserQuery {
	return svc.databaseService.User.Query()
}

func (svc *usersService) ChangeUserRolesByID(ctx context.Context, id int, roles []string) (*usersmodels.User, error) {
	minimalUser, err := svc.databaseService.User.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if *minimalUser.IntraID == svc.configService.GetConfig().SuperAdminUser {
		return nil, huma.Error403Forbidden("can't anonymize super admin user")
	}

	kind := user.KindAdmin
	if len(roles) == 0 {
		roles = append(roles, "user")
		kind = user.KindUser
	}

	rbacRoles := svc.rbacService.ListRoles()
	err = checkRoles(rbacRoles, roles)
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

func (svc *usersService) AnonymizeUserByID(ctx context.Context, id int) (*usersmodels.User, error) {
	minimalUser, err := svc.databaseService.User.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if *minimalUser.IntraID == svc.configService.GetConfig().SuperAdminUser {
		return nil, huma.Error403Forbidden("can't anonymize super admin user")
	}

	cfg := svc.configService.GetConfig()
	if cfg.AccountAnonymizeMinAgeDays > 0 {
		entUser, err := svc.databaseService.User.Get(ctx, id)
		if err != nil {
			return nil, svc.errorFilter.Filter(err, "get")
		}
		minAge := time.Duration(cfg.AccountAnonymizeMinAgeDays) * 24 * time.Hour
		if time.Since(entUser.CreatedAt) < minAge {
			return nil, huma.Error403Forbidden(
				fmt.Sprintf("account must be at least %d days old to anonymize", cfg.AccountAnonymizeMinAgeDays),
			)
		}
	}

	anonUsername := fmt.Sprintf("anonymous-%d-%d", id, time.Now().Unix())

	now := time.Now()
	updatedUser, err := svc.databaseService.User.UpdateOneID(id).
		SetKind(user.KindUser).
		SetRoles([]string{}).
		SetUsername(anonUsername).
		SetEmail("").
		SetPicture("").
		SetNillableAnonymizedAt(&now).
		ClearIntraID().
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
