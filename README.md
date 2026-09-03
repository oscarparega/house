# House

Full-stack foundation for the House application.

## Stack

- Next.js App Router and React
- PostgreSQL 16 with PostGIS
- Prisma ORM using the PostgreSQL driver adapter
- MapLibre GL JS
- TypeScript and flat-config ESLint
- Node.js test runner with `tsx`

## Local setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). PostgreSQL is exposed locally on port `5438` so it can run alongside the sibling CDMX project.

Useful commands:

```bash
npm test
npm run lint
npm run build
npm run db:down
```

## Coolify deployment

Create a Git-based Docker Compose application with:

- Base directory: `/`
- Compose file: `/docker-compose.coolify.yml`
- Auto Deploy enabled for the deployment branch

Configure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `.env.coolify.example`. Assign the public domain to the `app` service on container port `3000`; do not expose the `database` or `bootstrap` services. The `postgres-data` volume persists the database and should be backed up in production.
