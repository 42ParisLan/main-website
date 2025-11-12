package tournamentsservice

import (
	"base-website/ent"
	"base-website/ent/tournament"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"context"
	"fmt"
)

func (svc *tournamentsService) CreateTournament(
	ctx context.Context,
	input tournamentsmodels.CreateTournament,
) (*lightmodels.Tournament, error) {
	if !(input.RegistrationStart.Before(input.RegistrationEnd) &&
		input.RegistrationEnd.Before(input.TournamentStart) &&
		input.TournamentStart.Before(input.TournamentEnd)) {
		return nil, svc.errorFilter.Filter(
			fmt.Errorf("invalid tournament dates: expected registrationStart < registrationEnd < tournamentStart < tournamentEnd"),
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
		SetTournamentEnd(input.TournamentEnd).
		SetMaxTeams(input.MaxTeams)

	if input.TeamStructure != nil {
		if ts, ok := input.TeamStructure.(map[string]interface{}); ok {
			entBuilder = entBuilder.SetTeamStructure(ts)
		} else {
			return nil, svc.errorFilter.Filter(fmt.Errorf("invalid teamStructure: expected object"), "create")
		}
	}

	if input.CustomPageComponent != nil {
		entBuilder = entBuilder.SetCustomPageComponent(*input.CustomPageComponent)
	}
	if input.ExternalLink != nil {
		entBuilder = entBuilder.SetExternalLink(*input.ExternalLink)
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
