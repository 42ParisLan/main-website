package teamscontroller

import (
	"base-website/internal/security"
	pubsubservice "base-website/internal/services/pubsub"
	teamsservice "base-website/internal/services/teams"
	teamsmodels "base-website/internal/services/teams/models"
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type teamController struct {
	teamsService  teamsservice.TeamsService
	pubsubService pubsubservice.PubSubService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &teamController{
		teamsService:  do.MustInvoke[teamsservice.TeamsService](injector),
		pubsubService: do.MustInvoke[pubsubservice.PubSubService](injector),
	}
	authController.Register(api)
}

func (ctrl *teamController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/tournaments/{id}/teams",
		Summary:     "Get All Teams from Tournament",
		Description: `This endpoint is used to get all teams from a tournament.`,
		Tags:        []string{"Teams"},
		OperationID: "getAllTeamsTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.getAllTeamsTournament)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/tournaments/{id}/teams",
		Summary:     "Create A Team from Tournament",
		Description: `This endpoint is used to create a team from a tournament.`,
		Tags:        []string{"Teams"},
		OperationID: "createTeamTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.createTeamTournament)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/tournaments/{id}/me/team",
		Summary:     "Get User Team from Tournament",
		Description: `This endpoint is used to get user team from a tournament.`,
		Tags:        []string{"Teams"},
		OperationID: "getUserTeamFromTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.getUserTeamFromTournament)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/teams/{id}",
		Summary:     "Get Team",
		Description: `This endpoint is used to get a team.`,
		Tags:        []string{"Teams"},
		OperationID: "getTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.getTeam)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/teams/{id}",
		Summary:     "Update Team",
		Description: `This endpoint is used to update a team.`,
		Tags:        []string{"Teams"},
		OperationID: "updateTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateTeam)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/teams/{id}",
		Summary:     "Delete Team",
		Description: `This endpoint is used to delete a team.`,
		Tags:        []string{"Teams"},
		OperationID: "deleteTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteTeam)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/teams/{id}/leave",
		Summary:     "Leave Team",
		Description: `This endpoint is used to leave a team.`,
		Tags:        []string{"Teams"},
		OperationID: "leaveTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.leaveTeam)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/teams/{id}/lock",
		Summary:     "Lock Team",
		Description: `This endpoint is used to lock a team.`,
		Tags:        []string{"Teams"},
		OperationID: "lockTeam",
		Security:    security.WithAuth("profile"),
	}, ctrl.lockTeam)
}

func (ctrl *teamController) getAllTeamsTournament(
	ctx context.Context,
	input *teamsmodels.ListTeamsParams,
) (*multipleTeamsOutput, error) {
	result, err := ctrl.teamsService.ListTeamsByTournament(ctx, input)
	if err != nil {
		return nil, err
	}
	return &multipleTeamsOutput{
		Body: result,
	}, nil
}

func (ctrl *teamController) createTeamTournament(
	ctx context.Context,
	input *createTeamInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.teamsService.CreateTeam(ctx, input.RawBody.Data(), input.TournamentID)
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}

func (ctrl *teamController) getUserTeamFromTournament(
	ctx context.Context,
	input *tournamentIDInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.teamsService.GetMyTeam(ctx, input.TournamentID)
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}

func (ctrl *teamController) getTeam(
	ctx context.Context,
	input *teamIDInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.teamsService.GetTeam(ctx, input.TeamID)
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}

func (ctrl *teamController) updateTeam(
	ctx context.Context,
	input *updateTeamInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.teamsService.UpdateTeam(ctx, input.TeamID, input.RawBody.Data())
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}

func (ctrl *teamController) deleteTeam(
	ctx context.Context,
	input *teamIDInput,
) (*BodyMessage, error) {
	err := ctrl.teamsService.DeleteTeam(ctx, input.TeamID)
	if err != nil {
		return nil, err
	}
	return &BodyMessage{
		Body: "Team Successfully deleted",
	}, nil
}

func (ctrl *teamController) leaveTeam(
	ctx context.Context,
	input *teamIDInput,
) (*BodyMessage, error) {
	err := ctrl.teamsService.LeaveTeam(ctx, input.TeamID)
	if err != nil {
		return nil, err
	}
	return &BodyMessage{
		Body: "Team Successfully leaved",
	}, nil
}

func (ctrl *teamController) lockTeam(
	ctx context.Context,
	input *teamIDInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.teamsService.LockTeam(ctx, input.TeamID)
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}
