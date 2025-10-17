package storage

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"errors"
	"fmt"
	"strconv"
	"sync"
	"time"

	"base-website/ent"
	"base-website/ent/authrefreshtoken"
	"base-website/ent/authtoken"
	configservice "base-website/internal/services/config"
	"base-website/pkg/logger"

	jose "github.com/go-jose/go-jose/v4"
	"github.com/google/uuid"
	"golang.org/x/text/language"

	"github.com/zitadel/oidc/v3/pkg/oidc"
	"github.com/zitadel/oidc/v3/pkg/op"
)

func NewStorage(entClient *ent.Client, config *configservice.Config) (op.Storage, error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return nil, fmt.Errorf("failed to generate rsa key: %w", err)
	}
	return &Storage{
		entClient: entClient,
		config:    config,
		logger:    logger.New().WithContext("OpenIDStorage"),
		signingKey: signingKey{
			id:        "key-id",
			algorithm: jose.RS256,
			key:       key,
		},
	}, nil
}

// storage implements the op.Storage interface
// typically you would implement this as a layer on top of your database
// for simplicity this example keeps everything in-memory
type Storage struct {
	entClient  *ent.Client
	config     *configservice.Config
	lock       sync.Mutex
	signingKey signingKey
	logger     *logger.Logger
}

// AuthorizeClientIDSecret implements op.Storage.
func (s *Storage) AuthorizeClientIDSecret(ctx context.Context, clientID string, clientSecret string) error {
	panic("unimplemented")
}

// AuthRequestByCode implements op.Storage.
func (s *Storage) AuthRequestByCode(context.Context, string) (op.AuthRequest, error) {
	panic("unimplemented")
}

// AuthRequestByID implements op.Storage.
func (s *Storage) AuthRequestByID(context.Context, string) (op.AuthRequest, error) {
	panic("unimplemented")
}

// CreateAccessToken implements op.Storage.
func (s *Storage) CreateAccessToken(context.Context, op.TokenRequest) (accessTokenID string, expiration time.Time, err error) {
	panic("unimplemented")
}

// CreateAuthRequest implements op.Storage.
func (s *Storage) CreateAuthRequest(context.Context, *oidc.AuthRequest, string) (op.AuthRequest, error) {
	panic("unimplemented")
}

// DeleteAuthRequest implements op.Storage.
func (s *Storage) DeleteAuthRequest(context.Context, string) error {
	panic("unimplemented")
}

// GetClientByClientID implements op.Storage.
func (s *Storage) GetClientByClientID(ctx context.Context, clientID string) (op.Client, error) {
	panic("unimplemented")
}

type signingKey struct {
	id        string
	algorithm jose.SignatureAlgorithm
	key       *rsa.PrivateKey
}

func (s *signingKey) SignatureAlgorithm() jose.SignatureAlgorithm {
	return s.algorithm
}

func (s *signingKey) Key() any {
	return s.key
}

func (s *signingKey) ID() string {
	return s.id
}

type publicKey struct {
	signingKey
}

func (s *publicKey) ID() string {
	return s.id
}

func (s *publicKey) Algorithm() jose.SignatureAlgorithm {
	return s.algorithm
}

func (s *publicKey) Use() string {
	return "sig"
}

func (s *publicKey) Key() any {
	return &s.key.PublicKey
}

func (s *Storage) JWTProfileTokenType(
	ctx context.Context,
	request op.TokenRequest,
) (op.AccessTokenType, error) {
	return op.AccessTokenTypeJWT, nil
}

// SaveAuthCode implements the op.Storage interface
// it will be called after the authentication has been successful and before redirecting the user agent to the redirect_uri
// (in an authorization code flow)
func (s *Storage) SaveAuthCode(ctx context.Context, id string, code string) error {
	// for this example we'll just save the authRequestID to the code
	s.lock.Lock()
	defer s.lock.Unlock()
	_, err := s.entClient.AuthCode.Create().
		SetID(code).
		SetAuthRequestID(id).
		Save(ctx)
	if err != nil {
		return oidc.ErrServerError().WithDescription("failed to save auth code")
	}
	return nil
}

