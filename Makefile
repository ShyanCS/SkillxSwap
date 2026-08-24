# Convenience targets mirroring package.json scripts and the README.
# Requires Docker for anything touching the backend test suite.

.PHONY: up down install lint format-check test build

up:            ## Start the whole product (db, mailpit, api, web)
	docker compose -f docker-compose.dev.yml up --build

down:          ## Stop and remove the evaluation stack
	docker compose -f docker-compose.dev.yml down

install:       ## Install frontend dependencies
	npm ci --prefix frontend

lint:          ## ESLint over the frontend
	npm run lint --prefix frontend

format-check:  ## Prettier check over the frontend
	npm run format:check --prefix frontend

test:          ## Full suite: frontend Vitest + backend Testcontainers
	npm test --prefix frontend
	cd backend-java && ./mvnw -B verify

build:         ## Production frontend bundle
	npm run build --prefix frontend
