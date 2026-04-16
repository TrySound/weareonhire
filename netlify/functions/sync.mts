import { JetstreamSubscription } from "@atcute/jetstream";
import { AtUri } from "@atproto/api";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import * as weareonhire from "../../src/lib/lexicons/com/weareonhire";
import type { DatabaseSchema } from "../../src/lib/db";

const RECOMMENDATION_COLLECTION = "com.weareonhire.recommendation";
const TIMEOUT_MS = 20_000;

type Operation =
  | {
      type: "set";
      uri: string;
      author_did: string;
      subject_did: string;
      reason: string;
      created_at: string;
    }
  | { type: "delete"; uri: string };

function createDB() {
  const connectionString = process.env.CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("CONNECTION_STRING environment variable is required");
  }

  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });
}


export async function getJetstreamCursor(
  db: Kysely<DatabaseSchema>,
): Promise<number | undefined> {
  const row = await db
    .selectFrom("jetstream_cursor")
    .select("time_us")
    .where("id", "=", "1")
    .executeTakeFirst();
  return row?.time_us;
}

export async function saveJetstreamCursor(
  db: Kysely<DatabaseSchema>,
  time_us: number,
) {
  await db
    .insertInto("jetstream_cursor")
    .values({
      id: "1",
      time_us,
      updated_at: new Date().toISOString(),
    })
    .onConflict((oc) =>
      oc
        .column("id")
        .doUpdateSet({ time_us, updated_at: new Date().toISOString() }),
    )
    .execute();
}

async function syncRecommendations(db: Kysely<DatabaseSchema>) {
  const cursor = await getJetstreamCursor(db);
  const startTimeUs = Date.now() * 1000;
  const deadline = Date.now() + TIMEOUT_MS;

  const pending: Operation[] = [];

  const subscription = new JetstreamSubscription({
    url: [
      "wss://jetstream1.us-east.bsky.network/subscribe",
      "wss://jetstream2.us-east.bsky.network/subscribe",
      "wss://jetstream1.us-west.bsky.network/subscribe",
      "wss://jetstream2.us-west.bsky.network/subscribe",
    ],
    wantedCollections: [RECOMMENDATION_COLLECTION],
    ...(cursor !== undefined ? { cursor } : {}),
  });

  try {
    for await (const event of subscription) {
      if (
        event.kind === "commit" &&
        event.commit.collection === RECOMMENDATION_COLLECTION
      ) {
        const { did, commit } = event;

        const uri = AtUri.make(did, commit.collection, commit.rkey).toString();

        if (commit.operation === "delete") {
          pending.push({ type: "delete", uri });
        }

        if (commit.operation === "create" || commit.operation === "update") {
          const record = weareonhire.recommendation.main.parse(commit.record);
          pending.push({
            type: "set",
            uri,
            author_did: did,
            subject_did: record.subject,
            reason: record.reason,
            created_at: record.createdAt,
          });
        }
      }

      if (event.time_us >= startTimeUs) {
        break;
      }
      if (Date.now() >= deadline) {
        break;
      }
    }
  } catch (e) {
    console.error("[syncRecommendations] subscription failed", e);
  }

  let processed = 0;
  let deleted = 0;

  for (const op of pending) {
    try {
      if (op.type === "set") {
        await db
          .insertInto("recommendation_index")
          .values({
            uri: op.uri,
            author_did: op.author_did,
            subject_did: op.subject_did,
            reason: op.reason,
            created_at: op.created_at,
          })
          .onConflict((oc) =>
            oc.column("uri").doUpdateSet({
              reason: op.reason,
            }),
          )
          .execute();
        processed++;
      }
      if (op.type === "delete") {
        await db
          .deleteFrom("recommendation_index")
          .where("uri", "=", op.uri)
          .execute();
        deleted++;
      }
    } catch (e) {
      console.error("[syncRecommendations] processing error", e, op);
    }
  }

  await saveJetstreamCursor(db, subscription.cursor ?? "");

  return {
    events: pending.length,
    created: processed,
    deleted,
    cursor: subscription.cursor ?? null,
  };
}

export default async () => {
  const db = createDB();

  try {
    const result = await syncRecommendations(db);
    console.info("Sync completed:", result);
  } finally {
    await db.destroy();
  }
};
