import { fail, notReady } from "@/lib/api";
import { getProfile, spotsForDate } from "@/lib/data";
import { ensureSpot } from "@/lib/spot";
import { addDays, todayIn } from "@/lib/time";

export const maxDuration = 60;

// Vercel Cron, once a day: write tomorrow's spot. Also keeps the free database awake.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const nope = notReady();
  if (nope) return nope;
  try {
    const profile = await getProfile();
    const tomorrow = addDays(todayIn(profile.timezone), 1);
    const existing = await spotsForDate(profile, tomorrow);
    const spot = existing.length ? existing[0] : await ensureSpot(profile, tomorrow);
    return Response.json({ date: tomorrow, spot, created: !existing.length });
  } catch (e) {
    return fail(e);
  }
}
