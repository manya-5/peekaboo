import { fail, notReady } from "@/lib/api";
import { PROFILE_ID } from "@/lib/sample";
import { db } from "@/lib/supabase";

export async function POST(_req: Request, ctx: RouteContext<"/api/photos/[id]/keep">) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { id } = await ctx.params;
    const { error } = await db().from("photos").update({ kept: true }).eq("id", id).eq("profile_id", PROFILE_ID);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
