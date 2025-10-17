package authcontroller

import (
	"context"
	"net/http"
	"time"

	"base-website/internal/security"
	authservice "base-website/internal/services/auth"
	configservice "base-website/internal/services/config"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type authController struct {
	authService authservice.AuthService
	config      configservice.Config
}

func Init(api huma.API, injector *do.Injector) {
	authController := &authController{
		authService: do.MustInvoke[authservice.AuthService](injector),
		config:      do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
	}
	authController.Register(api)
}

func (ctrl *authController) Register(api huma.API) {
	huma.Register(api, huma.Operation{
		Method:  "GET",
		Path:    "/auth/callback",
		Summary: "OAuth2 Callback",
		Description: `This endpoint is used to handle the OAuth2 callback from the OAuth2 provider.
		It should exchange the code for an access token and return a generated TokenSet.
		⚠️ **You are probably not interested in this endpoint as it is should be only used by the frontend**.`,
		Tags:        []string{"Authentification"},
		OperationID: "getOAuthCallback",
	}, ctrl.getOAuthCallback)

	huma.Register(api, huma.Operation{
		Method:  "GET",
		Path:    "/auth/logout",
		Summary: "Logout",
		Description: `This endpoint is used to log out the user.
		It should clear the auth cookie and invalidate the session.
		⚠️ **You are probably not interested in this endpoint as it is should be only used by the frontend**`,
		Tags:        []string{"Authentification"},
		OperationID: "logout",
		Security:    security.WithAuth("security"),
	}, ctrl.logout)
}

func (ctrl *authController) getOAuthCallback(
	ctx context.Context,
	input *oAuthClientCallbackInput,
) (*oAuthClientCallbackOutput, error) {
	resp := &oAuthClientCallbackOutput{}
	tokenSet, err := ctrl.authService.OauthCallback(ctx, input.Code, input.RedirectURI)
	if err != nil {
		return nil, err
	}

	resp.AuthCookie = http.Cookie{
		Name:     "auth",
		Value:    tokenSet.AccessToken,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Secure:   ctrl.config.CookieSecure,
		Expires:  time.Now().Add(time.Duration(tokenSet.ExpiresIn) * time.Second),
		Path:     "/",
	}
	return resp, nil
}

func (ctrl *authController) logout(
	ctx context.Context,
	input *struct{},
) (*logoutOutput, error) {
	resp := &logoutOutput{}
	resp.AuthCookie = http.Cookie{
		Name:     "auth",
		Value:    "",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   ctrl.config.CookieSecure,
		Expires:  time.Now().Add(-time.Hour),
	}
	err := ctrl.authService.Logout(ctx)
	if err != nil {
		return nil, err
	}
	return resp, nil
}
