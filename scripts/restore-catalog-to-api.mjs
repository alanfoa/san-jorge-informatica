/**
 * Restaura backup en producción vía POST /productos/restore-backup (requiere admin).
 * Uso:
 *   API_URL=https://...onrender.com/api \
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *   node scripts/restore-catalog-to-api.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.API_URL ?? "https://san-jorge-informatica.onrender.com/api";
const BACKUP = join(__dirname, "..", "backend", "seeds", "backup-catalog.json");
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Faltan ADMIN_EMAIL y ADMIN_PASSWORD");
  process.exit(1);
}

const backup = JSON.parse(readFileSync(BACKUP, "utf-8"));

const loginRes = await fetch(`${BASE}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!loginRes.ok) {
  console.error("Login falló:", await loginRes.text());
  process.exit(1);
}
const { access_token } = await loginRes.json();

const restoreRes = await fetch(`${BASE}/productos/restore-backup`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access_token}`,
  },
  body: JSON.stringify({
    categorias: backup.categorias,
    productos: backup.productos,
  }),
});

if (!restoreRes.ok) {
  console.error("Restore falló:", await restoreRes.text());
  process.exit(1);
}

console.log("✓ Restaurado:", await restoreRes.json());
