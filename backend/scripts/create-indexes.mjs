import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const sqls = [
  `CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);`,
  `CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON public.productos("categoriaId");`,
  `CREATE INDEX IF NOT EXISTS idx_productos_created_at ON public.productos(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_productos_sku ON public.productos(sku);`,
  `CREATE INDEX IF NOT EXISTS idx_producto_imagenes_producto_id ON public.producto_imagenes("productoId");`,
  `CREATE INDEX IF NOT EXISTS idx_caracteristicas_producto_id ON public.caracteristicas("productoId");`,
];

async function run() {
  await client.connect();
  console.log("Conectado a PostgreSQL\n");
  for (const sql of sqls) {
    try {
      await client.query(sql);
      console.log(`  OK  ${sql.trim().slice(0, 70)}`);
    } catch (err) {
      console.log(`  ERR ${sql.trim().slice(0, 70)}`);
      console.error(`      ${err.message}`);
    }
  }
  await client.end();
  console.log("\nÍndices creados correctamente.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
