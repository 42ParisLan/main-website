package tournamentsservice

import (
	"base-website/ent"
	"base-website/ent/tournament"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"base-website/pkg/authz"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"
	"context"

	"github.com/samber/do"
)

type TournamentsService interface {
	// User
	ListTournaments(ctx context.Context, params *tournamentsmodels.ListTournamentsParams) (*paging.Response[*lightmodels.LightTournament], error)
	GetTournamentByID(ctx context.Context, tournamentID int) (*lightmodels.Tournament, error)
	// Admins
	CreateTournament(ctx context.Context, input tournamentsmodels.CreateTournament) (*lightmodels.Tournament, error)
}

type tournamentsService struct {
	databaseService databaseservice.DatabaseService
	errorFilter     errorfilters.ErrorFilter
	rbacService     rbacservice.RBACService
	s3service       s3service.S3Service
}

func NewProvider() func(i *do.Injector) (TournamentsService, error) {
	return func(i *do.Injector) (TournamentsService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[rbacservice.RBACService](i),
			do.MustInvoke[s3service.S3Service](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
	rbacService rbacservice.RBACService,
	s3service s3service.S3Service,
) (TournamentsService, error) {
	return &tournamentsService{
		databaseService: databaseService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("user"),
		rbacService:     rbacService,
		s3service:       s3service,
	}, nil
}

func (svc *tournamentsService) ListTournaments(
	ctx context.Context,
	params *tournamentsmodels.ListTournamentsParams,
) (*paging.Response[*lightmodels.LightTournament], error) {
	query := svc.databaseService.Tournament.Query()

	if params.Visible == "visible" {
		query = query.Where(tournament.IsVisibleEQ(true))
	} else {
		userID, err := security.GetUserIDFromContext(ctx)
		if err != nil {
			return nil, err
		}
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "admin", "super_admin"); err != nil {
			return nil, err
		}
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

	tournaments, err := query.WithCreator().All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	limit := params.Input.Limit
	page := params.Input.Page
	return paging.CreatePagingResponse(lightmodels.NewLightTournamentsFromEnt(tournaments), total, page, limit), nil
}

func (svc *tournamentsService) GetTournamentByID(
	ctx context.Context,
	tournamentID int,
) (*lightmodels.Tournament, error) {
	entTournament, err := svc.databaseService.Tournament.
		Query().
		Where(tournament.IDEQ(tournamentID)).
		WithAdmins().
		WithTeams().
		WithCreator().
		WithRankGroups().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewTournamentFromEnt(entTournament), nil
}
