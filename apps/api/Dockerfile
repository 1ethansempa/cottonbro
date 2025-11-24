# ---------- Base builder image (Node 22 + pnpm) ----------
FROM node:22-slim AS base

ENV NODE_ENV=production
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

# ---------- Dependencies stage ----------
FROM base AS deps

# Copy root-level files needed for workspaces + TS
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.types.json ./

# Copy workspace packages used by @cottonbro/api
COPY packages ./packages

# Copy API package.json so pnpm knows about this workspace
COPY apps/api/package.json ./apps/api/package.json

# Install only deps for @cottonbro/api and its workspace dependencies
RUN pnpm install --filter @cottonbro/api... --prod=false

# ---------- Build stage ----------
FROM deps AS build

ENV NODE_ENV=production

# Copy full app source
COPY apps ./apps

# Build API (NestJS -> dist/)
RUN pnpm --filter @cottonbro/api build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy node_modules, workspace packages, and the built API with correct ownership
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/packages ./packages
COPY --from=build --chown=app:app /app/apps/api ./apps/api

USER app

WORKDIR /app/apps/api

# Port & env
ENV PORT=3001
ENV APP_ENV=prod

EXPOSE 3001

CMD ["node", "dist/main.js"]
