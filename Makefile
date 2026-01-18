.PHONY: help install dev build docker-up docker-down clean

help:
	@echo "QuickQR SaaS - Available Commands"
	@echo "=================================="
	@echo "make install     - Install all dependencies"
	@echo "make dev         - Start development servers"
	@echo "make build       - Build for production"
	@echo "make docker-up   - Start Docker containers"
	@echo "make docker-down - Stop Docker containers"
	@echo "make clean       - Clean node_modules and build files"

install:
	npm install
	cd server && npm install
	cd client && npm install

dev:
	docker-compose up -d
	npm run dev

build:
	cd client && npm run build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

clean:
	rm -rf node_modules
	rm -rf server/node_modules
	rm -rf client/node_modules
	rm -rf client/dist

seed:
	cd server && npm run seed