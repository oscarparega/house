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

En otra terminal inicia el procesador de importaciones:

```bash
npm run worker:imports
```

Open [http://localhost:3000](http://localhost:3000). PostgreSQL is exposed locally on port `5438` so it can run alongside the sibling CDMX project.

Useful commands:

```bash
npm test
npm run lint
npm run build
npm run db:down
```

`db:setup` crea la base, aplica las migraciones y carga de forma idempotente las
propiedades de ejemplo de RE/MAX y Pulppo.

## Agregar propiedades

La acción **Agregar** ofrece dos flujos:

- **Desde una URL:** crea un trabajo asíncrono, intenta leer HTML, JSON-LD,
  Open Graph y estado embebido, usa Firecrawl si el portal bloquea la descarga
  directa y finalmente puede normalizar el resultado con OpenAI. El resultado
  siempre queda como borrador para revisión.
- **Captura manual:** muestra todos los campos del modelo. Las fotografías son
  URLs opcionales, una por línea; esta versión no sube archivos.

Los endpoints públicos son:

- `POST /api/imports` con `{ "url": "…", "turnstileToken": "…" }`.
- `GET /api/imports/:id` para consultar el avance y el borrador resultante.
- Las capturas manuales y la revisión usan Server Actions validadas.

El importador nunca entrega herramientas de navegación al modelo. El contenido
de la página se trata como datos no confiables y la respuesta se limita al
contrato de `PropertyInput` mediante Structured Outputs.

En producción configura Turnstile y un secreto de hash. Firecrawl y OpenAI son
opcionales: sin sus llaves, las páginas que exponen metadatos tradicionales aún
se pueden importar. Los límites predeterminados son 500 créditos de Firecrawl y
100 llamadas de IA por mes; pueden cambiarse mediante variables de entorno.

> La lectura y los controles siguen siendo públicos por decisión de producto.
> Turnstile, límites por IP y presupuestos reducen abuso automatizado, pero no
> impiden que una persona modifique información. Agrega autenticación si el
> despliegue deja de ser un tracker personal.

## Coolify deployment

Create a Git-based Docker Compose application with:

- Base directory: `/`
- Compose file: `/docker-compose.coolify.yml`
- Auto Deploy enabled for the deployment branch

Configure las variables de `.env.coolify.example`. `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
se pasa durante el build; las demás llaves permanecen únicamente en el servidor.
Asigna el dominio público al servicio `app` en el puerto `3000`; no expongas
`database`, `bootstrap` ni `import-worker`. El volumen `postgres-data` debe tener
respaldos periódicos.
