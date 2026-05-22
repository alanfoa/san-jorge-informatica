import type { DataSource } from "typeorm";

export async function ensureProtegidoColumn(ds: DataSource) {
  try {
    await ds.query(
      `ALTER TABLE productos ADD COLUMN protegido BOOLEAN DEFAULT 0`
    );
    console.log("✓ Columna productos.protegido agregada");
  } catch (err: unknown) {
    const msg = String(err instanceof Error ? err.message : err);
    if (!msg.toLowerCase().includes("duplicate") && !msg.includes("already exists")) {
      throw err;
    }
  }
}
