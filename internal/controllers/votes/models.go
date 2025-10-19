package votescontroller

import (
	"base-website/internal/lightmodels"
	votesmodels "base-website/internal/services/votes/models"
)

type BodyMessage struct {
	Body string `required:"true"`
}

type VoteIDInput struct {
	VoteID int `path:"id" required:"true" example:"42" description:"The vote ID"`
}

type oneVoteOutput struct {
	Body *lightmodels.Vote `required:"true"`
}

type multipleVotesOutput struct {
	Body []*lightmodels.LightVote `nullable:"false"`

	Total int `header:"X-Total" description:"The total number of users" example:"42"`
}

type submitVoteInput struct {
	VoteID int `path:"id" required:"true" example:"42" description:"The vote ID"`

	Body int `required:"true"`
}

type getResultsOutput struct {
	Body *votesmodels.ResultsResponse `required:"true"`
}

type createVoteInput struct {
	Body *votesmodels.CreateVote `required:"true"`
}

type updateVoteInput struct {
	VoteID int `path:"id" required:"true" example:"42" description:"The vote ID"`

	Body *votesmodels.UpdateVote `required:"true"`
}

type ComponentIDInput struct {
	ComponentID int `path:"id" required:"true" example:"42" description:"The component ID"`
}

type oneComponentOutput struct {
	Body *lightmodels.Component `required:"true"`
}

type createComponentInput struct {
	Body *votesmodels.CreateComponent `required:"true"`
}

type updateComponentInput struct {
	ComponentID int `path:"id" required:"true" example:"42" description:"The vote ID"`

	Body *votesmodels.UpdateComponent `required:"true"`
}
