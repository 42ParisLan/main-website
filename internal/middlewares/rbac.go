package middlewares

import (
	"errors"
	"fmt"
	"net/http"

	"base-website/ent"
	"base-website/ent/user"
	"base-website/internal/security"
	rbacservice "base-website/internal/services/rbac"
	"base-website/pkg/logger"

	"github.com/danielgtaylor/huma/v2"
)

func NewRbacMiddleware(
	api huma.API,
	entClient *ent.Client,
	rbacService rbacservice.RBACService,
) HumaMiddleware {
	logger := logger.New().WithContext("RbacMiddleware")
	return func(ctx huma.Context, next func(huma.Context)) {
		claims, err := security.GetClaimsFromHumaContext(ctx)
		if err != nil {
			next(ctx)
			return
		}

		var roles []string
		var notFoundErr error
		var missingIDErr error

		userID, err := claims.GetUserID()
		if err != nil {
			missingIDErr = errors.New("missing user ID")
		}
		user, err := entClient.User.Query().
			Where(user.ID(userID)).
			Select(user.FieldRoles).
			First(ctx.Context())
		if err != nil {
			notFoundErr = errors.New("user not found")
		}
		roles = user.Roles

		if missingIDErr != nil {
			_ = huma.WriteErr(api, ctx, http.StatusForbidden, "forbidden", missingIDErr)
			return
		}

		if notFoundErr != nil {
			_ = huma.WriteErr(api, ctx, http.StatusForbidden, "forbidden", notFoundErr)
			return
		}

		if !rbacService.Can(roles, ctx.Operation().Path, ctx.Operation().Method) {
			logger.Warn(
				"[%s] missing permission %s on %s",
				claims.Subject,
				ctx.Operation().Method,
				ctx.Operation().Path,
			)
			_ = huma.WriteErr(
				api,
				ctx,
				http.StatusForbidden,
				"forbidden",
				fmt.Errorf(
					"missing permission %s on %s",
					ctx.Operation().Method,
					ctx.Operation().Path,
				),
			)
			return
		}

		ctx = huma.WithValue(ctx, security.PermissionsKey, &security.RequestPermissions{
			Permissions: rbacService.GetPermissions(roles),
		})
		next(ctx)
	}
}
