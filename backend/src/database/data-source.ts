import "dotenv/config";
import { DataSource, type DataSourceOptions } from "typeorm";
import { join } from "path";
import { fileURLToPath } from "url";
import { usePostgres, postgresSsl } from "./typeorm.config.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function cliDataSourceOptions(): DataSourceOptions {
  const entities = [join(__dirname, "..", "**", "*.entity.{ts,js}")];
  const migrations = [join(__dirname, "..", "migrations", "*.{ts,js}")];

  if (usePostgres()) {
    return {
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: postgresSsl(),
      synchronize: false,
      entities,
      migrations,
    };
  }

  return {
    type: "sqljs",
    location: join(__dirname, "..", "..", "data.db"),
    autoSave: true,
    synchronize: false,
    entities,
    migrations,
  };
}

export const AppDataSource = new DataSource(cliDataSourceOptions());

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
        case "show": {
          const pending = await AppDataSource.showMigrations();
          console.log(`Migraciones pendientes: ${pending}`);
          break;
        }
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
