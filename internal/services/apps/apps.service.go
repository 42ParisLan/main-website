package appsservice

import (
	"context"
	"fmt"
	"math/rand"
	"slices"
	"strconv"

	"base-website/ent"
	"base-website/ent/app"
	"base-website/ent/user"
	"base-website/internal/security"
	appsmodels "base-website/internal/services/apps/models"
	databaseservice "base-website/internal/services/database"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

const (
	clientIDPrefix  = "u-e4v2-" // u-v4l2- is the prefix for the client_id
	secretIDPrefix  = "s-e4v2-" // s-v4l2- is the prefix for the secret_id
	lengthOfRandStr = 48
)

type AppsService interface {
	Create(
		ctx context.Context,
		appPayload appsmodels.AppPayload,
	) (*appsmodels.App, error)
	Get(
		ctx context.Context,
		appID string,
	) (*appsmodels.App, error)
	Update(
		ctx context.Context,
		appID string,
		appPayload appsmodels.AppPayload,
	) (*appsmodels.App, error)
	Delete(
		ctx context.Context,
		appID string,
	) error
	Search(
		ctx context.Context,
		params appsmodels.SearchAppsParams,
	) (*paging.Response[*appsmodels.App], error)
	RotateSecret(
		ctx context.Context,
		appID string,
	) (*appsmodels.App, error)
}

type appsService struct {
	databaseService databaseservice.DatabaseService
	errorFilter     errorfilters.ErrorFilter
}

func NewProvider() func(i *do.Injector) (AppsService, error) {
	return func(i *do.Injector) (AppsService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
) (AppsService, error) {
	return &appsService{
		databaseService: databaseService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("App"),
	}, nil
}

func (svc *appsService) Create(
	ctx context.Context,
	appPayload appsmodels.AppPayload,
) (*appsmodels.App, error) {
	ownerID, err := getOwnerID(ctx)
	if err != nil {
		return nil, err
	}

	reqPerms := security.PermissionsFromContext(ctx)
	isSudo := reqPerms.Can("/apps", "SUDO")
	if !isSudo {
		if ownerID == nil {
			return nil, huma.Error403Forbidden("must be from a user if not sudo")
		}
		userEnt, err := svc.databaseService.User.Get(ctx, *ownerID)
		if err != nil {
			return nil, huma.Error500InternalServerError("error while getting user")
		}
		if err := validateAppPayload(appPayload, userEnt); err != nil {
			return nil, err
		}
	}

	if appPayload.OwnerID != nil {
		ownerID = appPayload.OwnerID
	}
	if ownerID == nil {
		return nil, huma.Error403Forbidden("owner_id is required if you are not a user")
	}

	clientID := fmt.Sprintf("%s%s", clientIDPrefix, randStr(lengthOfRandStr))
	secretID := fmt.Sprintf("%s%s", secretIDPrefix, randStr(lengthOfRandStr))
	app, err := svc.databaseService.App.Create().
		SetID(clientID).
		SetSecret(secretID).
		SetName(appPayload.Name).
		SetDescription(appPayload.Description).
		SetImplicitConsent(appPayload.ImplicitConsent).
		SetOwnerID(*ownerID).
		SetRoles(appPayload.Roles).
		SetRedirectUris(appPayload.RedirectUris).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}
	return svc.Get(ctx, app.ID)
}

func (svc *appsService) Get(
	ctx context.Context,
	appID string,
) (*appsmodels.App, error) {
	app, err := svc.newQuery().
		Where(app.ID(appID)).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	return appsmodels.NewAppFromEnt(app, !hasRightOverApp(ctx, app.OwnerID)), nil
}

func (svc *appsService) Update(
	ctx context.Context,
	appID string,
	appPayload appsmodels.AppPayload,
) (*appsmodels.App, error) {
	ownerID, err := getOwnerID(ctx)
	if err != nil {
		return nil, err
	}

	reqPerms := security.PermissionsFromContext(ctx)
	app, err := svc.databaseService.App.Query().Where(app.ID(appID)).Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}
	isSudo := reqPerms.Can("/apps", "SUDO")
	if !isSudo {
		if ownerID == nil {
			return nil, huma.Error403Forbidden("must be from a user if not sudo")
		}
		userEnt, err := svc.databaseService.User.Get(ctx, *ownerID)
		if err != nil {
			return nil, huma.Error500InternalServerError("error while getting user")
		}
		if err := validateAppPayloadForUpdate(appPayload, app, userEnt); err != nil {
			return nil, err
		}
	}

	if appPayload.OwnerID != nil {
		ownerID = appPayload.OwnerID
	}
	if ownerID == nil {
		return nil, huma.Error403Forbidden("owner_id is required if you are not a user")
	}

	app, err = svc.databaseService.App.UpdateOneID(appID).
		SetName(appPayload.Name).
		SetDescription(appPayload.Description).
		SetImplicitConsent(appPayload.ImplicitConsent).
		SetOwnerID(*ownerID).
		SetRoles(appPayload.Roles).
		SetRedirectUris(appPayload.RedirectUris).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}
	return svc.Get(ctx, app.ID)
}

