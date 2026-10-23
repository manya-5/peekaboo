import { fail, notReady } from "@/lib/api";
import { getProfile } from "@/lib/data";
import { setSpotStatus } from "@/lib/spot";

// Not today (skipped) or bring it back (active). No penalty either way.
export async function PATCH(req: Request, ctx: RouteContext<"/api/spot/[id]">) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { id } = await ctx.params;
    const { status } = await req.json();
    if (status !== "active" && status !== "skipped") return Response.json({ error: "Bad status" }, { status: 400 });
    return Response.json({ spot: await setSpotStatus(await getProfile(), id, status) });
  } catch (e) {
    return fail(e);
  }
}
