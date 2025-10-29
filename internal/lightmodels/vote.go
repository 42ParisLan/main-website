package lightmodels

import (
	"time"

	"base-website/ent"
)

type LightVote struct {
	ID              int       `json:"id" example:"1" description:"The ID of the vote"`
	Title           string    `json:"title" example:"Best Programming Language 2025" description:"The title of the vote"`
	Description     string    `json:"description" example:"Vote for your favorite language!" description:"The description of the vote"`
	StartAt         time.Time `json:"start_at" example:"2025-10-10T00:00:00Z" description:"The start date of the vote"`
	EndAt           time.Time `json:"end_at" example:"2025-10-20T23:59:59Z" description:"The end date of the vote"`
	CreatedAt       time.Time `json:"created_at" example:"2025-10-01T12:00:00Z" description:"The creation date of the vote"`
	ComponentsCount int       `json:"components_count" example:"4" description:"The number of components in the vote"`
	Visible         bool      `json:"visible" example:"true" description:"Whether the vote is visible"`
	Creator         LightUser `json:"creator" description:"The user who created this vote"`
}

type Vote struct {
	ID          int          `json:"id" example:"1" description:"The ID of the vote"`
	Title       string       `json:"title" example:"Best Programming Language 2025" description:"The title of the vote"`
	Description string       `json:"description" example:"Vote for your favorite language!" description:"The description of the vote"`
	StartAt     time.Time    `json:"start_at" example:"2025-10-10T00:00:00Z" description:"The start date of the vote"`
	EndAt       time.Time    `json:"end_at" example:"2025-10-20T23:59:59Z" description:"The end date of the vote"`
	Visible     bool         `json:"visible" example:"true" description:"Whether the vote is visible"`
	Components  []*Component `json:"components" description:"The list of components in the vote"`
	Creator     LightUser    `json:"creator" description:"The user who created this vote"`
}

func NewLightVoteFromEnt(entVote *ent.Vote) *LightVote {
	if entVote == nil {
		return nil
	}

	componentsCount := 0
	if entVote.Edges.Components != nil {
		componentsCount = len(entVote.Edges.Components)
	}

	return &LightVote{
		ID:              entVote.ID,
		Title:           entVote.Title,
		Description:     entVote.Description,
		StartAt:         entVote.StartAt,
		EndAt:           entVote.EndAt,
		CreatedAt:       entVote.CreatedAt,
		ComponentsCount: componentsCount,
		Visible:         entVote.Visible,
		Creator:         *NewLightUserFromEnt(entVote.Edges.Creator),
	}
}

func NewLightVotesFromEnt(entVotes []*ent.Vote) []*LightVote {
	votes := make([]*LightVote, len(entVotes))
	for i, entVote := range entVotes {
		votes[i] = NewLightVoteFromEnt(entVote)
	}
	return votes
}

func NewVoteFromEnt(entVote *ent.Vote) *Vote {
	if entVote == nil {
		return nil
	}

	components := NewComponentsFromEnt(entVote.Edges.Components)

	return &Vote{
		ID:          entVote.ID,
		Title:       entVote.Title,
		Description: entVote.Description,
		StartAt:     entVote.StartAt,
		EndAt:       entVote.EndAt,
		Components:  components,
		Visible:     entVote.Visible,
		Creator:     *NewLightUserFromEnt(entVote.Edges.Creator),
	}
}

func NewVotesFromEnt(entVotes []*ent.Vote) []*Vote {
	votes := make([]*Vote, len(entVotes))
	for i, entVote := range entVotes {
		votes[i] = NewVoteFromEnt(entVote)
	}
	return votes
}
