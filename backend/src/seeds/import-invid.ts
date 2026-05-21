import "reflect-metadata";
import { DataSource } from "typeorm";
import { join } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";
import { Categoria } from "../modules/categorias/entities/categoria.entity.js";
import {
  Producto,
  ProductoImagen,
  Caracteristica,
} from "../modules/productos/entities/producto.entity.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const JSON_PATH = join(__dirname, "..", "..", "seeds", "seed-invid.json");

// Mapeo de slugs de Invid → slugs de nuestra BD
const SLUG_MAP: Record<string, string> = {
  conectividad: "conectividad",
  electrodomesticos: "electrodomesticos",
  "fuentes-de-alimentacion": "fuentes",
  "gabinetes-y-fuentes": "gabinetes",
  "memorias-ram": "memorias-ram",
  "memoria-sodimm-memorias-ram": "memorias-ram",
  "memoria-ddr3-memorias-ram": "memorias-ram",
  "memoria-ddr4-memorias-ram": "memorias-ram",
  "memoria-ddr5-memorias-ram": "memorias-ram",
  microprocesadores: "procesadores",
  mothers: "motherboards",
  monitores: "monitores",
  "placas-de-video": "placas-de-video",
  perifericos: "perifericos",
  almacenamiento: "almacenamiento",
  notebooks: "notebooks",
  gamers: "gamers",
  consumibles: "consumibles",
  impresoras: "impresoras",
  tablets: "tablets",
};

function normalizeSlug(slug: string): string {
  return SLUG_MAP[slug] || slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

const BANNED_WORDS = ['Kelyx', 'Invid Computers'];

function sanitizarNombre(nombre: string): string {
  let res = nombre;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    res = res.replace(regex, '');
  }
  res = res.replace(/\s*\(\d+\)\s*$/, '');
  return res.replace(/\s+/g, ' ').trim();
}

function sanitizarDescripcion(descripcion: string): string {
  let res = descripcion;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    res = res.replace(regex, '');
  }
  return res;
}

