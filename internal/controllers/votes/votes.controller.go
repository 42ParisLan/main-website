package votescontroller

import (
	"base-website/internal/security"
	pubsubservice "base-website/internal/services/pubsub"
	votesservice "base-website/internal/services/votes"
	votesmodels "base-website/internal/services/votes/models"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/sse"
	"github.com/samber/do"
)

type voteController struct {
	votesService  votesservice.VotesService
	pubsubService pubsubservice.PubSubService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &voteController{
		votesService:  do.MustInvoke[votesservice.VotesService](injector),
		pubsubService: do.MustInvoke[pubsubservice.PubSubService](injector),
	}
	authController.Register(api)
}

func (ctrl *voteController) Register(api huma.API) {
	// User routes
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/votes",
		Summary:     "Get All Votes",
		Description: `This endpoint is used to get all votes.`,
		Tags:        []string{"Vote"},
		OperationID: "getAllVotes",
		Security:    security.WithAuth("profile"),
	}, ctrl.getAllVotes)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/votes/{id}",
		Summary:     "Get Vote by ID",
		Description: `This endpoint is used to get a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "getVoteByID",
		Security:    security.WithAuth("profile"),
	}, ctrl.getVoteByID)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/votes/{id}/submit",
		Summary:     "Submit Vote",
		Description: `This endpoint is used to submit a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "submitVote",
		Security:    security.WithAuth("profile"),
	}, ctrl.submitVote)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/votes/{id}/results",
		Summary:     "Get Vote results",
		Description: `This endpoint is used to get vote results.`,
		Tags:        []string{"Vote"},
		OperationID: "getResults",
		Security:    security.WithAuth("profile"),
	}, ctrl.getResults)

	// Admin routes
	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/votes",
		Summary:     "Create Vote",
		Description: `This endpoint is used to create a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "createVote",
		Security:    security.WithAuth("profile"),
	}, ctrl.createVote)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/votes/{id}",
		Summary:     "Update Vote",
		Description: `This endpoint is used to update a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "updateVote",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateVote)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/votes/{id}",
		Summary:     "Delete Vote",
		Description: `This endpoint is used to delete a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "deleteVote",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteVote)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/votes/{id}/components",
		Summary:     "Create Component",
		Description: `This endpoint is used to create a component for a vote.`,
		Tags:        []string{"Vote"},
		OperationID: "createComponent",
		Security:    security.WithAuth("profile"),
	}, ctrl.createComponent)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/components/{id}",
		Summary:     "Update Component",
		Description: `This endpoint is used to update a component.`,
		Tags:        []string{"Vote"},
		OperationID: "updateComponent",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateComponent)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/components/{id}/image",
		Summary:     "Update Component Image",
		Description: `This endpoint is used to update component image.`,
		Tags:        []string{"Vote"},
		OperationID: "updateComponentImage",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateComponentImage)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/components/{id}",
		Summary:     "DELETE Component",
		Description: `This endpoint is used to delete a component.`,
		Tags:        []string{"Vote"},
		OperationID: "deleteComponent",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteComponent)

	sse.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/votes/{id}/live",
		Summary:     "Live updates for a vote",
		Description: `Server-Sent Events stream that sends live vote results in real-time when votes are submitted. First sends a connection confirmation message, then streams updated results as they occur.`,
		Tags:        []string{"Vote"},
		OperationID: "liveVote",
		Security:    security.WithAuth("profile"),
	}, map[string]any{
		"message": votesmodels.ResultsResponse{},
	}, ctrl.liveVote)
}

func (ctrl *voteController) getAllVotes(
	ctx context.Context,
	input *votesmodels.ListVotesParams,
) (*multipleVotesOutput, error) {
	result, err := ctrl.votesService.ListVotes(ctx, input)
	if err != nil {
		return nil, err
	}
	return &multipleVotesOutput{
		Body: result,
	}, nil
}

func (ctrl *voteController) getVoteByID(
	ctx context.Context,
	input *VoteIDInput,
) (*oneVoteOutput, error) {
	vote, err := ctrl.votesService.GetVoteByID(ctx, input.VoteID)
	if err != nil {
		return nil, err
	}
	return &oneVoteOutput{
		Body: vote,
	}, nil
}

func (ctrl *voteController) submitVote(
	ctx context.Context,
	input *submitVoteInput,
) (*BodyMessage, error) {
	results, err := ctrl.votesService.SubmitVote(ctx, input.Body, input.VoteID)
	if err != nil {
		return nil, err
	}

	resultsJSON, err := json.Marshal(results)
	if err == nil {
		ctrl.pubsubService.Publish(ctx, fmt.Sprintf("Vote:%d", input.VoteID), resultsJSON)
	}

	return &BodyMessage{
		Body: "Success",
	}, nil
}

func (ctrl *voteController) getResults(
	ctx context.Context,
	input *VoteIDInput,
) (*getResultsOutput, error) {
	result, err := ctrl.votesService.GetResults(ctx, input.VoteID, false)
	if err != nil {
		return nil, err
	}

	return &getResultsOutput{
		Body: result,
	}, nil
}

func (ctrl *voteController) createVote(
	ctx context.Context,
	input *createVoteInput,
) (*oneVoteOutput, error) {
	vote, err := ctrl.votesService.CreateVote(ctx, *input.Body)
	if err != nil {
		return nil, err
	}

	return &oneVoteOutput{
		Body: vote,
	}, nil
}

func (ctrl *voteController) updateVote(
	ctx context.Context,
	input *updateVoteInput,
) (*oneVoteOutput, error) {
	vote, err := ctrl.votesService.UpdateVote(ctx, input.VoteID, input.Body)
	if err != nil {
		return nil, err
	}

	return &oneVoteOutput{
		Body: vote,
	}, nil
}

func (ctrl *voteController) deleteVote(
	ctx context.Context,
	input *VoteIDInput,
) (*BodyMessage, error) {
	err := ctrl.votesService.DeleteVote(ctx, input.VoteID)
	if err != nil {
		return nil, err
	}

	return &BodyMessage{
		Body: "Success",
	}, nil
}

func (ctrl *voteController) createComponent(
	ctx context.Context,
	input *createComponentInput,
) (*oneComponentOutput, error) {
	component, err := ctrl.votesService.CreateComponent(ctx, *input.Body, input.VoteID)
	if err != nil {
		return nil, err
	}

	return &oneComponentOutput{
		Body: component,
	}, nil
}

func (ctrl *voteController) updateComponent(
	ctx context.Context,
	input *updateComponentInput,
) (*oneComponentOutput, error) {
	component, err := ctrl.votesService.UpdateComponent(ctx, input.ComponentID, input.Body)
	if err != nil {
		return nil, err
	}

	return &oneComponentOutput{
		Body: component,
	}, nil
}

func (ctrl *voteController) updateComponentImage(
	ctx context.Context,
	input *updateComponentImageInput,
) (*oneComponentOutput, error) {
	if input == nil || len(input.RawBody.File) == 0 {
		return nil, fmt.Errorf("invalid input: image file required")
	}

	for _, fhs := range input.RawBody.File {
		fh := fhs[0]

		ct := fh.Header.Get("Content-Type")
		if ct == "" || !strings.HasPrefix(ct, "image/") {
			return nil, fmt.Errorf("invalid content type: %s", ct)
		}

		file, err := fh.Open()
		if err != nil {
			return nil, err
		}

		comp, err := ctrl.votesService.UpdateComponentImage(ctx, input.ComponentID, file, fh.Size, ct, fh.Filename)

		_ = file.Close()
		if err != nil {
			return nil, err
		}

		return &oneComponentOutput{
			Body: comp,
		}, nil
	}

	return nil, fmt.Errorf("no file processed")
}

func (ctrl *voteController) deleteComponent(
	ctx context.Context,
	input *ComponentIDInput,
) (*BodyMessage, error) {
	err := ctrl.votesService.DeleteComponent(ctx, input.ComponentID)
	if err != nil {
		return nil, err
	}

	return &BodyMessage{
		Body: "Success",
	}, nil
}

func (ctrl *voteController) liveVote(
	ctx context.Context,
	input *VoteIDInput,
	send sse.Sender,
) {
	result, err := ctrl.votesService.GetResults(ctx, input.VoteID, true)
	if err != nil {
		return
	}

	_ = send.Data(result)

	_ = ctrl.pubsubService.Subscribe(ctx, fmt.Sprintf("Vote:%d", input.VoteID), func(message []byte) error {
		var results votesmodels.ResultsResponse
		if err := json.Unmarshal(message, &results); err != nil {
			return err
		}

		return send.Data(results)
	})
}
