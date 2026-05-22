import "reflect-metadata";
import "dotenv/config";
import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";
import { Categoria } from "../modules/categorias/entities/categoria.entity.js";
import { Producto, ProductoImagen, Caracteristica } from "../modules/productos/entities/producto.entity.js";
import { createSyncDataSource } from "../database/create-data-source.js";
import { usePostgres } from "../database/typeorm.config.js";
import { ensureProtegidoColumn } from "./ensure-schema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const BACKUP_PATH = join(__dirname, "..", "..", "seeds", "backup-catalog.json");

async function main() {
  if (!existsSync(BACKUP_PATH)) {
    console.error(`ERROR: No existe ${BACKUP_PATH}`);
    console.error("Ejecutá primero: npm run backup:export (o descargá el backup de producción)");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(BACKUP_PATH, "utf-8"));
  const productos: any[] = raw.productos ?? [];

  const ds = createSyncDataSource([Categoria, Producto, ProductoImagen, Caracteristica]);

  await ds.initialize();
  if (!usePostgres()) {
    await ensureProtegidoColumn(ds);
  }

  const catRepo = ds.getRepository(Categoria);
  const prodRepo = ds.getRepository(Producto);
  const imgRepo = ds.getRepository(ProductoImagen);
  const charRepo = ds.getRepository(Caracteristica);

  const slugToId = new Map<string, number>();
  for (const c of raw.categorias ?? []) {
    const existing = await catRepo.findOne({ where: { slug: c.slug } });
    if (existing) {
      slugToId.set(c.slug, existing.id);
    } else {
      const saved = await catRepo.save(
        catRepo.create({
          nombre: c.nombre,
          slug: c.slug,
          descripcion: c.descripcion ?? "",
          imagen: c.imagen ?? "",
        })
      );
      slugToId.set(c.slug, saved.id);
    }
  }

  let created = 0;
  let updated = 0;

  for (const p of productos) {
    const categoriaSlug = p.categoria?.slug;
    const categoriaId = p.categoriaId
      ?? (categoriaSlug ? slugToId.get(categoriaSlug) : undefined);

    let existing = p.sku
      ? await prodRepo.findOne({ where: { sku: p.sku } })
      : null;
    if (!existing) {
      existing = await prodRepo.findOne({ where: { nombre: p.nombre } });
    }

    const data = {
      nombre: p.nombre,
      descripcion: p.descripcion ?? "",
      sku: p.sku ?? null,
      precio: Number(p.precio) || 0,
      imagen: p.imagen ?? "",
      activo: p.activo !== false,
      destacado: !!p.destacado,
      stock: p.stock ?? 0,
      categoriaId: categoriaId ?? null,
      protegido: true,
    };

    let saved: Producto;
    if (existing) {
      await prodRepo.save({ ...existing, ...data });
      saved = (await prodRepo.findOne({ where: { id: existing.id } }))!;
      updated++;
    } else {
      saved = await prodRepo.save(prodRepo.create(data));
      created++;
    }

    if (p.imagenes?.length) {
      await imgRepo.delete({ productoId: saved.id });
      for (const img of p.imagenes) {
        await imgRepo.save(
          imgRepo.create({
            url: img.url,
            orden: img.orden ?? 0,
            productoId: saved.id,
          })
        );
      }
    }

    if (p.caracteristicas?.length) {
      await charRepo.delete({ productoId: saved.id });
      for (const ch of p.caracteristicas) {
        if (!ch.nombre || !ch.valor) continue;
        await charRepo.save(
          charRepo.create({
            nombre: ch.nombre,
            valor: ch.valor,
            productoId: saved.id,
          })
        );
      }
    }
  }

  console.log(`✓ Backup restaurado: ${created} creados, ${updated} actualizados`);
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
