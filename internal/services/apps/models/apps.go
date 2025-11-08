package appsmodels

import (
	"time"

	"base-website/ent"
	"base-website/internal/lightmodels"
)

type AppPayload struct {
	Name            string   `json:"name" description:"Name of the app" example:"My App"`
	RedirectUris    []string `json:"redirect_uris" description:"The URIs to redirect to after login" example:"[\"https://myapp.com/login\"]" nullable:"false"`
	Description     string   `json:"description" example:"My app is the best app"`
	ImplicitConsent bool     `json:"implicit_consent" description:"Whether the app can access user data without asking for consent" example:"false" default:"false"`
	OwnerID         *int     `json:"owner_id,omitempty" description:"ID of the user that owns the app"`
	Roles           []string `json:"roles" description:"The roles of the app" example:"[\"student-app\"]" nullable:"false"`
	_               struct{} `json:"-" additionalProperties:"true"`
}

type App struct {
	AppPayload
	ID          string                 `json:"id" example:"1" description:"The ID of the app"`
	Secret      string                 `json:"secret" example:"my-secret" description:"The secret of the app (may be redacted)"`
	CreatedAt   time.Time              `json:"created_at" example:"2024-09-01T00:00:00Z" description:"The creation date of the app"`
	UpdatedAt   time.Time              `json:"updated_at" example:"2024-09-01T00:00:00Z" description:"The last update date of the app"`
	LastLoginAt *time.Time             `json:"last_login_at,omitempty" example:"2024-09-01T00:00:00Z" description:"The last login date of the app"`
	Owner       *lightmodels.LightUser `json:"owner" description:"The owner of the app"`
}

func NewAppFromEnt(entApp *ent.App, censorSecret bool) *App {
	app := &App{
		ID: entApp.ID,
		AppPayload: AppPayload{
			Name:            entApp.Name,
			RedirectUris:    entApp.RedirectUris,
			Description:     entApp.Description,
			ImplicitConsent: entApp.ImplicitConsent,
			OwnerID:         &entApp.OwnerID,
			Roles:           entApp.Roles,
		},
		Secret:      entApp.Secret,
		CreatedAt:   entApp.CreatedAt,
		UpdatedAt:   entApp.UpdatedAt,
		LastLoginAt: entApp.LastLoginAt,
		Owner:       lightmodels.NewLightUserFromEnt(entApp.Edges.Owner),
	}
	if censorSecret {
		app.Secret = "************************"
	}
	return app
}

func NewAppsFromEnt(entApps []*ent.App, censorSecret bool) []*App {
	apps := make([]*App, len(entApps))
	for i, entApp := range entApps {
		apps[i] = NewAppFromEnt(entApp, censorSecret)
	}
	return apps
}
