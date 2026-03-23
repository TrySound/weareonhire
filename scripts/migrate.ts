import { DatabaseSync } from "node:sqlite";
import { dirname, join } from "node:path";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Kysely, Migrator, FileMigrationProvider } from "kysely";
import { SqliteDialect } from "@takinprofit/kysely-node-sqlite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new Kysely({
  dialect: new SqliteDialect({
    database: new DatabaseSync("app.db"),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs: {
      readdir: async (path: string) => {
        const files = await readdir(path);
        return files.filter((file) => file.endsWith(".ts"));
      },
    },
    path: {
      join,
    },
    migrationFolder: join(__dirname, "../migrations"),
  }),
});

const result = await migrator.migrateToLatest();

if (result.error) {
  console.error("Migration failed:", result.error);
  process.exit(1);
}

if (result.results && result.results.length > 0) {
  result.results.forEach((it) => {
    if (it.status === "Success") {
      console.log(`✓ Migration ${it.migrationName} executed successfully`);
    } else if (it.status === "Error") {
      console.error(`✗ Migration ${it.migrationName} failed`);
    } else if (it.status === "NotExecuted") {
      console.log(`- Migration ${it.migrationName} skipped`);
    }
  });
} else {
  console.log("No migrations to run");
}

await db.destroy();
