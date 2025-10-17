package intraclientmodels

import "time"

type CursusUserCursus struct {
	ID        int       `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	Kind      string    `json:"kind"`
}

type CursusUser struct {
	ID           int              `json:"id"`
	BeginAt      time.Time        `json:"begin_at"`
	EndAt        *time.Time       `json:"end_at"`
	Grade        string           `json:"grade"`
	Level        float64          `json:"level"`
	Skills       []Skill          `json:"skills"`
	CursusID     int              `json:"cursus_id"`
	HasCoalition bool             `json:"has_coalition"`
	BlackholedAt *time.Time       `json:"blackholed_at"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	User         PartialUser      `json:"user"`
	Cursus       CursusUserCursus `json:"cursus"`
}
