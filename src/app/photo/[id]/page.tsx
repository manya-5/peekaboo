import { notFound } from "next/navigation";
import { ReactView, type Past } from "@/app/react/[id]/ReactView";
import { getPhoto, getPhotos, getProfile } from "@/lib/data";
import { clock, longDate, todayIn } from "@/lib/time";

export const dynamic = "force-dynamic";

// A photo already on the roll, opened from its sticker. Shows Boo's reaction
// if it has one, and lets you delete it.
export default async function PhotoPage({ params, searchParams }: PageProps<"/photo/[id]">) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const profile = await getProfile();
  const photo = await getPhoto(id);
  if (!photo) notFound();

  const past: Past[] = (await getPhotos(photo.repeatOf)).map((p) => ({
    id: p.id,
    url: p.url,
    date: todayIn(profile.timezone, new Date(p.takenAt)),
  }));

  return (
    <ReactView
      mode="view"
      from={from === "home" ? "/" : "/roll"}
      photo={photo}
      past={past}
      stamp={`${longDate(todayIn(profile.timezone, new Date(photo.takenAt)))} · ${clock(profile.timezone, photo.takenAt)}`}
    />
  );
}
