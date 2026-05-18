import "reflect-metadata";
import { DataSource } from "typeorm";
import { join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function seed() {
  const ds = new DataSource({
    type: "sqljs",
    location: join(__dirname, "..", "..", "data.db"),
    autoSave: true,
    synchronize: true,
    entities: [join(__dirname, "..", "**", "*.entity.js")],
  });

  await ds.initialize();
  console.log("✓ Conectado a la base de datos");

  // Clean existing data
  await ds.query("DELETE FROM caracteristicas");
  await ds.query("DELETE FROM producto_imagenes");
  await ds.query("DELETE FROM productos");
  await ds.query("DELETE FROM categorias");
  await ds.query("DELETE FROM users");
  await ds.query("DELETE FROM sqlite_sequence"); // Reset autoincrement

  // ── Users ──
  const adminPass = await bcrypt.hash("admin123", 10);
  const editorPass = await bcrypt.hash("editor123", 10);
  await ds.query(
    "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)",
    ["Administrador", "admin@sanjorge.com", adminPass, "admin", 1]
  );
  await ds.query(
    "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)",
    ["Editor", "editor@sanjorge.com", editorPass, "editor", 1]
  );
  console.log("✓ Usuarios creados");

  // ── Categories ──
  const cats = [
    ["Procesadores", "procesadores", "Procesadores Intel y AMD", ""],
    ["Placas de Video", "placas-de-video", "NVIDIA GeForce y AMD Radeon", ""],
    ["Memorias RAM", "memorias-ram", "DDR4 y DDR5", ""],
    ["Almacenamiento", "almacenamiento", "SSD NVMe, SATA y HDD", ""],
    ["Motherboards", "motherboards", "Placas madre Intel y AMD", ""],
    ["Fuentes de Poder", "fuentes", "Fuentes certificadas 80+", ""],
    ["Monitores", "monitores", "Monitores gaming y profesionales", ""],
    ["Periféricos", "perifericos", "Teclados, mouses, auriculares", ""],
    ["Gabinetes", "gabinetes", "Gabinetes ATX y Micro-ATX", ""],
  ];

  for (const [nombre, slug, desc, img] of cats) {
    await ds.query(
      "INSERT INTO categorias (nombre, slug, descripcion, imagen) VALUES (?, ?, ?, ?)",
      [nombre, slug, desc, img]
    );
  }
  console.log("✓ Categorías creadas");

  // ── Products ──
  interface ProdSeed {
    nombre: string;
    desc: string;
    precio: number;
    img: string;
    catSlug: string;
    destacado: boolean;
    caracteristicas?: { nombre: string; valor: string }[];
  }

  const prods: ProdSeed[] = [
    {
      nombre: "Procesador Intel Core i5-14600K",
      desc: "Procesador de 14ª generación, 14 núcleos, 20 hilos, hasta 5.3 GHz. Ideal para gaming y productividad.",
      precio: 389999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_609924-MLA78117720452_082024-F.webp",
      catSlug: "procesadores",
      destacado: true,
      caracteristicas: [
        { nombre: "Núcleos", valor: "14 (6P + 8E)" },
        { nombre: "Hilos", valor: "20" },
        { nombre: "Frecuencia Max", valor: "5.3 GHz" },
        { nombre: "Socket", valor: "LGA1700" },
      ],
    },
    {
      nombre: "Procesador AMD Ryzen 7 7800X3D",
      desc: "Procesador con tecnología 3D V-Cache, 8 núcleos, 16 hilos, óptimo para gaming.",
      precio: 449999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_672138-MLU72686715660_112023-F.webp",
      catSlug: "procesadores",
      destacado: true,
      caracteristicas: [
        { nombre: "Núcleos", valor: "8" },
        { nombre: "Hilos", valor: "16" },
        { nombre: "Frecuencia Max", valor: "5.0 GHz" },
        { nombre: "Socket", valor: "AM5" },
      ],
    },
    {
      nombre: "Placa de Video NVIDIA RTX 4060 8GB",
      desc: "Placa gráfica NVIDIA GeForce RTX 4060 con 8GB GDDR6.",
      precio: 429999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_643533-MLA78141396995_082024-F.webp",
      catSlug: "placas-de-video",
      destacado: true,
    },
    {
      nombre: "Placa de Video AMD Radeon RX 7600 8GB",
      desc: "Placa gráfica AMD Radeon RX 7600 con 8GB GDDR6.",
      precio: 359999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_626251-MLU75592921252_042024-F.webp",
      catSlug: "placas-de-video",
      destacado: false,
    },
    {
      nombre: "Memoria RAM DDR5 32GB (2x16GB) 5600MHz",
      desc: "Kit de 2 memorias DDR5 de 16GB, 5600MHz.",
      precio: 129999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_946192-MLA78121808432_082024-F.webp",
      catSlug: "memorias-ram",
      destacado: true,
    },
    {
      nombre: "Memoria RAM DDR4 16GB 3200MHz",
      desc: "Memoria DDR4 de 16GB, 3200MHz.",
      precio: 54999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_650138-MLU75664172720_042024-F.webp",
      catSlug: "memorias-ram",
      destacado: false,
    },
    {
      nombre: "SSD NVMe M.2 1TB Kingston",
      desc: "SSD NVMe M.2, velocidades de lectura hasta 3500MB/s.",
      precio: 89999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_845544-MLA78122416057_082024-F.webp",
      catSlug: "almacenamiento",
      destacado: true,
    },
    {
      nombre: "SSD 2TB SATA III Samsung 870 EVO",
      desc: "SSD SATA III de 2TB. Ideal para almacenamiento masivo.",
      precio: 179999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_724197-MLU77163603480_062024-F.webp",
      catSlug: "almacenamiento",
      destacado: false,
    },
    {
      nombre: "Motherboard ASUS ROG STRIX B760-F",
      desc: "Placa madre LGA1700, DDR5, WiFi 6E. Ideal para Intel 12°-14° gen.",
      precio: 279999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_603171-MLA78121384622_082024-F.webp",
      catSlug: "motherboards",
      destacado: true,
    },
    {
      nombre: "Fuente 750W 80+ Gold Corsair RM750x",
      desc: "Fuente modular 750W 80+ Gold. Silenciosa y eficiente.",
      precio: 159999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_698525-MLA78121888108_082024-F.webp",
      catSlug: "fuentes",
      destacado: true,
    },
    {
      nombre: 'Monitor 27" 4K IPS LG 27UL850-W',
      desc: 'Monitor 27" 4K, panel IPS, HDR10, USB-C 60W.',
      precio: 499999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_620157-MLA78123930742_082024-F.webp",
      catSlug: "monitores",
      destacado: true,
    },
    {
      nombre: "Teclado Mecánico Redragon Kumara K552",
      desc: "Teclado mecánico compacto TKL, switches Outemu Blue.",
      precio: 39999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_931757-MLU76249562223_052024-F.webp",
      catSlug: "perifericos",
      destacado: false,
    },
    {
      nombre: "Mouse Logitech G502 Hero",
      desc: "Mouse gaming sensor HERO 25K, 11 botones, peso ajustable.",
      precio: 64999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_727343-MLA78123456352_082024-F.webp",
      catSlug: "perifericos",
      destacado: true,
    },
    {
      nombre: "Auriculares HyperX Cloud II",
      desc: "Auriculares gaming sonido 7.1 virtual, micrófono desmontable.",
      precio: 79999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_675854-MLA78122015454_082024-F.webp",
      catSlug: "perifericos",
      destacado: false,
    },
    {
      nombre: "Gabinete NZXT H5 Flow",
      desc: "Gabinete ATX flujo de aire optimizado, vidrio templado, 2 ventiladores.",
      precio: 129999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_791463-MLU74275180328_022024-F.webp",
      catSlug: "gabinetes",
      destacado: true,
    },
    {
      nombre: "Hub USB-C 7 en 1",
      desc: "Hub multipuerto USB-C con HDMI 4K, 3x USB-A, lector SD.",
      precio: 34999,
      img: "https://http2.mlstatic.com/D_NQ_NP_2X_770222-MLU74693675405_032024-F.webp",
      catSlug: "perifericos",
      destacado: false,
    },
  ];

  // Get category IDs
  const catRows = await ds.query("SELECT id, slug FROM categorias") as { id: number; slug: string }[];
  const catMap = new Map(catRows.map((c) => [c.slug, c.id]));

  for (const p of prods) {
    const catId = catMap.get(p.catSlug);
    if (!catId) {
      console.warn(`  ! Categoría '${p.catSlug}' no encontrada, saltando '${p.nombre}'`);
      continue;
    }

    const r = await ds.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen, categoriaId, activo, destacado, stock)
       VALUES (?, ?, ?, ?, ?, 1, ?, 10)`,
      [p.nombre, p.desc, p.precio, p.img, catId, p.destacado ? 1 : 0]
    );

    // Get inserted ID via sql.js last_insert_rowid
    const idRows = await ds.query("SELECT last_insert_rowid() as id") as { id: number }[];
    const prodId = idRows[0]?.id;
    if (!prodId) continue;

    // Insert characteristics
    if (p.caracteristicas) {
      for (const c of p.caracteristicas) {
        await ds.query(
          "INSERT INTO caracteristicas (nombre, valor, productoId) VALUES (?, ?, ?)",
          [c.nombre, c.valor, prodId]
        );
      }
    }
  }

  console.log(`✓ ${prods.length} productos creados con características`);

  await ds.destroy();
  console.log("✓ Seed completado");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