func (svc *appsService) Delete(
	ctx context.Context,
	appID string,
) error {
	app, err := svc.databaseService.App.Query().Where(app.ID(appID)).Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "delete")
	}
	if !hasRightOverApp(ctx, app.OwnerID) {
		return huma.Error403Forbidden("you cannot delete an app that you do not own")
	}
	err = svc.databaseService.App.DeleteOneID(appID).Exec(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "delete")
	}
	return nil
}

func (svc *appsService) Search(
	ctx context.Context,
	params appsmodels.SearchAppsParams,
) (*paging.Response[*appsmodels.App], error) {
	query := svc.newQuery()
	if params.Query != "" {
		query = query.Where(
			app.Or(
				app.NameContainsFold(params.Query),
				app.DescriptionContainsFold(params.Query),
				app.HasOwnerWith(
					user.UsernameContainsFold(params.Query),
				),
			),
		)
	}
	if params.OwnerID != "" {
		intOwnerID, err := strconv.Atoi(params.OwnerID)
		if err != nil {
			return nil, huma.Error400BadRequest("invalid owner_id")
		}
		query = query.Where(app.OwnerID(intOwnerID))
	}
	total, err := query.Count(ctx)
	if err != nil {
		return nil, err
	}
	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc("id"))
	} else {
		query = query.Order(ent.Desc("id"))
	}

	apps, err := query.All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "search")
	}

	return paging.CreatePagingResponse(appsmodels.NewAppsFromEnt(apps, true), total, params.Page, params.Limit), nil
}

func (svc *appsService) RotateSecret(
	ctx context.Context,
	appID string,
) (*appsmodels.App, error) {
	app, err := svc.databaseService.App.Query().Where(app.ID(appID)).Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "rotate secret")
	}
	if !hasRightOverApp(ctx, app.OwnerID) {
		return nil, huma.Error403Forbidden(
			"you cannot rotate the secret of an app that you do not own",
		)
	}
	secretID := fmt.Sprintf("%s%s", secretIDPrefix, randStr(lengthOfRandStr))
	app, err = svc.databaseService.App.UpdateOneID(appID).
		SetSecret(secretID).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "rotate secret")
	}
	return svc.Get(ctx, app.ID)
}

func (svc *appsService) newQuery() *ent.AppQuery {
	return svc.databaseService.App.Query().WithOwner()
}

func getOwnerID(ctx context.Context) (*int, error) {
	claims, err := security.GetClaimsFromContext(ctx)
	if err != nil {
		return nil, err
	}
	if claims.GetSubjectType() == security.SubjectTypeUser {
		userID, _ := claims.GetUserID()
		return &userID, nil
	}
	return nil, nil
}

func validateAppPayload(appPayload appsmodels.AppPayload, userEnt *ent.User) error {
	if appPayload.ImplicitConsent && userEnt.Kind != user.KindAdmin {
		return huma.Error403Forbidden(
			"you cannot edit implicit consent unless you are a staff member",
		)
	}
	if appPayload.OwnerID != nil {
		return huma.Error403Forbidden(
			"you cannot create an app as another user unless you have the permission to do so",
		)
	}
	return checkRoles(appPayload.Roles, userEnt.Roles)
}

func validateAppPayloadForUpdate(
	appPayload appsmodels.AppPayload,
	app *ent.App,
	userEnt *ent.User,
) error {
	if appPayload.OwnerID != nil && *appPayload.OwnerID != app.OwnerID {
		return huma.Error403Forbidden(
			"you are not allowed to change the owner of the app",
		)
	}
	if appPayload.ImplicitConsent != app.ImplicitConsent && userEnt.Kind != user.KindAdmin {
		return huma.Error403Forbidden(
			"you cannot edit implicit consent unless you are a staff member",
		)
	}
	if app.OwnerID != userEnt.ID {
		return huma.Error403Forbidden(
			"you cannot update an app that you do not own",
		)
	}
	return checkRoles(appPayload.Roles, userEnt.Roles)
}

func hasRightOverApp(ctx context.Context, appOwnerID int) bool {
	reqPerms := security.PermissionsFromContext(ctx)
	isSudo := reqPerms.Can("/apps", "SUDO")
	if isSudo {
		return true
	}
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return true
	}
	return userID == appOwnerID
}

//// HELPERS ////

func checkRoles(roles []string, userRoles []string) error {
	for _, role := range roles {
		found := slices.Contains(userRoles, role)
		if !found {
			return huma.Error403Forbidden(
				fmt.Sprintf(
					"you cannot create an app with role %s unless you have the permission to do so",
					role,
				),
			)
		}
	}
	return nil
}

func randStr(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0987654321")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
