# Progreso — San Jorge Informática v2.0

> Documentación de referencia en `DOCS.md`

## Leyenda
✅ Completado — ⬜ No empezado — 🔧 En progreso — 👤 **Requiere acción manual del usuario**

---

## 🎯 OBJETIVOS DOMINGO 18/05 — META: 100% FUNCIONAL + DEPLOY

### Objetivo 1: React Query ✅
- [x] Instalar `@tanstack/react-query`
- [x] Crear `frontend/src/hooks/queries.ts` con hooks tipados
- [x] Reemplazar todo `useEffect` + `useState` crudo por hooks React Query en cada página

### Objetivo 2: Skeleton + Loading States ✅
- [x] Crear `ProductCardSkeleton.tsx` (animate-pulse)
- [x] Crear `DetailSkeleton.tsx` (para ProductoPage)
- [x] Crear `TableSkeleton.tsx` (para AdminPage)
- [x] Integrar `isLoading` / `isFetching` en todas las páginas

### Objetivo 3: Admin Categorías ✅
- [x] Crear página `AdminCategoriasPage.tsx` (tabla + CRUD modal)
- [x] Agregar ruta `/admin/categorias` en App.tsx
- [x] Agregar link en AdminPage

### Objetivo 4: Backend — Perfil + Upload ✅
- [x] Implementar `GET /auth/perfil` + CurrentUser decorator
- [x] File upload en ProductForm (input file + endpoint /upload)
- [x] ServeStaticModule para servir uploads/ en producción

### Objetivo 5: Deploy ⬜ — Configuración lista, **falta subir** 👤
- [x] Backend: `tsconfig.build.json` creado, `npm run build` + `start:prod` funcionando
- [x] Frontend: build final, `VITE_API_URL` variable de entorno
- [x] `netlify.toml` con build + SPA redirects + headers de seguridad
- [x] `.env.example` actualizado con CORS_ORIGIN
- [x] `render.yaml` para deploy automático en Render
- [x] `DOCS.md` con guía de deploy + documentación
- [ ] 👤 **Crear cuenta en Render y subir backend** (seguir `DOCS.md`)
- [ ] 👤 **Crear cuenta en Netlify y subir frontend** (seguir `DOCS.md`)
- [ ] 👤 **Configurar CORS_ORIGIN en Render** con URL de Netlify

### Objetivo 6: Admin para tu papá (UX no-técnico) ✅
- [x] File upload directo en ProductForm (subir archivo + preview)
- [x] Labels grandes, placeholders claros, todo en español
- [x] Login persistente con "Recordar sesión" checkbox (localStorage/sessionStorage)
- [x] Mobile-friendly (overflow-x-auto en tablas, responsive)
- [x] Toast notifications (componente `<Toast />` reemplaza todos los `alert()`)
- [x] Stock field visible en formulario
- [x] E2E testing: login → crear/editar/eliminar producto → crear/editar/eliminar categoría

### Extras
- [x] Scroll suave vía CSS (`scroll-behavior: smooth`)
- [x] Favicon SVG con logo SJ (gradiente cyan-to-purple)
- [x] Custom 404 page
- [x] Galería de imágenes en ProductoPage
- [x] Admin: filtrar productos por categoría
- [x] End-to-end testing (13/13 tests OK)

---

## ⚠️ PENDIENTES — Tareas que quedan por hacer

### A) Deploy (requiere cuentas externas) 👤

**1. Backend en Render (gratis)**
- [ ] 👤 Crear cuenta en https://render.com
- [ ] 👤 Conectar repo `alanfoa/san-jorge-informatica`
- [ ] 👤 Configurar servicio con `render.yaml` (o manual)
- [ ] 👤 Setear env vars: `JWT_SECRET` (generar random), `CORS_ORIGIN` (URL de Netlify)
- [ ] 👤 Verificar que `npm run sync` corre en cada deploy

**2. Frontend en Netlify (gratis)**
- [ ] 👤 Ir a https://app.netlify.com → New site → Import repo
- [ ] 👤 Configurar env var: `VITE_API_URL` = URL de Render + `/api`
- [ ] 👤 Deployar y verificar que carga el catálogo

**3. Conectar ambos**
- [ ] 👤 Actualizar `CORS_ORIGIN` en Render con la URL final de Netlify
- [ ] 👤 Probar login, catálogo, y admin panel en producción

### B) Sincronización automática de catálogo

**GitHub Action (sync diario)**
- [ ] Crear `.github/workflows/sync-catalog.yml`
- [ ] Configurar secret `PYTHON` o usar `actions/setup-python`
- [ ] Probar ejecución manual (`workflow_dispatch`)
- [ ] Verificar que Render redeploya tras push del scraper

### C) Migración a PostgreSQL (persistencia de datos) 🔧

