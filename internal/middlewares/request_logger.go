package middlewares

import (
	"base-website/internal/security"
	"base-website/pkg/logger"

	"github.com/danielgtaylor/huma/v2"
)

func RequestLoggerMiddleware(logger *logger.Logger) HumaMiddleware {
	return func(ctx huma.Context, next func(huma.Context)) {
		claims, _ := security.GetClaimsFromHumaContext(ctx)
		url := ctx.URL()
		path := url.Path
		if url.RawQuery != "" {
			path += "?" + url.RawQuery
		}
		if claims != nil {
			logger.Http(
				"ip=%s subject=%s method=%s path=%s",
				ctx.RemoteAddr(),
				claims.Subject,
				ctx.Method(),
				path,
			)
		} else {
			logger.Http("ip=%s method=%s path=%s", ctx.RemoteAddr(), ctx.Method(), path)
		}
		next(ctx)
	}
}
