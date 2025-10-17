package authcontroller

import (
	"net/http"
)

type logoutOutput struct {
	AuthCookie http.Cookie `header:"Set-Cookie"`
}

type oAuthClientCallbackOutput struct {
	AuthCookie http.Cookie `header:"Set-Cookie"`
}

type oAuthClientCallbackInput struct {
	Code        string `query:"code" required:"true" doc:"The OAuth2 code to exchange for a token" example:"123456"`
	RedirectURI string `query:"redirect_uri" doc:"The redirect URI to use for the OAuth2 callback" example:"http://localhost:8080/auth/callback"`
}