**Problema:** Render free tier tiene disco efímero. Cada deploy destruye `data.db` (SQLite). Los cambios hechos desde admin (precios, stock, activar/desactivar) se pierden.

**Solución:** Migrar a PostgreSQL en Supabase (free tier). Los datos viven fuera de Render, sobreviven cualquier deploy.

**Prerequisito:** 👤 Crear cuenta en [supabase.com](https://supabase.com) → New project → copiar Connection string

**Archivos a modificar:**
- `backend/package.json` — agregar `pg`, eliminar `sql.js`
- `backend/src/app.module.ts` — TypeORM condicional (PG en prod, SQLite en dev)
- `backend/src/database/data-source.ts` — Ídem
- `backend/src/seeds/seed.ts` — DataSource dinámico
- `backend/src/seeds/import-invid.ts` — Sync no destructivo + soporte PG
- `backend/src/seeds/add-users.ts` — Reescribir con TypeORM (hoy usa sql.js nativo)
- `backend/scripts/seed.ts` — Eliminar (legacy sql.js sin TypeORM)
- `backend/src/modules/productos/productos.service.ts` — `Like` → `ILike`
- `render.yaml` — Sacar sync del startCommand, agregar `DATABASE_URL`
- `.env.example` — Agregar `DATABASE_URL`

**Detalles en:** `DOCS.md` sección "PENDIENTE — Migración a PostgreSQL"

### D) Mercado Pago — Pendiente 👤

La lógica ya está implementada:
- **Backend**: `POST /mercadopago/create-preference` en `backend/src/modules/mercadopago/`
- **Frontend**: Botón "Pagar con Mercado Pago" en CartPage (visible solo si hay items con precio)

**Lo que falta:**
1. 👤 Obtener `MERCADOPAGO_ACCESS_TOKEN` de producción desde [Mercado Pago Developers](https://developers.mercadopago.com)
2. 👤 Agregar `MERCADOPAGO_ACCESS_TOKEN` al `.env` del backend
3. 👤 En producción: agregar la misma variable en Render Dashboard → Environment Variables
4. [ ] Probar el flujo completo en producción

**Detalles en:** `DOCS.md` sección "PENDIENTE — Mercado Pago"

### E) Migrar upload a Cloudinary 👤

Las imágenes se guardan en `backend/uploads/` (efímero en Render free). CloudinaryModule ya está importado, falta conectar el endpoint `/upload` a Cloudinary en vez de disco local.
- [ ] 👤 Conectar endpoint `/upload` a Cloudinary (ya hay módulo configurado)

### F) Mejoras opcionales del catálogo

- [ ] Agregar campo `precio` a los productos de Invid (actualmente todos "Consultar")
- [ ] Agregar `descripción` completa (scrapeada de la página de detalle del producto)
- [ ] Página de categorías real (`/#categorias` ahora hace scroll en Home)
- [ ] Paginación en la lista de productos (939 productos en una sola página es pesado)
- [ ] Ordenar productos por nombre/precio en el frontend
- [ ] Agregar búsqueda por SKU

### G) Seguridad

- [x] Rate limiting en `/auth/login` (5 requests/minuto vía `@nestjs/throttler`)
- [ ] 👤 Cambiar `JWT_SECRET` actual (`sanjorge-secret-cambiar-en-produccion`) por uno seguro
- [ ] 👤 Cambiar passwords de admin/editor antes de deployar

---

## ESTADO ACTUAL DETALLADO

## 1. Backend — Stack Profesional NestJS + TypeORM

### 1.1 Core
- ✅ NestJS 11 + TypeScript configurado
- ✅ TypeORM con sql.js (SQLite embebido, sin compilación nativa)
- ✅ Módulo `ConfigModule` con `.env` (JWT_SECRET, PORT, Cloudinary)
- ✅ Módulo `MulterModule` (subida de imágenes con validación)
- ✅ `/api` prefix global, CORS, ValidationPipe
- ✅ tsx watch funcionando con `@Inject()` explícitos para compatibilidad esbuild
- ✅ **Build de producción**: `tsc -p tsconfig.build.json` → `dist/` + `start:prod` funcionando
- ✅ **emitDecoratorMetadata** agregado a `tsconfig.build.json` (requerido por TypeORM)
- ✅ **Circular dependencies ESM** fixeados (entidades consolidadas + string refs)
- ✅ **CloudinaryModule** configurado e importado en AppModule (pendiente migrar endpoint /upload)
- ✅ **ThrottlerModule** configurado con límite global (10 req/min)
- ✅ **SKU** agregado a entidad Producto + DTOs + búsqueda por query param

### 1.2 Entidades (5 con relaciones)
- ✅ **User**: id, nombre, email (unique), password (bcrypt), rol (admin/editor), activo, created_at, updated_at
- ✅ **Categoria**: id, nombre, slug (unique), descripcion, imagen, created_at, updated_at
- ✅ **Producto**: id, nombre, descripcion, precio, imagen, activo, destacado, stock, categoriaId (FK), timestamps
- ✅ **ProductoImagen**: id, url, orden, productoId (FK)
- ✅ **Caracteristica**: id, nombre, valor, productoId (FK)
- ✅ Relaciones: Categoria 1:N Producto, Producto 1:N ProductoImagen, Producto 1:N Caracteristica

### 1.3 Auth
- ✅ Login con email + password → JWT (bcryptjs + Passport)
- ✅ JwtStrategy con validación de usuario activo
- ✅ JwtAuthGuard + RolesGuard + Roles decorator (`@Roles("admin", "editor")`)
- ✅ `GET /auth/perfil` — endpoint implementado con JwtAuthGuard + CurrentUser
- ✅ Rate limiting en `/auth/login` (5 requests/minuto via `@nestjs/throttler`)

### 1.4 CRUDs
- ✅ **Users**: POST/GET/GET:id/PATCH:id/DELETE:id (solo admin)
- ✅ **Categorías**: GET/GET:id/POST/PATCH:id/DELETE:id (POST/PATCH/DELETE solo admin)
- ✅ **Productos**: GET con filtros (categoriaId, activo, destacado, search/LIKE) + GET/id + POST + PATCH/id + DELETE/id
- ✅ **Upload**: POST /upload con Multer (file size/type validation)

### 1.5 Seed y Catálogo
- ✅ Seed solo crea 1 admin (sin tocar productos/categorías existentes)
- ✅ **Scraper Invid**: 939 productos extraídos de 72 categorías
- ✅ **Import script**: `npm run sync` importa JSON → TypeORM
- ✅ **Setup completo**: `npm run setup` crea admin + importa Invid
- ✅ **BD actual**: 939 productos + 69 categorías + 1 admin (solo datos Invid)

---

## 2. Frontend — React 19 + Vite + Tailwind 4 + React Router v7

### 2.1 Base
- ✅ Vite 8 + React 19 + TypeScript 6
- ✅ Tailwind CSS 4 + `@tailwindcss/vite`
- ✅ React Router v7 (rutas: `/`, `/productos`, `/productos/:id`, `/admin/login`, `/admin`, `/admin/categorias`, `/admin/nuevo`, `/admin/editar/:id`)
- ✅ Vite proxy: `/api` → `localhost:3001`
- ✅ `tsc -b` → 0 errores, `vite build` exitoso (331KB JS gzipped)

### 2.2 Componentes
- ✅ **Navbar**: Logo, links (Inicio, Catálogo, Categorías, Cómo Comprar), menú mobile, smooth scroll
- ✅ **Footer**
- ✅ **ProductCard**: Card con gradiente, hover effects, badge categoría, botón WhatsApp
- ✅ **ProductForm**: Formulario con nombre, descripción, precio, imagen, categoría (select), activo, destacado, stock

### 2.3 Páginas
- ✅ **HomePage**: Hero, categorías destacadas (grid 4), productos destacados, "Cómo Comprar"
- ✅ **ProductosPage**: Grid de productos con filtro por categoría (sidebar)
- ✅ **ProductoPage**: Detalle completo con imagen, características grid, productos relacionados
- ✅ **LoginPage**: Formulario email + password, guarda token en localStorage
- ✅ **AdminPage**: Tabla de productos, botones editar/eliminar, cerrar sesión
- ✅ **AdminNewPage / AdminEditPage**: Crear/editar producto con ProductForm
- ✅ **NotFoundPage**: Custom 404

### 2.4 API Client (`src/api/client.ts`)
- ✅ `login()`, `getCategorias()`, `getProductos()`, `getProductosActivos()`, `getProducto()`
- ✅ `createProducto()`, `updateProducto()`, `deleteProducto()` (con token)
- ✅ `createCategoria()`, `updateCategoria()`, `deleteCategoria()` (con token)
- ✅ `uploadFile()` (multipart/form-data)

### 2.5 State Management
- ✅ **@tanstack/react-query** — configurado con hooks tipados:
  - `useProductos()`, `useProducto(id)`, `useCategorias()`
  - `useCreateProducto()`, `useUpdateProducto()`, `useDeleteProducto()`
  - `useLogin()`, `useCreateCategoria()`, `useUpdateCategoria()`, `useDeleteCategoria()`
- ✅ **Toast notifications** — componente `<Toast />` con contexto
- ✅ **AdminRoute** — wrapper protegido con `Navigate`

---

## 3. Integración Backend + Frontend

### 3.1 Estado actual
- ✅ Backend `:3001` — todos los endpoints responden
- ✅ Login funciona (testeado con curl)
- ✅ 939 productos activos + 69 categorías
- ✅ Frontend build sin errores
- ✅ E2E testing: 13/13 tests OK (CRUD productos, CRUD categorías, auth, proxy)

---

## 4. Deploy

- ✅ `tsconfig.build.json` + `tsc` → `dist/`
- ✅ `start:prod` probado y funcionando
- ✅ Frontend `npm run build` → `dist/`
- ✅ `netlify.toml` raiz con build + SPA redirects + headers de seguridad
- ✅ `ServeStaticModule` para `/uploads/`
- ✅ CORS configurable via `CORS_ORIGIN`
- ✅ `render.yaml` para deploy automático
- ✅ `DOCS.md` con guía de deploy + documentación
- ❌ **Render**: No subido — 👤 requiere cuenta
- ❌ **Netlify**: No subido — 👤 requiere cuenta

---

## 5. Catálogo Invid Computers

### 5.1 Scraper (`scripts/scraper.py`)
- ✅ Parsea sitemap.xml → 108 categorías → ~1462 URLs
- ✅ Extrae: nombre, imagen, SKU, categoría, URL origen
- ✅ Paginación automática (20 productos/página)
- ✅ Deduplicación por nombre
- ✅ Rate limit 1s entre requests
- ✅ Output: `backend/seeds/seed-invid.json` (939 productos, 69 categorías)

### 5.2 Import (`backend/src/seeds/import-invid.ts`)
- ✅ Lee `seed-invid.json` → importa a TypeORM
- ✅ Crea categorías nuevas (mapeo de slugs)
- ✅ Upsert productos (no duplica existentes)
- ✅ Agrega características: SKU + URL Invid
- ✅ Agrega ProductoImagen para cada producto
- ✅ **Resultado: 939 productos, 69 categorías**

### 5.3 Scripts disponibles
```bash
python3 scripts/scraper.py          # Scrapear catálogo de Invid
cd backend && npm run sync          # Importar JSON a la BD
cd backend && npm run seed          # Crear admin (si no existe)
cd backend && npx tsx src/seeds/add-users.ts  # Crear usuarios admin
cd backend && npm run start:prod    # Levantar en producción
cd frontend && npm run dev          # Levantar frontend
```

---

## Resumen Visual

| Área | Completado |
|------|-----------|
| Backend Core | ██████████ 100% |
| Auth | ██████████ 100% |
| CRUDs | ██████████ 100% |
| Seed + Catálogo Invid | ██████████ 100% |
| Cloudinary + Rate Limiting + SKU | ██████████ 100% |
| Frontend Páginas | ██████████ 100% |
| Admin UX (no-técnico) | ██████████ 100% |
| React Query | ██████████ 100% |
| Skeleton/Loading | ██████████ 100% |
| Admin Categorías | ██████████ 100% |
| Galería + 404 + extras | ██████████ 100% |
| E2E Testing | ██████████ 100% |
| Deploy | ████████░░ 80% (config lista, **falta subir**) |
| GitHub Action sync | ██░░░░░░░░ 20% (pendiente) |
| **Total código** | **~98%** |
| **Total proyecto** | **~85%** (incluye deploy pendiente) |

---
## 🔧 Fixes aplicados

### 21/05/2026 — Gabinetes ya no filtra "Fuentes de Alimentación"

**Problema:** En el home, al clickear la card "Gabinetes" (Componentes por Categoría), se marcaban 4 filtros en el catálogo: "Fuentes de Alimentación", "Gabinetes", "Gabinetes con Fuente", "Gabinetes sin Fuente". El primero (Fuentes de Alimentación) no debería aparecer porque no es un gabinete.

**Causa raíz:** La keyword `'gabinete'` en la DESEADAS de Gabinetes también matcheaba la categoría `"Fuentes De Alimentacion Gabinetes Y Fuentes"` porque su nombre contiene "gabinetes". Esto agregaba el slug `fuentes-de-alimentacion-gabinetes-y-fuentes` a la URL del link.

**Fix:** Agregar `slugsParaUrl` a la entrada "Gabinetes" en `DESEADAS` (`HomePage.tsx:131`) con los slugs de gabinetes exclusivamente: `['gabinetes-y-fuentes', 'gabinetes-con-fuente-gabinetes-y-fuentes', 'gabinetes-sin-fuente-gabinetes-y-fuentes']`. Esto sobreescribe los slugs del link sin afectar el conteo de productos ni el set `slugsUsados`.

**Archivos modificados:** `frontend/src/pages/HomePage.tsx` (línea 131), `DOCS.md` (nueva sección "HomePage — Categorías Destacadas").

---

> _Última actualización: 21/05/2026 — Fix Gabinetes slugs + Mercado Pago implementado (falta token) + plan migración PostgreSQL documentado_
