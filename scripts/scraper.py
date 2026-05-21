#!/usr/bin/env python3
"""
Scraper de catálogo para Invid Computers.
Extrae productos de las páginas de categoría del sitemap
y genera backend/seeds/seed-invid.json para importar en la BD del proyecto.
"""

import html as _html
import json
import logging
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.request import Request, urlopen

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

BASE_URL = "https://www.invidcomputers.com"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
REQUEST_DELAY = 1.0  # segundos entre requests (respetar servidor)
DETAIL_DELAY = 0.3  # delay entre páginas de detalle
OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "backend",
    "seeds",
    "seed-invid.json",
)
ENCODING = "iso-8859-1"


def fetch(url: str) -> str:
    """Hacer GET request con encoding correcto del sitio."""
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:
        raw = resp.read()
    return raw.decode(ENCODING, errors="replace")


def parse_sitemap() -> list[dict]:
    """
    Parsea el sitemap.xml y devuelve lista de categorías con su URL base.
    Las categorías tienen el patrón --prod--{id} y NO contienen ---det--.
    """
    logger.info("Descargando sitemap.xml...")
    html = fetch(SITEMAP_URL)

    # Extraer todas las URLs del sitemap
    urls = re.findall(r"<loc>(.*?)</loc>", html)
    logger.info(f"Total URLs en sitemap: {len(urls)}")

    # Clasificar URLs
    categories = []
    for url in urls:
        # Categoría: contiene --prod-- pero NO ---det--
        if "--prod--" in url and "---det--" not in url:
            slug = url.replace(BASE_URL + "/", "").split("--prod--")[0].rstrip("/")
            categories.append({"url": url, "slug": slug})

    logger.info(f"Categorías encontradas: {len(categories)}")
    return categories


def scrape_category(cat_url: str, cat_slug: str) -> list[dict]:
    """Scrapea una página de categoría y devuelve lista de productos."""
    products = []
    offset = 0

    while True:
        if offset == 0:
            page_url = cat_url
        else:
            # Construir URL con paginación
            if "--view--grilla-" in cat_url:
                page_url = re.sub(r"--view--grilla-\d+", f"--view--grilla-{offset}", cat_url)
            else:
                page_url = f"{cat_url}--view--grilla-{offset}"

        try:
            html = fetch(page_url)
        except Exception as e:
            logger.warning(f"Error descargando {page_url}: {e}")
            break

        # Extraer bloques de productos
        # Patrón: <h4><a ... class="titprod" ...>NOMBRE</a></h4>
        # seguido de: <small><span class="size art_cod_precios">SKU</span></small>
        # y: <div class="price">PRECIO</div>
        # e: <img src="IMAGE_URL">

        # Encontrar todos los productos en la página
        # Extraer nombres y URLs de detalle
        product_links = re.findall(
            r'<h4>\s*<a[^>]*href="([^"]*---det--[^"]*)"[^>]*class="titprod"[^>]*>(.*?)</a>\s*</h4>',
            html,
            re.DOTALL,
        )

        if not product_links:
            # Intentar patrón alternativo (class antes de href)
            product_links = re.findall(
                r'<h4>\s*<a[^>]*class="titprod"[^>]*href="([^"]*---det--[^"]*)"[^>]*>(.*?)</a>\s*</h4>',
                html,
                re.DOTALL,
            )

        if not product_links:
            break  # No hay más productos en esta página

        # Extraer imágenes
        images = re.findall(
            r'<img[^>]*src="(https://www\.invidcomputers\.com/thumb/[^"]+)"',
            html,
        )

        # Extraer SKUs
        skus = re.findall(
            r'<span[^>]*class="[^"]*art_cod_precios[^"]*"[^>]*>\s*([0-9]+)\s*</span>',
            html,
        )

        # Extraer precios
        prices = re.findall(
            r'<div[^>]*class="price"[^>]*>(.*?)</div>',
            html,
            re.DOTALL,
        )

        for idx, (detail_url, name) in enumerate(product_links):
            full_url = detail_url if detail_url.startswith("http") else f"{BASE_URL}/{detail_url}"
            img = images[idx] if idx < len(images) else ""
            sku = skus[idx] if idx < len(skus) else ""

            # Limpiar precio (eliminar HTML)
            raw_price = prices[idx] if idx < len(prices) else ""
            price_clean = re.sub(r"<[^>]+>", "", raw_price).strip()

            # Determinar precio numérico si existe
            price_num = None
            if price_clean and price_clean != "Consultar":
                price_match = re.search(r"\$?\s*([\d.,]+)", price_clean)
                if price_match:
                    try:
                        price_num = float(price_match.group(1).replace(".", "").replace(",", "."))
                    except ValueError:
                        pass

            products.append({
                "nombre": name.strip(),
                "descripcion": "",
                "precio": price_num,
                "imagen": img,
                "categoriaSlug": cat_slug,
                "sku": sku,
                "url_origen": full_url,
                "precio_texto": price_clean,
            })

        logger.info(f"  [{cat_slug}] Página offset={offset}: {len(product_links)} productos")

        # Verificar si hay más páginas
        # Si encontramos menos de 20 productos, no hay más páginas
        if len(product_links) < 20:
            break

        offset += 20
        time.sleep(REQUEST_DELAY)

    return products


