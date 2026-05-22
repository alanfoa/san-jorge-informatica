import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Categoria } from "../categorias/entities/categoria.entity.js";
import {
  Producto,
  ProductoImagen,
} from "../productos/entities/producto.entity.js";
const BASE_URL = "https://www.invidcomputers.com";
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const REQUEST_DELAY = 1000;
const DETAIL_DELAY = 300;

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

const BANNED_WORDS = ["Kelyx", "Invid Computers"];

interface InvidProductRaw {
  nombre: string;
  descripcion: string;
  precio: number | null;
  imagen: string;
  categoriaSlug: string;
  sku: string;
  url_origen: string;
  precio_texto: string;
  imagenes_extra?: string[];
  caracteristicas?: { nombre: string; valor: string }[];
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(@InjectDataSource() private ds: DataSource) {}

  async syncFromInvid(): Promise<{
    created: number;
    updated: number;
    skipped: number;
    categories: number;
    scraped: number;
    message: string;
    duration: string;
  }> {
    const start = Date.now();

    this.logger.log("=== Iniciando sync desde Invid ===");

    // 1. Scrapear
    const productos = await this.scrapeAll();
    this.logger.log(`Productos scrapeados: ${productos.length}`);

    // 2. Importar a la BD
    const result = await this.importProducts(productos);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    return {
      ...result,
      scraped: productos.length,
      message: `Sync completado en ${elapsed}s: ${result.created} creados, ${result.updated} actualizados, ${result.skipped} omitidos`,
      duration: `${elapsed}s`,
    };
  }

  // ─── SCRAPER ────────────────────────────────────────

