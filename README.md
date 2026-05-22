# San Jorge Informática
E-commerce completo para San Jorge Informática, tienda de insumos informáticos. Panel de administración con sincronización automática del catálogo desde Invid.
## Stack
- **Backend:** NestJS + TypeORM + PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Pagos:** Mercado Pago (Checkout Pro)
- **Hosting:** Render (backend) + Netlify (frontend)
## Funcionalidades
### Tienda pública
- Catálogo con búsqueda y filtros por categoría
- Página de producto con imágenes, características y precios
- Carrito de compras con cálculo de total
- Checkout con Mercado Pago
### Panel de administración
- **Sincronización web externa:** un botón para scrapear e importar todo el catálogo desde web externa
- Productos: crear, editar, activar/desactivar, subir imágenes
- Categorías: gestionar categorías
- Usuarios: login seguro con JWT + rate limiting
- Tabla con búsqueda, filtros, ordenamiento y vista previa de imágenes
## Seguridad
- Helmet (headers HTTP seguros)
- JWT con expiración de 12 horas
- Bcrypt con 12 rondas de hash
- Rate limiting (5 intentos/min en login)
- Contraseñas desde variables de entorno
- CORS configurado
## Setup local
\`\`\`bash
git clone https://github.com/alanfoa/san-jorge-informatica.git
cd san-jorge-informatica
# Backend
cd backend
cp .env.example .env
# Completar .env con: DATABASE_URL, JWT_SECRET, MERCADOPAGO_ACCESS_TOKEN
npm install
npm run seed     # Crea admin
npm run sync     # Importa catálogo desde seed-invid.json
npm run start:dev
# Frontend
cd frontend
npm install
npm run dev
\`\`\`
## Variables de entorno
| Variable | Descripción |
|----------|-------------|
| \`DATABASE_URL\` | Conexión a PostgreSQL (Supabase) |
| \`JWT_SECRET\` | Clave secreta para firmar tokens |
| \`ADMIN_PASSWORD\` | Contraseña del admin para seed |
| \`MERCADOPAGO_ACCESS_TOKEN\` | Token de producción de MP |
| \`CLOUDINARY_*\` | Credenciales de Cloudinary para imágenes |
| \`CORS_ORIGIN\` | Origen permitido para CORS |
## Deploy
- **Backend:** Render — \`npm run build && npm run start:prod\`
- **Frontend:** Netlify — \`cd frontend && npm install && npm run build\` (publish: \`frontend/dist\`)
- **Base de datos:** Supabase PostgreSQL
