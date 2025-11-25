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

# App package manifest so pnpm can resolve @cottonbro/web
COPY apps/web/package.json ./apps/web/package.json

# Install deps for @cottonbro/web (and its deps)
RUN pnpm install --filter @cottonbro/web... --prod=false

# ---------- Build stage ----------
FROM deps AS build

ARG APP_ENV=prod
ARG NEXT_PUBLIC_APP_ENV=""
ARG NEXT_PUBLIC_FIREBASE_API_KEY=""
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
ARG NEXT_PUBLIC_FIREBASE_APP_ID=""
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
ARG NEXT_PUBLIC_AUTH_BASE_URL=""
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=""

ENV APP_ENV=${APP_ENV}
ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}
ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}
ENV NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}
ENV NEXT_PUBLIC_AUTH_BASE_URL=${NEXT_PUBLIC_AUTH_BASE_URL}
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}

# Copy only the web app sources (Next, config, assets, env files)
COPY apps/web ./apps/web

# Generate the env file expected by env-cmd (e.g., .env.qa.local) using build args.
RUN ENV_FILE="/app/apps/web/.env.${APP_ENV}.local"; \
    mkdir -p "$(dirname "$ENV_FILE")"; \
    { \
      echo "APP_ENV=${APP_ENV}"; \
      echo "NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV:-$APP_ENV}"; \
      echo "NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}"; \
      echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}"; \
      echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}"; \
      echo "NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}"; \
      echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}"; \
      echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}"; \
      echo "NEXT_PUBLIC_AUTH_BASE_URL=${NEXT_PUBLIC_AUTH_BASE_URL}"; \
      echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}"; \
    } > "$ENV_FILE"; \
    cp "$ENV_FILE" "/app/.env.${APP_ENV}.local"

# Build shared frontend packages so their dist outputs exist for Next build
RUN pnpm --filter @cottonbro/ui build && pnpm --filter @cottonbro/auth-react build

# Build QA or Prod based on APP_ENV (Next will emit .next/standalone)
RUN if [ "$APP_ENV" = "qa" ]; then \
      pnpm --filter @cottonbro/web build:qa; \
    else \
      pnpm --filter @cottonbro/web build:prod; \
    fi

# ---------- Runtime stage ----------
FROM node:22-slim AS runner

ENV NODE_ENV=production
WORKDIR /app

# Create non-root user first
RUN addgroup --system app && adduser --system --ingroup app app

# Default envs (Cloud Run can override)
ENV PORT=5173
ENV APP_ENV=prod

# Copy standalone server output & public assets
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=app:app /app/apps/web/public ./apps/web/public

# Now drop to non-root
USER app

EXPOSE 5173

CMD ["node", "apps/web/server.js"]
