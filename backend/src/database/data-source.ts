import { DataSource } from "typeorm";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const AppDataSource = new DataSource({
  type: "sqljs",
  location: join(__dirname, "..", "..", "data.db"),
  autoSave: true,
  entities: [join(__dirname, "..", "**", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "..", "migrations", "*.{ts,js}")],
  synchronize: false,
});

const action = process.argv[2];
if (action) {
  AppDataSource.initialize()
    .then(async () => {
      switch (action) {
        case "run":
          await AppDataSource.runMigrations();
          console.log("✓ Migraciones ejecutadas");
          break;
        case "revert":
          await AppDataSource.undoLastMigration();
          console.log("✓ Última migración revertida");
          break;
        case "show":
          const pending = await AppDataSource.showMigrations();
          console.log(`Migraciones pendientes: ${pending}`);
          break;
        case "generate":
          await AppDataSource.runMigrations();
          console.log("✓ Migraciones generadas");
          break;
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}
