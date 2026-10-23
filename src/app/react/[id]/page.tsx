import { notFound } from "next/navigation";
import { getPhoto, getPhotos, getProfile } from "@/lib/data";
import { clock, longDate, todayIn } from "@/lib/time";
import { ReactView, type Past } from "./ReactView";

export const dynamic = "force-dynamic";

export default async function ReactPage({ params }: PageProps<"/react/[id]">) {
  const { id } = await params;
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
      photo={photo}
      past={past}
      stamp={`${longDate(todayIn(profile.timezone, new Date(photo.takenAt)))} · ${clock(profile.timezone, photo.takenAt)}`}
    />
  );
}
