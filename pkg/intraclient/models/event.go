package intraclientmodels

import "time"

type Event struct {
	ID                        int           `json:"id"`
	Name                      string        `json:"name"`
	Description               string        `json:"description"`
	Location                  string        `json:"location"`
	Kind                      string        `json:"kind"`
	MaxPeople                 int           `json:"max_people"`
	NbrSubscribers            int           `json:"nbr_subscribers"`
	BeginAt                   time.Time     `json:"begin_at"`
	EndAt                     time.Time     `json:"end_at"`
	CampusIds                 []int         `json:"campus_ids"`
	CursusIds                 []int         `json:"cursus_ids"`
	Themes                    []EventTheme  `json:"themes"`
	Waitlist                  EventWaitlist `json:"waitlist"`
	ProhibitionOfCancellation int           `json:"prohibition_of_cancellation"`
	CreatedAt                 time.Time     `json:"created_at"`
	UpdatedAt                 time.Time     `json:"updated_at"`
}

type EventTheme struct {
	CreatedAt time.Time `json:"created_at"`
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	UpdatedAt time.Time `json:"updated_at"`
}

type EventWaitlist struct {
	CreatedAt        time.Time `json:"created_at"`
	ID               int       `json:"id"`
	UpdatedAt        time.Time `json:"updated_at"`
	WaitlistableID   int       `json:"waitlistable_id"`
	WaitlistableType string    `json:"waitlistable_type"`
}
