package intraclientmodels

import "time"

type Close struct {
	ID                int                      `json:"id"`
	Reason            string                   `json:"reason"`
	State             string                   `json:"state"`
	Kind              string                   `json:"kind"`
	EndAt             *time.Time               `json:"end_at"`
	PrimaryCampusID   int                      `json:"primary_campus_id"`
	CreatedAt         time.Time                `json:"created_at"`
	UpdatedAt         time.Time                `json:"updated_at"`
	User              LightIntraUser           `json:"user"`
	Closer            LightIntraUser           `json:"closer"`
	CommunityServices []CloseCommunityServices `json:"community_services"`
}

type CloseCommunityServices struct {
	ID         int       `json:"id"`
	Duration   int       `json:"duration"`
	ScheduleAt time.Time `json:"schedule_at"`
	Occupation *string   `json:"occupation"`
	State      string    `json:"state"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
