package votesmodels

import "time"

type CreateVote struct {
	Title       string    `json:"title" example:"Best Programming Language 2025" description:"The title of the vote" required:"true" validate:"min=3"`
	Description string    `json:"description" example:"Vote for your favorite language!" description:"The description of the vote" required:"true" validate:"min=3"`
	StartAt     time.Time `json:"start_at" example:"2025-10-10T00:00:00Z" description:"The start date of the vote" required:"true"`
	EndAt       time.Time `json:"end_at" example:"2025-10-20T23:59:59Z" description:"The end date of the vote" required:"true"`
	Visible     bool      `json:"visible" example:"true" description:"Whether the vote is visible" required:"true"`
}

type UpdateVote struct {
	Title       *string    `json:"title" example:"Best Programming Language 2025" description:"The title of the vote" validate:"min=3" required:"false"`
	Description *string    `json:"description" example:"Vote for your favorite language!" description:"The description of the vote" validate:"min=3" required:"false"`
	StartAt     *time.Time `json:"start_at" example:"2025-10-10T00:00:00Z" description:"The start date of the vote" required:"false"`
	EndAt       *time.Time `json:"end_at" example:"2025-10-20T23:59:59Z" description:"The end date of the vote" required:"false"`
	Visible     *bool      `json:"visible" example:"true" description:"Whether the vote is visible" required:"false"`
}
