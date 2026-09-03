# Casa Clara

Aplicación local para guardar, ubicar y comparar las propiedades que te
interesan. La pantalla principal combina una lista editable con un mapa y un
flujo personal de decisión.

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

`db:setup` crea la base, aplica las migraciones y carga de forma idempotente la
propiedad de ejemplo de RE/MAX.

## API para modelos

Un modelo con control remoto del navegador debe inspeccionar la publicación y
enviar los datos ya estructurados a `POST /api/properties`. El servidor no
intenta descargar ni extraer la página original.

El contrato requiere `schemaVersion: 1` y cuatro bloques: `source`, `property`,
`images`, `features` y `contact`. La forma canónica y un ejemplo completo están
en [`src/lib/remax-seed.ts`](src/lib/remax-seed.ts). Los campos desconocidos o
específicos del portal deben preservarse en `source.rawMetadata`.

```bash
curl -X POST http://localhost:3000/api/properties \
  -H 'content-type: application/json' \
  --data @property.json
```

La primera solicitud responde `201` y las siguientes para la misma URL o ID de
portal responden `200`. Una actualización reemplaza los datos de la publicación
pero conserva estado, favoritos, calificación, notas y visita.

> La API no tiene autenticación porque esta primera versión es exclusivamente
> local. No expongas el servicio a internet antes de agregar control de acceso.

## Coolify deployment

Create a Git-based Docker Compose application with:

- Base directory: `/`
- Compose file: `/docker-compose.coolify.yml`
- Auto Deploy enabled for the deployment branch

Configure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `.env.coolify.example`. Assign the public domain to the `app` service on container port `3000`; do not expose the `database` or `bootstrap` services. The `postgres-data` volume persists the database and should be backed up in production.
