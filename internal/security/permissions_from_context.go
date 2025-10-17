package security

import (
	"context"

	"base-website/pkg/rbac"

	"github.com/danielgtaylor/huma/v2"
)

const PermissionsKey = "permissions"

type RequestPermissions struct {
	Permissions []*rbac.Permission
}

func (p *RequestPermissions) Can(path string, method string) bool {
	for _, permission := range p.Permissions {
		if permission.Can(path, method) {
			return true
		}
	}
	return false
}

func PermissionsFromHumaContext(ctx huma.Context) *RequestPermissions {
	return PermissionsFromContext(ctx.Context())
}

func PermissionsFromContext(ctx context.Context) *RequestPermissions {
	rp := ctx.Value(PermissionsKey).(*RequestPermissions)
	if rp == nil {
		return &RequestPermissions{
			Permissions: []*rbac.Permission{},
		}
	}
	return rp
}
