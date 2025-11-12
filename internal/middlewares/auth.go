package middlewares

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"base-website/ent"
	"base-website/internal/security"
	configservice "base-website/internal/services/config"

	"github.com/danielgtaylor/huma/v2"
	"github.com/zitadel/oidc/v3/pkg/op"
)

func NewAuthMiddleware(
	api huma.API,
	configService configservice.ConfigService,
	entClient *ent.Client,
	provider op.OpenIDProvider,
) HumaMiddleware {
	return func(ctx huma.Context, next func(huma.Context)) {
		isAuthorisationRequired := false
		scopes := []string{}
		for _, opScheme := range ctx.Operation().Security {
			if secScopes, ok := opScheme[security.Oauth2]; ok {
				isAuthorisationRequired = true
				scopes = secScopes
				break
			}
		}
		if !isAuthorisationRequired {
			next(ctx)
			return
		}
		token := strings.TrimPrefix(ctx.Header("Authorization"), "Bearer ")
		if token == "" {
			tokenCookie, _ := huma.ReadCookie(ctx, "auth")
			if tokenCookie != nil {
				token = tokenCookie.Value
			}
		}
		if token == "" {
			_ = huma.WriteErr(
				api,
				ctx,
				http.StatusUnauthorized,
				"unauthorized",
				fmt.Errorf("missing cookie or bearer token"),
			)
			return
		}
		claims, err := verifyToken(ctx.Context(), token, provider, entClient)
		if err != nil {
			_ = huma.WriteErr(
				api,
				ctx,
				http.StatusUnauthorized,
				"unauthorized",
				fmt.Errorf("failed to verify token: %v", err),
			)
			return
		}
		// Check if the token has the required scopes
		if !checkScopes(claims, scopes) {
			_ = huma.WriteErr(
				api,
				ctx,
				http.StatusForbidden,
				"forbidden",
				fmt.Errorf("missing one of the required scopes: %s", strings.Join(scopes, ", ")),
			)
			return
		}
		ctx = huma.WithValue(ctx, security.ClaimsKey, claims)
		next(ctx)
	}
}

// verifyToken verifies the token and returns the claims
func verifyToken(
	ctx context.Context,
	token string,
	provider op.OpenIDProvider,
	entClient *ent.Client,
) (*security.Claims, error) {
	tokenIDSubject, err := provider.Crypto().Decrypt(token)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt token: %v", err)
	}
	tokenIdParts := strings.Split(tokenIDSubject, ":")
	if len(tokenIdParts) != 2 {
		return nil, fmt.Errorf("invalid token format")
	}
	tokenID, subject := tokenIdParts[0], tokenIdParts[1]
	if tokenID == "" || subject == "" {
		return nil, fmt.Errorf("invalid token format")
	}
	authTokenEnt, err := entClient.AuthToken.Get(ctx, tokenID)
	if err != nil {
		return nil, fmt.Errorf("auth token not found")
	}
	if authTokenEnt.Expiration.Before(time.Now()) {
		return nil, fmt.Errorf("token expired")
	}
	return &security.Claims{
		TokenID: tokenID,
		Scopes:  authTokenEnt.Scopes,
		Subject: subject,
	}, nil
}

// checkScopes checks if the token has the required scopes
// Returns true if the token has one of the required scopes
func checkScopes(claims *security.Claims, requiredScopes []string) bool {
	found := false
	for _, requiredScope := range requiredScopes {
		for _, scope := range claims.Scopes {
			if scope == requiredScope {
				found = true
				break
			}
		}
	}
	return found
}
