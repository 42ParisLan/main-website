package intraclientmodels

import "time"

type QuestCursus struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
}

type Quest struct {
	ID           int         `json:"id"`
	Name         string      `json:"name"`
	Slug         string      `json:"slug"`
	Kind         string      `json:"kind"`
	InternalName *string     `json:"internal_name"`
	Description  string      `json:"description"`
	CursusID     int         `json:"cursus_id"`
	CampusID     *int        `json:"campus_id"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
	GradeID      *int        `json:"grade_id"`
	Position     int         `json:"position"`
	Grade        interface{} `json:"grade"`
	Cursus       QuestCursus `json:"cursus"`
	Campus       interface{} `json:"campus"`
}

type PartialQuest struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Kind         string    `json:"kind"`
	InternalName *string   `json:"internal_name"`
	Description  string    `json:"description"`
	CursusID     int       `json:"cursus_id"`
	CampusID     *int      `json:"campus_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	GradeID      *int      `json:"grade_id"`
	Position     int       `json:"position"`
}
