package teamsservice

import (
	"base-website/ent"
	"base-website/ent/team"
	"base-website/ent/teammember"
	"base-website/ent/tournament"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
	teamsmodels "base-website/internal/services/teams/models"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type TeamsService interface {
	ListTeamsByTournament(ctx context.Context, params *teamsmodels.ListTeamsParams) (*paging.Response[*lightmodels.LightTeam], error)
	CreateTeam(ctx context.Context, input *teamsmodels.CreateTeam, tournamentID int) (*lightmodels.LightTeam, error)
	GetMyTeam(ctx context.Context, tournamentID int) (*lightmodels.LightTeam, error)
}

type teamsService struct {
	databaseService databaseservice.DatabaseService
	errorFilter     errorfilters.ErrorFilter
	rbacService     rbacservice.RBACService
	s3service       s3service.S3Service
}

func NewProvider() func(i *do.Injector) (TeamsService, error) {
	return func(i *do.Injector) (TeamsService, error) {
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
) (TeamsService, error) {
	return &teamsService{
		databaseService: databaseService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("team"),
		rbacService:     rbacService,
		s3service:       s3service,
	}, nil
}

func (svc *teamsService) ListTeamsByTournament(
	ctx context.Context,
	params *teamsmodels.ListTeamsParams,
) (*paging.Response[*lightmodels.LightTeam], error) {
	query := svc.databaseService.Team.Query().Where(team.HasTournamentWith(tournament.IDEQ(params.TournamentID)))

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc(team.FieldID))
	} else {
		query = query.Order(ent.Desc(team.FieldID))
	}

	teams, err := query.
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	limit := params.Input.Limit
	page := params.Input.Page
	return paging.CreatePagingResponse(lightmodels.NewLightTeamsFromEnt(ctx, teams, svc.s3service), total, page, limit), nil
}

func (svc *teamsService) CreateTeam(
	ctx context.Context,
	input *teamsmodels.CreateTeam,
	tournamentID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeamMember, err := svc.databaseService.TeamMember.Query().Where(
		teammember.HasUserWith(user.IDEQ(userID)),
		teammember.HasTournamentWith(tournament.IDEQ(tournamentID)),
	).Only(ctx)
	if err == nil {
		return nil, huma.Error401Unauthorized("user has already a team in this tournament")
	}

	entTournament, err := svc.databaseService.Tournament.Get(ctx, tournamentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve tournament")
	}

	now := time.Now()
	if now.Before(entTournament.RegistrationStart) || now.After(entTournament.RegistrationEnd) {
		return nil, huma.Error401Unauthorized("tournament isn't in registration phase")
	}

	_, exists := entTournament.TeamStructure[input.CreatorStatus]
	if !exists {
		return nil, huma.Error400BadRequest(fmt.Sprintf("status '%s' not found for tournament", input.CreatorStatus))
	}

	entTeam, err := svc.databaseService.Team.
		Create().
		SetName(input.Name).
		SetTournamentID(entTournament.ID).
		SetCreatorID(userID).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create team")
	}

	entTeamMember, err = svc.databaseService.TeamMember.
		Create().
		SetTeamID(entTeam.ID).
		SetUserID(userID).
		SetTournamentID(entTournament.ID).
		SetRole(input.CreatorStatus).
		Save(ctx)
	if err != nil {
		svc.databaseService.Team.Delete().Where(team.ID(entTeam.ID)).Exec(ctx)
		return nil, svc.errorFilter.Filter(err, "create team member")
	}

	if input.Image.Filename != "" {
		sanitized := strings.ReplaceAll(input.Image.Filename, " ", "_")
		ext := filepath.Ext(sanitized)
		base := strings.TrimSuffix(sanitized, ext)
		if base == "" {
			base = "file"
		}

		objectName := fmt.Sprintf("teams/%d/%d_%s%s", entTeam.ID, time.Now().UnixNano(), base, ext)

		if err := svc.s3service.UploadObject(ctx, objectName, input.Image.File, input.Image.Size, input.Image.ContentType); err != nil {
			return nil, svc.errorFilter.Filter(err, "upload image")
		}

		entTeam, err = svc.databaseService.Team.
			UpdateOneID(entTeam.ID).
			SetImageURL(objectName).
			Save(ctx)
		if err != nil {
			svc.s3service.RemoveObject(ctx, objectName)
			svc.databaseService.Team.Delete().Where(team.ID(entTeam.ID)).Exec(ctx)
			svc.databaseService.TeamMember.Delete().Where(teammember.ID(entTeamMember.ID)).Exec(ctx)
			return nil, svc.errorFilter.Filter(err, "update team image")
		}
	}

	entTeam, err = svc.databaseService.Team.
		Query().
		Where(team.IDEQ(entTeam.ID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve team")
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}

func (svc *teamsService) GetMyTeam(
	ctx context.Context,
	tournamentID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeamMember, err := svc.databaseService.TeamMember.Query().Where(
		teammember.HasUserWith(user.IDEQ(userID)),
		teammember.HasTournamentWith(tournament.IDEQ(tournamentID)),
	).Only(ctx)
	if err != nil {
		return nil, err
	}

	entTeam, err := entTeamMember.
		QueryTeam().
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}
