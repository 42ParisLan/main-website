package votesservice

import (
	"base-website/ent"
	"base-website/ent/component"
	"base-website/ent/user"
	"base-website/ent/uservote"
	"base-website/ent/vote"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	rbacservice "base-website/internal/services/rbac"
	votesmodels "base-website/internal/services/votes/models"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/samber/do"
)

type VotesService interface {
	// User
	ListVotes(ctx context.Context, params *votesmodels.ListVotesParams) (*votesmodels.ListResult, error)
	GetVoteByID(ctx context.Context, voteID int) (*lightmodels.Vote, error)
	SubmitVote(ctx context.Context, componentID int, voteID int) (*votesmodels.ResultsResponse, error)
	GetResults(ctx context.Context, voteID int, live bool) (*votesmodels.ResultsResponse, error)

	// Admins
	CreateVote(ctx context.Context, input votesmodels.CreateVote) (*lightmodels.Vote, error)
	UpdateVote(ctx context.Context, voteID int, input *votesmodels.UpdateVote) (*lightmodels.Vote, error)
	DeleteVote(ctx context.Context, voteID int) error

	CreateComponent(ctx context.Context, input votesmodels.CreateComponent, VoteID int) (*lightmodels.Component, error)
	UpdateComponent(ctx context.Context, componentID int, input *votesmodels.UpdateComponent) (*lightmodels.Component, error)
	DeleteComponent(ctx context.Context, componentID int) error
}

type votesService struct {
	databaseService databaseservice.DatabaseService
	errorFilter     errorfilters.ErrorFilter
	rbacService     rbacservice.RBACService
}

func NewProvider() func(i *do.Injector) (VotesService, error) {
	return func(i *do.Injector) (VotesService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[rbacservice.RBACService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
	rbacService rbacservice.RBACService,
) (VotesService, error) {
	return &votesService{
		databaseService: databaseService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("user"),
		rbacService:     rbacService,
	}, nil
}

func (svc *votesService) ListVotes(
	ctx context.Context,
	params *votesmodels.ListVotesParams,
) (*votesmodels.ListResult, error) {
	query := svc.databaseService.Vote.Query()

	if params.Visible == "visible" {
		query = query.Where(vote.VisibleEQ(true))
	} else {
		err := svc.CheckModo(ctx)
		if err != nil {
			return nil, err
		}
	}

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc("id"))
	} else {
		query = query.Order(ent.Desc("id"))
	}

	votes, err := query.WithComponents().All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	return &votesmodels.ListResult{
		Votes: lightmodels.NewLightVotesFromEnt(votes),
		Response: paging.Response{
			Total: total,
		},
	}, nil
}

func (svc *votesService) GetVoteByID(
	ctx context.Context,
	voteID int,
) (*lightmodels.Vote, error) {
	entVote, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(voteID)).
		WithComponents().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}
	return lightmodels.NewVoteFromEnt(entVote), nil
}

func (svc *votesService) SubmitVote(
	ctx context.Context,
	componentID int,
	voteID int,
) (*votesmodels.ResultsResponse, error) {
	entVote, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(voteID)).
		WithComponents().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get_vote")
	}
	if entVote.Visible == false || entVote.StartAt.After(time.Now()) || entVote.EndAt.Before(time.Now()) {
		return nil, fmt.Errorf("vote session is not active")
	}

	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	_, err = svc.databaseService.UserVote.
		Query().
		Where(
			uservote.HasUserWith(user.IDEQ(userID)),
			uservote.HasComponentWith(component.HasVoteWith(vote.IDEQ(voteID))),
		).
		Only(ctx)
	if err == nil {
		return nil, errors.New("user has already voted in this vote")
	}

	_, err = svc.databaseService.UserVote.
		Create().
		SetUserID(userID).
		SetComponentID(componentID).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create_uservote")
	}

	return svc.GetResults(ctx, voteID, true)
}

func (svc *votesService) GetResults(
	ctx context.Context,
	voteID int,
	live bool,
) (*votesmodels.ResultsResponse, error) {
	entVote, err := svc.databaseService.Vote.
		Query().
		Where(vote.IDEQ(voteID)).
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get_vote")
	}

	if live == false {
		if !entVote.Visible || entVote.EndAt.After(time.Now()) {
			return nil, fmt.Errorf("results are not available yet")
		}
	}

	comps, err := svc.databaseService.Component.
		Query().
		Where(component.HasVoteWith(vote.IDEQ(voteID))).
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get_components")
	}

	results := make([]votesmodels.ComponentResult, 0, len(comps))
	total := 0

	for _, comp := range comps {
		count, err := svc.databaseService.UserVote.
			Query().
			Where(uservote.HasComponentWith(component.IDEQ(comp.ID))).
			Count(ctx)
		if err != nil {
			return nil, svc.errorFilter.Filter(err, "count_component_votes")
		}
		results = append(results, votesmodels.ComponentResult{
			ComponentID: comp.ID,
			Name:        comp.Name,
			Votes:       count,
		})
		total += count
	}

	return &votesmodels.ResultsResponse{
		VoteID:     voteID,
		Results:    results,
		TotalVotes: total,
	}, nil
}
