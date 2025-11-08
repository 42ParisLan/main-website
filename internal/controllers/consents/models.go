package consentscontroller

import (
	consentsmodels "base-website/internal/services/consents/models"
	"base-website/pkg/paging"
)

type consentByIDInput struct {
	ID int `path:"id" example:"1" description:"The ID of the consent"`
}

type consentsOutput struct {
	Body *paging.Response[*consentsmodels.Consent] `nullable:"false"`
}

type searchConsentsInput struct {
	consentsmodels.SearchConsentsParams
}

type oneConsentOutput struct {
	Body *consentsmodels.Consent
}

type getMyConsentForAppInput struct {
	AppID string `path:"app_id" example:"1" description:"The ID of the app"`
}
