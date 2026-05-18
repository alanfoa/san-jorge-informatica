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

### Objetivo 5: Deploy ✅ (config listo, falta subir)
- [x] Backend: `tsconfig.build.json` creado, `npm run build` + `start:prod` funcionando
- [x] Frontend: build final, `VITE_API_URL` variable de entorno
- [x] `netlify.toml` con build + SPA redirects
- [x] `.env.example` actualizado con CORS_ORIGIN
- [ ] Subir a Render + Netlify

### Objetivo 6: Admin para tu papá (UX no-técnico) ✅
- [x] File upload directo en ProductForm (subir archivo + preview)
- [x] Labels grandes, placeholders claros, todo en español
- [x] Login persistente con "Recordar sesión" checkbox (localStorage/sessionStorage)
- [x] Mobile-friendly (overflow-x-auto en tablas, responsive)
- [x] Toast notifications (componente `<Toast />` reemplaza todos los `alert()`)
- [x] Stock field visible en formulario
- [ ] Probar el flujo completo con él: login → tabla → crear/editar/eliminar

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
- ✅ 9 categorías
- ✅ 16 productos con características técnicas
- ✅ Script `npm run seed` funcionando

---

## 2. Frontend — React 19 + Vite + Tailwind 4 + React Router v7

### 2.1 Base
- ✅ Vite 8 + React 19 + TypeScript 6
- ✅ Tailwind CSS 4 + `@tailwindcss/vite`
- ✅ React Router v7 (rutas: `/`, `/productos`, `/productos/:id`, `/admin/login`, `/admin`, `/admin/categorias`, `/admin/nuevo`, `/admin/editar/:id`)
- ✅ Vite proxy: `/api` → `localhost:3001`
- ✅ `tsc --noEmit` → 0 errores, `vite build` exitoso

### 2.2 Componentes
- ✅ **Navbar**: Logo, links (Inicio, Catálogo, Categorías, Cómo Comprar), menú mobile, smooth scroll al navegar
- ✅ **Footer**
- ✅ **ProductCard**: Card con gradiente, hover effects, badge categoría, botón WhatsApp
- ✅ **ProductForm**: Formulario con campos nombre, descripción, precio, imagen, categoría (select), activo, destacado, stock

### 2.3 Páginas
- ✅ **HomePage**: Hero, categorías destacadas (grid 4), productos destacados, sección "Cómo Comprar"
- ✅ **ProductosPage**: Grid de productos con filtro por categoría (sidebar)
- ✅ **ProductoPage**: Detalle completo con imagen, características grid, productos relacionados
- ✅ **LoginPage**: Formulario email + password, guarda token en localStorage
- ✅ **AdminPage**: Tabla de productos, botones editar/eliminar, cerrar sesión
- ✅ **AdminNewPage / AdminEditPage**: Crear/editar producto con ProductForm

### 2.4 API Client (`src/api/client.ts`)
- ✅ `login()`, `getCategorias()`, `getProductos()`, `getProductosActivos()`, `getProducto()`
- ✅ `createProducto()`, `updateProducto()`, `deleteProducto()` (con token)
- ✅ `createCategoria()`, `updateCategoria()`, `deleteCategoria()` (con token)

### 2.5 Pendientes Frontend
- ✅ **@tanstack/react-query** — instalado y configurado
- ✅ **`hooks/queries.ts`** — creado con hooks tipados:
  - `useProductos()`, `useProducto(id)`, `useCategorias()`
  - `useCreateProducto()`, `useUpdateProducto()`, `useDeleteProducto()`
  - `useLogin()`
  - `useCreateCategoria()`, `useUpdateCategoria()`, `useDeleteCategoria()`
- ✅ **Skeleton loading** — ProductCardSkeleton, DetailSkeleton, TableSkeleton creados con animate-pulse
- ✅ **Loading states** — todas las páginas integran isLoading con skeletons
- ✅ **Admin CRUD para categorías** — AdminCategoriasPage con tabla + modal inline para crear/editar/eliminar
- ✅ **ProductForm** — file upload directo + URL manual + preview de imagen + stock field
- ✅ **Fix: Content-Type en client.ts** — merge de headers corregido, ahora POST/PATCH envía correctamente `Content-Type: application/json`
- ✅ **Fix: @UseGuards en UsersController** — agregado `@UseGuards(JwtAuthGuard, RolesGuard)` a nivel clase
- ✅ **Fix: stock en ProductForm** — `stock` incluido en el submit
- ✅ **Fix: RolesGuard Reflector bug** — `RolesGuard` usaba `Reflector` vía DI (no disponible en ESM), reemplazado por `Reflect.getMetadata` directo. Sin esto POST/PATCH/DELETE daban 500
- ✅ **Toast notifications** — componente `<Toast />` con contexto reemplaza todos los `alert()`
- ✅ **Login persistente** — checkbox "Recordar sesión" (localStorage) o sessionStorage
- ✅ **AdminRoute** — wrapper con `Navigate` que redirige a `/admin/login` si no hay token, protege todas las rutas `admin/*`
- ✅ **UX para usuario no técnico** (tu papá):
  - File upload directo (input file + preview) y URL manual
  - Labels grandes, placeholders claros, todo en español
  - Login persistente con "Recordar sesión"
  - Mobile-friendly (overflow-auto en tablas)
  - Toast en vez de alert()
  - Stock field visible

---

## 3. Backend + Frontend — Integración

### 3.1 Estado actual
- ✅ Backend corriendo en `:3001`, todos los endpoints responden
- ✅ Login funciona (testeado con curl)
- ✅ Categorías (9) y Productos (16) se sirven correctamente
- ✅ Frontend compila y build sin errores

### 3.2 Pendiente
- ✅ Frontend conectado al backend mediante React Query (fetch automático y caché)
- ❌ End-to-end testing completo

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
| Deploy | ████████░░ 80% (config listo, falta subir) |
| **Total** | **~92%** |

---

> _Última actualización: 18/05/2026 — +FileUpload+Stock+Preview ProductForm, +Toast system, +Login persistente, +Smooth scroll CSS, +tsconfig.build.json+start:prod, +netlify.toml, +VITE_API_URL, +NotFoundPage, +Galería imágenes ProductoPage, +Admin filtrar por categoría, +.env.example, +Circular deps entities fix ESM_
