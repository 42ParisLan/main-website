package tournamentscontroller

import (
	"base-website/internal/security"
	pubsubservice "base-website/internal/services/pubsub"
	tournamentsservice "base-website/internal/services/tournaments"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"context"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type tournamentController struct {
	tournamentsService tournamentsservice.TournamentsService
	pubsubService      pubsubservice.PubSubService
}

func Init(api huma.API, injector *do.Injector) {
	authController := &tournamentController{
		tournamentsService: do.MustInvoke[tournamentsservice.TournamentsService](injector),
		pubsubService:      do.MustInvoke[pubsubservice.PubSubService](injector),
	}
	authController.Register(api)
}

func (ctrl *tournamentController) Register(api huma.API) {
	// User routes
	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/tournaments",
		Summary:     "Get All Tournaments",
		Description: `This endpoint is used to get all tournaments.`,
		Tags:        []string{"Tournament"},
		OperationID: "getAllTournaments",
		Security:    security.WithAuth("profile"),
	}, ctrl.getAllTournaments)

	huma.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/tournaments/{id}",
		Summary:     "Get Tournament by ID",
		Description: `This endpoint is used to get a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "getTournamentByID",
		Security:    security.WithAuth("profile"),
	}, ctrl.getTournamentByID)

	// Admin routes
	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/tournaments",
		Summary:     "Create Tournament",
		Description: `This endpoint is used to create a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "createTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.createTournament)

	// huma.Register(api, huma.Operation{
	// 	Method:      "PATCH",
	// 	Path:        "/tournaments/{id}",
	// 	Summary:     "Update Tournament",
	// 	Description: `This endpoint is used to update a tournament.`,
	// 	Tags:        []string{"Tournament"},
	// 	OperationID: "updateTournament",
	// 	Security:    security.WithAuth("profile"),
	// }, ctrl.updateTournament)

	// huma.Register(api, huma.Operation{
	// 	Method:      "DELETE",
	// 	Path:        "/tournaments/{id}",
	// 	Summary:     "Delete Tournament",
	// 	Description: `This endpoint is used to delete a tournament.`,
	// 	Tags:        []string{"Tournament"},
	// 	OperationID: "deleteTournament",
	// 	Security:    security.WithAuth("profile"),
	// }, ctrl.deleteTournament)
}

func (ctrl *tournamentController) getAllTournaments(
	ctx context.Context,
	input *tournamentsmodels.ListTournamentsParams,
) (*multipleTournamentsOutput, error) {
	result, err := ctrl.tournamentsService.ListTournaments(ctx, input)
	if err != nil {
		return nil, err
	}
	return &multipleTournamentsOutput{
		Body: result,
	}, nil
}

func (ctrl *tournamentController) getTournamentByID(
	ctx context.Context,
	input *TournamentIDInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.GetTournamentByID(ctx, input.TournamentID)
	if err != nil {
		return nil, err
	}
	return &oneTournamentOutput{
		Body: tournament,
	}, nil
}

func (ctrl *tournamentController) createTournament(
	ctx context.Context,
	input *createTournamentInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.CreateTournament(ctx, *input.Body)
	if err != nil {
		return nil, err
	}

	return &oneTournamentOutput{
		Body: tournament,
	}, nil
}

// func (ctrl *tournamentController) updateTournament(
// 	ctx context.Context,
// 	input *updateTournamentInput,
// ) (*oneTournamentOutput, error) {
// 	tournament, err := ctrl.tournamentsService.UpdateTournament(ctx, input.TournamentID, input.Body)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &oneTournamentOutput{
// 		Body: tournament,
// 	}, nil
// }

// func (ctrl *tournamentController) deleteTournament(
// 	ctx context.Context,
// 	input *TournamentIDInput,
// ) (*BodyMessage, error) {
// 	err := ctrl.tournamentsService.DeleteTournament(ctx, input.TournamentID)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &BodyMessage{
// 		Body: "Success",
// 	}, nil
// }
