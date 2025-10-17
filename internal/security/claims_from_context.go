package security

import (
	"context"
	"strconv"

	"github.com/danielgtaylor/huma/v2"
)

const ClaimsKey = "claims"

type Claims struct {
	TokenID string
	Scopes  []string
	Subject string
}

func (c *Claims) GetUserID() (int, error) {
	return strconv.Atoi(c.Subject)
}

func GetClaimsFromHumaContext(ctx huma.Context) (*Claims, error) {
	return GetClaimsFromContext(ctx.Context())
}

func GetClaimsFromContext(ctx context.Context) (*Claims, error) {
	claims, ok := ctx.Value("claims").(*Claims)
	if !ok {
		return nil, huma.Error403Forbidden("unauthorized")
	}
	return claims, nil
}

func GetUserIDFromContext(ctx context.Context) (int, error) {
	claims, err := GetClaimsFromContext(ctx)
	if err != nil {
		return 0, err
	}
	return claims.GetUserID()
}
