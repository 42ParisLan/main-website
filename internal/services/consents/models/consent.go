package consentsmodels

import (
	"time"

	"base-website/ent"
	"base-website/internal/lightmodels"
	appsmodels "base-website/internal/services/apps/models"
)

type Consent struct {
	ID             int                    `json:"id" description:"The ID of the consent" example:"1"`
	CreatedAt      time.Time              `json:"created_at" example:"2024-09-01T00:00:00Z" description:"The creation date of the consent"`
	UpdatedAt      time.Time              `json:"updated_at" example:"2024-09-01T00:00:00Z" description:"The last update date of the consent"`
	ApplicationID  string                 `json:"application_id" description:"The ID of the application that the consent is for" example:"1"`
	Application    *appsmodels.App        `json:"application" description:"The application that the consent is for"`
	UserID         int                    `json:"user_id" description:"The ID of the user that the consent is for" example:"1"`
	User           *lightmodels.LightUser `json:"user" description:"The user that the consent is for"`
	Scopes         []string               `json:"scopes" description:"The scopes the app has access" example:"[\"openid\", \"profile\"]" nullable:"false"`
	ExpirationDate time.Time              `json:"expiration_date" example:"2024-09-01T00:00:00Z" description:"The expiration date of the consent"`
}

func NewConsentFromEnt(entConsent *ent.Consent) *Consent {
	return &Consent{
		ID:             entConsent.ID,
		CreatedAt:      entConsent.CreatedAt,
		UpdatedAt:      entConsent.UpdatedAt,
		ApplicationID:  entConsent.ApplicationID,
		Application:    appsmodels.NewAppFromEnt(entConsent.Edges.Application, true),
		UserID:         entConsent.UserID,
		User:           lightmodels.NewLightUserFromEnt(entConsent.Edges.User),
		Scopes:         entConsent.Scopes,
		ExpirationDate: entConsent.ExpirationDate,
	}
}

func NewConsentsFromEnt(entConsents []*ent.Consent) []*Consent {
	consents := make([]*Consent, len(entConsents))
	for i, entConsent := range entConsents {
		consents[i] = NewConsentFromEnt(entConsent)
	}
	return consents
}
