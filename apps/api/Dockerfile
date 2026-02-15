# Base: Node 22 + pnpm
FROM node:22-slim AS base

ENV NODE_ENV=production
WORKDIR /app

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

# Dependencies
FROM base AS deps

# Workspace manifests + TS configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.types.json ./

# Workspace packages for dependency resolution
COPY packages ./packages

# API manifest
COPY apps/api/package.json ./apps/api/package.json

# Install all workspace deps (incl. dev) for build
RUN pnpm install --prod=false

# Build
FROM deps AS build

ENV NODE_ENV=production

# Full sources after deps
COPY apps ./apps

# Build shared auth-server first
RUN pnpm --filter @cottonbro/auth-server build

# Build API (NestJS -> dist)
RUN pnpm --filter @cottonbro/api build

# Trim to production payload (app + prod node_modules)
RUN pnpm deploy --filter @cottonbro/api --prod --legacy /app/deploy

# Runtime
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Deploy artifacts only
COPY --from=build --chown=app:app /app/deploy/ ./

# Drop privileges
USER app

# Port & env
ENV PORT=3001
ENV APP_ENV=prod

EXPOSE 3001

CMD ["node", "dist/main.js"]
