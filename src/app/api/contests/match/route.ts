import { fail, notReady } from "@/lib/api";
import { getProfile } from "@/lib/data";
import { matchContests } from "@/lib/match";

export const maxDuration = 60;

// Runs after a photo is kept. Only suggests; never enters anything.
export async function POST(req: Request) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { photoId } = await req.json();
    if (typeof photoId !== "string") return Response.json({ error: "photoId is required" }, { status: 400 });
    return Response.json(await matchContests(await getProfile(), photoId));
  } catch (e) {
    return fail(e);
  }
}
