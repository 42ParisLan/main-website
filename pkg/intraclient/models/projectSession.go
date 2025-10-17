package intraclientmodels

import "time"

type LightScale struct {
	ID               int  `json:"id"`
	CorrectionNumber int  `json:"correction_number"`
	IsPrimary        bool `json:"is_primary"`
}

type ProjectSessionProject struct {
	ID          int           `json:"id"`
	Name        string        `json:"name"`
	Slug        string        `json:"slug"`
	Difficulty  int           `json:"difficulty"`
	Parent      interface{}   `json:"parent"`
	Children    []interface{} `json:"children"`
	Attachments []interface{} `json:"attachments"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	Exam        bool          `json:"exam"`
	GitID       int           `json:"git_id"`
	Repository  string        `json:"repository"`
}

type Evaluation struct {
	ID   int    `json:"id"`
	Kind string `json:"kind"`
}

type Rule struct {
	ID           int       `json:"id"`
	Kind         string    `json:"kind"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Slug         string    `json:"slug"`
	InternalName string    `json:"internal_name"`
}

type Param struct {
	ID                    int       `json:"id"`
	ParamID               int       `json:"param_id"`
	ProjectSessionsRuleID int       `json:"project_sessions_rule_id"`
	Value                 string    `json:"value"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

type ProjectSessionsRule struct {
	ID       int     `json:"id"`
	Required bool    `json:"required"`
	Position int     `json:"position"`
	Params   []Param `json:"params"`
	Rule     Rule    `json:"rule"`
}

type ProjectSession struct {
	ID                   int                   `json:"id"`
	Solo                 bool                  `json:"solo"`
	BeginAt              time.Time             `json:"begin_at"`
	EndAt                time.Time             `json:"end_at"`
	EstimateTime         string                `json:"estimate_time"`
	Difficulty           int                   `json:"difficulty"`
	Objectives           []string              `json:"objectives"`
	Description          string                `json:"description"`
	DurationDays         int                   `json:"duration_days"`
	TerminatingAfter     int                   `json:"terminating_after"`
	ProjectID            int                   `json:"project_id"`
	CampusID             int                   `json:"campus_id"`
	CursusID             int                   `json:"cursus_id"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
	MaxPeople            interface{}           `json:"max_people"`
	IsSubscriptable      bool                  `json:"is_subscriptable"`
	Scales               []Scale               `json:"scales"`
	Uploads              []interface{}         `json:"uploads"`
	TeamBehaviour        string                `json:"team_behaviour"`
	Commit               string                `json:"commit"`
	MinimumMark          int                   `json:"minimum_mark"`
	Project              ProjectSessionProject `json:"project"`
	Campus               Campus                `json:"campus"`
	Cursus               Cursus                `json:"cursus"`
	Evaluations          []Evaluation          `json:"evaluations"`
	ProjectSessionsRules []ProjectSessionsRule `json:"project_sessions_rules"`
}
