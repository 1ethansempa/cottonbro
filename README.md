# Cottonbro

This will enable users(creators) create merch. This ranges from shirts, beenies, sweatshirts, croptops etc. A user can then choose to download this merch. They can publish a link(private or public) which then other users can purchase. I want a canva like app where they can edit assets that will go on the clothes, user can then see a 3d like image of someone wearing the shirt in a given size before checking it out. We handle printing, sales & delivery.

## Commands

- pnpm --filter @cottonbro/web dev
- pnpm --filter @cottonbro/api dev
- pnpm --filter @cottonbro/ui build

## Packages layout

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

## Docker

- docker build \
  -f apps/web/Dockerfile \
  --build-arg APP_ENV=qa \
  -t cottonbro-web:qa .
- docker run --rm -p 5173:5173 \
  -e APP_ENV=qa \
  -e NEXT_PUBLIC_API_URL=<http://localhost:3001> \
  cottonbro-web:qa
- docker build \
  -f apps/api/Dockerfile \
  --build-arg APP_ENV=qa \
  -t cottonbro-api:qa .
- docker run --rm -p 3001:3001 \
  -e APP_ENV=qa \
  cottonbro-api:qa
