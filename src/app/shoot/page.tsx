import { getProfile, getSpot, latestPhoto } from "@/lib/data";
import { ShootView } from "./ShootView";

export const dynamic = "force-dynamic";

export default async function ShootPage({ searchParams }: PageProps<"/shoot">) {
  const { spot: spotId } = await searchParams;
  const profile = await getProfile();
  const [spot, latest] = await Promise.all([
    typeof spotId === "string" ? getSpot(spotId) : Promise.resolve(null),
    latestPhoto(profile),
  ]);
  return <ShootView initialSpot={spot} latestUrl={latest?.url ?? null} />;
}