  private async fetch(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(30000),
    });
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    return decoder.decode(buffer);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private async scrapeAll(): Promise<InvidProductRaw[]> {
    const sitemapHtml = await this.fetch(SITEMAP_URL);

    const urlMatches = sitemapHtml.matchAll(/<loc>(.*?)<\/loc>/g);
    const allUrls = [...urlMatches].map((m) => m[1]);

    const categories = allUrls
      .filter((url) => url.includes("--prod--") && !url.includes("---det--"))
      .map((url) => {
        const slug = url.replace(BASE_URL + "/", "").split("--prod--")[0].replace(/\/$/, "");
        return { url, slug };
      });

    this.logger.log(`Categorías encontradas: ${categories.length}`);

    const allProducts: InvidProductRaw[] = [];
    const seenNames = new Set<string>();

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const normSlug = this.normalizeSlug(cat.slug);
      this.logger.log(`[${i + 1}/${categories.length}] ${normSlug}`);

      try {
        const products = await this.scrapeCategory(cat.url, cat.slug);

        for (const p of products) {
          if (!seenNames.has(p.nombre)) {
            seenNames.add(p.nombre);
            allProducts.push(p);
          }
        }

        this.logger.log(`  → ${products.length} productos`);
      } catch (err) {
        this.logger.warn(`  Error en ${cat.slug}: ${err}`);
      }

      if (i < categories.length - 1) {
        await this.sleep(REQUEST_DELAY);
      }
    }

    this.logger.log(`Obteniendo descripciones...`);
    let descCount = 0;
    for (let i = 0; i < allProducts.length; i++) {
      const p = allProducts[i];
      try {
        const { descripcion, imagenesExtra } = await this.scrapeDetail(p.url_origen, p.imagen);
        if (descripcion) {
          p.descripcion = descripcion;
          descCount++;
        }
        if (imagenesExtra.length > 0) {
          p.imagenes_extra = imagenesExtra;
        }
      } catch {
        // ignore
      }
      if ((i + 1) % 50 === 0 || i === allProducts.length - 1) {
        this.logger.log(`  Detalles: ${i + 1}/${allProducts.length} (desc: ${descCount})`);
      }
      if (i < allProducts.length - 1) {
        await this.sleep(DETAIL_DELAY);
      }
    }

    return allProducts;
  }

  private async scrapeCategory(catUrl: string, catSlug: string): Promise<InvidProductRaw[]> {
    const products: InvidProductRaw[] = [];
    let offset = 0;

    while (true) {
      let pageUrl: string;
      if (offset === 0) {
        pageUrl = catUrl;
      } else {
        pageUrl = catUrl.includes("--view--grilla-")
          ? catUrl.replace(/--view--grilla-\d+/, `--view--grilla-${offset}`)
          : `${catUrl}--view--grilla-${offset}`;
      }

      let html: string;
      try {
        html = await this.fetch(pageUrl);
      } catch {
        break;
      }

      const productLinks = this.extractProductLinks(html);
      if (productLinks.length === 0) break;

      const images = [...html.matchAll(/<img[^>]*src="(https:\/\/www\.invidcomputers\.com\/thumb\/[^"]+)"/g)].map((m) => m[1]);
      const skus = [...html.matchAll(/<span[^>]*class="[^"]*art_cod_precios[^"]*"[^>]*>\s*([0-9]+)\s*<\/span>/g)].map((m) => m[1]);
      const prices = [...html.matchAll(/<div[^>]*class="price"[^>]*>(.*?)<\/div>/gs)].map((m) => {
        const clean = m[1].replace(/<[^>]+>/g, "").trim();
        return clean;
      });

      for (let idx = 0; idx < productLinks.length; idx++) {
        const [detailUrl, name] = productLinks[idx];
        const fullUrl = detailUrl.startsWith("http") ? detailUrl : `${BASE_URL}/${detailUrl}`;
        const img = images[idx] || "";
        const sku = skus[idx] || "";
        const rawPrice = prices[idx] || "";

        let priceNum: number | null = null;
        if (rawPrice && rawPrice !== "Consultar") {
          const m = rawPrice.match(/\$?\s*([\d.,]+)/);
          if (m) {
            const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
            if (!isNaN(num)) priceNum = num;
          }
        }

        products.push({
          nombre: name.trim(),
          descripcion: "",
          precio: priceNum,
          imagen: img,
          categoriaSlug: catSlug,
          sku,
          url_origen: fullUrl,
          precio_texto: rawPrice,
        });
      }

      this.logger.log(`  [${catSlug}] offset=${offset}: ${productLinks.length} productos`);

      if (productLinks.length < 20) break;
      offset += 20;
      await this.sleep(REQUEST_DELAY);
    }

    return products;
  }

  private extractProductLinks(html: string): [string, string][] {
    let matches = [...html.matchAll(/<h4>\s*<a[^>]*href="([^"]*---det--[^"]*)"[^>]*class="titprod"[^>]*>(.*?)<\/a>\s*<\/h4>/gs)];
    if (matches.length === 0) {
      matches = [...html.matchAll(/<h4>\s*<a[^>]*class="titprod"[^>]*href="([^"]*---det--[^"]*)"[^>]*>(.*?)<\/a>\s*<\/h4>/gs)];
    }
    return matches.map((m) => [m[1], m[2]]);
  }

  private async scrapeDetail(url: string, mainImage: string): Promise<{ descripcion: string; imagenesExtra: string[] }> {
    let html: string;
    try {
      html = await this.fetch(url);
    } catch {
      return { descripcion: "", imagenesExtra: [] };
    }

    let desc = "";
    const metaMatch = html.match(/<meta[^>]*name="Description"[^>]*content="([^"]*)"/i);
    if (metaMatch) {
      desc = metaMatch[1].trim();
    }

    const allImgs = [...html.matchAll(/<img[^>]*src="(https:\/\/[^"]+)"/g)].map((m) => m[1]);
    const extra: string[] = [];
    for (const imgUrl of allImgs) {
      if (imgUrl === mainImage) continue;
      if (imgUrl.includes("/thumb/")) continue;
      const lower = imgUrl.toLowerCase();
      if (["logo", "icon", "banner", "facebook", "instagram", "whatsapp"].some((x) => lower.includes(x))) continue;
      extra.push(imgUrl);
    }

    return { descripcion: desc, imagenesExtra: [...new Set(extra)] };
  }

  private normalizeSlug(slug: string): string {
    return SLUG_MAP[slug] || slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }

  // ─── IMPORTADOR ─────────────────────────────────────

  private async importProducts(productos: InvidProductRaw[]) {
    const catRepo = this.ds.getRepository(Categoria);
    const prodRepo = this.ds.getRepository(Producto);
    const imgRepo = this.ds.getRepository(ProductoImagen);

    // Limpiar caracteristicas internas viejas
    await this.ds
      .createQueryBuilder()
      .delete()
      .from("caracteristicas")
      .where("nombre IN ('SKU', 'URL Origen', 'URL Invid')")
      .execute();

    // Categorías
    const existingCats = await catRepo.find();
    const existingSlugMap = new Map(existingCats.map((c) => [c.slug.toLowerCase(), c.id]));

    const uniqueSlugs = new Map<string, string>();
    for (const p of productos) {
      const norm = this.normalizeSlug(p.categoriaSlug);
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
        const nombre = normSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        const cat = catRepo.create({
          nombre,
          slug: normSlug,
          descripcion: `Productos de ${nombre.toLowerCase()}`,
          imagen: "",
        });
        const saved = await catRepo.save(cat);
        slugToId.set(normSlug, saved.id);
        catsCreated++;
        this.logger.log(`  + Categoría creada: ${nombre} (id=${saved.id})`);
      }
    }

    this.logger.log(`Categorías: ${catsCreated} creadas, ${existingCats.length} existentes`);

    // Importar productos
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let imgCreated = 0;

    for (const p of productos) {
      const normSlug = this.normalizeSlug(p.categoriaSlug);
      const catId = slugToId.get(normSlug);
      if (catId === undefined) {
        skipped++;
        continue;
      }

      const nombreSanitizado = this.sanitizeNombre(p.nombre);
      const descripcionSanitizada = this.sanitizeDescripcion(p.descripcion || "");

      const existing = p.sku
        ? await prodRepo.findOne({ where: { sku: p.sku } })
        : await prodRepo.findOne({ where: { nombre: nombreSanitizado } });

      if (existing) {
        if (existing.protegido || !existing.sku) {
          skipped++;
          continue;
        }

        let changed = false;
        if (p.imagen && existing.imagen !== p.imagen) {
          existing.imagen = p.imagen;
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

      const prod = new Producto();
      prod.nombre = nombreSanitizado;
      prod.descripcion = descripcionSanitizada;
      prod.sku = p.sku || "";
      prod.precio = p.precio || 0;
      prod.imagen = p.imagen || "";
      prod.activo = true;
      prod.destacado = false;
      prod.stock = 0;
      prod.protegido = false;
      prod.categoriaId = catId;

      const saved = await prodRepo.save(prod);

      if (p.imagen) {
        const img = new ProductoImagen();
        img.url = p.imagen;
        img.orden = 0;
        img.productoId = saved.id;
        await imgRepo.save(img);
        imgCreated++;
      }

      if (p.imagenes_extra && Array.isArray(p.imagenes_extra)) {
        for (const imgUrl of p.imagenes_extra) {
          const img = new ProductoImagen();
          img.url = imgUrl;
          img.orden = 1;
          img.productoId = saved.id;
          await imgRepo.save(img);
          imgCreated++;
        }
      }

      created++;
    }

    this.logger.log(`Importación: ${created} creados, ${updated} actualizados, ${skipped} omitidos`);

    return { created, updated, skipped, categories: catsCreated };
  }

  private sanitizeNombre(nombre: string): string {
    let res = nombre;
    for (const word of BANNED_WORDS) {
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      res = res.replace(regex, "");
    }
    res = res.replace(/\s*\(\d+\)\s*$/, "");
    return res.replace(/\s+/g, " ").trim();
  }

  private sanitizeDescripcion(descripcion: string): string {
    let res = descripcion;
    for (const word of BANNED_WORDS) {
      const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      res = res.replace(regex, "");
    }
    return res;
  }
}
