# Cottonbro

Cottonbro lets creators design merch (tees, beanies, crop tops, etc.), render them on real-body previews, and share purchasable links. We manage printing, payments, and delivery so creators only focus on their brand.

## Tech Stack

**Monorepo & Tooling**

- `pnpm` workspaces + `turbo` orchestrate builds/tests across `apps/*` and `packages/*/*`.
- TypeScript-first everywhere; linting/formatting handled by ESLint 9, Prettier 3, and Husky/Commitlint hooks.
- Docker images (Node 22 slim) power both local and Cloud Run deployments.

**Frontend (`apps/web`)**

- Next.js 15 + React 19 + App Router; renders marketing site and creator studio UI.
- Tailwind CSS 4/PostCSS for styles, Framer Motion for animation, React Three Fiber/Drei + Three.js for the 3D garment preview.
- Firebase JS SDK supplies client auth/session handling; Cloudflare Turnstile keys are injected via env vars.

**Backend (`apps/api`)**

- NestJS 11 on Express 5 (HTTP only) with class-transformer/validator, Helmet, cookie-parser, and Throttler for validation/security.
- Shared code pulled from internal packages: `@cottonbro/auth-server` (Firebase Admin helpers), `@cottonbro/contracts` (Zod models), and `@cottonbro/utils`.
- Secrets (Firebase project/admin JSON, SMTP creds, Turnstile secret) are mounted into Cloud Run via Secret Manager.

**Shared Packages**

- `packages/frontend/ui` – reusable UI library (React 18/19 compatible) built with Tailwind utilities.
- `packages/frontend/auth-react` – Firebase-aware React hooks/components.
- `packages/backend/auth-server` – Firebase Admin helpers for authenticated APIs/jobs.
- `packages/core/*` – contracts, utils, pricing, etc. that can be shared across surfaces.

**Infrastructure**

- GitHub Actions build and push Docker images, then deploy both services to Google Cloud Run (see `.github/workflows/deploy-*.yml`).
- Artifact Registry stores images; Workload Identity Federation authenticates workflows (no long-lived GCP keys).

## Commands

| Purpose | Command |
| --- | --- |
| Web app dev server | `pnpm --filter @cottonbro/web dev` |
| API dev server | `pnpm --filter @cottonbro/api dev` |
| Build shared UI kit | `pnpm --filter @cottonbro/ui build` |

> Use `pnpm dev` / `pnpm build` at the root to fan out via Turbo once all env files are in place.

## Packages Layout

```
packages/
  core/
    contracts/
    utils/
    pricing/
    orders/
  frontend/
    ui/
    auth-react/
  backend/
    auth-server/
    jobs/
```

## Docker Quickstart

```bash
# Web (QA env)
docker build -f apps/web/Dockerfile --build-arg APP_ENV=qa -t cottonbro-web:qa .
docker run --rm -p 5173:5173 \
  -e APP_ENV=qa \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  cottonbro-web:qa

# API (QA env)
docker build -f apps/api/Dockerfile --build-arg APP_ENV=qa -t cottonbro-api:qa .
docker run --rm -p 3001:3001 \
  -e APP_ENV=qa \
  cottonbro-api:qa
```

> Cloud Run deployments mirror these images; update `.github/workflows/deploy-web-qa.yml` or `.github/workflows/deploy-qa-api.yml` if build args/envs change.
