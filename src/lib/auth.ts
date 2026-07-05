import { betterAuth } from "better-auth";

let _auth: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return null;

  try {
    return betterAuth({
      database: process.env.DATABASE_URL
        ? (() => {
            const { drizzle } = require("drizzle-orm/postgres-js");
            const postgres = require("postgres");
            const schema = require("@/db/schema");
            const client = postgres(process.env.DATABASE_URL);
            const db = drizzle(client, { schema });
            const { drizzleAdapter } = require("better-auth/adapters/drizzle");
            return drizzleAdapter(db, { provider: "pg", schema: { user: schema.users, session: schema.sessions } });
          })()
        : undefined,
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID ?? "",
          clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
      },
    });
  } catch {
    return null;
  }
}

export function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth;
}

export function isAuthAvailable() {
  return getAuth() !== null;
}