// CreateAccessAndRefreshTokens implements the op.Storage interface
// it will be called for all requests able to return an access and refresh token (Authorization Code Flow, Refresh Token Request)
func (s *Storage) CreateAccessAndRefreshTokens(
	ctx context.Context,
	request op.TokenRequest,
	currentRefreshToken string,
) (accessTokenID string, newRefreshToken string, expiration time.Time, err error) {
	// generate tokens via token exchange flow if request is relevant
	if teReq, ok := request.(op.TokenExchangeRequest); ok {
		return s.exchangeRefreshToken(teReq)
	}

	// get the information depending on the request type / implementation
	applicationID, authTime, amr := getInfoFromRequest(request)

	// if currentRefreshToken is empty (Code Flow) we will have to create a new refresh token
	if currentRefreshToken == "" {
		refreshTokenID := uuid.NewString()
		accessToken, err := s.accessToken(
			applicationID,
			refreshTokenID,
			request.GetSubject(),
			request.GetAudience(),
			request.GetScopes(),
		)
		if err != nil {
			return "", "", time.Time{}, err
		}
		refreshToken, err := s.createRefreshToken(accessToken, amr, authTime)
		if err != nil {
			return "", "", time.Time{}, err
		}
		return accessToken.ID, refreshToken, accessToken.Expiration, nil
	}

	// if we get here, the currentRefreshToken was not empty, so the call is a refresh token request
	// we therefore will have to check the currentRefreshToken and renew the refresh token
	refreshToken, refreshTokenID, err := s.renewRefreshToken(currentRefreshToken)
	if err != nil {
		return "", "", time.Time{}, err
	}
	accessToken, err := s.accessToken(
		applicationID,
		refreshTokenID,
		request.GetSubject(),
		request.GetAudience(),
		request.GetScopes(),
	)
	if err != nil {
		return "", "", time.Time{}, err
	}
	return accessToken.ID, refreshToken, accessToken.Expiration, nil
}

func (s *Storage) exchangeRefreshToken(
	request op.TokenExchangeRequest,
) (accessTokenID string, newRefreshToken string, expiration time.Time, err error) {
	applicationID := request.GetClientID()
	authTime := request.GetAuthTime()

	refreshTokenID := uuid.NewString()
	accessToken, err := s.accessToken(
		applicationID,
		refreshTokenID,
		request.GetSubject(),
		request.GetAudience(),
		request.GetScopes(),
	)
	if err != nil {
		return "", "", time.Time{}, err
	}

	refreshToken, err := s.createRefreshToken(accessToken, nil, authTime)
	if err != nil {
		return "", "", time.Time{}, err
	}

	return accessToken.ID, refreshToken, accessToken.Expiration, nil
}

// TokenRequestByRefreshToken implements the op.Storage interface
// it will be called after parsing and validation of the refresh token request
func (s *Storage) TokenRequestByRefreshToken(
	ctx context.Context,
	refreshToken string,
) (op.RefreshTokenRequest, error) {
	s.lock.Lock()
	defer s.lock.Unlock()
	token, err := s.entClient.AuthRefreshToken.Get(ctx, refreshToken)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh_token")
	}
	return RefreshTokenRequestFromBusiness(token), nil
}

// TerminateSession implements the op.Storage interface
// it will be called after the user signed out, therefore the access and refresh token of the user of this client must be removed
func (s *Storage) TerminateSession(ctx context.Context, userID string, clientID string) error {
	s.lock.Lock()
	defer s.lock.Unlock()
	_, err := s.entClient.AuthToken.Delete().Where(authtoken.Subject(userID)).Exec(ctx)
	if err != nil {
		s.logger.Error("failed to delete tokens: %v", err)
		return fmt.Errorf("failed to delete tokens: %w", err)
	}
	_, err = s.entClient.AuthRefreshToken.Delete().Where(authrefreshtoken.UserID(userID)).Exec(ctx)
	if err != nil {
		s.logger.Error("failed to delete refresh tokens: %v", err)
		return fmt.Errorf("failed to delete refresh tokens: %w", err)
	}
	return nil
}

// GetRefreshTokenInfo looks up a refresh token and returns the token id and user id.
// If given something that is not a refresh token, it must return error.
func (s *Storage) GetRefreshTokenInfo(
	ctx context.Context,
	clientID string,
	token string,
) (userID string, tokenID string, err error) {
	refreshToken, err := s.entClient.AuthRefreshToken.Get(ctx, token)
	if err != nil {
		return "", "", op.ErrInvalidRefreshToken
	}

	return refreshToken.UserID, refreshToken.ID, nil
}

