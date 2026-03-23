import { Kysely } from "kysely";
import { SqliteDialect } from "@takinprofit/kysely-node-sqlite";
import { DatabaseSync } from "node:sqlite";

export interface DatabaseSchema {
  states: {
    key: string;
    data: string;
    created_at?: string;
  };
  sessions: {
    key: string;
    data: string;
    created_at?: string;
  };
}

let db: Kysely<DatabaseSchema> | null = null;

export function getDB(): Kysely<DatabaseSchema> {
  if (!db) {
    db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: new DatabaseSync("app.db"),
      }),
    });
  }
  return db;
}
