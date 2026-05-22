import "reflect-metadata";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { User } from "../modules/users/entities/user.entity.js";
import { createSeedDataSource } from "../database/create-data-source.js";
import { usePostgres } from "../database/typeorm.config.js";
import { ensureProtegidoColumn } from "./ensure-schema.js";

async function seed() {
  const ds = createSeedDataSource();

  await ds.initialize();
  if (!usePostgres()) {
    await ensureProtegidoColumn(ds);
  }
  console.log(`✓ Conectado (${usePostgres() ? "PostgreSQL" : "SQLite"})`);

  const userRepo = ds.getRepository(User);

  await userRepo.delete({ email: "admin@sanjorge.com" });

  const existing = await userRepo.findOne({
    where: { email: "sanjorgeinf@hotmail.com" },
  });

  if (existing) {
    console.log("✓ Usuario admin ya existe (email: sanjorgeinf@hotmail.com)");
  } else {
    const adminPassword = process.env.ADMIN_PASSWORD || "Academia01";
    const pass = await bcrypt.hash(adminPassword, 12);
    await userRepo.save(
      userRepo.create({
        nombre: "Administrador",
        email: "sanjorgeinf@hotmail.com",
        password: pass,
        rol: "admin",
        activo: true,
      })
    );
    console.log("✓ Usuario admin creado");
  }

  await ds.destroy();
  console.log("✓ Seed completado");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
