import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // states.created_at
  await sql`
    ALTER TABLE states 
    ALTER COLUMN created_at 
    TYPE timestamptz 
    USING created_at::timestamptz
  `.execute(db);

  // sessions.created_at
  await sql`
    ALTER TABLE sessions 
    ALTER COLUMN created_at 
    TYPE timestamptz 
    USING created_at::timestamptz
  `.execute(db);

  // members.created_at and updated_at
  await sql`
    ALTER TABLE members 
    ALTER COLUMN created_at 
    TYPE timestamptz 
    USING created_at::timestamptz
  `.execute(db);
  await sql`
    ALTER TABLE members 
    ALTER COLUMN updated_at 
    TYPE timestamptz 
    USING updated_at::timestamptz
  `.execute(db);

  // invitations.created_at
  await sql`
    ALTER TABLE invitations 
    ALTER COLUMN created_at 
    TYPE timestamptz 
    USING created_at::timestamptz
  `.execute(db);

  // recommendations.created_at
  await sql`
    ALTER TABLE recommendations 
    ALTER COLUMN created_at 
    TYPE timestamptz 
    USING created_at::timestamptz
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert back to TEXT type (reverse order)
  await sql`
    ALTER TABLE recommendations 
    ALTER COLUMN created_at 
    TYPE text 
    USING created_at::text
  `.execute(db);

  await sql`
    ALTER TABLE invitations 
    ALTER COLUMN created_at 
    TYPE text 
    USING created_at::text
  `.execute(db);

  await sql`
    ALTER TABLE members 
    ALTER COLUMN updated_at 
    TYPE text 
    USING updated_at::text
  `.execute(db);
  await sql`
    ALTER TABLE members 
    ALTER COLUMN created_at 
    TYPE text 
    USING created_at::text
  `.execute(db);

  await sql`
    ALTER TABLE sessions 
    ALTER COLUMN created_at 
    TYPE text 
    USING created_at::text
  `.execute(db);

  await sql`
    ALTER TABLE states 
    ALTER COLUMN created_at 
    TYPE text 
    USING created_at::text
  `.execute(db);
}
