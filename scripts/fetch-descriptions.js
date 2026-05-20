const fs = require('fs')
const path = require('path')

const JSON_PATH = path.join(__dirname, '..', 'backend', 'seeds', 'seed-invid.json')
const DELAY = 200
const SAVE_EVERY = 50

async function get(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  const buf = await resp.arrayBuffer()
  return Buffer.from(buf).toString('latin1')
}

function extractDescription(html) {
  const match = html.match(/<meta[^>]*name="Description"[^>]*content="([^"]*)"/i)
  if (!match) return ''
  return match[1]
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .trim()
}

async function main() {
  console.log('='.repeat(60))
  console.log('Fetch de descripciones — San Jorge Informática')
  console.log('='.repeat(60))

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`ERROR: No existe ${JSON_PATH}`)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'))
  const productos = raw.productos
  console.log(`Productos en JSON: ${productos.length}`)

  let descCount = 0
  let errorCount = 0

  for (let i = 0; i < productos.length; i++) {
    const p = productos[i]
    if (p.descripcion) continue
    const url = p.url_origen
    if (!url) continue

    try {
      const html = await get(url)
      const desc = extractDescription(html)
      if (desc) {
        p.descripcion = desc
        descCount++
      }
    } catch (e) {
      errorCount++
      if (errorCount <= 5) {
        console.error(`  Error #${i + 1}: ${e.message}`)
      }
    }

    if ((i + 1) % SAVE_EVERY === 0 || i === productos.length - 1) {
      const pct = ((i + 1) / productos.length * 100).toFixed(1)
      console.log(`  ${i + 1}/${productos.length} (${pct}%) — ${descCount} obtenidas, ${errorCount} errores`)
      raw.generado = new Date().toISOString()
      fs.writeFileSync(JSON_PATH, JSON.stringify(raw, null, 2), 'utf-8')
    }

    if (i < productos.length - 1) {
      await new Promise(r => setTimeout(r, DELAY))
    }
  }

  console.log('='.repeat(60))
  console.log(`Completado: ${descCount}/${productos.length} descripciones obtenidas`)
  console.log(`Errores: ${errorCount}`)
  console.log(`Archivo: ${JSON_PATH}`)
  console.log('='.repeat(60))
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
