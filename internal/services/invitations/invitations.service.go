package invitationsservice

import (
	"base-website/ent"
	"base-website/ent/invitation"
	"base-website/ent/team"
	"base-website/ent/teammember"
	"base-website/ent/tournament"
	"base-website/ent/user"
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
	"strconv"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type InvitationsService interface {
	ListInvitationsForTeam(ctx context.Context, teamID int, params *invitationsmodels.ListInvitationsParams) (*paging.Response[*lightmodels.Invitation], error)
	DeleteInvitation(ctx context.Context, invitationID int) error
	AcceptInvitation(ctx context.Context, invitationID int) error
	CreateInvitationForTeam(ctx context.Context, teamID int, input invitationsmodels.CreateInvitation) (*lightmodels.Invitation, error)
	ListInvitationsForMe(ctx context.Context, params *invitationsmodels.ListInvitationsParams) (*paging.Response[*lightmodels.Invitation], error)
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
	teamID int,
	params *invitationsmodels.ListInvitationsParams,
) (*paging.Response[*lightmodels.Invitation], error) {
	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithTournament().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve")
	}
	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entTeam.Edges.Tournament.ID)
	if err != nil {
		return nil, err
	}
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	if myRole == nil && userID != entTeam.Edges.Creator.ID {
		return nil, huma.Error401Unauthorized("Only Creator or admin can see invitation")
	}

	query := svc.databaseService.Invitation.Query().Where(invitation.HasTeamWith(team.IDEQ(teamID)))

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

	if entTeam.Edges.Creator == nil || entTeam.Edges.Creator.ID != userID {
		return nil, huma.Error401Unauthorized("Only creator of team can invite someone")
	}

	if entTeam.Edges.Tournament == nil {
		return nil, huma.Error400BadRequest("tournament data not loaded for team")
	}
	if _, ok := entTeam.Edges.Tournament.TeamStructure[input.Role]; !ok {
		return nil, huma.Error400BadRequest(fmt.Sprintf("role '%s' doesn't exist for this tournament", input.Role))
	}

	tmExists, err := svc.databaseService.TeamMember.Query().Where(
		teammember.HasUserWith(user.IDEQ(input.UserID)),
		teammember.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)),
	).Exist(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "check_team_member")
	}
	if tmExists {
		return nil, huma.Error400BadRequest("user already has a team in this tournament")
	}

	if raw, ok := entTeam.Edges.Tournament.TeamStructure[input.Role]; ok {
		var maxAllowed int
		if m, ok := raw.(map[string]interface{}); ok {
			if mv, ok := m["max"]; ok {
				s := fmt.Sprint(mv)
				if f, err := strconv.ParseFloat(s, 64); err == nil {
					maxAllowed = int(f)
				}
			}
		}
		if maxAllowed > 0 {
			membersCount, err := svc.databaseService.TeamMember.Query().Where(
				teammember.HasTeamWith(team.IDEQ(entTeam.ID)),
				teammember.RoleEQ(input.Role),
			).Count(ctx)
			if err != nil {
				return nil, svc.errorFilter.Filter(err, "count_team_members")
			}
			invitesCount, err := svc.databaseService.Invitation.Query().Where(
				invitation.HasTeamWith(team.IDEQ(entTeam.ID)),
				invitation.RoleEQ(input.Role),
			).Count(ctx)
			if err != nil {
				return nil, svc.errorFilter.Filter(err, "count_invitations")
			}
			if membersCount+invitesCount >= maxAllowed {
				return nil, huma.Error400BadRequest(fmt.Sprintf("role '%s' is already full for this team", input.Role))
			}
		}
	}

	invExists, err := svc.databaseService.Invitation.Query().Where(
		invitation.HasTeamWith(team.IDEQ(entTeam.ID)),
		invitation.HasInviteeWith(user.IDEQ(input.UserID)),
	).Exist(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "check_invitation")
	}
	if invExists {
		return nil, huma.Error400BadRequest("invitation already exists for this user and team")
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

	reloaded, err := svc.databaseService.Invitation.Query().
		Where(invitation.IDEQ(entInvitation.ID)).
		WithInvitee().
		WithTeam().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve")
	}

	return lightmodels.NewInvitationFromEnt(ctx, reloaded, svc.s3service), nil
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

func (svc *invitationsService) AcceptInvitation(ctx context.Context, invitationID int) error {
	entInvitation, err := svc.databaseService.Invitation.Query().
		Where(invitation.IDEQ(invitationID)).
		WithInvitee().
		WithTeam(func(tQuery *ent.TeamQuery) {
			tQuery.WithTournament()
		}).
		Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "retrieve")
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	if entInvitation.Edges.Invitee == nil || entInvitation.Edges.Team == nil || entInvitation.Edges.Team.Edges.Tournament == nil {
		return svc.errorFilter.Filter(fmt.Errorf("invitation edges not loaded for id %d", entInvitation.ID), "retrieve")
	}

	if entInvitation.Edges.Invitee.ID != userID {
		return huma.Error401Unauthorized("Only Invitee can accept invitation")
	}

	if _, err := svc.databaseService.TeamMember.Create().
		SetRole(entInvitation.Role).
		SetTeamID(entInvitation.Edges.Team.ID).
		SetUserID(entInvitation.Edges.Invitee.ID).
		SetTournamentID(entInvitation.Edges.Team.Edges.Tournament.ID).
		Save(ctx); err != nil {
		return svc.errorFilter.Filter(err, "create_team_member")
	}

	_, _ = svc.databaseService.Invitation.Delete().
		Where(invitation.HasInviteeWith(user.IDEQ(userID))).
		Exec(ctx)

	return nil
}

func (svc *invitationsService) ListInvitationsForMe(
	ctx context.Context,
	params *invitationsmodels.ListInvitationsParams,
) (*paging.Response[*lightmodels.Invitation], error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	query := svc.databaseService.Invitation.Query().Where(invitation.HasInviteeWith(user.IDEQ(userID)))

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
