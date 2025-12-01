ARG VERSION

# --- Frontend ---
# Docs: https://pnpm.io/docker

FROM node:23 AS front-base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY ./frontend /src

WORKDIR /src

FROM front-base AS front-prod-deps
ENV CI=true
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM front-base AS front-builder
ENV CI=true
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM front-base AS front-final
COPY --from=front-prod-deps /src/node_modules /src/node_modules
COPY --from=front-builder /src/dist /src/dist


# --- Backend ---

FROM golang:1.25.2 AS back-builder

COPY . /src

WORKDIR /src

COPY --from=front-final /src/dist /src/spa/public

RUN GOEXPERIMENT=jsonv2 CGO_ENABLED=0 go build -o pedago-dashboard -ldflags="-s -w -X 'base-website.Version=${VERSION}'" ./cmd/api

# --- Final ---

FROM debian:12.11

WORKDIR /app

ENV MIGRATIONS_DIR="/app/migrations"
ENV CI="true"

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/* && apt-get clean

RUN curl -sSf https://atlasgo.sh | sh

COPY ./ent/migrate/migrations /app/migrations
COPY ./configs /app/configs
COPY ./scripts/docker/api-entrypoint.sh /usr/local/bin/entrypoint.sh

COPY --from=back-builder /src/pedago-dashboard /usr/local/bin/pedago-dashboard

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["/usr/local/bin/pedago-dashboard", "start"]

