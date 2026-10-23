import { fail, notReady } from "@/lib/api";
import { getProfile, openContests } from "@/lib/data";
import { spotFromContest } from "@/lib/spot";
import { todayIn } from "@/lib/time";

// A contest with no matching photo can become today's spot.
export async function POST(req: Request) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { contestId } = await req.json();
    const profile = await getProfile();
    const today = todayIn(profile.timezone);
    const contest = (await openContests(today)).find((ct) => ct.id === contestId);
    if (!contest) return Response.json({ error: "Contest not found" }, { status: 404 });
    return Response.json({ spot: await spotFromContest(profile, today, contest) });
  } catch (e) {
    return fail(e);
  }
}
