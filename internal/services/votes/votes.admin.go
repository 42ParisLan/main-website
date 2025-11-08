package votesservice

import (
	"base-website/ent"
	"base-website/ent/component"
	"base-website/ent/uservote"
	"base-website/ent/vote"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	votesmodels "base-website/internal/services/votes/models"
	"base-website/pkg/authz"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"time"
)

func (svc *votesService) CreateVote(
	ctx context.Context,
	input votesmodels.CreateVote,
) (*lightmodels.Vote, error) {
	if !input.StartAt.Before(input.EndAt) {
		return nil, fmt.Errorf("start_at must be before end_at")
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entVote, err := svc.databaseService.Vote.
		Create().
		SetTitle(input.Title).
		SetDescription(input.Description).
		SetStartAt(input.StartAt).
		SetEndAt(input.EndAt).
		SetCreatorID(userID).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	// Reload with needed edges (components & creator) for light model conversion
	reloaded, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(entVote.ID)).
		WithComponents().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewVoteFromEnt(ctx, reloaded, svc.s3service), nil
}

func (svc *votesService) UpdateVote(
	ctx context.Context,
	voteID int,
	input *votesmodels.UpdateVote,
) (*lightmodels.Vote, error) {
	if input == nil {
		return nil, fmt.Errorf("invalid input")
	}

	existing, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(voteID)).
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	// Check ownership
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	creator, err := existing.Edges.CreatorOrErr()
	if err != nil {
		return nil, fmt.Errorf("vote has no creator")
	}

	if creator.ID != userID {
		// Check if user is admin
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "super_admin"); err != nil {
			return nil, fmt.Errorf("only the creator or an admin can update this vote")
		}
	}

	desiredStart := existing.StartAt
	desiredEnd := existing.EndAt

	update := svc.databaseService.Vote.UpdateOneID(voteID)

	if input.Title != nil {
		update.SetTitle(*input.Title)
	}
	if input.Description != nil {
		update.SetDescription(*input.Description)
	}
	if input.StartAt != nil {
		desiredStart = *input.StartAt
		update.SetStartAt(*input.StartAt)
	}
	if input.EndAt != nil {
		desiredEnd = *input.EndAt
		update.SetEndAt(*input.EndAt)
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
	existing, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(voteID)).
		WithCreator().
		Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "get")
	}

	// Check ownership
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	creator, err := existing.Edges.CreatorOrErr()
	if err != nil {
		return fmt.Errorf("vote has no creator")
	}

	if creator.ID != userID {
		// Check if user is admin
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "super_admin"); err != nil {
			return fmt.Errorf("only the creator or an admin can delete this vote")
		}
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
	VoteID int,
) (*lightmodels.Component, error) {
	entComponent, err := svc.databaseService.Component.
		Create().
		SetName(input.Name).
		SetDescription(input.Description).
		SetColor(input.Color).
		SetVoteID(VoteID).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return lightmodels.NewComponentFromEnt(ctx, entComponent, svc.s3service), nil
}

func (svc *votesService) UpdateComponent(
	ctx context.Context,
	componentID int,
	input *votesmodels.UpdateComponent,
) (*lightmodels.Component, error) {
	if input == nil {
		return nil, fmt.Errorf("invalid input")
	}

	// Fetch component with owning vote and its creator for ownership checks
	compWithOwner, err := svc.databaseService.Component.
		Query().
		Where(component.IDEQ(componentID)).
		WithVote(func(vq *ent.VoteQuery) {
			vq.WithCreator()
		}).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	// Check ownership or admin
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	var creatorID int
	if compWithOwner.Edges.Vote != nil && compWithOwner.Edges.Vote.Edges.Creator != nil {
		creatorID = compWithOwner.Edges.Vote.Edges.Creator.ID
	}
	if creatorID != userID {
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "super_admin"); err != nil {
			return nil, fmt.Errorf("only the vote creator or an admin can update this component")
		}
	}

	update := svc.databaseService.Component.UpdateOneID(componentID)

	if input.Name != nil {
		update.SetName(*input.Name)
	}
	if input.Description != nil {
		update.SetDescription(*input.Description)
	}
	if input.Color != nil {
		update.SetColor(*input.Color)
	}

	if _, err := update.Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	component, err := svc.databaseService.Component.Get(ctx, componentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewComponentFromEnt(ctx, component, svc.s3service), nil
}

func (svc *votesService) DeleteComponent(
	ctx context.Context,
	componentID int,
) error {
	// Fetch component with owning vote and its creator for ownership checks
	compWithOwner, err := svc.databaseService.Component.
		Query().
		Where(component.IDEQ(componentID)).
		WithVote(func(vq *ent.VoteQuery) {
			vq.WithCreator()
		}).
		Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "get")
	}

	// Check ownership or admin
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}
	var creatorID int
	if compWithOwner.Edges.Vote != nil && compWithOwner.Edges.Vote.Edges.Creator != nil {
		creatorID = compWithOwner.Edges.Vote.Edges.Creator.ID
	}
	if creatorID != userID {
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "super_admin"); err != nil {
			return fmt.Errorf("only the vote creator or an admin can delete this component")
		}
	}

	if err := svc.databaseService.Component.DeleteOneID(componentID).Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_component")
	}

	return nil
}

func (svc *votesService) UpdateComponentImage(
	ctx context.Context,
	componentID int,
	reader io.Reader,
	size int64,
	contentType string,
	filename string,
) (*lightmodels.Component, error) {
	// Fetch component with owning vote and its creator for ownership checks
	compWithOwner, err := svc.databaseService.Component.
		Query().
		Where(component.IDEQ(componentID)).
		WithVote(func(vq *ent.VoteQuery) {
			vq.WithCreator()
		}).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	// Check ownership or admin
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}
	var creatorID int
	if compWithOwner.Edges.Vote != nil && compWithOwner.Edges.Vote.Edges.Creator != nil {
		creatorID = compWithOwner.Edges.Vote.Edges.Creator.ID
	}
	if creatorID != userID {
		if err := authz.CheckRoles(ctx, svc.databaseService, userID, "super_admin"); err != nil {
			return nil, fmt.Errorf("only the vote creator or an admin can update this component")
		}
	}

	// Sanitize filename and build object name
	sanitized := strings.ReplaceAll(filename, " ", "_")
	ext := filepath.Ext(sanitized)
	base := strings.TrimSuffix(sanitized, ext)
	if base == "" {
		base = "file"
	}
	objectName := fmt.Sprintf("components/%d/%d_%s%s", componentID, time.Now().UnixNano(), base, ext)

	// Upload to S3
	if err := svc.s3service.UploadObject(ctx, objectName, reader, size, contentType); err != nil {
		return nil, svc.errorFilter.Filter(err, "upload")
	}

	// Update component record with image object name
	if _, err := svc.databaseService.Component.UpdateOneID(componentID).SetImageURL(objectName).Save(ctx); err != nil {
		return nil, svc.errorFilter.Filter(err, "update_image")
	}

	component, err := svc.databaseService.Component.Get(ctx, componentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewComponentFromEnt(ctx, component, svc.s3service), nil
}
