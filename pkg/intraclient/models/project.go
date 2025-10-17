package intraclientmodels

import "time"

type ProjectTag struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Kind string `json:"kind"`
}

type Project struct {
	ID              int              `json:"id"`
	Name            string           `json:"name"`
	Slug            string           `json:"slug"`
	Difficulty      int              `json:"difficulty"`
	Description     string           `json:"description"`
	Parent          interface{}      `json:"parent"`
	Children        []interface{}    `json:"children"`
	Objectives      []string         `json:"objectives"`
	Attachments     []interface{}    `json:"attachments"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	Exam            bool             `json:"exam"`
	Cursus          []Cursus         `json:"cursus"`
	Campus          []Campus         `json:"campus"`
	Skills          []Skill          `json:"skills"`
	Videos          []interface{}    `json:"videos"`
	Tags            []ProjectTag     `json:"tags"`
	ProjectSessions []ProjectSession `json:"project_sessions"`
}

type PartialProject struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ParentID *int   `json:"parent_id"`
}
