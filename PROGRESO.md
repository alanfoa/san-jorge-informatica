# Progreso — San Jorge Informática v2.0

> Plan original en `PLAN.md`

## Leyenda
✅ Completado — ⬜ No empezado — 🔧 En progreso

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

### Objetivo 5: Deploy ✅
- [x] Backend: `tsconfig.build.json` creado, `npm run build` + `start:prod` funcionando
- [x] Frontend: build final, `VITE_API_URL` variable de entorno
- [x] `netlify.toml` con build + SPA redirects + headers de seguridad
- [x] `.env.example` actualizado con CORS_ORIGIN
- [x] `render.yaml` para deploy automático en Render
- [x] `DEPLOY.md` con guía paso a paso
- [ ] Subir a Render + Netlify (config lista, seguir DEPLOY.md)

### Objetivo 6: Admin para tu papá (UX no-técnico) ✅
- [x] File upload directo en ProductForm (subir archivo + preview)
- [x] Labels grandes, placeholders claros, todo en español
- [x] Login persistente con "Recordar sesión" checkbox (localStorage/sessionStorage)
- [x] Mobile-friendly (overflow-x-auto en tablas, responsive)
- [x] Toast notifications (componente `<Toast />` reemplaza todos los `alert()`)
- [x] Stock field visible en formulario
- [x] E2E testing: login → crear/editar/eliminar producto → crear/editar/eliminar categoría

### Extras si sobra tiempo ⬜ (en progreso)
- [x] Scroll suave vía CSS (`scroll-behavior: smooth`)
- [x] `.env.example` actualizado
- [ ] End-to-end testing
- [x] Custom 404 page
- [x] Galería de imágenes en ProductoPage
- [x] Admin: filtrar productos por categoría

---

## ESTADO ACTUAL DETALLADO

## 1. Backend — Stack Profesional NestJS + TypeORM

### 1.1 Core
- ✅ NestJS 11 + TypeScript configurado
- ✅ TypeORM con sql.js (SQLite embebido, sin compilación nativa)
- ✅ Módulo `ConfigModule` con `.env` (JWT_SECRET, PORT)
- ✅ Módulo `MulterModule` (subida de imágenes con validación)
- ✅ `/api` prefix global, CORS, ValidationPipe
- ✅ tsx watch funcionando con `@Inject()` explícitos para compatibilidad esbuild
- ❌ `build` script con `tsc` → `dist/main.js` no probado (requiere sacar `noEmit` o crear `tsconfig.build.json`)
- ❌ `start:prod` no testeado

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
- ✅ Testeado: `POST /api/auth/login` devuelve `access_token` + `user`
- ✅ **`GET /auth/perfil`** — endpoint implementado con JwtAuthGuard + CurrentUser

### 1.4 CRUDs
- ✅ **Users**: POST/GET/GET:id/PATCH:id/DELETE:id (solo admin)
- ✅ **Categorías**: GET/GET:id/POST/PATCH:id/DELETE:id (POST/PATCH/DELETE solo admin)
- ✅ **Productos**: GET con filtros (categoriaId, activo, destacado, search/LIKE) + GET/id + POST + PATCH/id + DELETE/id
- ✅ **Upload**: POST /upload con Multer (file size/type validation)

### 1.5 Seed
- ✅ 2 usuarios: admin@sanjorge.com / admin123 (admin), editor@sanjorge.com / editor123 (editor)
- ✅ 9 categorías base (seed manual)
- ✅ 16 productos con características técnicas (seed manual)
- ✅ Script `npm run seed` funcionando
- ✅ **+939 productos +65 categorías desde Invid (`npm run sync`)**

### 3.1 Estado actual
- ✅ Backend corriendo en `:3001`, todos los endpoints responden
- ✅ Login funciona (testeado con curl)
- ✅ **955 productos** (16 seed + 939 Invid) y **74 categorías** (9 + 65)
- ✅ Frontend compila y build sin errores

### 3.2 Pendiente
- ✅ Frontend conectado al backend mediante React Query (fetch automático y caché)
- ✅ End-to-end testing completo (13 tests, todos OK)

---

## 4. Deploy

- ✅ **Backend build**: `tsconfig.build.json` + `tsc -p tsconfig.build.json` → `dist/`, `start:prod` probado y funcionando
- ✅ **Frontend build**: `npm run build` → `dist/`, variable `VITE_API_URL` para producción
- ✅ **netlify.toml**: build command + SPA redirects configurado
- ✅ **ServeStaticModule**: backend sirve `uploads/` como `/uploads/` en producción
- ✅ **CORS**: configurable via `CORS_ORIGIN` env var
- ✅ **.env.example**: actualizado con JWT_SECRET, PORT, CORS_ORIGIN
- ❌ **Render (Backend)**: No subido aún
- ❌ **Netlify (Frontend)**: No subido aún

---

## 5. Catálogo Invid Computers

### 5.1 Scraper (`scripts/scraper.py`)
- ✅ Scraper Python extrae productos de invidcomputers.com
- ✅ Parsea sitemap.xml → 108 categorías → 1462 URLs
- ✅ Extrae nombre, imagen, SKU, categoría, URL origen
- ✅ Paginación automática (20 productos/página)
- ✅ Deduplicación por nombre
- ✅ Rate limit 1s entre requests
- ✅ Output: `backend/seeds/seed-invid.json` (939 productos, 72 categorías)

### 5.2 Import Script (`backend/src/seeds/import-invid.ts`)
- ✅ Lee `seed-invid.json` → importa a TypeORM
- ✅ Crea categorías nuevas (mapeo de slugs)
- ✅ Upsert productos (no duplica existentes)
- ✅ Agrega características: SKU + URL Invid
- ✅ Agrega ProductoImagen para cada producto
- ✅ Script `npm run sync` funcionando
- ✅ **Resultado: 955 productos totales, 74 categorías**

### 5.3 Flujo completo
```bash
# Scrapear catálogo
python3 scripts/scraper.py

# Importar a BD
cd backend && npm run sync

# Levantar
npm run start:prod
```

---

## Resumen Visual

| Área | Completado |
|------|-----------|
| Backend Core | █████████░ 90% |
| Auth | ██████████ 100% |
| CRUDs | ██████████ 100% |
| Seed | ██████████ 100% |
| Frontend Páginas | ██████████ 100% |
| Admin UX (no-técnico) | ██████████ 100% |
| React Query | ██████████ 100% |
| Skeleton/Loading | ██████████ 100% |
| Admin Categorías | ██████████ 100% |
| Galería + 404 + extras | ██████████ 100% |
| Deploy | █████████░ 90% (config + docs listos, falta subir) |
| E2E Testing | ██████████ 100% |
| Catálogo Invid | ██████████ 100% (scraper + import funcionando) |
| GitHub Action sync | ████░░░░░░ 40% (pendiente crear workflow) |
| **Total** | **~96%** |

---

> _Última actualización: 18/05/2026 — +Scraper Invid (939 productos extraídos), +Import script a TypeORM, +955 productos totales en BD, +74 categorías, +npm run sync, +plan_database.md actualizado, seed.ts fix entity glob_
