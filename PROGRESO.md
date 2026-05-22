# Progreso — San Jorge Informática v2.0

> Documentación técnica completa: **`DOCS.md`**

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado |
| ⬜ | Pendiente |
| 👤 | Acción manual (cuentas, credenciales, deploy) |
| ⚠️ | Importante / riesgo en producción |

---

## Estado general (Mayo 2026)

| Área | Estado |
|------|--------|
| Backend API (NestJS + TypeORM) | ✅ |
| Frontend tienda + admin | ✅ |
| Cloudinary upload | ✅ |
| Mercado Pago Checkout Pro | ✅ (falta token en Render si no está) |
| Deploy Netlify + Render | ✅ en producción |
| Catálogo Invid (scraper + sync) | ✅ |
| **Persistencia datos admin** | ⚠️ hasta pegar `DATABASE_URL` en Render |
| PostgreSQL (Supabase) | ✅ código listo — 👤 crear cuenta + URL |

---

## ⚠️ URGENTE — Deploy sin perder trabajo del admin

### Qué pasa al pushear y deployar en Render

1. Render crea un **contenedor nuevo** con disco vacío.
2. `data.db` **se borra** (no es persistente en free tier).
3. `seed:prod` solo crea el usuario admin.
4. **Ya no** corre `sync:prod` al inicio (cambio en `render.yaml`).
5. Los productos que tu papá **creó** o **editó** en el admin **no están** en `seed-invid.json` → **desaparecen** si no hacés backup.

**No es que el sync “borre” filas:** el problema principal es la **BD efímera** en cada deploy.

### Qué implementamos para mitigarlo

| Cambio | Archivo / detalle |
|--------|-------------------|
| Sync **no destructivo** | `import-invid.ts` — no pisa `protegido`, sin SKU, ni precio/nombre/descripción |
| Campo `protegido` | `producto.entity.ts` — `true` al crear/editar en admin |
| Sin sync en cada deploy | `render.yaml` — solo `seed:prod && start:prod` |
| Backup desde API prod | `scripts/export-catalog-from-api.mjs` |
| Restore en prod | `scripts/restore-catalog-to-api.mjs` + `POST /api/productos/restore-backup` |
| Backup local | `npm run backup:export` / `backup:import` |

### Procedimiento antes de tu próximo push

```bash
# 1. Exportar catálogo ACTUAL de producción (incluye cambios de tu papá)
node scripts/export-catalog-from-api.mjs

# Verificar que existe backend/seeds/backup-catalog.json
```

```bash
# 2. Push + deploy (Render reinicia BD)
git push
```

```bash
# 3. Después del deploy, restaurar
ADMIN_EMAIL=sanjorgeinf@hotmail.com \
ADMIN_PASSWORD=Academia01 \
node scripts/restore-catalog-to-api.mjs
```

Opcional: si solo querés repoblar Invid sin backup → Render Shell → `cd backend && npm run sync:prod` (no recupera productos manuales del papá).

### Solución definitiva — PostgreSQL ✅ (falta tu cuenta)

El código ya soporta Supabase. Guía corta: **`SUPABASE.md`**.

1. 👤 Crear proyecto en [supabase.com](https://supabase.com)
2. 👤 Copiar `DATABASE_URL` (pooler, puerto 6543)
3. 👤 Pegarla en Render → Environment
4. Redeploy → `node scripts/restore-catalog-to-api.mjs` si tenés backup

---

## Completado recientemente

### Mercado Pago ✅
- Backend: `GET /mercadopago/status`, `POST /mercadopago/create-preference`
- Frontend: botón en `/carrito`, página `/pago/resultado`
- Docs en `DOCS.md`
- 👤 Token en Render: `MERCADOPAGO_ACCESS_TOKEN`

### Protección catálogo admin ✅
- Campo `protegido` + sync no destructivo
- Backup/restore API y scripts
- `render.yaml` sin sync automático

### Documentación ✅
- `DOCS.md` revisado contra el código real (endpoints, env, deploy, MP, etc.)

---

## Deploy en producción

| Servicio | URL / notas |
|----------|-------------|
| Frontend | Netlify — proxy `/api` → Render (`netlify.toml`) |
| Backend | Render — `san-jorge-informatica.onrender.com` |
| Admin login | `sanjorgeinf@hotmail.com` / `Academia01` (cambiar en prod 👤) |

### Checklist deploy

- [x] Backend en Render
- [x] Frontend en Netlify
- [ ] 👤 `MERCADOPAGO_ACCESS_TOKEN` en Render
- [ ] 👤 `CLOUDINARY_*` en Render (upload admin)
- [ ] 👤 `CORS_ORIGIN` = URL Netlify exacta
- [ ] 👤 **Backup antes de cada deploy** que toque backend
- [ ] 👤 **Restore después del deploy**
- [ ] 👤 Cambiar password admin en producción

---

## Pendientes priorizados

### 1. Activar PostgreSQL en producción 👤

- [x] Código TypeORM dual (SQLite / Postgres)
- [x] Driver `pg`, `ILike`, seeds compatibles
- [x] `SUPABASE.md` con pasos
- [ ] 👤 Cuenta Supabase + `DATABASE_URL` en Render
- [ ] 👤 Restore catálogo tras primer deploy con Postgres

### 2. Mercado Pago en producción 👤

- [ ] 👤 Token en Render
- [ ] Probar pago real desde `/carrito`

### 3. GitHub Action sync Invid (opcional)

- [ ] Workflow diario scraper → commit JSON → redeploy
- [ ] Coordinar con sync no destructivo y/o PostgreSQL

### 4. Mejoras catálogo (opcional)

- [ ] Paginación en `/productos`
- [ ] Precios masivos desde Invid
- [ ] Página `/categorias` dedicada

---

## Referencia rápida — comandos

```bash
# Desarrollo
cd backend && npm run start:dev
cd frontend && npm run dev

# Primera vez local
python3 scripts/scraper.py
cd backend && npm run setup

# Backup / restore producción
node scripts/export-catalog-from-api.mjs
ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/restore-catalog-to-api.mjs

# Sync Invid manual (local o Render Shell)
cd backend && npm run sync
```

---

## Historial de fixes

### 21/05/2026 — Gabinetes / slugs en HomePage
- `slugsParaUrl` en DESEADAS para no mezclar Fuentes con Gabinetes.

### 21/05/2026 — Mercado Pago
- Checkout Pro completo + docs.

### 22/05/2026 — PostgreSQL (Supabase)
- TypeORM condicional por `DATABASE_URL`, guía `SUPABASE.md`.

### 22/05/2026 — Protección datos admin + deploy
- `protegido`, sync no destructivo, backup/restore, `render.yaml` sin sync auto.
- `DOCS.md` y `PROGRESO.md` alineados al repo.

---

> _Última actualización: 22/05/2026_
