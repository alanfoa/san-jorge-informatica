import "reflect-metadata";
import { DataSource } from "typeorm";
import { join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { writeFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DB_PATH = join(__dirname, "..", "data.db");

async function main() {
  const ds = new DataSource({
    type: "sqljs",
    location: DB_PATH,
    autoSave: false,
    synchronize: false,
    entities: [],
  });

  await ds.initialize();

  // Create users table if not exists
  await ds.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre VARCHAR NOT NULL,
      email VARCHAR NOT NULL UNIQUE,
      password VARCHAR NOT NULL,
      rol VARCHAR NOT NULL,
      activo BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Check if users already exist
  const count = await ds.query("SELECT COUNT(*) as c FROM users");
  if (count[0].c > 0) {
    console.log(`Ya hay ${count[0].c} usuarios`);
    await ds.destroy();
    return;
  }

  // Create users
  const adminPass = await bcrypt.hash("admin123", 10);
  const editorPass = await bcrypt.hash("editor123", 10);

  await ds.query(
    "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, 1)",
    ["Administrador", "admin@sanjorge.com", adminPass, "admin"]
  );
  await ds.query(
    "INSERT INTO users (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, 1)",
    ["Editor", "editor@sanjorge.com", editorPass, "editor"]
  );

  // Export and save
  const driver = ds.driver as any;
  const data = driver.database.export();
  writeFileSync(DB_PATH, Buffer.from(data));

  console.log("✓ 2 usuarios creados");
  await ds.destroy();
}

main().catch(console.error);
