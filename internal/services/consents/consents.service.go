package consentsservice

import (
	"context"
	"strconv"
	"time"

	"base-website/ent"
	"base-website/ent/authrefreshtoken"
	"base-website/ent/consent"
	"base-website/ent/user"
	"base-website/internal/security"
	consentsmodels "base-website/internal/services/consents/models"
	databaseservice "base-website/internal/services/database"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type ConsentService interface {
	Get(ctx context.Context, id int) (*consentsmodels.Consent, error)
	Search(
		ctx context.Context,
		params *consentsmodels.SearchConsentsParams,
	) (*paging.Response[*consentsmodels.Consent], error)
	Delete(ctx context.Context, id int) error
}

type consentService struct {
	entClient   *ent.Client
	errorFilter errorfilters.ErrorFilter
}

func NewProvider() func(i *do.Injector) (ConsentService, error) {
	return func(i *do.Injector) (ConsentService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
) (*consentService, error) {
	return &consentService{
		entClient:   databaseService,
		errorFilter: errorfilters.NewEntErrorFilter().WithEntityTypeName("Consent"),
	}, nil
}

func (svc *consentService) Get(ctx context.Context, id int) (*consentsmodels.Consent, error) {
	consentEnt, err := svc.newQuery().Where(consent.ID(id)).Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get", id)
	}
	return consentsmodels.NewConsentFromEnt(consentEnt), nil
}

func (svc *consentService) Search(
	ctx context.Context,
	params *consentsmodels.SearchConsentsParams,
) (*paging.Response[*consentsmodels.Consent], error) {
	query := svc.newQuery()
	if params.UserID != "" {
		userID, err := strconv.Atoi(params.UserID)
		if err != nil {
			return nil, huma.Error400BadRequest("user_id must be an integer")
		}
		query.Where(consent.HasUserWith(user.ID(userID)))
	}
	if params.ApplicationID != "" {
		query.Where(consent.ApplicationID(params.ApplicationID))
	}
	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "search")
	}
	query = paging.ApplyQueryPaging(query, params.Input)

	consentEnts, err := query.All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "search")
	}
	return paging.CreatePagingResponse(consentsmodels.NewConsentsFromEnt(consentEnts), total, params.Page, params.Limit), nil
}

func (svc *consentService) Delete(ctx context.Context, id int) error {
	reqPerms := security.PermissionsFromContext(ctx)
	consentEnt, err := svc.entClient.Consent.Get(ctx, id)
	if err != nil {
		return svc.errorFilter.Filter(err, "delete", id)
	}
	if !reqPerms.Can("/consents", "SUDO") {
		userID, err := security.GetUserIDFromContext(ctx)
		if err != nil {
			return huma.Error403Forbidden("your app is not allowed to delete consents")
		}
		if consentEnt.UserID != userID {
			return huma.Error403Forbidden("you cannot delete a consent that you do not own")
		}
	}
	err = svc.entClient.Consent.DeleteOneID(id).Exec(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "delete", id)
	}
	_, _ = svc.entClient.AuthRefreshToken.Delete().Where(
		authrefreshtoken.ApplicationID(consentEnt.ApplicationID),
		authrefreshtoken.UserID(strconv.Itoa(consentEnt.UserID)),
	).Exec(ctx)
	return nil
}

func (svc *consentService) newQuery() *ent.ConsentQuery {
	return svc.entClient.Consent.Query().
		WithUser().
		WithApplication(func(q *ent.AppQuery) {
			q.WithOwner()
		}).
		Where(consent.ExpirationDateGT(time.Now()))
}
