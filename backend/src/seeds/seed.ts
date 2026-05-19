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

  // Eliminar usuario legacy si existe
  await ds.query("DELETE FROM users WHERE email = ?", ["admin@sanjorge.com"]);

  // Solo crear usuario admin si no existe
  const existing = await ds.query(
    "SELECT id FROM users WHERE email = ?",
    ["sanjorgeinf@hotmail.com"]
  );

  if (existing.length > 0) {
    console.log("✓ Usuario admin ya existe (email: sanjorgeinf@hotmail.com)");
  } else {
    const pass = await bcrypt.hash("Academia01", 10);
    await ds.query(
      "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)",
      ["Administrador", "sanjorgeinf@hotmail.com", pass, "admin", 1]
    );
    console.log("✓ Usuario admin creado (email: sanjorgeinf@hotmail.com / pass: Academia01)");
  }

  await ds.destroy();
  console.log("✓ Seed completado");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
