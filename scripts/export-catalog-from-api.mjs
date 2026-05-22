/**
 * Exporta catálogo desde producción (API pública de lectura).
 * Uso: node scripts/export-catalog-from-api.mjs
 *      API_URL=https://san-jorge-informatica.onrender.com/api node scripts/...
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.API_URL ?? "https://san-jorge-informatica.onrender.com/api";
const OUT = join(__dirname, "..", "backend", "seeds", "backup-catalog.json");

const [productos, categorias] = await Promise.all([
  fetch(`${BASE}/productos`).then((r) => {
    if (!r.ok) throw new Error(`productos: HTTP ${r.status}`);
    return r.json();
  }),
  fetch(`${BASE}/categorias`).then((r) => {
    if (!r.ok) throw new Error(`categorias: HTTP ${r.status}`);
    return r.json();
  }),
]);

const payload = {
  exportedAt: new Date().toISOString(),
  source: BASE,
  categorias,
  productos,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2), "utf-8");
console.log(`✓ Guardado ${OUT}`);
console.log(`  ${productos.length} productos, ${categorias.length} categorías`);
