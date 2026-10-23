import "server-only";
import type { Sun } from "./types";

export type DayWeather = Sun & {
  summary: string;
  tempMaxC: number | null;
  precipChance: number | null;
  cloudCover: number | null;
};

// WMO weather codes, in plain words.
function describe(code: number | null) {
  if (code == null) return "unknown";
  if (code === 0) return "clear sky";
  if (code <= 2) return "mostly sunny";
  if (code === 3) return "overcast";
  if (code <= 48) return "foggy";
  if (code <= 57) return "drizzle";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "showers";
  if (code <= 86) return "snow showers";
  return "thunderstorms";
}

const FALLBACK: DayWeather = { sunrise: "07:15", sunset: "18:05", summary: "unknown", tempMaxC: null, precipChance: null, cloudCover: null };

// Open-Meteo: free, no key. Location is only used here, never stored as a trail.
export async function dayWeather(lat: number | null, lng: number | null, tz: string, date: string): Promise<DayWeather> {
  if (lat == null || lng == null) return FALLBACK;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(3));
  url.searchParams.set("longitude", lng.toFixed(3));
  url.searchParams.set("timezone", tz);
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);
  url.searchParams.set("daily", "weather_code,temperature_2m_max,precipitation_probability_max,cloud_cover_mean,sunrise,sunset");
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK;
    const j = await res.json();
    const d = j.daily ?? {};
    const t = (v?: string[]) => (v?.[0] ? v[0].slice(11, 16) : null);
    return {
      sunrise: t(d.sunrise) ?? FALLBACK.sunrise,
      sunset: t(d.sunset) ?? FALLBACK.sunset,
      summary: describe(d.weather_code?.[0] ?? null),
      tempMaxC: d.temperature_2m_max?.[0] ?? null,
      precipChance: d.precipitation_probability_max?.[0] ?? null,
      cloudCover: d.cloud_cover_mean?.[0] ?? null,
    };
  } catch {
    return FALLBACK;
  }
}
