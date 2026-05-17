import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data.db");

const SQL = await initSqlJs();

let sqlite: SQL.Database;
if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  sqlite = new SQL.Database(buffer);
} else {
  sqlite = new SQL.Database();
}

sqlite.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    precio REAL NOT NULL,
    imagen TEXT NOT NULL DEFAULT '',
    categoria TEXT NOT NULL DEFAULT 'general',
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT ''
  )
`);

const existing = sqlite.exec("SELECT COUNT(*) as count FROM productos");
const count = existing.length > 0 ? (existing[0].values[0][0] as number) : 0;

if (count === 0) {
  const now = new Date().toISOString();
  const productos: [string, string, number, string, string][] = [
    ["Procesador Intel Core i5-14600K", "Procesador de 14ª generación, 14 núcleos, 20 hilos, hasta 5.3 GHz. Ideal para gaming y productividad.", 389999, "https://http2.mlstatic.com/D_NQ_NP_2X_609924-MLA78117720452_082024-F.webp", "procesadores"],
    ["Procesador AMD Ryzen 7 7800X3D", "Procesador con tecnología 3D V-Cache, 8 núcleos, 16 hilos, óptimo para gaming.", 449999, "https://http2.mlstatic.com/D_NQ_NP_2X_672138-MLU72686715660_112023-F.webp", "procesadores"],
    ["Placa de Video NVIDIA RTX 4060 8GB", "Placa gráfica NVIDIA GeForce RTX 4060 con 8GB GDDR6.", 429999, "https://http2.mlstatic.com/D_NQ_NP_2X_643533-MLA78141396995_082024-F.webp", "placas-de-video"],
    ["Placa de Video AMD Radeon RX 7600 8GB", "Placa gráfica AMD Radeon RX 7600 con 8GB GDDR6.", 359999, "https://http2.mlstatic.com/D_NQ_NP_2X_626251-MLU75592921252_042024-F.webp", "placas-de-video"],
    ["Memoria RAM DDR5 32GB (2x16GB) 5600MHz", "Kit de 2 memorias DDR5 de 16GB, 5600MHz.", 129999, "https://http2.mlstatic.com/D_NQ_NP_2X_946192-MLA78121808432_082024-F.webp", "memorias-ram"],
    ["Memoria RAM DDR4 16GB 3200MHz", "Memoria DDR4 de 16GB, 3200MHz.", 54999, "https://http2.mlstatic.com/D_NQ_NP_2X_650138-MLU75664172720_042024-F.webp", "memorias-ram"],
    ["SSD NVMe M.2 1TB Kingston", "SSD NVMe M.2, velocidades de lectura hasta 3500MB/s.", 89999, "https://http2.mlstatic.com/D_NQ_NP_2X_845544-MLA78122416057_082024-F.webp", "almacenamiento"],
    ["SSD 2TB SATA III Samsung 870 EVO", "SSD SATA III de 2TB. Ideal para almacenamiento masivo.", 179999, "https://http2.mlstatic.com/D_NQ_NP_2X_724197-MLU77163603480_062024-F.webp", "almacenamiento"],
    ["Motherboard ASUS ROG STRIX B760-F", "Placa madre LGA1700, DDR5, WiFi 6E. Ideal para Intel 12°-14° gen.", 279999, "https://http2.mlstatic.com/D_NQ_NP_2X_603171-MLA78121384622_082024-F.webp", "motherboards"],
    ["Fuente 750W 80+ Gold Corsair RM750x", "Fuente modular 750W 80+ Gold. Silenciosa y eficiente.", 159999, "https://http2.mlstatic.com/D_NQ_NP_2X_698525-MLA78121888108_082024-F.webp", "fuentes"],
    ["Monitor 27\" 4K IPS LG 27UL850-W", "Monitor 27\" 4K, panel IPS, HDR10, USB-C 60W.", 499999, "https://http2.mlstatic.com/D_NQ_NP_2X_620157-MLA78123930742_082024-F.webp", "monitores"],
    ["Teclado Mecánico Redragon Kumara K552", "Teclado mecánico compacto TKL, switches Outemu Blue.", 39999, "https://http2.mlstatic.com/D_NQ_NP_2X_931757-MLU76249562223_052024-F.webp", "perifericos"],
    ["Mouse Logitech G502 Hero", "Mouse gaming sensor HERO 25K, 11 botones, peso ajustable.", 64999, "https://http2.mlstatic.com/D_NQ_NP_2X_727343-MLA78123456352_082024-F.webp", "perifericos"],
    ["Auriculares HyperX Cloud II", "Auriculares gaming sonido 7.1 virtual, micrófono desmontable.", 79999, "https://http2.mlstatic.com/D_NQ_NP_2X_675854-MLA78122015454_082024-F.webp", "perifericos"],
    ["Gabinete NZXT H5 Flow", "Gabinete ATX flujo de aire optimizado, vidrio templado, 2 ventiladores.", 129999, "https://http2.mlstatic.com/D_NQ_NP_2X_791463-MLU74275180328_022024-F.webp", "gabinetes"],
    ["Hub USB-C 7 en 1", "Hub multipuerto USB-C con HDMI 4K, 3x USB-A, lector SD.", 34999, "https://http2.mlstatic.com/D_NQ_NP_2X_770222-MLU74693675405_032024-F.webp", "perifericos"],
  ];

  const stmt = sqlite.prepare(`
    INSERT INTO productos (nombre, descripcion, precio, imagen, categoria, activo, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
  `);

  for (const [nombre, desc, precio, imagen, cat] of productos) {
    stmt.bind([nombre, desc, precio, imagen, cat, now, now]);
    stmt.run();
  }
  stmt.free();

  const data = sqlite.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log(`✓ Insertados ${productos.length} productos de ejemplo`);
} else {
  console.log(`→ La BD ya tiene ${count} productos`);
}

sqlite.close();
