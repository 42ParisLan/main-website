package invitationsservice

import (
	"base-website/ent"
	"base-website/ent/invitation"
	"base-website/ent/team"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	invitationsmodels "base-website/internal/services/invitations/models"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
	tournamentsservice "base-website/internal/services/tournaments"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"
	"context"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type InvitationsService interface {
	ListInvitationsForTeam(ctx context.Context, params *invitationsmodels.ListInvitationsParams) (*paging.Response[*lightmodels.Invitation], error)
	DeleteInvitation(ctx context.Context, invitationID int) error
	CreateInvitationForTeam(ctx context.Context, teamID int, input invitationsmodels.CreateInvitation) (*lightmodels.Invitation, error)
}

type invitationsService struct {
	databaseService    databaseservice.DatabaseService
	errorFilter        errorfilters.ErrorFilter
	rbacService        rbacservice.RBACService
	s3service          s3service.S3Service
	tournamentsService tournamentsservice.TournamentsService
}

func NewProvider() func(i *do.Injector) (InvitationsService, error) {
	return func(i *do.Injector) (InvitationsService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[rbacservice.RBACService](i),
			do.MustInvoke[s3service.S3Service](i),
			do.MustInvoke[tournamentsservice.TournamentsService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
	rbacService rbacservice.RBACService,
	s3service s3service.S3Service,
	tournamentsService tournamentsservice.TournamentsService,
) (InvitationsService, error) {
	return &invitationsService{
		databaseService:    databaseService,
		errorFilter:        errorfilters.NewEntErrorFilter().WithEntityTypeName("invitation"),
		rbacService:        rbacService,
		s3service:          s3service,
		tournamentsService: tournamentsService,
	}, nil
}

func (svc *invitationsService) ListInvitationsForTeam(
	ctx context.Context,
	params *invitationsmodels.ListInvitationsParams,
) (*paging.Response[*lightmodels.Invitation], error) {
	query := svc.databaseService.Invitation.Query().Where(invitation.HasTeamWith(team.IDEQ(params.TeamID)))

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc(invitation.FieldCreatedAt))
	} else {
		query = query.Order(ent.Desc(invitation.FieldCreatedAt))
	}

	invitations, err := query.
		WithTeam().
		WithInvitee().
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	limit := params.Input.Limit
	page := params.Input.Page
	return paging.CreatePagingResponse(lightmodels.NewInvitationsFromEnt(ctx, invitations, svc.s3service), total, page, limit), nil
}

func (svc *invitationsService) CreateInvitationForTeam(
	ctx context.Context,
	teamID int,
	input invitationsmodels.CreateInvitation,
) (*lightmodels.Invitation, error) {
	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithTournament().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	if entTeam.Edges.Creator.ID != userID {
		return nil, huma.Error401Unauthorized("Only creator of team can invite someone")
	}

	if entTeam.Edges.Tournament == nil {
		return nil, huma.Error400BadRequest("tournament data not loaded for team")
	}
	if _, ok := entTeam.Edges.Tournament.TeamStructure[input.Role]; !ok {
		return nil, huma.Error400BadRequest(fmt.Sprintf("role '%s' doesn't exist for this tournament", input.Role))
	}

	entInvitation, err := svc.databaseService.Invitation.Create().
		SetMessage(input.Message).
		SetRole(input.Role).
		SetInviteeID(input.UserID).
		SetTeamID(entTeam.ID).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}

	return lightmodels.NewInvitationFromEnt(ctx, entInvitation, svc.s3service), nil
}

func (svc *invitationsService) DeleteInvitation(ctx context.Context, invitationID int) error {
	entInvitation, err := svc.databaseService.Invitation.Query().
		Where(invitation.IDEQ(invitationID)).
		WithInvitee().
		WithTeam(func(tq *ent.TeamQuery) {
			tq.WithCreator().WithTournament()
		}).
		Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "retrieve")
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	allowed := false
	if entInvitation.Edges.Invitee != nil && entInvitation.Edges.Invitee.ID == userID {
		allowed = true
	}
	if !allowed && entInvitation.Edges.Team != nil && entInvitation.Edges.Team.Edges.Creator != nil && entInvitation.Edges.Team.Edges.Creator.ID == userID {
		allowed = true
	}
	if !allowed && entInvitation.Edges.Team != nil && entInvitation.Edges.Team.Edges.Tournament != nil {
		myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entInvitation.Edges.Team.Edges.Tournament.ID)
		if err != nil {
			return err
		}
		if myRole != nil {
			allowed = true
		}
	}

	if !allowed {
		return huma.Error401Unauthorized("don't have required role to delete this invitation")
	}

	if err := svc.databaseService.Invitation.DeleteOneID(entInvitation.ID).Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete")
	}

	return nil
}

// huma.Register(api, huma.Operation{
// 	Method:      "POST",
// 	Path:        "/invitations/{id}/accept",
// 	Summary:     "Accept An Invitation",
// 	Description: `This endpoint is used to accept an invitation.`,
// 	Tags:        []string{"Invitations"},
// 	OperationID: "acceptInvitation",
// 	Security:    security.WithAuth("profile"),
// }, ctrl.acceptInvitation)

// huma.Register(api, huma.Operation{
// 	Method:      "POST",
// 	Path:        "/invitations/{id}/decline",
// 	Summary:     "Decline An Invitation",
// 	Description: `This endpoint is used to decline an invitation.`,
// 	Tags:        []string{"Invitations"},
// 	OperationID: "declineInvitation",
// 	Security:    security.WithAuth("profile"),
// }, ctrl.declineInvitation)

// huma.Register(api, huma.Operation{
// 	Method:      "GET",
// 	Path:        "/users/{id}/invitations",
// 	Summary:     "Get Invitations For User",
// 	Description: `This endpoint is used to get invitations that belong to a user.`,
// 	Tags:        []string{"Invitations"},
// 	OperationID: "getInvitationsForUser",
// 	Security:    security.WithAuth("profile"),
// }, ctrl.getInvitationsForUser)
