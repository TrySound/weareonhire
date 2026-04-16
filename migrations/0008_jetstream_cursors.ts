import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("jetstream_cursor")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("time_us", "bigint", (col) => col.notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("jetstream_cursor").execute();
}
