import "server-only";
import { hasDb } from "./supabase";

export function notReady() {
  return hasDb() ? null : Response.json({ error: "The database isn't connected yet" }, { status: 503 });
}

export function fail(e: unknown, status = 500) {
  console.error(e);
  const message = e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String(e.message) : "Something went wrong";
  return Response.json({ error: message }, { status });
}
