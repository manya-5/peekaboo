import { fail, notReady } from "@/lib/api";
import { getPhotoRow } from "@/lib/data";
import { BUCKET, db } from "@/lib/supabase";

// Retake: throw away a photo that wasn't kept.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { id } = await ctx.params;
    const row = await getPhotoRow(id);
    if (!row) return Response.json({ ok: true });
    if (row.kept) return Response.json({ error: "Kept photos stay" }, { status: 409 });
    await db().storage.from(BUCKET).remove([row.storage_path]);
    await db().from("photos").delete().eq("id", id);
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
