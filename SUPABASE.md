# PostgreSQL con Supabase — Guía rápida

No necesitás instalar PostgreSQL en tu PC. Todo es en la nube (gratis).

## 1. Crear proyecto (5 minutos)

1. Entrá a [https://supabase.com](https://supabase.com) y creá cuenta (con GitHub va bien).
2. **New project** → nombre ej. `san-jorge` → contraseña de base (guardala).
3. Esperá ~2 min a que termine de crear.

## 2. Copiar la URL de conexión

1. En el proyecto: **Project Settings** (engranaje) → **Database**.
2. En **Connection string** elegí **URI**.
3. Modo recomendado para Render: **Transaction pooler** (puerto `6543`).
4. Copiá la URL y reemplazá `[YOUR-PASSWORD]` por la contraseña del paso 1.

Ejemplo:
```
postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

## 3. Configurar Render

1. [Render Dashboard](https://dashboard.render.com) → tu servicio `sanjorge-backend`.
2. **Environment** → agregar:
   - `DATABASE_URL` = la URL de Supabase (completa).
3. **Save** → **Manual Deploy** (o push a GitHub).

El backend detecta `DATABASE_URL` y usa PostgreSQL automáticamente. SQLite solo se usa en local si no tenés esa variable.

## 4. Después del primer deploy con PostgreSQL

La base empieza vacía. Restaurá el catálogo actual (con los cambios de tu papá):

```bash
# Si ya exportaste antes del deploy:
ADMIN_EMAIL=sanjorgeinf@hotmail.com \
ADMIN_PASSWORD=Academia01 \
node scripts/restore-catalog-to-api.mjs
```

Si no tenés backup:

```bash
node scripts/export-catalog-from-api.mjs   # solo si producción aún tiene datos
# deploy...
node scripts/restore-catalog-to-api.mjs
```

O en Render Shell (si tenés `seed-invid.json` en el repo):

```bash
cd backend && npm run sync:prod
```

## 5. Desarrollo local con Supabase (opcional)

En `backend/.env`:

```env
DATABASE_URL=postgresql://...
```

```bash
cd backend && npm run seed && npm run start:dev
```

Sin `DATABASE_URL` sigue usando `data.db` (SQLite) como antes.

## Preguntas frecuentes

**¿Necesito otra página o programa?**  
No. Solo Supabase (web) + pegar la URL en Render.

**¿Es difícil?**  
El código ya está listo. Vos solo creás la cuenta y copiás una variable.

**¿Qué pasa con los deploys?**  
Los datos quedan en Supabase. Deployar código **no borra** productos ni ediciones del admin.

**¿Cuánto cuesta?**  
Supabase free tier alcanza para esta tienda.

Más detalle en `DOCS.md` → sección Base de datos.
