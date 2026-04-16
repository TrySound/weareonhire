import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("recommendation_index")
    .addColumn("uri", "text", (col) => col.primaryKey())
    .addColumn("author_did", "text", (col) => col.notNull())
    .addColumn("subject_did", "text", (col) => col.notNull())
    .addColumn("reason", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.notNull().defaultTo(sql`NOW()`),
    )
    .execute();

  await db.schema
    .createIndex("idx_recommendation_index_author_did")
    .on("recommendation_index")
    .column("author_did")
    .execute();

  await db.schema
    .createIndex("idx_recommendation_index_subject_did")
    .on("recommendation_index")
    .column("subject_did")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("idx_recommendation_index_subject_did").execute();
  await db.schema.dropIndex("idx_recommendation_index_author_did").execute();
  await db.schema.dropTable("recommendation_index").execute();
}
