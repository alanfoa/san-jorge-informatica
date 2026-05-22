import { join } from "path";
import { fileURLToPath } from "url";
import type { DataSourceOptions } from "typeorm";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..", "..");

export function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function postgresSsl():
  | { rejectUnauthorized: boolean }
  | undefined {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("supabase.co") || url.includes("sslmode=require")) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

/** NestJS AppModule (soporta autoLoadEntities) */
export function getTypeOrmModuleOptions(): Record<string, unknown> {
  if (usePostgres()) {
    return {
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: postgresSsl(),
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNC !== "false",
    };
  }

  return {
    type: "sqljs",
    location: join(ROOT, "data.db"),
    autoSave: true,
    autoLoadEntities: true,
    synchronize: false,
  };
}

/** Scripts de seed / sync / backup */
export function getSeedDataSourceOptions(
  entities: DataSourceOptions["entities"]
): DataSourceOptions {
  if (usePostgres()) {
    return {
      type: "postgres",
      url: process.env.DATABASE_URL,
      ssl: postgresSsl(),
      entities,
      synchronize: true,
    };
  }

  return {
    type: "sqljs",
    location: join(ROOT, "data.db"),
    autoSave: true,
    entities,
    synchronize: true,
  };
}

export function getEntityGlob(): string {
  return join(__dirname, "..", "**", "*.entity.{ts,js}");
}

/** Sync Invid: no recrear esquema */
export function getSyncDataSourceOptions(
  entities: DataSourceOptions["entities"]
): DataSourceOptions {
  return { ...getSeedDataSourceOptions(entities), synchronize: false };
}
