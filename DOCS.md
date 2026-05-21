# San Jorge Informática v2.0 — Documentación

## Stack

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| Backend | NestJS + TypeScript | Render (gratis) |
| ORM | TypeORM | — |
| BD | SQLite (sql.js) | Archivo `data.db` |
| Auth | JWT + bcryptjs + Passport + Roles | — |
| Validación | class-validator | — |
| Frontend | React 19 + Vite 8 + TypeScript | Netlify (gratis) |
| Data fetching | @tanstack/react-query | — |
| Routing | React Router v7 | — |
| Estilos | Tailwind CSS 4 + lucide-react | — |

## Entidades

```
User ──── (independiente, solo auth)

Categoria 1 ──── N Producto
  └─ productos: OneToMany → Producto

Producto 1 ──── N ProductoImagen
  ├─ categoria: ManyToOne → Categoria
  ├─ imagenes: OneToMany → ProductoImagen
  └─ caracteristicas: OneToMany → Caracteristica

Producto 1 ──── N Caracteristica
  └─ producto: ManyToOne → Producto
```

### User
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| nombre | VARCHAR | Nombre completo |
| email | VARCHAR unique | Email de login |
| password | VARCHAR | Hash bcrypt |
| rol | VARCHAR | admin / editor |
| activo | BOOLEAN | Si puede acceder |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### Categoria
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| nombre | VARCHAR | Nombre visible |
| slug | VARCHAR unique | Para URLs |
| descripcion | TEXT | Opcional |
| imagen | VARCHAR | URL opcional |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### Producto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| nombre | VARCHAR | Nombre |
| descripcion | TEXT | Descripción |
| precio | DECIMAL(10,2) | Precio ARS |
| imagen | VARCHAR | URL principal |
| activo | BOOLEAN | Visible |
| destacado | BOOLEAN | Home |
| stock | INTEGER | Stock |
| categoriaId | INTEGER FK | → Categoria.id |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

### ProductoImagen
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| url | VARCHAR | URL |
| orden | INTEGER | Posición |
| productoId | INTEGER FK | → Producto.id |

### Caracteristica
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Autoincremental |
| nombre | VARCHAR | Ej: "Puertos" |
| valor | VARCHAR | Ej: "2x HDMI" |
| productoId | INTEGER FK | → Producto.id |

## Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /auth/login | — | Login → JWT |
| GET | /auth/perfil | JWT | Datos del usuario |

### Categorías
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /categorias | — | Lista |
| GET | /categorias/:id | — | Detalle |
| POST | /categorias | admin | Crear |
| PATCH | /categorias/:id | admin | Editar |
| DELETE | /categorias/:id | admin | Eliminar |

### Productos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /productos | — | Lista (filtros) |
| GET | /productos/activos | — | Solo activos |
| GET | /productos/:id | — | Detalle |
| POST | /productos | admin/editor | Crear |
| PATCH | /productos/:id | admin/editor | Editar |
| DELETE | /productos/:id | admin | Eliminar |

### Usuarios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /users | admin | Lista |
| POST | /users | admin | Crear |
| PATCH | /users/:id | admin | Editar |
| DELETE | /users/:id | admin | Eliminar |

### Mercado Pago
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /mercadopago/create-preference | — | Crea preferencia de pago (carrito) y devuelve link de Checkout Pro |

Requiere `MERCADOPAGO_ACCESS_TOKEN` en `.env`.

### Upload
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /upload | admin/editor | Subir imagen |

## Comandos

```bash
# ── Primera vez (crear BD desde cero) ──
cd backend  && npm run setup          # Crea admin + importa 939 productos Invid

# ── Desarrollo ──
cd backend  && npm run start:dev      # Backend en :3001
cd frontend && npm run dev            # Frontend en :5173

# ── Seed / Sync individual ──
cd backend  && npm run seed           # Solo crear admin (si no existe)
cd backend  && npm run sync           # Solo importar/actualizar catálogo Invid

# ── Producción ──
cd frontend && npm run build          # Build frontend → dist/
cd backend  && npm run build          # Build backend → dist/
cd backend  && npm run start:prod     # Backend en modo producción

# ── Scraper ──
python3 scripts/scraper.py            # Scrapear catálogo de Invid
cd backend && npx tsx src/seeds/add-users.ts  # Crear usuarios admin
```

