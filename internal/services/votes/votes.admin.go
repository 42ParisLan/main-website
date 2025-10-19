package votesservice

import (
	"base-website/ent/component"
	"base-website/ent/uservote"
	"base-website/ent/vote"
	"base-website/internal/lightmodels"
	votesmodels "base-website/internal/services/votes/models"
	"context"
	"fmt"
)

func (svc *votesService) CreateVote(
	ctx context.Context,
	input votesmodels.CreateVote,
) (*lightmodels.Vote, error) {
	if !input.StartAt.Before(input.EndAt) {
		return nil, fmt.Errorf("start_at must be before end_at")
	}
	entVote, err := svc.databaseService.Vote.
		Create().
		SetTitle(input.Title).
		SetDescription(input.Description).
		SetStartAt(input.StartAt).
		SetEndAt(input.EndAt).
		SetVisible(input.Visible).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return lightmodels.NewVoteFromEnt(entVote), nil
}

func (svc *votesService) UpdateVote(
	ctx context.Context,
	voteID int,
	input *votesmodels.UpdateVote,
) (*lightmodels.Vote, error) {
	if input == nil {
		return nil, fmt.Errorf("invalid input")
	}

	existing, err := svc.databaseService.Vote.Get(ctx, voteID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	desiredStart := existing.StartAt
	desiredEnd := existing.EndAt

	update := svc.databaseService.Vote.UpdateOneID(voteID)

	if input.Title != "" {
		update.SetTitle(input.Title)
	}
	if input.Description != "" {
		update.SetDescription(input.Description)
	}
	if !input.StartAt.IsZero() {
		desiredStart = input.StartAt
		update.SetStartAt(input.StartAt)
	}
	if !input.EndAt.IsZero() {
		desiredEnd = input.EndAt
		update.SetEndAt(input.EndAt)
	}

	if input.Visible != nil {
		update.SetVisible(*input.Visible)
	}

	if !desiredStart.Before(desiredEnd) {
		return nil, fmt.Errorf("start_at must be before end_at")
	}

	if _, err := update.Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	return svc.GetVoteByID(ctx, voteID)
}

func (svc *votesService) DeleteVote(
	ctx context.Context,
	voteID int,
) error {
	if _, err := svc.databaseService.Vote.Get(ctx, voteID); err != nil {
		return svc.errorFilter.Filter(err, "get")
	}

	if _, err := svc.databaseService.UserVote.
		Delete().
		Where(uservote.HasComponentWith(component.HasVoteWith(vote.IDEQ(voteID)))).
		Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_uservotes")
	}

	if _, err := svc.databaseService.Component.
		Delete().
		Where(component.HasVoteWith(vote.IDEQ(voteID))).
		Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_components")
	}

	if err := svc.databaseService.Vote.DeleteOneID(voteID).Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_vote")
	}

	return nil
}

func (svc *votesService) CreateComponent(
	ctx context.Context,
	input votesmodels.CreateComponent,
) (*lightmodels.Component, error) {
	entComponent, err := svc.databaseService.Component.
		Create().
		SetName(input.Name).
		SetDescription(input.Description).
		SetImageURL(input.ImageURL).
		SetColor(input.Color).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return lightmodels.NewComponentFromEnt(entComponent), nil
}

func (svc *votesService) UpdateComponent(
	ctx context.Context,
	componentID int,
	input *votesmodels.UpdateComponent,
) (*lightmodels.Component, error) {
	if input == nil {
		return nil, fmt.Errorf("invalid input")
	}

	_, err := svc.databaseService.Component.Get(ctx, componentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	update := svc.databaseService.Component.UpdateOneID(componentID)

	if input.Name != "" {
		update.SetName(input.Name)
	}
	if input.Description != "" {
		update.SetDescription(input.Description)
	}
	if input.ImageURL != "" {
		update.SetImageURL(input.ImageURL)
	}
	if input.Color != "" {
		update.SetColor(input.Color)
	}

	if _, err := update.Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	component, err := svc.databaseService.Component.Get(ctx, componentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewComponentFromEnt(component), nil
}

func (svc *votesService) DeleteComponent(
	ctx context.Context,
	componentID int,
) error {
	_, err := svc.databaseService.Component.Get(ctx, componentID)
	if err != nil {
		return svc.errorFilter.Filter(err, "get")
	}

	if err := svc.databaseService.Component.DeleteOneID(componentID).Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_component")
	}

	return nil
}
