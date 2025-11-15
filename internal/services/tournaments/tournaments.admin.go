package tournamentsservice

import (
	"base-website/ent"
	"base-website/ent/tournament"
	"base-website/ent/tournamentadmin"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"base-website/pkg/authz"
	"context"
	"encoding/json"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
)

func (svc *tournamentsService) GetTournamentUserRole(ctx context.Context, tournamentID int) (*tournamentadmin.Role, error) {
	meID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	if err := authz.CheckRoles(ctx, svc.databaseService, meID, "super_admin"); err != nil {
		meAdmin, err := svc.databaseService.TournamentAdmin.
			Query().
			Where(
				tournamentadmin.HasTournamentWith(tournament.IDEQ(tournamentID)),
				tournamentadmin.HasUserWith(user.IDEQ(meID)),
			).
			Only(ctx)
		if err != nil {
			return nil, svc.errorFilter.Filter(err, "create")
		}
		return &meAdmin.Role, nil
	}

	r := tournamentadmin.RoleSUPER_ADMIN
	return &r, nil
}

func (svc *tournamentsService) CreateTournament(
	ctx context.Context,
	input tournamentsmodels.CreateTournament,
) (*lightmodels.Tournament, error) {
	if !(input.RegistrationStart.Before(input.RegistrationEnd) &&
		input.RegistrationEnd.Before(input.TournamentStart)) {
		return nil, svc.errorFilter.Filter(
			fmt.Errorf("invalid tournament dates: expected registrationStart < registrationEnd < tournamentStart"),
			"create",
		)
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entBuilder := svc.databaseService.Tournament.
		Create().
		SetCreatorID(userID).
		SetSlug(input.Slug).
		SetName(input.Name).
		SetDescription(input.Description).
		SetRegistrationStart(input.RegistrationStart).
		SetRegistrationEnd(input.RegistrationEnd).
		SetTournamentStart(input.TournamentStart).
		SetMaxTeams(input.MaxTeams)

	if input.TeamStructure != nil {
		ts := make(map[string]interface{}, len(input.TeamStructure))
		for k, v := range input.TeamStructure {
			var any interface{}
			b, err := json.Marshal(v)
			if err != nil {
				return nil, svc.errorFilter.Filter(fmt.Errorf("invalid teamStructure: %w", err), "create")
			}
			if err := json.Unmarshal(b, &any); err != nil {
				return nil, svc.errorFilter.Filter(fmt.Errorf("invalid teamStructure: %w", err), "create")
			}
			ts[k] = any
		}
		entBuilder = entBuilder.SetTeamStructure(ts)
	}

	if input.CustomPageComponent != nil {
		entBuilder = entBuilder.SetCustomPageComponent(*input.CustomPageComponent)
	}

	entTournament, err := entBuilder.Save(ctx)
	if err != nil {
		return nil, err
	}

	_, err = svc.databaseService.TournamentAdmin.
		Create().
		SetRole("SUPER_ADMIN").
		SetTournamentID(entTournament.ID).
		SetUserID(userID).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	reloaded, err := svc.databaseService.Tournament.
		Query().
		Where(tournament.IDEQ(entTournament.ID)).
		WithAdmins(func(adminQuery *ent.TournamentAdminQuery) {
			adminQuery.WithUser()
		}).
		WithTeams(func(teamQuery *ent.TeamQuery) {
			teamQuery.
				WithMembers().
				WithRankGroup()
		}).
		WithCreator().
		WithRankGroups().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewTournamentFromEnt(reloaded), nil
}

func (svc *tournamentsService) AddAdminToTournament(
	ctx context.Context,
	tournamentID int,
	userID int,
	role string,
) (*lightmodels.Tournament, error) {
	myRole, err := svc.GetTournamentUserRole(ctx, tournamentID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || *myRole != tournamentadmin.RoleSUPER_ADMIN {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	exists, err := svc.databaseService.TournamentAdmin.
		Query().
		Where(
			tournamentadmin.HasTournamentWith(tournament.IDEQ(tournamentID)),
			tournamentadmin.HasUserWith(user.IDEQ(userID)),
		).
		Exist(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}
	if exists {
		return nil, huma.Error400BadRequest("user is already an admin for this tournament")
	}

	if _, err := svc.databaseService.TournamentAdmin.
		Create().
		SetTournamentID(tournamentID).
		SetUserID(userID).
		SetRole(tournamentadmin.Role(role)).
		Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}

	reloaded, err := svc.databaseService.Tournament.
		Query().
		Where(tournament.IDEQ(tournamentID)).
		WithAdmins(func(adminQuery *ent.TournamentAdminQuery) {
			adminQuery.WithUser()
		}).
		WithTeams(func(teamQuery *ent.TeamQuery) {
			teamQuery.WithMembers().WithRankGroup()
		}).
		WithCreator().
		WithRankGroups().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewTournamentFromEnt(reloaded), nil
}

func (svc *tournamentsService) EditAdminToTournament(
	ctx context.Context,
	tournamentID int,
	userID int,
	role string,
) (*lightmodels.Tournament, error) {
	myRole, err := svc.GetTournamentUserRole(ctx, tournamentID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || *myRole != tournamentadmin.RoleSUPER_ADMIN {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	existing, err := svc.databaseService.TournamentAdmin.
		Query().
		Where(
			tournamentadmin.HasTournamentWith(tournament.IDEQ(tournamentID)),
			tournamentadmin.HasUserWith(user.IDEQ(userID)),
		).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	if _, err := svc.databaseService.TournamentAdmin.
		UpdateOneID(existing.ID).
		SetRole(tournamentadmin.Role(role)).
		Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	reloaded, err := svc.databaseService.Tournament.
		Query().
		Where(tournament.IDEQ(tournamentID)).
		WithAdmins(func(adminQuery *ent.TournamentAdminQuery) {
			adminQuery.WithUser()
		}).
		WithTeams(func(teamQuery *ent.TeamQuery) {
			teamQuery.WithMembers().WithRankGroup()
		}).
		WithCreator().
		WithRankGroups().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewTournamentFromEnt(reloaded), nil
}

func (svc *tournamentsService) DeleteAdminToTournament(
	ctx context.Context,
	tournamentID int,
	userID int,
) (*lightmodels.Tournament, error) {
	myRole, err := svc.GetTournamentUserRole(ctx, tournamentID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || *myRole != tournamentadmin.RoleSUPER_ADMIN {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	existing, err := svc.databaseService.TournamentAdmin.
		Query().
		Where(
			tournamentadmin.HasTournamentWith(tournament.IDEQ(tournamentID)),
			tournamentadmin.HasUserWith(user.IDEQ(userID)),
		).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "delete")
	}

	if err := svc.databaseService.TournamentAdmin.DeleteOneID(existing.ID).Exec(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "delete")
	}

	reloaded, err := svc.databaseService.Tournament.
		Query().
		Where(tournament.IDEQ(tournamentID)).
		WithAdmins(func(adminQuery *ent.TournamentAdminQuery) {
			adminQuery.WithUser()
		}).
		WithTeams(func(teamQuery *ent.TeamQuery) {
			teamQuery.WithMembers().WithRankGroup()
		}).
		WithCreator().
		WithRankGroups().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewTournamentFromEnt(reloaded), nil
}
