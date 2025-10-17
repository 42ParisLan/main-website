package intraclientmodels

import "time"

type ScaleFlag struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Positive  bool      `json:"positive"`
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Scale struct {
	ID                 int             `json:"id"`
	EvaluationID       int             `json:"evaluation_id"`
	Name               string          `json:"name"`
	IsPrimary          bool            `json:"is_primary"`
	Comment            string          `json:"comment"`
	IntroductionMd     string          `json:"introduction_md"`
	DisclaimerMd       string          `json:"disclaimer_md"`
	GuidelinesMd       string          `json:"guidelines_md"`
	CreatedAt          time.Time       `json:"created_at"`
	CorrectionNumber   int             `json:"correction_number"`
	Duration           int             `json:"duration"`
	ManualSubscription bool            `json:"manual_subscription"`
	Languages          []Language      `json:"languages"`
	Flags              []ScaleFlag `json:"flags"`
	Free               bool            `json:"free"`
}
