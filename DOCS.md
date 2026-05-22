# San Jorge Informática v2.0 — Documentación

Documentación del proyecto alineada con el código actual del repositorio.

## Índice

1. [Estructura del proyecto](#estructura-del-proyecto)
2. [Stack técnico](#stack-técnico)
3. [Variables de entorno](#variables-de-entorno)
4. [Base de datos](#base-de-datos)
5. [Entidades](#entidades)
6. [API REST](#api-rest)
7. [Autenticación y roles](#autenticación-y-roles)
8. [Upload de imágenes (Cloudinary)](#upload-de-imágenes-cloudinary)
9. [Mercado Pago — Checkout Pro](#mercado-pago--checkout-pro)
10. [Frontend — tienda pública](#frontend--tienda-pública)
11. [Panel de administración](#panel-de-administración)
12. [HomePage — categorías destacadas](#homepage--categorías-destacadas)
13. [Comandos y scripts](#comandos-y-scripts)
14. [Pendiente — PostgreSQL](#pendiente--postgresql)
15. [Convenciones y favicon](#convenciones-y-favicon)
16. [Guía de deploy](#guía-de-deploy)

---

## Estructura del proyecto

```
san-jorge-informatica/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── main.ts             # Bootstrap, CORS, prefijo /api
│   │   ├── app.module.ts
│   │   ├── modules/            # auth, productos, categorias, users, upload, mercadopago, health
│   │   ├── seeds/              # seed.ts, import-invid.ts, add-users.ts
│   │   ├── cloudinary/         # Provider Cloudinary
│   │   └── common/             # guards JWT, roles
│   ├── data.db                 # SQLite (gitignored, generado localmente)
│   ├── uploads/                # Temp multer (gitignored)
│   └── package.json
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── pages/              # Home, catálogo, carrito, admin, pago
│   │   ├── components/
│   │   ├── hooks/              # useCart, useToast, queries
│   │   └── api/client.ts
│   ├── public/favicon.svg
│   └── vite.config.ts          # Proxy /api → localhost:3001
├── scripts/
│   ├── scraper.py              # Genera backend/seeds/seed-invid.json
│   └── fetch-descriptions.js
├── render.yaml                 # Deploy backend en Render
├── netlify.toml                # Deploy frontend en Netlify
├── .env.example                # Plantilla raíz (backend + frontend)
└── DOCS.md
```

**Prefijo API:** todas las rutas del backend están bajo `/api` (`backend/src/main.ts`).

---

## Stack técnico

| Capa | Tecnología | Deploy / notas |
|------|-----------|----------------|
| Backend | NestJS 11 + TypeScript (ESM) | [Render](https://render.com) free tier |
| ORM | TypeORM | — |
| BD | SQLite vía `sql.js` | Archivo `backend/data.db` |
| Auth | JWT + bcryptjs + Passport + guards de roles | Expira en 24h |
| Validación | class-validator + class-transformer | Global en NestJS |
| Pagos | Mercado Pago SDK v3 (Checkout Pro) | Solo Access Token en servidor |
| Imágenes | Cloudinary (upload admin) | Requiere credenciales en `.env` |
| Rate limit | @nestjs/throttler | Login: 5 req/min |
| Frontend | React 19 + Vite 8 + TypeScript | [Netlify](https://netlify.com) |
| Data fetching | @tanstack/react-query | Catálogo y admin |
| Routing | React Router v7 | SPA con fallback |
| Estilos | Tailwind CSS 4 + lucide-react | — |
| Carrito | React Context + `localStorage` | Clave `sanjorge-cart` |
| Contacto | WhatsApp | `5491136075731` (`frontend/src/lib/constants.ts`) |

---

## Variables de entorno

### Backend (`backend/.env`)

Copiar desde `backend/.env.example` o la raíz `.env.example`.

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `JWT_SECRET` | Sí | Firma del JWT |
| `PORT` | No (default `3001`) | Puerto del servidor |
| `CORS_ORIGIN` | Sí en prod | Origen(es) del frontend; también define `back_urls` de Mercado Pago. Sin barra final. Varios orígenes separados por coma. |
| `MERCADOPAGO_ACCESS_TOKEN` | Para pagos | Access Token de Mercado Pago |
| `CLOUDINARY_CLOUD_NAME` | Para upload admin | Cloudinary |
| `CLOUDINARY_API_KEY` | Para upload admin | Cloudinary |
| `CLOUDINARY_API_SECRET` | Para upload admin | Cloudinary |

**Ejemplo local:**
```env
JWT_SECRET=dev-secret-cambiar
PORT=3001
CORS_ORIGIN=http://localhost:5173
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (`frontend/.env` — opcional en dev)

| Variable | Default | Uso |
|----------|---------|-----|
| `VITE_API_URL` | `/api` | Base URL del API. En Netlify suele no hacer falta porque `netlify.toml` hace proxy de `/api` al backend en Render. |

### Render (`render.yaml`)

Variables declaradas en el blueprint:

- `NODE_ENV=production`
- `JWT_SECRET` (generado automáticamente)
- `PORT=10000`
- `CORS_ORIGIN` — configurar manualmente (`sync: false`)
- `MERCADOPAGO_ACCESS_TOKEN` — configurar manualmente (`sync: false`)

**También configurar en el dashboard de Render:** `CLOUDINARY_*` (no están en `render.yaml`).

### Seguridad

- Nunca commitear `backend/.env`, credenciales ni `DATA MERCADO PAGO.txt` (en `.gitignore`).
- Checkout Pro **no** necesita Public Key ni Client Secret en el backend; solo `MERCADOPAGO_ACCESS_TOKEN`.

---

## Base de datos

- **Motor:** SQLite con driver `sql.js`, archivo `backend/data.db`.
- **Producción (Render):** almacenamiento **efímero** — `data.db` se pierde en **cada deploy**.
- **Arranque en Render:** `npm run seed:prod && npm run start:prod` (ya **no** corre `sync:prod` automático; ver `render.yaml`).
- **Sincronización Invid:** manual con `npm run sync` / `sync:prod` — lee `backend/seeds/seed-invid.json`.
- **Sync no destructivo:** el import de Invid **no borra** productos; solo actualiza imagen de ítems Invid con SKU que **no** están marcados `protegido`. Productos sin SKU o con `protegido=true` (creados/editados en admin) no se pisan.
- **Campo `protegido`:** se pone en `true` al crear o editar desde el admin. El sync de Invid lo respeta.
- **Migraciones TypeORM:** sin archivos en `migrations/`; columna `protegido` se agrega vía `ensure-schema.ts` en seed/sync.

### ⚠️ Deploy en Render y datos del admin

**Problema:** aunque el sync ya no sea destructivo, cada deploy **reinicia la BD vacía**. Los productos que tu papá creó o editó **no están** en `seed-invid.json`, así que desaparecen salvo que hagas backup/restore.

**Antes de cada deploy:**

```bash
# 1. Exportar catálogo actual de producción (API pública)
node scripts/export-catalog-from-api.mjs

# Guarda backend/seeds/backup-catalog.json (gitignored)
```

**Después del deploy:**

```bash
# 2. Restaurar en producción (requiere admin)
ADMIN_EMAIL=sanjorgeinf@hotmail.com ADMIN_PASSWORD=... \
  node scripts/restore-catalog-to-api.mjs
```

**Alternativa local:** `npm run backup:export` / `backup:import` contra `data.db` local.

**Endpoint admin:** `POST /api/productos/restore-backup` (JWT admin) con body `{ categorias?, productos }`.

**Solución definitiva:** PostgreSQL (Supabase) — datos fuera de Render. Ver [Pendiente — PostgreSQL](#pendiente--postgresql).

---

## Entidades

```
User (independiente, solo auth)

Categoria 1 ──── N Producto
Producto 1 ──── N ProductoImagen
Producto 1 ──── N Caracteristica
```

### User — tabla `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| nombre | VARCHAR | Nombre completo |
| email | VARCHAR unique | Login |
| password | VARCHAR | Hash bcrypt |
| rol | VARCHAR | `admin` o `editor` (default `editor`) |
| activo | BOOLEAN | Si puede iniciar sesión |
| created_at, updated_at | TIMESTAMP | Automáticos |

### Categoria — tabla `categorias`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| nombre | VARCHAR | Nombre visible |
| slug | VARCHAR unique | URLs y filtros |
| descripcion | TEXT | Opcional |
| imagen | VARCHAR | URL opcional |
| created_at, updated_at | TIMESTAMP | |

### Producto — tabla `productos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | |
| nombre | VARCHAR | |
| descripcion | TEXT | Opcional |
| sku | VARCHAR unique | Opcional; clave para sync Invid |
| precio | DECIMAL(10,2) | ARS; `0` = consultar por WhatsApp |
| imagen | VARCHAR | URL principal |
| activo | BOOLEAN | Visible en catálogo |
| destacado | BOOLEAN | Home (si se usa) |
| stock | INTEGER | |
| protegido | BOOLEAN | `true` = no pisar en sync Invid (admin) |
| categoriaId | INTEGER FK | → Categoria |
| imagenes | OneToMany | ProductoImagen |
| caracteristicas | OneToMany | Caracteristica |
| created_at, updated_at | TIMESTAMP | |

### ProductoImagen — tabla `producto_imagenes`

| Campo | Tipo |
|-------|------|
| id | PK |
| url | VARCHAR |
| orden | INTEGER |
| productoId | FK → Producto |

### Caracteristica — tabla `caracteristicas`

| Campo | Tipo |
|-------|------|
| id | PK |
| nombre | VARCHAR |
| valor | VARCHAR |
| productoId | FK → Producto |

---

## API REST

Todas las rutas llevan prefijo `/api`. Auth: header `Authorization: Bearer <token>`.

### Health

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | — | `{ status: "ok", timestamp }` |

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login → `{ access_token, user }`. Throttle: **5 intentos/minuto** |
| GET | `/auth/perfil` | JWT | Usuario del token |

### Categorías

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categorias` | — | Lista |
| GET | `/categorias/:id` | — | Detalle |
| POST | `/categorias` | admin | Crear |
| PATCH | `/categorias/:id` | admin | Editar |
| DELETE | `/categorias/:id` | admin | Eliminar |

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/productos` | — | Lista con filtros query |
| GET | `/productos/activos` | — | Solo `activo: true` |
| GET | `/productos/:id` | — | Detalle con relaciones |
| POST | `/productos` | admin \| editor | Crear |
| PATCH | `/productos/:id` | admin \| editor | Editar |
| DELETE | `/productos/:id` | admin | Eliminar |
| POST | `/productos/restore-backup` | admin | Restaurar catálogo desde backup JSON |

**Query params en `GET /productos`:**

| Param | Tipo | Ejemplo |
|-------|------|---------|
| `categoriaId` | number | `?categoriaId=3` |
| `activo` | boolean | `?activo=true` |
| `destacado` | boolean | `?destacado=true` |
| `search` | string | Búsqueda por nombre |
| `sku` | string | Filtro por SKU |

### Usuarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users` | admin | Lista |
| GET | `/users/:id` | admin | Detalle |
| POST | `/users` | admin | Crear |
| PATCH | `/users/:id` | admin | Editar |
| DELETE | `/users/:id` | admin | Eliminar |

### Upload

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/upload` | admin \| editor | Multipart campo `file` → `{ url }` (Cloudinary) |

### Mercado Pago

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/mercadopago/status` | — | `{ configured, testMode }` |
| POST | `/mercadopago/create-preference` | — | Crea preferencia Checkout Pro |

Detalle en [Mercado Pago — Checkout Pro](#mercado-pago--checkout-pro).

### Estáticos locales

- `GET /uploads/*` — archivos temporales/legacy servidos desde `backend/uploads/` (el flujo actual de admin usa Cloudinary).

---

## Autenticación y roles

### Flujo

1. `POST /api/auth/login` con `{ email, password }`.
2. El servicio verifica bcrypt, usuario `activo`, y devuelve JWT (24h) con payload `{ sub, email, role }`.
3. Rutas protegidas usan `JwtAuthGuard` + `RolesGuard` según decorador `@Roles()`.

### Roles

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: usuarios, categorías CRUD, borrar productos |
| `editor` | Crear/editar productos, subir imágenes |
| Público | Catálogo, health, Mercado Pago status/preference |

### Frontend (admin)

- Login en `/admin/login`.
- Token en `localStorage` (`admin_token`) si “recordarme”, o `sessionStorage`.
- `AdminRoute` solo verifica que exista token (no valida rol en el cliente).
- React Query en `hooks/queries.ts` para datos del panel.

### Usuario admin por defecto (seed)

Creado por `npm run seed` si no existe:

| Campo | Valor |
|-------|-------|
| Email | `sanjorgeinf@hotmail.com` |
| Password | `Academia01` |
| Rol | `admin` |

El seed **elimina** el usuario legacy `admin@sanjorge.com` si existía.

---

## Upload de imágenes (Cloudinary)

Implementado en `backend/src/modules/upload/upload.controller.ts`.

1. Admin sube imagen en `ProductForm` → `POST /api/upload` con JWT.
2. Multer guarda temporal en `backend/uploads/`.
3. Se sube a Cloudinary carpeta `sanjorge-informatica`.
4. Respuesta: `{ url: "<secure_url>" }` — esa URL se guarda en el producto.
5. Límite: **5 MB**, solo `image/*`.

**Requisito:** las tres variables `CLOUDINARY_*` deben estar configuradas; sin ellas el upload falla.

En Render free tier el directorio `uploads/` local también es efímero; las imágenes persistentes son las URLs de Cloudinary.

---

## Mercado Pago — Checkout Pro

Integración con [Checkout Pro](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing): el cliente paga en Mercado Pago y vuelve al sitio.

**Estado:** implementado. SDK `mercadopago` v3 en `backend/src/modules/mercadopago/`.

### Archivos

| Archivo | Rol |
|---------|-----|
| `mercadopago.controller.ts` | Status y creación de preferencia |
| `mercadopago.module.ts` | Módulo NestJS |
| `dto/create-preference.dto.ts` | Validación del body |
| `frontend/.../CartPage.tsx` | Botón de pago y total |
| `frontend/.../PagoResultadoPage.tsx` | Pantalla post-pago |
| `frontend/src/api/client.ts` | Cliente HTTP |

### Flujo

```
Carrito (localStorage) → items con precio > 0
    → GET /mercadopago/status (¿token configurado?)
    → POST /mercadopago/create-preference
    → Redirección a init_point (Checkout Pro)
    → Usuario paga en MP
    → MP redirige a /pago/resultado?collection_status=...
```

### Credenciales

| Prefijo token | Modo | URL usada |
|---------------|------|-----------|
| `TEST-` | Prueba | `sandbox_init_point` o `init_point` |
| `APP_USR-` | Producción | `init_point` |

### `GET /api/mercadopago/status`

```json
{ "configured": true, "testMode": false }
```

### `POST /api/mercadopago/create-preference`

**Body:**
```json
{
  "items": [
    { "title": "Nombre producto", "quantity": 1, "unit_price": 15000 }
  ],
  "external_reference": "opcional"
}
```

**Validación:** `quantity` ≥ 1, `unit_price` ≥ 0.01. Títulos truncados a 256 caracteres. Moneda `ARS`. Descriptor en resumen: `SAN JORGE INF`.

**Respuesta:**
```json
{
  "id": "pref-id",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "test_mode": false
}
```

**Retorno (`back_urls`):** `{CORS_ORIGIN}/pago/resultado` para success, failure y pending.

**`auto_return: "approved"`:** solo si `CORS_ORIGIN` empieza con `https://`. En localhost (`http://`) MP lo rechaza; el usuario vuelve manualmente desde MP.

### Frontend

- Botón **“Pagar con Mercado Pago”** en `/carrito` solo si `configured === true` y hay ítems con `precio > 0`.
- Muestra **Total a pagar** cuando aplica MP.
- Errores con **toast** (`useToast`), no `alert()`.
- WhatsApp disponible siempre para consultas (`WHATSAPP` en constants).

### `/pago/resultado`

Lee `collection_status` o `status` de la query:

| Valor | Pantalla |
|-------|----------|
| `approved` | Pago aprobado |
| `pending`, `in_process` | Pago pendiente |
| `rejected`, `failure` | Pago no realizado + link al carrito |
| otro | Mensaje genérico |

### Limitaciones actuales

- No hay tabla de **pedidos** en la BD.
- No hay **webhooks** (`notification_url`).
- El carrito no se guarda en el servidor; MP recibe solo los ítems enviados por el frontend.
- Productos sin precio (`precio === 0`) no entran a la preferencia; se consultan por WhatsApp.

### Pruebas

```bash
curl http://localhost:3001/api/mercadopago/status

curl -X POST http://localhost:3001/api/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{"items":[{"title":"Test","quantity":1,"unit_price":100}]}'
```

### Checklist Mercado Pago

- [ ] `MERCADOPAGO_ACCESS_TOKEN` en `backend/.env` y Render
- [ ] `CORS_ORIGIN` = URL Netlify (HTTPS, sin barra final)
- [ ] `GET /api/mercadopago/status` → `configured: true`
- [ ] Productos con precio > 0 en admin
- [ ] Pago de prueba y retorno a `/pago/resultado`

---

## Frontend — tienda pública

### Rutas (`frontend/src/App.tsx`)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | `HomePage` | Inicio, categorías destacadas |
| `/productos` | `ProductosPage` | Catálogo con filtros |
| `/productos/:id` | `ProductoPage` | Detalle, agregar al carrito |
| `/carrito` | `CartPage` | Carrito, WhatsApp, Mercado Pago |
| `/pago/resultado` | `PagoResultadoPage` | Retorno desde MP |
| `/admin/login` | `LoginPage` | Login admin |
| `/admin` | `AdminPage` | Lista de productos |
| `/admin/categorias` | `AdminCategoriasPage` | CRUD categorías |
| `/admin/nuevo` | `AdminNewPage` | Crear producto |
| `/admin/editar/:id` | `AdminEditPage` | Editar producto |
| `*` | `NotFoundPage` | 404 |

Layout global: `Navbar`, `Footer`, `ScrollToTop`. `ToastProvider` en el root de la app.

### Componentes principales

| Componente | Uso |
|------------|-----|
| `ProductCard` | Tarjeta en grilla; precio si `> 0` |
| `Navbar` | Links + ícono carrito → `/carrito` |
| `ProductForm` | Formulario admin (precio, imagen, categoría, etc.) |

### Carrito (`useCart`)

- Persistencia: `localStorage` clave `sanjorge-cart`.
- Métodos: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
- No requiere login.

### Precios y WhatsApp

- `precio > 0`: se muestra en catálogo y puede pagarse con MP.
- `precio === 0` (o sin precio): en detalle se ofrece **“Consultar precio por WhatsApp”** con mensaje armado.

### Desarrollo local

```bash
cd backend && npm run start:dev   # :3001
cd frontend && npm run dev        # :5173, proxy /api → backend
```

`vite.config.ts` proxy:
```ts
proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
```

---

## Panel de administración

Flujo para usuario no técnico:

1. **Login** → `/admin/login`
2. **Dashboard** → `/admin` (tabla: ID, nombre, categoría, precio, activo)
3. **Nuevo** → `/admin/nuevo` — nombre, descripción, precio, categoría, imagen (archivo o URL), activo, destacado
4. **Editar** → `/admin/editar/:id`
5. **Eliminar** → confirmación en lista
6. **Categorías** → `/admin/categorias`

**UX:** labels en español, upload desde celular/PC, login persistente, mobile-friendly, toasts (no `alert()` en flujos nuevos).

---

## HomePage — categorías destacadas

El home renderiza un grid de 8 categorías en `HomePage.tsx` usando el array `DESEADAS`.

### Mecanismo

1. **`catMap`:** agrupa productos activos por `categoria.slug` y cuenta por categoría.
2. **`DESEADAS`:** define las 8 categorías del home. Cada entrada tiene:
   - `nombre`: texto en la card
   - `keywords`: matcheo contra `categoria.nombre` (case-insensitive, `.includes()`)
   - `slugsParaUrl?`: opcional; si está presente, **sobrescribe** los slugs del link de la card
3. **`slugsUsados`:** evita duplicados en el relleno.
4. **`restantes`:** si alguna DESEADAS no matchea, se rellena con categorías populares hasta 8 cards.

### slugsParaUrl

Usar cuando los `keywords` matchean categorías incorrectas por substring:

- **Fuentes:** `slugsParaUrl: ['fuentes-de-alimentacion-gabinetes-y-fuentes']`
- **Gabinetes:** `slugsParaUrl: ['gabinetes-y-fuentes', 'gabinetes-con-fuente-gabinetes-y-fuentes', 'gabinetes-sin-fuente-gabinetes-y-fuentes']`

### Clean Names

`CLEAN_NAMES` mapea nombres largos de Invid a nombres de display. Se usa en `HomePage` y `ProductosPage`.

---

## Comandos y scripts

### Backend (`backend/package.json`)

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con `tsx watch` |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | `node dist/main.js` |
| `npm run seed` | Crea admin si no existe |
| `npm run seed:prod` | Seed en producción (compilado) |
| `npm run sync` | Import Invid (no destructivo) |
| `npm run sync:prod` | Sync compilado (manual en Render) |
| `npm run backup:export` | Backup local → `seeds/backup-catalog.json` |
| `npm run backup:import` | Restaurar backup local |
| `npm run setup` | `seed` + `sync` (primera vez local) |

**Scripts raíz:**

| Script | Descripción |
|--------|-------------|
| `node scripts/export-catalog-from-api.mjs` | Backup desde API de producción |
| `node scripts/restore-catalog-to-api.mjs` | Restaurar backup en producción (admin) |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Vite dev server :5173 |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Preview del build |

### Scripts externos (raíz `scripts/`)

| Script | Descripción |
|--------|-------------|
| `python3 scripts/scraper.py` | Scrapea Invid → `backend/seeds/seed-invid.json` |
| `node scripts/fetch-descriptions.js` | Enriquece descripciones en el JSON |
| `npx tsx backend/src/seeds/add-users.ts` | Crea admin/editor por sql.js directo si la tabla está vacía |

### Primera vez (desarrollo)

```bash
# 1. Generar catálogo (opcional si ya tenés seed-invid.json)
python3 scripts/scraper.py

# 2. BD + admin + importación
cd backend && npm run setup

# 3. Levantar
cd backend && npm run start:dev
cd frontend && npm run dev
```

---

## PostgreSQL (Supabase)

### Implementado

Con `DATABASE_URL` definido → PostgreSQL. Sin ella → SQLite local (`data.db`).

Guía para crear cuenta y pegar la URL: **`SUPABASE.md`**.

| Entorno | Persiste al deployar |
|---------|----------------------|
| Render + `DATABASE_URL` | Sí (datos en Supabase) |
| Render sin `DATABASE_URL` | No (SQLite efímero) |
| Local sin `DATABASE_URL` | Sí (`data.db` en disco) |

Archivos: `backend/src/database/typeorm.config.ts`, `create-data-source.ts`, `render.yaml` (`DATABASE_URL`).

---

## Convenciones y favicon

- Imports frontend con alias `@/` → `frontend/src/`.
- Componentes funcionales + TypeScript.
- Tras cambios en frontend: `cd frontend && npm run build`.
- Comentarios en código solo cuando aporten lógica no obvia.

**Favicon:** `frontend/public/favicon.svg` — gradiente cyan (#06b6d4) a purple (#9333ea), texto “SJ”. Referenciado en `frontend/index.html`.

---

# Guía de deploy

## Backend — Render

### Opción A: Blueprint (`render.yaml`)

1. Push a GitHub.
2. Render Dashboard → **New** → **Blueprint** → conectar repo.
3. Configurar manualmente en el servicio:
   - `CORS_ORIGIN` = URL de Netlify (ej. `https://san-jorge.netlify.app`)
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Comandos del blueprint:**
- Build: `cd backend && npm install --include=dev && npm run build`
- Start: `cd backend && npm run seed:prod && npm run start:prod` (**sin** sync automático)

> **Importante:** tras cada deploy la BD queda casi vacía (solo admin). Hacé [backup/restore](#-deploy-en-render-y-datos-del-admin) o corré `sync:prod` a mano en Render Shell si solo querés repoblar Invid.

### Opción B: Manual

- Root Directory: `backend`
- Build: `npm install && npm run build`
- Start: `npm run seed:prod && npm run start:prod`
- Env vars: `NODE_ENV`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `MERCADOPAGO_ACCESS_TOKEN`, `CLOUDINARY_*`

### Notas Render free tier

- `data.db` efímero — se recrea con seed/sync en cada deploy.
- **Spin down** tras ~15 min inactividad; primera request ~50s.
- Imágenes en Cloudinary persisten; `uploads/` local no.

## Frontend — Netlify

### Desde GitHub (recomendado)

`netlify.toml` ya define build y publish:

- Build: `cd frontend && npm install && npm run build`
- Publish: `frontend/dist`
- Proxy: `/api/*` → `https://san-jorge-informatica.onrender.com/api/:splat`
- SPA: `/*` → `/index.html`

Variable opcional: `VITE_API_URL` si no usás el proxy (en la config actual el proxy basta).

### Después del deploy

1. Copiar URL de Netlify.
2. En Render → `CORS_ORIGIN` = esa URL (HTTPS).
3. Redeploy backend.

## Verificación post-deploy

```bash
# Health
curl https://san-jorge-informatica.onrender.com/api/health

# Catálogo
curl https://san-jorge-informatica.onrender.com/api/categorias

# Mercado Pago
curl https://san-jorge-informatica.onrender.com/api/mercadopago/status

# Login admin
curl -X POST https://san-jorge-informatica.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sanjorgeinf@hotmail.com","password":"Academia01"}'
```

### Checklist de deploy

- [ ] Backend en Render con env vars completas
- [ ] Frontend en Netlify
- [ ] `CORS_ORIGIN` en Render = URL Netlify (HTTPS)
- [ ] `seed-invid.json` disponible si se usa `sync:prod`
- [ ] Login admin en producción
- [ ] Catálogo y admin funcionan
- [ ] Upload a Cloudinary (credenciales en Render)
- [ ] Mercado Pago: [checklist](#checklist-mercado-pago)
- [ ] WhatsApp y carrito en el sitio publicado