def scrape_detail(url: str, main_image: str = "") -> tuple[str, list[str]]:
    """Fetches a product detail page and extracts description and extra images."""
    desc = ""
    extra_images = []
    try:
        html = fetch(url)

        # Extraer descripcion del meta tag
        match = re.search(
            r'<meta[^>]*name="Description"[^>]*content="([^"]*)"',
            html,
            re.IGNORECASE,
        )
        if match:
            desc = _html.unescape(match.group(1).strip())

        # Extraer todas las imagenes de la pagina de detalle
        all_imgs = re.findall(
            r'<img[^>]*src="(https://[^"]+)"',
            html,
        )
        # Filtrar: excluir la imagen principal, thumbnails tiny, iconos y logo
        for img_url in all_imgs:
            if img_url == main_image:
                continue
            if "/thumb/" in img_url:
                continue
            if any(x in img_url.lower() for x in ["logo", "icon", "banner", "facebook", "instagram", "whatsapp"]):
                continue
            extra_images.append(img_url)

        extra_images = list(set(extra_images))

    except Exception as e:
        logger.warning(f"  Error obteniendo detalle de {url}: {e}")

    return desc, extra_images


def normalize_slug(slug: str) -> str:
    """Normaliza slug para que coincida con las categorías existentes en la BD."""
    slug_map = {
        "microprocesadores": "procesadores",
        "placas-de-video": "placas-de-video",
        "memorias-ram": "memorias-ram",
        "almacenamiento": "almacenamiento",
        "mothers": "motherboards",
        "fuentes-de-alimentacion": "fuentes",
        "monitores": "monitores",
        "perifericos": "perifericos",
        "gabinetes-y-fuentes": "gabinetes",
        "conectividad": "conectividad",
        "notebooks": "notebooks",
        "impresoras": "impresoras",
        "electrodomesticos": "electrodomesticos",
    }
    return slug_map.get(slug, slug)


def main():
    logger.info("=" * 60)
    logger.info("Scraper Invid Computers — San Jorge Informática")
    logger.info("=" * 60)

    start_time = time.time()

    # 1. Parsear sitemap
    categories = parse_sitemap()

    if not categories:
        logger.error("No se encontraron categorías en el sitemap.")
        sys.exit(1)

    # 2. Scrapear cada categoría
    all_products = []
    seen_names = set()
    skipped = 0

    for i, cat in enumerate(categories, 1):
        slug = normalize_slug(cat["slug"])
        logger.info(f"[{i}/{len(categories)}] Scraping: {slug}")

        try:
            products = scrape_category(cat["url"], cat["slug"])

            # Evitar duplicados por nombre
            new_products = []
            for p in products:
                if p["nombre"] not in seen_names:
                    seen_names.add(p["nombre"])
                    new_products.append(p)
                else:
                    skipped += 1

            all_products.extend(new_products)
            logger.info(f"  → {len(new_products)} productos nuevos (total: {len(all_products)})")

        except Exception as e:
            logger.error(f"  Error en {cat['slug']}: {e}")

        # Delay entre categorías
        if i < len(categories):
            time.sleep(REQUEST_DELAY)

    # 3. Obtener descripciones e imágenes adicionales de las páginas de detalle
    logger.info("Obteniendo descripciones e imágenes de productos...")
    desc_count = 0
    img_count = 0
    for i, p in enumerate(all_products, 1):
        desc, extra_imgs = scrape_detail(p["url_origen"], p.get("imagen", ""))
        if desc:
            p["descripcion"] = desc
            desc_count += 1
        if extra_imgs:
            p["imagenes_extra"] = extra_imgs
            img_count += len(extra_imgs)
        if i % 50 == 0 or i == len(all_products):
            logger.info(f"  Procesados: {i}/{len(all_products)} (desc: {desc_count}, imgs extra: {img_count})")
        if i < len(all_products):
            time.sleep(DETAIL_DELAY)

    logger.info(f"Descripciones obtenidas: {desc_count}, imágenes extra: {img_count}")

    # 4. Guardar resultado
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    output = {
        "generado": datetime.now().isoformat(),
        "total_productos": len(all_products),
        "categorias": len(set(p["categoriaSlug"] for p in all_products)),
        "skipped_duplicates": skipped,
        "productos": all_products,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    elapsed = time.time() - start_time
    logger.info("=" * 60)
    logger.info(f"Completado en {elapsed:.1f}s")
    logger.info(f"Productos extraídos: {len(all_products)}")
    logger.info(f"Categorías: {output['categorias']}")
    logger.info(f"Duplicados omitidos: {skipped}")
    logger.info(f"Archivo guardado: {OUTPUT_PATH}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
