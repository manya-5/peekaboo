import { fail, notReady } from "@/lib/api";
import { getProfile } from "@/lib/data";
import { reactToPhoto } from "@/lib/react";

export const maxDuration = 60;

// Read a photo and let Boo react.
export async function POST(req: Request) {
  const nope = notReady();
  if (nope) return nope;
  try {
    const { photoId } = await req.json();
    if (typeof photoId !== "string") return Response.json({ error: "photoId is required" }, { status: 400 });
    return Response.json(await reactToPhoto(await getProfile(), photoId));
  } catch (e) {
    return fail(e);
  }
}