// RevokeToken implements the op.Storage interface
// it will be called after parsing and validation of the token revocation request
func (s *Storage) RevokeToken(
	ctx context.Context,
	tokenIDOrToken string,
	userID string,
	clientID string,
) *oidc.Error {
	// a single token was requested to be removed
	s.lock.Lock()
	defer s.lock.Unlock()
	accessToken, err := s.entClient.AuthToken.Get(ctx, tokenIDOrToken)
	if err != nil {
		return oidc.ErrAccessDenied().WithDescription("token not found")
	}
	if accessToken.ApplicationID != clientID {
		return oidc.ErrInvalidClient().WithDescription("token was not issued for this client")
	}
	refreshtoken, _ := s.entClient.AuthRefreshToken.Get(ctx, accessToken.RefreshTokenID)

	err = s.entClient.AuthToken.DeleteOneID(tokenIDOrToken).Exec(ctx)
	if err != nil {
		return oidc.ErrServerError().WithDescription("failed to delete token")
	}
	if refreshtoken != nil {
		err = s.entClient.AuthRefreshToken.DeleteOneID(accessToken.RefreshTokenID).Exec(ctx)
		if err != nil {
			return oidc.ErrServerError().WithDescription("failed to delete refresh token")
		}
	}
	return nil
}

// SigningKey implements the op.Storage interface
// it will be called when creating the OpenID Provider
func (s *Storage) SigningKey(ctx context.Context) (op.SigningKey, error) {
	// in this example the signing key is a static rsa.PrivateKey and the algorithm used is RS256
	// you would obviously have a more complex implementation and store / retrieve the key from your database as well
	return &s.signingKey, nil
}

// SignatureAlgorithms implements the op.Storage interface
// it will be called to get the sign
func (s *Storage) SignatureAlgorithms(context.Context) ([]jose.SignatureAlgorithm, error) {
	return []jose.SignatureAlgorithm{s.signingKey.algorithm}, nil
}

// KeySet implements the op.Storage interface
// it will be called to get the current (public) keys, among others for the keys_endpoint or for validating access_tokens on the userinfo_endpoint, ...
func (s *Storage) KeySet(ctx context.Context) ([]op.Key, error) {
	// as mentioned above, this example only has a single signing key without key rotation,
	// so it will directly use its public key
	//
	// when using key rotation you typically would store the public keys alongside the private keys in your database
	// and give both of them an expiration date, with the public key having a longer lifetime
	return []op.Key{&publicKey{s.signingKey}}, nil
}

// SetUserinfoFromScopes implements the op.Storage interface.
// Provide an empty implementation and use SetUserinfoFromRequest instead.
func (s *Storage) SetUserinfoFromScopes(
	ctx context.Context,
	userinfo *oidc.UserInfo,
	userID, clientID string,
	scopes []string,
) error {
	return s.setUserinfo(ctx, userinfo, userID, scopes)
}

// SetUserinfoFromRequest implements the op.Storage interface
// it will be called for the userinfo endpoint, so we read the request and pass the information from that to the private function
func (s *Storage) SetUserinfoFromRequest(
	ctx context.Context,
	userinfo *oidc.UserInfo,
	request op.TokenRequest,
) error {
	return s.setUserinfo(ctx, userinfo, request.GetSubject(), request.GetScopes())
}

// SetUserinfoFromToken implements the op.Storage interface
// it will be called for the userinfo endpoint, so we read the token and pass the information from that to the private function
func (s *Storage) SetUserinfoFromToken(
	ctx context.Context,
	userinfo *oidc.UserInfo,
	tokenID, subject, origin string,
) error {
	token, err := s.entClient.AuthToken.Get(ctx, tokenID)
	if err != nil {
		return oidc.ErrAccessDenied().WithDescription("token not found")
	}
	if token.Expiration.Before(time.Now()) {
		return oidc.ErrAccessDenied().WithDescription("token expired")
	}
	return s.setUserinfo(ctx, userinfo, token.Subject, token.Scopes)
}

// SetIntrospectionFromToken implements the op.Storage interface
// it will be called for the introspection endpoint, so we read the token and pass the information from that to the private function
func (s *Storage) SetIntrospectionFromToken(
	ctx context.Context,
	introspection *oidc.IntrospectionResponse,
	tokenID, subject, clientID string,
) error {
	token, err := s.entClient.AuthToken.Get(ctx, tokenID)
	if err != nil {
		return oidc.ErrAccessDenied().WithDescription("token not found")
	}
	if token.Expiration.Before(time.Now()) {
		return oidc.ErrAccessDenied().WithDescription("token expired")
	}
	userInfo := new(oidc.UserInfo)
	err = s.setUserinfo(ctx, userInfo, subject, token.Scopes)
	if err != nil {
		return err
	}
	introspection.SetUserInfo(userInfo)
	introspection.Scope = token.Scopes
	introspection.ClientID = token.ApplicationID
	return nil
}

