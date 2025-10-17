package intraclientmodels

import "time"

type QuestUser struct {
	ID          int          `json:"id"`
	EndAt       interface{}  `json:"end_at"`
	QuestID     int          `json:"quest_id"`
	ValidatedAt interface{}  `json:"validated_at"`
	Prct        interface{}  `json:"prct"`
	Advancement interface{}  `json:"advancement"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
	User        LightIntraUser    `json:"user"`
	Quest       PartialQuest `json:"quest"`
}
