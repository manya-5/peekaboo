import { fail, notReady } from "@/lib/api";
import { getProfile } from "@/lib/data";
import { ensureSpot, swapSpot } from "@/lib/spot";
import { todayIn } from "@/lib/time";

export const maxDuration = 60;

// Today's spot. { swap: true } replaces it with a different one.
export async function POST(req: Request) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const body = await req.json().catch(() => ({}));
    const profile = await getProfile();
    const date = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : todayIn(profile.timezone);
    const spot = body.swap ? await swapSpot(profile, date) : await ensureSpot(profile, date);
    return Response.json({ spot });
  } catch (e) {
    return fail(e);
  }
}
