package rankgroupcontroller

import (
	"base-website/internal/security"
	pubsubservice "base-website/internal/services/pubsub"
	rankgroupservice "base-website/internal/services/rank_group"
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type rankGroupController struct {
	pubsubService    pubsubservice.PubSubService
	rankGroupService rankgroupservice.RankGroupService
}

func Init(api huma.API, injector *do.Injector) {
	ctrl := &rankGroupController{
		pubsubService:    do.MustInvoke[pubsubservice.PubSubService](injector),
		rankGroupService: do.MustInvoke[rankgroupservice.RankGroupService](injector),
	}
	ctrl.Register(api)
}

func (ctrl *rankGroupController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/tournaments/{id}/rank-groups",
		Summary:     "Get All Rank Groups from Tournament",
		Description: `This endpoint is used to get all rank groups from a tournament.`,
		Tags:        []string{"RankGroups"},
		OperationID: "getAllRankGroupsTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.getAllRankGroupsTournament)

	huma.Register(api, huma.Operation{
		Method:      "PUT",
		Path:        "/tournaments/{id}/rank-groups",
		Summary:     "Update Rank Groups for Tournament",
		Description: `This endpoint is used to update rank groups for a tournament.`,
		Tags:        []string{"RankGroups"},
		OperationID: "updateRankGroupsTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateRankGroupsTournament)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/teams/{id}/rank-group",
		Summary:     "Update Team Rank Group",
		Description: `This endpoint is used to update the rank group of a team.`,
		Tags:        []string{"RankGroups"},
		OperationID: "updateTeamRankGroup",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateTeamRankGroup)
}

func (ctrl *rankGroupController) getAllRankGroupsTournament(
	ctx context.Context,
	input *tournamentIDInput,
) (*multipleRankGroupsOutput, error) {
	result, err := ctrl.rankGroupService.ListRankGroupsByTournament(ctx, input.TournamentID)
	if err != nil {
		return nil, err
	}
	return &multipleRankGroupsOutput{
		Body: result,
	}, nil
}

func (ctrl *rankGroupController) updateRankGroupsTournament(
	ctx context.Context,
	input *updateRankGroupsInput,
) (*multipleRankGroupsOutput, error) {
	result, err := ctrl.rankGroupService.UpdateRankGroupsByTournament(ctx, input.TournamentID, input.Body)
	if err != nil {
		return nil, err
	}
	return &multipleRankGroupsOutput{
		Body: result,
	}, nil
}

func (ctrl *rankGroupController) updateTeamRankGroup(
	ctx context.Context,
	input *updateTeamRankGroupInput,
) (*oneTeamOutput, error) {
	result, err := ctrl.rankGroupService.UpdateTeamRankGroup(ctx, input.TeamID, input.Body.RankGroupID)
	if err != nil {
		return nil, err
	}
	return &oneTeamOutput{
		Body: result,
	}, nil
}
