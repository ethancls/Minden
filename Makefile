SHELL := /bin/bash

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

db-up:
	docker compose up -d postgres

db-down:
	docker compose down

db-logs:
	docker compose logs -f postgres

s3-up:
	docker compose up -d s3 s3-setup

s3-logs:
	docker compose logs -f s3

s3-down:
	docker compose stop s3 s3-setup

prisma-generate:
	npm run prisma:generate

prisma-migrate:
	npm run prisma:migrate

prisma-studio:
	npm run prisma:studio
