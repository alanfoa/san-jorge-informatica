import "reflect-metadata";
import "dotenv/config";
import { join } from "path";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { Categoria } from "../modules/categorias/entities/categoria.entity.js";
import { Producto, ProductoImagen, Caracteristica } from "../modules/productos/entities/producto.entity.js";
import { createSyncDataSource } from "../database/create-data-source.js";
import { usePostgres } from "../database/typeorm.config.js";
import { ensureProtegidoColumn } from "./ensure-schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const OUT_PATH = join(__dirname, "..", "..", "seeds", "backup-catalog.json");

async function main() {
  const ds = createSyncDataSource([Categoria, Producto, ProductoImagen, Caracteristica]);

  await ds.initialize();
  if (!usePostgres()) {
    await ensureProtegidoColumn(ds);
  }

  const categorias = await ds.getRepository(Categoria).find();
  const productos = await ds.getRepository(Producto).find({
    relations: ["imagenes", "caracteristicas"],
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    categorias,
    productos,
  };

  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`✓ Backup guardado: ${OUT_PATH}`);
  console.log(`  ${productos.length} productos, ${categorias.length} categorías`);

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
