# -------- BASE IMAGE --------
# Use the official Node.js 22 slim image.
# "slim" keeps the image smaller by excluding unnecessary OS packages.
FROM node:22-slim AS base

# Set Node environment to production.
# Many libraries change behavior (e.g. logging, optimizations) when NODE_ENV=production.
ENV NODE_ENV=production

# Set the working directory inside the container.
# All subsequent commands run relative to /app.
WORKDIR /app

# Enable pnpm using Node's built-in package manager wrapper (corepack).
# corepack ensures the correct pnpm version is used.
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate


# -------- DEPENDENCIES STAGE --------
# Separate stage used to install dependencies.
# This improves Docker layer caching and keeps builds faster.
FROM base AS deps

# Copy root workspace manifests and TypeScript configs.
# These files define the monorepo structure and dependency graph.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json tsconfig.types.json ./

# Copy shared workspace packages.
# These may contain shared libraries used by multiple apps.
COPY packages ./packages

# Copy only the API package.json.
# This allows Docker to determine dependency requirements
# without copying the entire source code yet (better cache usage).
COPY apps/api/package.json ./apps/api/package.json

# Pre-fetch all dependencies listed in the lockfile.
# This downloads packages into pnpm's store without installing them yet.
# --prod=false includes dev dependencies needed for building TypeScript.
RUN pnpm fetch --prod=false

# Install dependencies using the lockfile strictly.
# --offline ensures no external network fetch occurs (deterministic build).
# --frozen-lockfile prevents pnpm from modifying the lockfile.
RUN pnpm install --offline --prod=false --frozen-lockfile


# -------- BUILD STAGE --------
# Uses dependencies from the previous stage to compile the application.
FROM deps AS build

# Ensure build tools run in production mode.
ENV NODE_ENV=production

# Copy the rest of the application source code.
# This is done AFTER dependency installation so Docker caching works better.
COPY apps ./apps

# Build the shared auth-server package first.
# This is likely a shared library used by the API.
RUN pnpm --filter @cottonbro/auth-server build

# Build the NestJS API application.
# NestJS compiles TypeScript into JavaScript in the dist/ folder.
RUN pnpm --filter @cottonbro/api build

# Prepare a minimal deployment directory.
# pnpm deploy copies only:
#   - the built application
#   - production node_modules
# This reduces final image size and removes dev dependencies.
RUN pnpm deploy --filter @cottonbro/api --prod --legacy /app/deploy


# -------- RUNTIME STAGE --------
# Final lightweight container that will run in production.
FROM node:22-slim AS runner

# Production environment again for safety.
ENV NODE_ENV=production

# Set working directory inside the runtime container.
WORKDIR /app

# Create a non-root user and group.
# Running containers as root is a security risk.
RUN addgroup --system app && adduser --system --ingroup app app

# Copy only the deployment artifacts from the build stage.
# This keeps the runtime image smaller and removes build tooling.
COPY --from=build --chown=app:app /app/deploy/ ./

# Drop privileges so the app runs as the non-root user.
USER app

# Set the application port.
# Many platforms (Cloud Run, etc.) rely on the PORT environment variable.
ENV PORT=8080

# Custom environment flag for your app.
ENV APP_ENV=prod

# Document that the container listens on port 8080.
# This does not publish the port but helps tooling understand the image.
EXPOSE 8080

# Start the NestJS application.
# dist/main.js is the compiled output produced by the NestJS build step.
CMD ["node", "dist/main.js"]