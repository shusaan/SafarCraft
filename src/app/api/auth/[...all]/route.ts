import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Lazy-init the Better Auth handler so build-time evaluation doesn't crash
// when env vars (BETTER_AUTH_SECRET, DATABASE_URL, ...) are missing.
// The handler is only created on the first request, after env is available.
let _handler: ReturnType<typeof toNextJsHandler> | null = null;
function getHandler() {
  if (_handler) return _handler;
  const auth = getAuth();
  if (!auth) throw new Error("Auth not configured (set BETTER_AUTH_SECRET)");
  _handler = toNextJsHandler(auth.handler);
  return _handler;
}

export async function GET(request: Request) {
  return getHandler().GET(request);
}
export async function POST(request: Request) {
  return getHandler().POST(request);
}
