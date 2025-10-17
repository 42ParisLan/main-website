package authservice

import (
	"context"
	"errors"
	"strconv"
	"time"

	"base-website/internal/security"
	authmodels "base-website/internal/services/auth/models"
	configservice "base-website/internal/services/config"
	databaseservice "base-website/internal/services/database"
	openidservice "base-website/internal/services/openid"
	usersservice "base-website/internal/services/users"
	"base-website/pkg/intraclient"
	"base-website/pkg/logger"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
	"github.com/zitadel/oidc/v3/pkg/oidc"
	"github.com/zitadel/oidc/v3/pkg/op"
)

type AuthService interface {
	OauthCallback(
		ctx context.Context,
		code string,
		redirectURI string,
	) (*authmodels.TokenSet, error)
	Logout(ctx context.Context) error
}

type authService struct {
	configService   configservice.ConfigService
	userService     usersservice.UserService
	databaseService databaseservice.DatabaseService
	openIDService   openidservice.OpenIDService
	logger          *logger.Logger
}

func NewProvider() func(i *do.Injector) (AuthService, error) {
	return func(i *do.Injector) (AuthService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[usersservice.UserService](i),
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[openidservice.OpenIDService](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	usersService usersservice.UserService,
	databaseService databaseservice.DatabaseService,
	openIDService openidservice.OpenIDService,
) (AuthService, error) {
	return &authService{
		configService:   configService,
		userService:     usersService,
		databaseService: databaseService,
		openIDService:   openIDService,
		logger:          logger.New().WithContext("AuthService"),
	}, nil
}

func (s *authService) OauthCallback(
	ctx context.Context,
	code string,
	redirectURI string,
) (*authmodels.TokenSet, error) {
	config := s.configService.GetConfig()

	userIntraClient, err := intraclient.NewClientWithUserBearerToken(
		ctx,
		&intraclient.ClientConfig{
			ClientID:     config.IntraClientID,
			ClientSecret: config.IntraClientSecret,
		},
		code,
		redirectURI,
	)
	if err != nil {
		s.logger.Error("failed to create intra client %s", err.Error())
		return nil, huma.Error401Unauthorized(
			"authentication failed",
			errors.New("please contact an administrator or stop trying to hack the system"),
		)
	}

	user, err := userIntraClient.GetUserMe()
	if err != nil {
		s.logger.Error("failed to get user %s", err.Error())
		return nil, huma.Error401Unauthorized(
			"authentication failed",
			errors.New("please contact an administrator or stop trying to hack the system"),
		)
	}

	internalUser, err := s.userService.UpsertUserFromIntra(ctx, user.ID)
	if err != nil {
		s.logger.Error("failed to upsert user %s", err.Error())
		return nil, huma.Error500InternalServerError("failed to upsert user")
	}

	accessToken, newRefreshToken, validity, err := op.CreateAccessToken(
		ctx,
		&tokenRequest{
			ID: strconv.Itoa(internalUser.ID),
		},
		op.AccessTokenTypeBearer,
		s.openIDService,
		&client{},
		"",
	)
	if err != nil {
		s.logger.Error("failed to create access token %s", err.Error())
		return nil, huma.Error500InternalServerError("failed to create access token")
	}

	s.logger.Info(
		"user "+logger.ColorBold+"%s"+logger.ColorReset+logger.ColorGreen+" (%s) authenticated",
		user.Login,
		user.Email,
	)

	return &authmodels.TokenSet{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    uint64(validity.Seconds()),
		Scope:        "openid profile email offline_access",
	}, nil
}

func (s *authService) Logout(ctx context.Context) error {
	claims, err := security.GetClaimsFromContext(ctx)
	if err != nil {
		return err
	}
	oidcErr := s.openIDService.Storage().RevokeToken(ctx, claims.TokenID, claims.Subject, "builtin")
	if oidcErr != nil {
		s.logger.Error("failed to revoke token %s", oidcErr.Error())
		return huma.Error401Unauthorized("failed to revoke token", oidcErr)
	}
	return nil
}

type tokenRequest struct {
	ID string
}

var _ op.TokenRequest = (*tokenRequest)(nil)
var _ op.RefreshTokenRequest = (*tokenRequest)(nil)

func (t *tokenRequest) GetSubject() string {
	return t.ID
}

func (t *tokenRequest) GetAudience() []string {
	return []string{"*"}
}

func (t *tokenRequest) GetScopes() []string {
	return []string{"openid", "offline_access", "profile", "email", "security"}
}

func (t *tokenRequest) GetAMR() []string {
	return []string{
		"intra42",
	}
}

func (t *tokenRequest) GetAuthTime() time.Time {
	return time.Now()
}

func (t *tokenRequest) GetClientID() string {
	return "builtin"
}

func (t *tokenRequest) SetCurrentScopes(scopes []string) {
}

type client struct{}

func (c *client) ClockSkew() time.Duration {
	return 30 * 24 * time.Hour
}

func (c *client) GetID() string {
	return "builtin"
}

func (c *client) RestrictAdditionalAccessTokenScopes() func(scopes []string) []string {
	return func(scopes []string) []string {
		return scopes
	}
}

func (c *client) GrantTypes() []oidc.GrantType {
	return []oidc.GrantType{oidc.GrantTypeCode}
}
