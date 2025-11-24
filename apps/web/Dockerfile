# ---------- Base image: Node 22 + pnpm ----------
FROM node:22-slim AS base

ENV NODE_ENV=production
WORKDIR /app

# Enable pnpm via corepack (Node 22 ships with corepack)
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

# ---------- Dependencies stage ----------
FROM base AS deps

# Root-level files needed for workspace & tsconfig
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.types.json ./

# Workspace packages (for @cottonbro/ui, @cottonbro/auth-react, etc.)
COPY packages ./packages

# App package.json so pnpm knows about @cottonbro/web
COPY apps/web/package.json ./apps/web/package.json

# Install deps for @cottonbro/web (and its deps)
RUN pnpm install --filter @cottonbro/web... --prod=false

# ---------- Build stage ----------
FROM deps AS build

ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=production

# Copy full app source (TS, config, public, etc.)
COPY apps ./apps

# Build QA or Prod based on APP_ENV
RUN if [ "$APP_ENV" = "qa" ]; then \
      pnpm --filter @cottonbro/web build:qa; \
    else \
      pnpm --filter @cottonbro/web build:prod; \
    fi

# ---------- Runtime stage ----------
# ---------- Runtime stage ----------
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user first
RUN addgroup --system app && adduser --system --ingroup app app

# Default envs (Cloud Run can override)
ENV PORT=5173
ENV APP_ENV=prod

# Copy built artifacts and node_modules, assigning ownership to app:app
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/apps/web ./apps/web

# Now drop to non-root
USER app

WORKDIR /app/apps/web

EXPOSE 5173

CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "5173"]