// GetPrivateClaimsFromScopes implements the op.Storage interface
// it will be called for the creation of a JWT access token to assert claims for custom scopes
func (s *Storage) GetPrivateClaimsFromScopes(
	ctx context.Context,
	userID, clientID string,
	scopes []string,
) (claims map[string]any, err error) {
	return map[string]any{}, nil
}

// GetKeyByIDAndClientID implements the op.Storage interface
// it will be called to validate the signatures of a JWT (JWT Profile Grant and Authentication)
func (s *Storage) GetKeyByIDAndClientID(
	ctx context.Context,
	keyID, clientID string,
) (*jose.JSONWebKey, error) {
	return nil, fmt.Errorf("not implemented")
}

// ValidateJWTProfileScopes implements the op.Storage interface
// it will be called to validate the scopes of a JWT Profile Authorization Grant request
func (s *Storage) ValidateJWTProfileScopes(
	ctx context.Context,
	userID string,
	scopes []string,
) ([]string, error) {
	allowedScopes := make([]string, 0)
	for _, scope := range scopes {
		if scope == oidc.ScopeOpenID {
			allowedScopes = append(allowedScopes, scope)
		}
	}
	return allowedScopes, nil
}

// Health implements the op.Storage interface
func (s *Storage) Health(ctx context.Context) error {
	return nil
}

// createRefreshToken will store a refresh_token in-memory based on the provided information
func (s *Storage) createRefreshToken(
	accessToken *ent.AuthToken,
	amr []string,
	authTime time.Time,
) (string, error) {
	s.lock.Lock()
	defer s.lock.Unlock()
	token, err := s.entClient.AuthRefreshToken.Create().
		SetID(accessToken.RefreshTokenID).
		SetToken(accessToken.RefreshTokenID).
		SetAuthTime(authTime).
		SetAmr(amr).
		SetApplicationID(accessToken.ApplicationID).
		SetUserID(accessToken.Subject).
		SetAudience(accessToken.Audience).
		SetExpiration(time.Now().Add(5 * time.Hour)).
		SetScopes(accessToken.Scopes).
		SetSubject(accessToken.Subject).
		Save(context.Background())
	if err != nil {
		s.logger.Error("failed to save refresh token: %v", err)
		return "", fmt.Errorf("failed to save refresh token: %w", err)
	}
	return token.Token, nil
}

// renewRefreshToken checks the provided refresh_token and creates a new one based on the current
func (s *Storage) renewRefreshToken(currentRefreshToken string) (string, string, error) {
	s.lock.Lock()
	defer s.lock.Unlock()
	refreshToken, err := s.entClient.AuthRefreshToken.Get(context.Background(), currentRefreshToken)
	if err != nil {
		return "", "", oidc.ErrAccessDenied().WithDescription("refresh token not found")
	}
	refreshTokenID := uuid.NewString()
	_, err = s.entClient.AuthRefreshToken.Create().
		SetID(refreshTokenID).
		SetToken(refreshTokenID).
		SetAuthTime(refreshToken.AuthTime).
		SetAmr(refreshToken.Amr).
		SetApplicationID(refreshToken.ApplicationID).
		SetUserID(refreshToken.UserID).
		SetAudience(refreshToken.Audience).
		SetExpiration(time.Now().Add(5 * time.Hour)).
		SetScopes(refreshToken.Scopes).
		Save(context.Background())
	if err != nil {
		s.logger.Error("failed to save refresh token: %v", err)
		return "", "", fmt.Errorf("failed to save refresh token: %w", err)
	}
	_ = s.entClient.AuthRefreshToken.DeleteOneID(currentRefreshToken).Exec(context.Background())
	return refreshTokenID, refreshToken.Token, nil
}

// accessToken will store an access_token in-memory based on the provided information
func (s *Storage) accessToken(
	applicationID, refreshTokenID, subject string,
	audience, scopes []string,
) (*ent.AuthToken, error) {
	s.lock.Lock()
	defer s.lock.Unlock()
	expiration := time.Now().Add(5 * time.Minute)
	if applicationID == "builtin" {
		expiration = time.Now().Add(30 * 24 * time.Hour)
	}
	token, err := s.entClient.AuthToken.Create().
		SetID(uuid.NewString()).
		SetApplicationID(applicationID).
		SetRefreshTokenID(refreshTokenID).
		SetSubject(subject).
		SetAudience(audience).
		SetExpiration(expiration).
		SetScopes(scopes).
		Save(context.Background())
	if err != nil {
		s.logger.Error("failed to save access token: %v", err)
		return nil, fmt.Errorf("failed to save access token: %w", err)
	}
	return token, nil
}

