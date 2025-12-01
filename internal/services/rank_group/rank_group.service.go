package rankgroupservice

import (
	"base-website/ent"
	"base-website/ent/rankgroup"
	"base-website/ent/team"
	"base-website/ent/tournament"
	"base-website/ent/tournamentadmin"
	"base-website/internal/lightmodels"
	databaseservice "base-website/internal/services/database"
	rankgroupmodels "base-website/internal/services/rank_group/models"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
	tournamentsservice "base-website/internal/services/tournaments"
	"base-website/pkg/errorfilters"
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type RankGroupService interface {
	ListRankGroupsByTournament(ctx context.Context, tournamentID int) ([]*lightmodels.LightRankGroup, error)
	UpdateRankGroupsByTournament(ctx context.Context, tournamentID int, rankgroups []rankgroupmodels.UpdateRankGroup) ([]*lightmodels.LightRankGroup, error)
	UpdateTeamRankGroup(ctx context.Context, teamID int, rankGroupID int) (*lightmodels.LightTeam, error)
}

type rankGroupService struct {
	databaseService    databaseservice.DatabaseService
	errorFilter        errorfilters.ErrorFilter
	rbacService        rbacservice.RBACService
	s3service          s3service.S3Service
	tournamentsService tournamentsservice.TournamentsService
}

func NewProvider() func(i *do.Injector) (RankGroupService, error) {
	return func(i *do.Injector) (RankGroupService, error) {
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
) (RankGroupService, error) {
	return &rankGroupService{
		databaseService:    databaseService,
		errorFilter:        errorfilters.NewEntErrorFilter().WithEntityTypeName("rank_group"),
		rbacService:        rbacService,
		s3service:          s3service,
		tournamentsService: tournamentsService,
	}, nil
}

func (svc *rankGroupService) ListRankGroupsByTournament(
	ctx context.Context,
	tournamentID int,
) ([]*lightmodels.LightRankGroup, error) {
	rankgroups, err := svc.databaseService.RankGroup.Query().
		Where(rankgroup.HasTournamentWith(tournament.IDEQ(tournamentID))).
		All(ctx)
	if err != nil {
		return nil, err
	}
	return lightmodels.NewLightRankGroupsFromEnt(rankgroups), nil
}

func (svc *rankGroupService) UpdateRankGroupsByTournament(
	ctx context.Context,
	tournamentID int,
	rankgroups []rankgroupmodels.UpdateRankGroup,
) ([]*lightmodels.LightRankGroup, error) {
	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, tournamentID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || *myRole == tournamentadmin.RoleADMIN {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	_, err = svc.databaseService.RankGroup.Delete().Where(rankgroup.HasTournamentWith(tournament.IDEQ(tournamentID))).Exec(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "delete rank_groups")
	}

	for _, rankgroup := range rankgroups {
		svc.databaseService.RankGroup.Create().
			SetName(GetNameFromRankRange(rankgroup.RankMin, rankgroup.RankMax)).
			SetPosition(rankgroup.Position).
			SetRankMin(rankgroup.RankMin).
			SetRankMax(rankgroup.RankMax).
			SetTournamentID(tournamentID).
			Exec(ctx)
	}
	newRankGroups, err := svc.databaseService.RankGroup.Query().
		Where(rankgroup.HasTournamentWith(tournament.IDEQ(tournamentID))).
		All(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightRankGroupsFromEnt(newRankGroups), nil
}

func (svc *rankGroupService) UpdateTeamRankGroup(
	ctx context.Context,
	teamID int,
	rankGroupID int,
) (*lightmodels.LightTeam, error) {
	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithTournament().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get team")
	}

	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entTeam.Edges.Tournament.ID)
	if err != nil {
		return nil, err
	}
	if myRole == nil {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	entTeam, err = svc.databaseService.Team.UpdateOneID(teamID).SetRankGroupID(rankGroupID).Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update team rank group")
	}

	entTeam, err = svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(q *ent.TeamMemberQuery) {
			q.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get team")
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}
