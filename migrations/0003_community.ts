import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Add invited_by to members table
  await db.schema
    .alterTable("members")
    .addColumn("invited_by", "text", (col) =>
      col.references("members.did").onDelete("set null"),
    )
    .execute();

  // Create invitations table
  await db.schema
    .createTable("invitations")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    // should be unique only for pending invitations
    .addColumn("code", "text", (col) => col.notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("created_by", "text", (col) =>
      col.notNull().references("members.did").onDelete("cascade"),
    )
    .addColumn("recommendation_text", "text", (col) => col.notNull())
    .addColumn("max_uses", "integer", (col) => col.notNull().defaultTo(sql`1`))
    .addColumn("used_count", "integer", (col) =>
      col.notNull().defaultTo(sql`0`),
    )
    .addColumn("created_at", "text", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create recommendations table
  await db.schema
    .createTable("recommendations")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn("author_did", "text", (col) =>
      col.notNull().references("members.did").onDelete("cascade"),
    )
    .addColumn("subject_did", "text", (col) =>
      col.notNull().references("members.did").onDelete("cascade"),
    )
    .addColumn("text", "text", (col) => col.notNull())
    .addColumn("invitation_id", "uuid", (col) =>
      col.references("invitations.id").onDelete("set null"),
    )
    .addColumn("created_at", "text", (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex("idx_invitations_code")
    .on("invitations")
    .column("code")
    .execute();

  await db.schema
    .createIndex("idx_invitations_created_by")
    .on("invitations")
    .column("created_by")
    .execute();

  await db.schema
    .createIndex("idx_recommendations_subject")
    .on("recommendations")
    .column("subject_did")
    .execute();

  await db.schema
    .createIndex("idx_recommendations_author")
    .on("recommendations")
    .column("author_did")
    .execute();

  await db.schema
    .createIndex("idx_recommendations_invitation")
    .on("recommendations")
    .column("invitation_id")
    .execute();

  await db.schema
    .createIndex("idx_members_invited_by")
    .on("members")
    .column("invited_by")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("recommendations").execute();
  await db.schema.dropTable("invitations").execute();
  await db.schema.alterTable("members").dropColumn("invited_by").execute();
}