// setUserinfo sets the info based on the user, scopes and if necessary the clientID
func (s *Storage) setUserinfo(
	ctx context.Context,
	userInfo *oidc.UserInfo,
	userID string,
	scopes []string,
) (err error) {
	s.lock.Lock()
	defer s.lock.Unlock()
	userIDInt, err := strconv.ParseInt(userID, 10, 32)
	if err != nil {
		return fmt.Errorf("user not found")
	}
	user, _ := s.entClient.User.Get(ctx, int(userIDInt))

	if user == nil {
		return fmt.Errorf("user not found")
	}
	for _, scope := range scopes {
		switch scope {
		case oidc.ScopeOpenID:
			userInfo.Subject = userID
		case oidc.ScopeEmail:
			userInfo.Email = user.Email
			userInfo.EmailVerified = true
		case oidc.ScopeProfile:
			userInfo.PreferredUsername = user.Username
			userInfo.Name = user.UsualFullName
			userInfo.FamilyName = user.LastName
			userInfo.Nickname = user.Username
			userInfo.GivenName = user.FirstName
			if user.UsualFirstName != nil {
				userInfo.GivenName = *user.UsualFirstName
			}
			userInfo.Locale = oidc.NewLocale(language.English)
			if user.Picture != nil {
				userInfo.Picture = *user.Picture
			}
		}
	}
	return nil
}

// ValidateTokenExchangeRequest implements the op.TokenExchangeStorage interface
// it will be called to validate parsed Token Exchange Grant request
func (s *Storage) ValidateTokenExchangeRequest(
	ctx context.Context,
	request op.TokenExchangeRequest,
) error {
	if request.GetRequestedTokenType() == "" {
		request.SetRequestedTokenType(oidc.RefreshTokenType)
	}

	// Just an example, some use cases might need this use case
	if request.GetExchangeSubjectTokenType() == oidc.IDTokenType &&
		request.GetRequestedTokenType() == oidc.RefreshTokenType {
		return errors.New("exchanging id_token to refresh_token is not supported")
	}

	request.SetCurrentScopes(request.GetScopes())

	return nil
}

// ValidateTokenExchangeRequest implements the op.TokenExchangeStorage interface
// Common use case is to store request for audit purposes. For this example we skip the storing.
func (s *Storage) CreateTokenExchangeRequest(
	ctx context.Context,
	request op.TokenExchangeRequest,
) error {
	return nil
}

// GetPrivateClaimsFromScopesForTokenExchange implements the op.TokenExchangeStorage interface
// it will be called for the creation of an exchanged JWT access token to assert claims for custom scopes
// plus adding token exchange specific claims related to delegation or impersonation
func (s *Storage) GetPrivateClaimsFromTokenExchangeRequest(
	ctx context.Context,
	request op.TokenExchangeRequest,
) (claims map[string]any, err error) {
	return make(map[string]any), nil
}

// SetUserinfoFromScopesForTokenExchange implements the op.TokenExchangeStorage interface
// it will be called for the creation of an id_token - we are using the same private function as for other flows,
// plus adding token exchange specific claims related to delegation or impersonation
func (s *Storage) SetUserinfoFromTokenExchangeRequest(
	ctx context.Context,
	userinfo *oidc.UserInfo,
	request op.TokenExchangeRequest,
) error {
	err := s.setUserinfo(ctx, userinfo, request.GetSubject(), request.GetScopes())
	if err != nil {
		return err
	}

	return nil
}

// getInfoFromRequest returns the clientID, authTime and amr depending on the op.TokenRequest type / implementation
func getInfoFromRequest(req op.TokenRequest) (clientID string, authTime time.Time, amr []string) {
	refreshReq, ok := req.(*RefreshTokenRequest) // Refresh Token Request
	if ok {
		return refreshReq.ApplicationID, refreshReq.AuthTime, refreshReq.Amr
	}
	interfaceRefreshReq, ok := req.(op.RefreshTokenRequest) // Refresh Token Request
	if ok {
		return interfaceRefreshReq.GetClientID(), interfaceRefreshReq.GetAuthTime(), interfaceRefreshReq.GetAMR()
	}
	return "", time.Time{}, nil
}
