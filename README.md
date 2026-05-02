# Cottonbro

Cottonbro is a merch creation platform. The current monorepo contains a Next.js web app, a NestJS API, a FastAPI image-processing service, and a small set of shared TypeScript packages.

## Tech Stack

| Area | Technology |
| --- | --- |
| Web | Next.js 15 App Router, React 19, Tailwind CSS 4 |
| Editor/UI | Fabric.js, Framer Motion, Three.js, lucide-react |
| API | NestJS 11, Express 5 |
| Python service | FastAPI, rembg/ONNX image processing |
| Auth | Firebase client SDK, Firebase Admin SDK, HttpOnly session cookies |
| Tooling | pnpm 10 workspaces, Turborepo 2, TypeScript 5.9 |
| Tests | Jest for API, Vitest for UI package, Playwright for web E2E |
| Runtime | Node.js 24.x, Python 3.12 for `apps/python-services` |

## Repository Layout

```text
cottonbro/
├── apps/
│   ├── api/              # NestJS API: auth, health, image proxy
│   ├── web/              # Next.js app: public site, auth, design/editor UI
│   └── python-services/  # FastAPI service: background removal/image tasks
├── packages/
│   ├── backend/
│   │   └── auth-server/  # Firebase Admin helpers for server-side auth
│   ├── core/
│   │   └── utils/        # Shared TypeScript utilities and validation exports
│   └── frontend/
│       ├── auth-react/   # React auth provider/hooks
│       └── ui/           # Shared React UI package
├── .github/workflows/    # CI and QA deploy workflows
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

Workspace globs are:

```yaml
apps/*
packages/*/*
```

## App Flow

```text
Browser
  -> Next.js web app
  -> same-origin /api/* requests
  -> Next.js rewrite to API_BASE_URL
  -> NestJS API
  -> FastAPI python-services for image processing when needed
```

Auth routes are intentionally proxied through the web app. The browser calls `/api/auth/*`; Next.js forwards those requests to `${API_BASE_URL}/auth/*`; the API owns session cookie minting and verification.

## Environment Files

Each app has its own env template:

```text
apps/api/.env.example
apps/web/.env.example
apps/python-services/.env.example
```

For local development, copy templates to local env files and fill real values:

```bash
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/python-services/.env.example apps/python-services/.env.local
```

Important web variables:

```env
APP_ENV=local
NEXT_PUBLIC_APP_ENV=local
API_BASE_URL=http://localhost:3001/v1
NEXT_PUBLIC_ASSETS_BASE_URL=https://qa-assets.cottonbro.com
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

`API_BASE_URL` is server-side and should include the API version prefix. `NEXT_PUBLIC_ASSETS_BASE_URL` is required by `next.config.ts` so Next.js can allow remote images and CSP image sources.

## Setup

```bash
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm install
```

The repo declares Node `24.x`. If your local Node version differs, pnpm will warn.

Python service setup:

```bash
cd apps/python-services
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Development

Run the full Turborepo dev graph:

```bash
pnpm dev
```

Run individual services:

```bash
pnpm --filter @cottonbro/web dev
pnpm --filter @cottonbro/api dev
cd apps/python-services && source venv/bin/activate && uvicorn src.main:app --reload --port 8000
```

Default local ports:

| Service | Port |
| --- | --- |
| Web | `5173` |
| API | `3001` |
| Python services | `8000` |

## Commands

Root commands:

| Purpose | Command |
| --- | --- |
| Dev all workspace packages with `dev` scripts | `pnpm dev` |
| Build all | `pnpm build` |
| Test all packages with `test` scripts | `pnpm test` |
| Typecheck all packages with `typecheck` scripts | `pnpm typecheck` |
| Lint all packages with `lint` scripts | `pnpm lint` |

Useful package commands:

| Purpose | Command |
| --- | --- |
| Web dev | `pnpm --filter @cottonbro/web dev` |
| Web QA dev | `pnpm --filter @cottonbro/web dev:qa` |
| Web build | `pnpm --filter @cottonbro/web build` |
| Web E2E | `pnpm --filter @cottonbro/web test:e2e` |
| API dev | `pnpm --filter @cottonbro/api dev` |
| API tests | `pnpm --filter @cottonbro/api test` |
| UI package tests | `pnpm --filter @cottonbro/ui test` |

## Docker

Build the web image from the repo root:

```bash
docker build -f apps/web/Dockerfile \
  --build-arg APP_ENV=qa \
  --build-arg NEXT_PUBLIC_APP_ENV=qa \
  --build-arg API_BASE_URL=https://api.example.com/v1 \
  --build-arg NEXT_PUBLIC_ASSETS_BASE_URL=https://assets.example.com \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id \
  --build-arg NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key \
  -t cottonbro-web:qa .
```

Build the API image:

```bash
docker build -f apps/api/Dockerfile -t cottonbro-api:qa .
```

Build the Python services image:

```bash
docker build -f apps/python-services/Dockerfile -t cottonbro-python-services:qa apps/python-services
```

## CI/CD

Current workflows live in `.github/workflows/`:

```text
ci.yml
deploy-web-qa.yml
deploy-qa-api.yml
deploy-qa-python-services.yml
```

`ci.yml` runs on pushes and pull requests to `main`, installs dependencies with pnpm, then runs root lint and test commands. The deploy workflows build and deploy the QA services.