### Login por defecto
- **Email:** `admin@sanjorge.com`
- **Password:** `admin123`

## Admin Panel (para usuario no técnico)

Flujo para que un usuario no técnico administre la tienda:

1. **Login** → `/admin/login` con email + contraseña (queda persistente)
2. **Dashboard** → `/admin` tabla con todos los productos (ID, nombre, categoría, precio, activo)
3. **Crear** → "Nuevo producto" → formulario simple: nombre, descripción, precio, categoría (select), imagen (subir archivo o URL), activo, destacado
4. **Editar** → click en "Editar" → mismo formulario precargado
5. **Eliminar** → click en "Eliminar" → confirmación → borra el producto
6. **Categorías** → misma lógica desde `/admin/categorias`

Requisitos UX:
- Labels grandes, placeholders claros, todo en español
- File upload directo (seleccionar imagen del celular/PC)
- Login persistente (no pedir contraseña cada vez)
- Mobile-friendly (que funcione bien desde el celular)
- Toast notifications para feedback claro (no `alert()`)

## HomePage — Categorías Destacadas (Componentes por Categoría)

El home renderiza un grid de 8 categorías en `HomePage.tsx:124-158` usando el array `DESEADAS`.

### Mecanismo

1. **`catMap`** (línea 114): se construye a partir de todos los productos activos. Agrupa por `categoria.slug` y cuenta productos por categoría.
2. **`DESEADAS`** (líneas 125-134): define las 8 categorías que queremos mostrar en el home. Cada entrada tiene:
   - `nombre`: texto visible en la card
   - `keywords`: palabras clave para matchear contra `categoria.nombre` (case-insensitive, `.includes()`)
   - `slugsParaUrl?`: **opcional**. Si está presente, SOBREESCRIBE los slugs usados en el link de la card. Sino, usa todos los slugs de las categorías matcheadas.
3. **`slugsUsados`** (línea 136): set que acumula slugs de categorías matcheadas por cada DESEADAS. Previene que aparezcan duplicados en `restantes`.
4. **`restantes`** (líneas 150-158): si alguna DESEADAS no matchea ninguna categoría (retorna `null`), se rellena con las categorías más populares no usadas aún, hasta llegar a 8 cards.

### slugsParaUrl

Se usa cuando los keywords matchean categorías cuyo nombre contiene substrings de otras categorías. Por ejemplo:

- **`Fuentes`**: keywords `['fuente', 'fuente de alimentacion']` matchean `"Fuentes De Alimentacion Gabinetes Y Fuentes"`, `"Gabinetes Y Fuentes"`, etc. Sin `slugsParaUrl`, la URL incluiría categorías de gabinetes. Con `slugsParaUrl: ['fuentes-de-alimentacion-gabinetes-y-fuentes']` solo filtra por Fuentes de Alimentación.
- **`Gabinetes`**: keywords `['gabinete']` también matchean `"Fuentes De Alimentacion Gabinetes Y Fuentes"` porque contiene "gabinetes". Sin `slugsParaUrl`, la URL incluiría Fuentes de Alimentación. Con `slugsParaUrl: ['gabinetes-y-fuentes', 'gabinetes-con-fuente-gabinetes-y-fuentes', 'gabinetes-sin-fuente-gabinetes-y-fuentes']` solo filtra gabinetes.

**Regla**: si una DESEADAS usa keywords que pueden solaparse con otras categorías, agregar `slugsParaUrl` con los slugs exactos que debe filtrar.

### Clean Names

