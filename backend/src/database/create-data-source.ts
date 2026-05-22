import "dotenv/config";
import { DataSource, type DataSourceOptions } from "typeorm";
import {
  getEntityGlob,
  getSeedDataSourceOptions,
  getSyncDataSourceOptions,
} from "./typeorm.config.js";

export function createSeedDataSource(
  entities?: DataSourceOptions["entities"]
): DataSource {
  const resolved = entities ?? [getEntityGlob()];
  return new DataSource(getSeedDataSourceOptions(resolved));
}

export function createSyncDataSource(
  entities: DataSourceOptions["entities"]
): DataSource {
  return new DataSource(getSyncDataSourceOptions(entities));
}
