package middlewares

import "github.com/danielgtaylor/huma/v2"

func CorsMiddleware() HumaMiddleware {
	return func(ctx huma.Context, next func(huma.Context)) {
		ctx.AppendHeader("Access-Control-Allow-Origin", "*")
		next(ctx)
	}
}
