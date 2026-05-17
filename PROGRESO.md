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

### Objetivo 2: Skeleton + Loading States ⬜
- [ ] Crear `ProductCardSkeleton.tsx` (animate-pulse)
- [ ] Crear `DetailSkeleton.tsx` (para ProductoPage)
- [ ] Crear `TableSkeleton.tsx` (para AdminPage)
- [ ] Integrar `isLoading` / `isFetching` en todas las páginas

### Objetivo 3: Admin Categorías ⬜
- [ ] Crear página `AdminCategoriasPage.tsx` (tabla + CRUD)
- [ ] Agregar ruta `/admin/categorias` en App.tsx
- [ ] Agregar link en AdminPage

### Objetivo 4: Backend — Perfil + Upload ⬜
- [ ] Implementar `GET /auth/perfil` + CurrentUser decorator
- [ ] Conectar file upload en ProductForm (usar endpoint `/upload`)

### Objetivo 5: Deploy ⬜
- [ ] Backend: crear `tsconfig.build.json`, probar `npm run build` + `start:prod`
- [ ] Frontend: build final, ajustar variables de entorno
- [ ] Subir a Render + Netlify

### Objetivo 6: Admin para tu papá (UX no-técnico) ⬜
- [ ] File upload directo en ProductForm (seleccionar imagen del celular/PC)
- [ ] Labels grandes, placeholders claros, todo en español
- [ ] Login persistente (que no pida contraseña cada vez)
- [ ] Mobile-friendly (que funcione bien desde el celular)
- [ ] Toast notifications en vez de `alert()` para feedback claro
- [ ] Probar el flujo completo con él: login → tabla → crear/editar/eliminar

### Extras si sobra tiempo ⬜
- [ ] Scroll suave en anchor links (`/#categorias`, `/#como-comprar`)
- [ ] `.env.example`
- [ ] End-to-end testing

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
- ❌ **`GET /auth/perfil`** — endpoint listado en PLAN pero no implementado

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
- ✅ React Router v7 (rutas: `/`, `/productos`, `/productos/:id`, `/admin/login`, `/admin`, `/admin/nuevo`, `/admin/editar/:id`)
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

### 2.5 Pendientes Frontend
- ✅ **@tanstack/react-query** — instalado y configurado
- ✅ **`hooks/queries.ts`** — creado con hooks tipados:
  - `useProductos()`, `useProducto(id)`, `useCategorias()`
  - `useCreateProducto()`, `useUpdateProducto()`, `useDeleteProducto()`
  - `useLogin()`
- ❌ **Skeleton loading** — no hay componentes de carga (skeleton cards, detail skeleton, table skeleton)
- ❌ **Loading states** — páginas no tienen spinner/loading mientras fetch
- ❌ **Admin CRUD para categorías** — solo productos, faltan categorías en admin
- ❌ **ProductForm** — no maneja subida de imágenes (upload endpoint existe pero no conectado)
- ❌ **Manejo de errores** — sin toast/notificaciones, solo alert() en admin
- ❌ **UX para usuario no técnico** (tu papá):
  - File upload directo en vez de solo URL
  - Labels/placeholders ultra claros en español
  - Login persistente
  - Mobile-friendly
  - Feedback visual con toast en vez de alert()

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

- ❌ **Render (Backend)**: No configurado. Build: `npm install && npm run build`, Start: `node dist/main.js`
- ❌ **Netlify (Frontend)**: No configurado. Build: `npm run build` → `dist/`, Redirects: SPA
- ❌ Variables de producción: JWT_SECRET seguro, PORT dinámico
- ❌ `.env.example` no creado

---

## Resumen Visual

| Área | Completado |
|------|-----------|
| Backend Core | █████████░ 90% |
| Auth | ██████████ 100% |
| CRUDs | ██████████ 100% |
| Seed | ██████████ 100% |
| Frontend Páginas | █████████░ 90% |
| Admin UX (no-técnico) | ░░░░░░░░░░ 0% |
| React Query | ██████████ 100% |
| Skeleton/Loading | ░░░░░░░░░░ 0% |
| Admin Categorías | ░░░░░░░░░░ 0% |
| Deploy | ░░░░░░░░░░ 0% |
| **Total** | **~53%** |

---

> _Última actualización: 18/05/2026_
