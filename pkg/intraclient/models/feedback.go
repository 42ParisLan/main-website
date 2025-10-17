package intraclientmodels

import "time"

type Feedback struct {
	ID               int              `json:"id"`
	User             LightIntraUser   `json:"user"`
	FeedbackableType string           `json:"feedbackable_type"`
	FeedbackableID   int              `json:"feedbackable_id"`
	Comment          string           `json:"comment"`
	Rating           int              `json:"rating"`
	CreatedAt        time.Time        `json:"created_at"`
	FeedbackDetails  []FeedbackDetail `json:"feedback_details"`
	ScaleTeam        *ScaleTeam       `json:"scale_team"`
	Event            *Event           `json:"event"`
}

type FeedbackDetail struct {
	ID   int    `json:"id"`
	Rate int    `json:"rate"`
	Kind string `json:"kind"`
}