`CLEAN_NAMES` (líneas 29-99) mapea nombres originales de categorías (ej: `"Fuentes De Alimentacion Gabinetes Y Fuentes"`) a nombres limpios de display (ej: `"Fuentes de Alimentación"`). Se usa tanto en HomePage como en ProductosPage.

---

## 🚧 PENDIENTE — Migración a PostgreSQL

### Problema

Render free tier tiene **almacenamiento efímero**. Cada deploy destruye el contenedor y con él la base de datos `data.db` (SQLite). Aunque el sync de Invid repuebla los productos, **cualquier cambio hecho desde el admin** (precios, stock, activar/desactivar productos, destacados) **se pierde en cada deploy**.

### Solución

Migrar de `sql.js` (SQLite embebido) a **PostgreSQL externo** (Supabase free tier). Los datos viven fuera de Render y sobreviven cualquier deploy.

### Prerequisito

1. Crear cuenta gratis en [supabase.com](https://supabase.com)
2. Crear proyecto → Settings → Database → copiar **Connection string** (`postgresql://...`)
3. Poner ese string en la variable de entorno `DATABASE_URL` del backend

### Cambios de código necesarios

| Archivo | Cambio |
|---------|--------|
| `backend/package.json` | Agregar `pg` driver, eliminar `sql.js` |
| `backend/src/app.module.ts` | TypeORM condicional: si `DATABASE_URL` → PostgreSQL, si no → SQLite (dev) |
| `backend/src/database/data-source.ts` | Ídem, para CLI |
| `backend/src/seeds/seed.ts` | DataSource dinámico según entorno |
| `backend/src/seeds/import-invid.ts` | **Sync no destructivo**: no pisar `precio`, `activo`, `destacado`, `stock` si el usuario los modificó. Soporte PostgreSQL. |
| `backend/src/seeds/add-users.ts` | Reescribir usando TypeORM (hoy usa sql.js nativo) |
| `backend/scripts/seed.ts` | **Eliminar** (legacy, usa sql.js nativo sin TypeORM) |
| `backend/src/modules/productos/productos.service.ts` | `Like` → `ILike` (case-insensitive en PostgreSQL) |
| `render.yaml` | Sacar `&& sync:prod` del startCommand. Agregar env var `DATABASE_URL` |
| `.env.example` | Agregar `DATABASE_URL` |

### Flujo post-migración

```
Deploy:
  1. Render arranca contenedor
  2. npm run seed:prod  → Crea tablas + admin (solo si no existen)
  3. npm run start:prod → App conecta a Supabase → datos persistentes

Sync Invid (solo cuando haya productos nuevos, NO en cada deploy):
  npm run sync  (no destructivo: NO pisará datos editados por el usuario)
```

---

## 🚧 PENDIENTE — Mercado Pago

### Estado actual

El código ya está implementado:
- **Backend**: `POST /mercadopago/create-preference` en `backend/src/modules/mercadopago/`
- **Frontend**: Botón "Pagar con Mercado Pago" en CartPage (visible solo si hay items con `precio > 0`)

### Para activarlo

1. Obtener **Access Token** de producción desde [developers.mercadopago.com](https://developers.mercadopago.com) (misma cuenta que la app Mercado Pago)
2. Agregar `MERCADOPAGO_ACCESS_TOKEN=APP_USR-...` al `.env` del backend
3. En producción: agregar la misma variable en Render Dashboard → Environment Variables

### Comportamiento

- Si no hay token configurado, el botón no se muestra (porque ningún producto tiene precio aún)
- Cuando hay token + productos con precio, el botón crea una preferencia de pago y abre Checkout Pro en otra pestaña
- Al pagar, redirige de vuelta al catálogo

---

## Convenciones de código

- No agregar comentarios a menos que se solicite explícitamente
- Usar rutas con `@/` alias para imports del frontend (ej: `@/components/...`)
- Seguir los patrones de componentes existentes (functional components con TypeScript)
- Después de cualquier cambio, correr `tsc -b` y `npm run build` en frontend para verificar

## Favicon

El favicon se encuentra en `frontend/public/favicon.svg`. Es un SVG con rectángulo de bordes redondeados (8px) con gradiente de cyan-500 (#06b6d4) a purple-600 (#9333ea) y texto "SJ" blanco en negrita. Referenciado desde `frontend/index.html`.

Si se necesita un favicon legacy (.ico), se debe generar aparte.

---

# Guía de Deploy

## Backend — Render (Gratis)

### Opción A: Deploy automático con render.yaml

1. Subir el código a GitHub:
   ```bash
   git push origin dev
   ```
2. Ir a [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. Conectar el repositorio `san-jorge-informatica`
4. Render detectará automáticamente `render.yaml` y creará el servicio
5. Después del deploy, copiar la URL del backend (ej: `https://sanjorge-backend.onrender.com`)

### Opción B: Deploy manual

1. En Render Dashboard → **New Web Service**
2. Conectar el repo `san-jorge-informatica`
3. Configurar:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run seed:prod && npm run start:prod`
    - **Environment Variables**:
      - `NODE_ENV` = `production`
      - `JWT_SECRET` = generar uno aleatorio (ej: `openssl rand -hex 32`)
      - `CORS_ORIGIN` = URL de Netlify (se configura después)
      - `MERCADOPAGO_ACCESS_TOKEN` = token de producción de Mercado Pago (ver sección Mercado Pago)

### Notas importantes sobre Render (Free Tier)

- **Almacenamiento efímero**: `data.db` se pierde en cada deploy. El seed se ejecuta automáticamente al iniciar, así que la base de datos se repobla sola.
- **Imágenes subidas**: El directorio `uploads/` también es efímero. Para producción real, migrar a Cloudinary o S3.
- **Spin down**: El servicio se pausa tras 15 min de inactividad. La primera request puede tardar ~50s.

## Frontend — Netlify (Gratis)

### Opción A: Deploy desde GitHub (recomendado)

1. Ir a [Netlify](https://app.netlify.com/) → **Add new site** → **Import an existing project**
2. Conectar con GitHub y seleccionar `san-jorge-informatica`
3. Configurar:
   - **Base directory**: dejar vacío (el `netlify.toml` ya apunta a `frontend/`)
   - **Build command**: dejar vacío (viene de `netlify.toml`)
   - **Publish directory**: dejar vacío (viene de `netlify.toml`)
4. Agregar variable de entorno:
   - `VITE_API_URL` = `https://tu-backend.onrender.com/api`
5. Deploy

### Opción B: Deploy manual con CLI

```bash
cd frontend
VITE_API_URL=https://tu-backend.onrender.com/api npm run build
npx netlify deploy --prod --dir=dist
```

### Después del deploy del frontend

1. Copiar la URL de Netlify (ej: `https://san-jorge.netlify.app`)
2. Ir a Render → backend → Environment Variables
3. Actualizar `CORS_ORIGIN` = `https://san-jorge.netlify.app`
4. Redeployar el backend

## Verificación post-deploy

```bash
# Test backend
curl https://tu-backend.onrender.com/api/categorias

# Test frontend (abrir en navegador)
# https://tu-sitio.netlify.app

# Test login
curl -X POST https://tu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sanjorge.com","password":"admin123"}'
```

### Checklist de deploy

- [ ] Backend deployado en Render
- [ ] Frontend deployado en Netlify
- [ ] `CORS_ORIGIN` configurado en Render con URL de Netlify
- [ ] `VITE_API_URL` configurado en Netlify con URL de Render
- [ ] Login funciona en producción
- [ ] Catálogo visible (productos y categorías)
- [ ] Admin panel accesible (`/admin/login`)
- [ ] Crear/editar/eliminar producto funciona
- [ ] Upload de imágenes funciona (recordar: efímero en Render free)