async function main() {
  console.log("=" .repeat(60));
  console.log("Importador Invid → San Jorge Informática");
  console.log("=".repeat(60));

  if (!existsSync(JSON_PATH)) {
    console.error(`ERROR: No existe ${JSON_PATH}`);
    console.error("Ejecutá primero: python3 scripts/scraper.py");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
  const productos: any[] = raw.productos;

  console.log(`Productos en JSON: ${productos.length}`);

  // Conectar a la BD
  const ds = new DataSource({
    type: "sqljs",
    location: join(__dirname, "..", "..", "data.db"),
    autoSave: true,
    synchronize: false,
    entities: [Categoria, Producto, ProductoImagen, Caracteristica],
  });

  await ds.initialize();
  console.log("✓ Conectado a la base de datos");

  // ── 0. Limpiar Caracteristicas internas viejas (SKU y URL Origen) ──
  const deleteResult = await ds
    .createQueryBuilder()
    .delete()
    .from("caracteristicas")
    .where("nombre IN ('SKU', 'URL Origen', 'URL Invid')")
    .execute();
  if (deleteResult.affected && deleteResult.affected > 0) {
    console.log(`  Limpiadas ${deleteResult.affected} Caracteristicas internas (SKU / URL Origen)`);
  }

  // ── 1. Crear categorías que no existan ──
  const catRepo = ds.getRepository(Categoria);
  const existingCats = await catRepo.find();
  const existingSlugMap = new Map(
    existingCats.map((c) => [c.slug.toLowerCase(), c.id])
  );

  const uniqueSlugs = new Map<string, string>();
  for (const p of productos) {
    const norm = normalizeSlug(p.categoriaSlug);
    if (!uniqueSlugs.has(norm)) {
      uniqueSlugs.set(norm, p.categoriaSlug);
    }
  }

  let catsCreated = 0;
  const slugToId = new Map<string, number>();

  for (const [normSlug, originalSlug] of uniqueSlugs.entries()) {
    const existingId = existingSlugMap.get(normSlug);
    if (existingId) {
      slugToId.set(normSlug, existingId);
    } else {
      const nombre = normSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const cat = catRepo.create({
        nombre,
        slug: normSlug,
        descripcion: `Productos de ${nombre.toLowerCase()}`,
        imagen: "",
      });
      const saved = await catRepo.save(cat);
      slugToId.set(normSlug, saved.id);
      catsCreated++;
      console.log(`  + Categoría creada: ${nombre} (id=${saved.id})`);
    }
  }

  console.log(`✓ Categorías: ${catsCreated} creadas, ${existingCats.length} existentes`);

  // ── 2. Importar productos ──
  const prodRepo = ds.getRepository(Producto);
  const charRepo = ds.getRepository(Caracteristica);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let imgCreated = 0;

  for (const p of productos) {
    const normSlug = normalizeSlug(p.categoriaSlug);
    const catId = slugToId.get(normSlug);
    if (!catId) {
      skipped++;
      continue;
    }

    // Buscar producto existente por SKU o nombre sanitizado
    const nombreSanitizado = sanitizarNombre(p.nombre);
    const descripcionSanitizada = sanitizarDescripcion(p.descripcion || "");

    const existing = p.sku
      ? await prodRepo.findOne({ where: { sku: p.sku } })
      : await prodRepo.findOne({ where: { nombre: nombreSanitizado } });

    if (existing) {
      // Actualizar si hay cambios
      let changed = false;
      if (p.imagen && existing.imagen !== p.imagen) {
        existing.imagen = p.imagen;
        changed = true;
      }
      if (p.precio && existing.precio !== p.precio) {
        existing.precio = p.precio;
        changed = true;
      }
      if (existing.nombre !== nombreSanitizado) {
        existing.nombre = nombreSanitizado;
        changed = true;
      }
      if (existing.descripcion !== descripcionSanitizada) {
        existing.descripcion = descripcionSanitizada;
        changed = true;
      }
      if (changed) {
        await prodRepo.save(existing);
        updated++;
      } else {
        skipped++;
      }
      continue;
    }

    // Crear nuevo producto
    const prod = prodRepo.create({
      nombre: nombreSanitizado,
      descripcion: descripcionSanitizada,
      precio: p.precio || 0,
      imagen: p.imagen || "",
      activo: true,
      destacado: false,
      stock: 0,
      categoriaId: catId,
    });

    const saved = await prodRepo.save(prod);

    // Agregar imagen como ProductoImagen
    if (p.imagen) {
      const img = new ProductoImagen();
      img.url = p.imagen;
      img.orden = 0;
      img.productoId = saved.id;
      await ds.getRepository(ProductoImagen).save(img);
      imgCreated++;
    }

    // Agregar caracteristicas reales (specs scrapeadas)
    if (p.caracteristicas && Array.isArray(p.caracteristicas)) {
      for (const spec of p.caracteristicas) {
        if (!spec.nombre || !spec.valor) continue;
        const c = charRepo.create({
          nombre: spec.nombre,
          valor: spec.valor,
          productoId: saved.id,
        });
        await charRepo.save(c);
      }
    }

    created++;

    if (created % 100 === 0) {
      console.log(`  → Importados ${created} productos...`);
    }
  }

  console.log("=".repeat(60));
  console.log(`Importación completada`);
  console.log(`  Productos creados: ${created}`);
  console.log(`  Productos actualizados: ${updated}`);
  console.log(`  Productos omitidos (ya existen): ${skipped}`);
  console.log(`  Categorías nuevas: ${catsCreated}`);
  console.log(`  Imágenes creadas: ${imgCreated}`);
  console.log("=".repeat(60));

  await ds.destroy();
}

main().catch((err) => {
  console.error("Error en import:", err);
  process.exit(1);
});
