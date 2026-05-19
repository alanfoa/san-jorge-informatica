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
    entities: [join(__dirname, "..", "**", "*.entity.{ts,js}")],
  });

  await ds.initialize();
  console.log("✓ Conectado a la base de datos");

  // Solo crear usuario admin si no existe
  const existing = await ds.query(
    "SELECT id FROM users WHERE email = ?",
    ["admin@sanjorge.com"]
  );

  if (existing.length > 0) {
    console.log("✓ Usuario admin ya existe (email: admin@sanjorge.com)");
  } else {
    const pass = await bcrypt.hash("admin123", 10);
    await ds.query(
      "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)",
      ["Administrador", "admin@sanjorge.com", pass, "admin", 1]
    );
    console.log("✓ Usuario admin creado (email: admin@sanjorge.com / pass: admin123)");
  }

  await ds.destroy();
  console.log("✓ Seed completado");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
