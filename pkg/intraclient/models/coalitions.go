package intraclientmodels

import "time"

type Coalitions struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	ImageURL string `json:"image_url"`
	CoverURL string `json:"cover_url"`
	Color    string `json:"color"`
	Score    int    `json:"score"`
	UserID   int    `json:"user_id"`
}

type Bloc struct {
	ID         int          `json:"id"`
	CampusID   int          `json:"campus_id"`
	CursusID   int          `json:"cursus_id"`
	SquadSize  int          `json:"squad_size"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
	Coalitions []Coalitions `json:"coalitions"`
}

type CoalitionUser struct {
	ID          int       `json:"id"`
	CoalitionID int       `json:"coalition_id"`
	UserID      int       `json:"user_id"`
	Score       int       `json:"score"`
	Rank        int       `json:"rank"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
