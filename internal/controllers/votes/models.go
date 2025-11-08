package votescontroller

import (
	"base-website/internal/lightmodels"
	votesmodels "base-website/internal/services/votes/models"
	"base-website/pkg/paging"
	"mime/multipart"
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
	Body *paging.Response[*lightmodels.LightVote] `nullable:"false"`
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
	VoteID int `path:"id" required:"true" example:"42" description:"The vote ID"`

	Body *votesmodels.CreateComponent `required:"true"`
}

type updateComponentInput struct {
	ComponentID int `path:"id" required:"true" example:"42" description:"The vote ID"`

	Body *votesmodels.UpdateComponent `required:"true"`
}

type updateComponentImageInput struct {
	ComponentID int `path:"id" required:"true" example:"42" description:"The component ID"`

	RawBody multipart.Form
}
