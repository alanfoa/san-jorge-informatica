# Plan: Scrapear specs reales de Invid

## Problema
SKU y URL Invid se guardan como Caracteristicas y se muestran en "Especificaciones" del frontend. No son specs reales.

## Solución
Scrapear la tabla de specs de cada página de detalle de Invid e importarlas como Caracteristicas legítimas.

---

## Fase 1 — scripts/scraper.py

1.1 Agregar import de beautifulsoup4 (ya está en requirements).

1.2 Nueva función scrape_specs(url) que:
   - Fetch ea página de detalle
   - Parsear con BeautifulSoup la tabla en #Descripción table
   - Extraer pares nombre/valor
   - Devolver [{nombre, valor}]

1.3 Segunda pasada — después del scraping de listing, enriquecer cada producto:
   - Por cada producto, si tiene url_origen, llamar scrape_specs()
   - Rate limit 1s
   - Checkpoint cada 100 productos (guardado parcial)

1.4 Output JSON ahora incluye caracteristicas por producto.

Tiempo extra estimado: ~16 min (939 × 1s).

## Fase 2 — backend/src/seeds/import-invid.ts

2.1 Antes de empezar la importación, limpiar Caracteristicas viejas con nombre SKU o URL Invid.
2.2 Dejar de crear Caracteristica para p.sku y p.url_origen.
2.3 Importar specs reales de p.caracteristicas como Caracteristica.

## Fase 3 — frontend/src/pages/ProductoPage.tsx

Filtro de seguridad:
```tsx
caracteristicas.filter(c => c.nombre !== 'SKU' && c.nombre !== 'URL Invid')
```

## Fase 4 — Ejecución

```bash
python3 scripts/scraper.py      # ~41 min (25 listing + 16 specs)
cd backend && npm run sync      # reimportar
cd frontend && npm run dev      # verificar
```

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| scripts/scraper.py | + scrape_specs(), segunda pasada con checkpoint, + BeautifulSoup |
| backend/src/seeds/import-invid.ts | limpiar SKU/URL viejos, no crearlos, importar specs reales |
| frontend/src/pages/ProductoPage.tsx | + filter en características |
