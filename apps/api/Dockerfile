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

# Copy workspace packages (so pnpm can resolve all workspace deps)
COPY packages ./packages

# Copy API package manifest so pnpm can resolve this workspace
COPY apps/api/package.json ./apps/api/package.json

# Install all workspace dependencies (dev deps included for build)
# This ensures @cottonbro/auth-server and any other workspace deps are available.
RUN pnpm install --prod=false

# ---------- Build stage ----------
FROM deps AS build

ENV NODE_ENV=production

# Copy full app sources (now that deps are installed)
COPY apps ./apps

# Build shared auth-server package so compiled output exists for API build
RUN pnpm --filter @cottonbro/auth-server build

# Build API (NestJS -> dist/)
RUN pnpm --filter @cottonbro/api build

# Create a trimmed production payload (code + prod node_modules)
# This should only copy what @cottonbro/api needs into /app/deploy
RUN pnpm deploy --filter @cottonbro/api --prod --legacy /app/deploy

# ---------- Runtime stage ----------
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app

# Copy only the trimmed deploy artifacts
COPY --from=build --chown=app:app /app/deploy/ ./

# Switch to non-root user for runtime safety
USER app

# Port & env
ENV PORT=3001
ENV APP_ENV=prod

EXPOSE 3001

CMD ["node", "dist/main.js"]
