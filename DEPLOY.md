# Guía de Deploy — San Jorge Informática

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

### Notas importantes sobre Render (Free Tier)

- **Almacenamiento efímero**: `data.db` se pierde en cada deploy. El seed se ejecuta automáticamente al iniciar, así que la base de datos se repobla sola.
- **Imágenes subidas**: El directorio `uploads/` también es efímero. Para producción real, migrar a Cloudinary o S3.
- **Spin down**: El servicio se pausa tras 15 min de inactividad. La primera request puede tardar ~50s.

---

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
   (reemplazar con la URL real de Render)
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

---

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

## Credenciales de admin

- **Email**: admin@sanjorge.com
- **Password**: admin123

## Checklist

- [ ] Backend deployado en Render
- [ ] Frontend deployado en Netlify
- [ ] `CORS_ORIGIN` configurado en Render con URL de Netlify
- [ ] `VITE_API_URL` configurado en Netlify con URL de Render
- [ ] Login funciona en producción
- [ ] Catálogo visible (productos y categorías)
- [ ] Admin panel accesible (`/admin/login`)
- [ ] Crear/editar/eliminar producto funciona
- [ ] Upload de imágenes funciona (recordar: efímero en Render free)
