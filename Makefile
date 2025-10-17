VERSION ?= $(shell git describe --tags --dirty --broken)

DC ?= docker compose

##@ Dev

dev: ## Run dev docker compose
	$(DC) -f docker-compose.dev.yaml up --build

##@ Utilities

help:     ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_\-\.]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

lines-fmt: ##@ format lines of code to respect 100 characters
	go run -modfile=./tools/go.mod github.com/segmentio/golines --no-reformat-tags -m 100 -w ./

get-tag:      ## Get the next SemVer tag based on commits
	go run -modfile=./tools/go.mod github.com/caarlos0/svu

get-version:  ## Get the next version based on repo status (commit hash, dirty, broken)
	# git describe --tags --dirty --broken
	@echo $(VERSION)

commit:       ## Make a commit following the Conventional Commits convention
	go run -modfile=./tools/go.mod github.com/stefanlogue/meteor

tag:          ## Make a SemVer tag based on commits (make get-tag)
	git tag $(shell go run -modfile=./tools/go.mod github.com/caarlos0/svu)


##@ Checks (tests, linters, etc)
test:        ## Run Go tests
	go test -v ./... -json | go run -modfile=./tools/go.mod github.com/mfridman/tparse -all

test-junit:
	go run -modfile=./tools/go.mod gotest.tools/gotestsum --junitfile test-report.xml --format testname -- -v ./...

cover:       ## Run Go tests with coverage
	go test -cover -v ./...

lint:        ## Run linters and fix code, when possible (golangci-lint)
	go run -modfile=./tools/go.mod github.com/golangci/golangci-lint/cmd/golangci-lint run --show-stats --fix

check-lint:  ## Run linters in read-only (golangci-lint)
	go run -modfile=./tools/go.mod github.com/golangci/golangci-lint/cmd/golangci-lint run --show-stats

check: check-lint  ## Run all checks

##@ Types Generation
types-gen:
	cd frontend && npx openapi-typescript ../docs/pedagodashboard-api.yaml -o ./src/lib/api/types.ts

##@ Database Operations

database-gen: ## Generate ent files
	go generate ./ent

database-gen-migrations: ## Generate sql migration files
	./scripts/atlas/gen-migrations.sh

database-migrate: ## Apply sql migrations
	./scripts/atlas/migrate.sh

.PHONY: default lines-fmt help get-tag get-version commit tag test test-junit cover lint check-lint check database-gen database-gen-migrations database-migrate
