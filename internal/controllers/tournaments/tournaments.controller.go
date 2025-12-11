package tournamentscontroller

import (
	"base-website/internal/security"
	pubsubservice "base-website/internal/services/pubsub"
	tournamentsservice "base-website/internal/services/tournaments"
	tournamentsmodels "base-website/internal/services/tournaments/models"
	"context"
	"strconv"

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
		Path:        "/tournaments/{id_or_slug}",
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

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/tournaments/{id}",
		Summary:     "Update Tournament",
		Description: `This endpoint is used to update a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "updateTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.updateTournament)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/tournaments/{id}",
		Summary:     "Delete Tournament",
		Description: `This endpoint is used to delete a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "deleteTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteTournament)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/tournaments/{id}/admin",
		Summary:     "Add admin to tournament",
		Description: `Add a user as an admin to a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "addTournamentAdmin",
		Security:    security.WithAuth("profile"),
	}, ctrl.addTournamentAdmin)

	huma.Register(api, huma.Operation{
		Method:      "PATCH",
		Path:        "/tournaments/{id}/admin/{admin_id}",
		Summary:     "edit admin of tournament",
		Description: `Edit an admin of a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "editTournamentAdmin",
		Security:    security.WithAuth("profile"),
	}, ctrl.editTournamentAdmin)

	huma.Register(api, huma.Operation{
		Method:      "DELETE",
		Path:        "/tournaments/{id}/admin/{admin_id}",
		Summary:     "delete admin of tournament",
		Description: `Delete an admin of a tournament.`,
		Tags:        []string{"Tournament"},
		OperationID: "deleteTournamentAdmin",
		Security:    security.WithAuth("profile"),
	}, ctrl.deleteTournamentAdmin)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/tournaments/{id}/end",
		Summary:     "End Tournament",
		Description: `This endpoint is used to end a tournament, set the end date to now, and delete unregistered teams without rank groups.`,
		Tags:        []string{"Tournament"},
		OperationID: "endTournament",
		Security:    security.WithAuth("profile"),
	}, ctrl.endTournament)
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
	input *TournamentIDOrSlugInput,
) (*oneTournamentOutput, error) {
	idOrSlug := input.TournamentIDOrSlug

	if id, err := strconv.Atoi(idOrSlug); err == nil {
		tournament, err := ctrl.tournamentsService.GetTournamentByID(ctx, id)
		if err != nil {
			return nil, err
		}
		return &oneTournamentOutput{Body: tournament}, nil
	}

	tournament, err := ctrl.tournamentsService.GetTournamentBySlug(ctx, idOrSlug)
	if err != nil {
		return nil, err
	}
	return &oneTournamentOutput{Body: tournament}, nil
}

func (ctrl *tournamentController) updateTournament(
	ctx context.Context,
	input *updateTournamentInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.UpdateTournament(ctx, input.TournamentID, *input.RawBody.Data())
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
	tournament, err := ctrl.tournamentsService.CreateTournament(ctx, *input.RawBody.Data())
	if err != nil {
		return nil, err
	}

	return &oneTournamentOutput{
		Body: tournament,
	}, nil
}

func (ctrl *tournamentController) deleteTournament(
	ctx context.Context,
	input *TournamentIDInput,
) (*BodyMessage, error) {
	err := ctrl.tournamentsService.DeleteTournament(ctx, input.TournamentID)
	if err != nil {
		return nil, err
	}

	return &BodyMessage{
		Body: "Success",
	}, nil
}

func (ctrl *tournamentController) addTournamentAdmin(
	ctx context.Context,
	input *addTournamentAdminInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.AddAdminToTournament(ctx, input.TournamentID, input.Body.UserID, input.Body.Role)
	if err != nil {
		return nil, err
	}
	return &oneTournamentOutput{Body: tournament}, nil
}

func (ctrl *tournamentController) editTournamentAdmin(
	ctx context.Context,
	input *editTournamentAdminInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.EditAdminToTournament(ctx, input.TournamentID, input.AdminID, input.Body)
	if err != nil {
		return nil, err
	}
	return &oneTournamentOutput{Body: tournament}, nil
}

func (ctrl *tournamentController) deleteTournamentAdmin(
	ctx context.Context,
	input *deleteTournamentAdminInput,
) (*oneTournamentOutput, error) {
	tournament, err := ctrl.tournamentsService.DeleteAdminToTournament(ctx, input.TournamentID, input.AdminID)
	if err != nil {
		return nil, err
	}
	return &oneTournamentOutput{Body: tournament}, nil
}

func (ctrl *tournamentController) endTournament(
	ctx context.Context,
	input *TournamentIDInput,
) (*BodyMessage, error) {
	err := ctrl.tournamentsService.EndTournament(ctx, input.TournamentID)
	if err != nil {
		return nil, err
	}

	return &BodyMessage{
		Body: "Tournament ended successfully",
	}, nil
}
