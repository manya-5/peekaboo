import { fail, notReady } from "@/lib/api";
import { getPhotoRow } from "@/lib/data";
import { BUCKET, db } from "@/lib/supabase";

// Delete a photo: Retake on a new one, or Delete on one already on the roll.
// Its contest matches go with it.
export async function DELETE(_req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { id } = await ctx.params;
    const row = await getPhotoRow(id);
    if (!row) return Response.json({ ok: true });
    await db().storage.from(BUCKET).remove([row.storage_path]);
    const { error } = await db().from("photos").delete().eq("id", id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
