package middlewares

import "github.com/danielgtaylor/huma/v2"

func NoCacheMiddleware() HumaMiddleware {
	return func(ctx huma.Context, next func(huma.Context)) {
		ctx.AppendHeader("Cache-Control", "no-cache, no-transform")
		next(ctx)
	}
}
