package intraclientmodels

import "time"

type PostScaleTeam struct {
	TeamID  int    `json:"team_id"`
	ScaleID int    `json:"scale_id"`
	BeginAt string `json:"begin_at"`
	UserID  int    `json:"user_id"`
}

type ScaleTeamFeedbacks struct {
	ID               int       `json:"id"`
	User             LightIntraUser `json:"user"`
	FeedbackableType string    `json:"feedbackable_type"`
	FeedbackableID   int       `json:"feedbackable_id"`
	Comment          string    `json:"comment"`
	Rating           int       `json:"rating"`
	CreatedAt        time.Time `json:"created_at"`
}

type Answer struct {
	ID     int         `json:"id"`
	Value  int         `json:"value"`
	Answer interface{} `json:"answer"`
}

type QuestionsWithAnswer struct {
	ID         int      `json:"id"`
	Name       string   `json:"name"`
	Guidelines string   `json:"guidelines"`
	Rating     string   `json:"rating"`
	Kind       string   `json:"kind"`
	Position   int      `json:"position"`
	Answers    []Answer `json:"answers"`
}

type ScaleTeam struct {
	ID                   int                   `json:"id"`
	ScaleID              int                   `json:"scale_id"`
	Comment              string                `json:"comment"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
	Feedback             string                `json:"feedback"`
	FinalMark            int                   `json:"final_mark"`
	Flag                 ScaleFlag             `json:"flag"`
	BeginAt              time.Time             `json:"begin_at"`
	Correcteds           []PartialUser         `json:"correcteds"`
	Corrector            PartialUser           `json:"corrector"`
	Truant               *PartialUser          `json:"truant"`
	FilledAt             time.Time             `json:"filled_at"`
	QuestionsWithAnswers []QuestionsWithAnswer `json:"questions_with_answers"`
	Scale                Scale                 `json:"scale"`
	Team                 PartialTeam           `json:"team"`
	Feedbacks            []ScaleTeamFeedbacks  `json:"feedbacks"`
	TeamLeaderProject    *ProjectUser          `json:"leader_project_user"`
}

type PartialScaleTeam struct {
	ID                   int                   `json:"id"`
	ScaleID              int                   `json:"scale_id"`
	Comment              string                `json:"comment"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
	Feedback             string                `json:"feedback"`
	FinalMark            int                   `json:"final_mark"`
	Flag                 ScaleFlag             `json:"flag"`
	BeginAt              time.Time             `json:"begin_at"`
	Correcteds           []LightIntraUser           `json:"correcteds"`
	Corrector            LightIntraUser             `json:"corrector"`
	Truant               *PartialUser          `json:"truant"`
	FilledAt             time.Time             `json:"filled_at"`
	QuestionsWithAnswers []QuestionsWithAnswer `json:"questions_with_answers"`
}
