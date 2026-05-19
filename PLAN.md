# PLAN — San Jorge Informática v2.0

## Stack

| Capa | Tecnología | Deploy |
|------|-----------|--------|
| Backend | NestJS + TypeScript | Render (gratis) |
| ORM | TypeORM | — |
| BD | SQLite (sql.js) | Archivo `data.db` |
| Auth | JWT + bcryptjs + Passport + Roles | — |
| Validación | class-validator | — |
| Frontend | React 19 + Vite + TypeScript | Netlify (gratis) |
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

### Upload
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /upload | admin/editor | Subir imagen |

## Admin Panel (para usuario no técnico)

Flujo para que tu papá administre la tienda sin programar:

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

## Seed

```bash
cd backend && npm run setup
```

Crea 1 admin + importa 939 productos de Invid en un solo comando.

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
```

### Login por defecto

- **Email:** `admin@sanjorge.com`
- **Password:** `admin123`
