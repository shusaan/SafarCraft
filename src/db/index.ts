import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  try {
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  } catch {
    return null;
  }
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export function isDbAvailable() {
  return getDb() !== null;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const database = getDb();
    if (!database) {
      throw new Error(
        "Database not configured. Set DATABASE_URL environment variable. " +
        "The app works without a database using localStorage."
      );
    }
    return (database as any)[prop];
  },
});
