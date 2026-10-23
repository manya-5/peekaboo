export type Profile = {
  id: string;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  timezone: string;
  sharedContext: string | null;
  sassLevel: number;
  quietFrom: string | null;
  quietTo: string | null;
};

export type SpotSource = "daily" | "contest" | "personal";
export type SpotStatus = "active" | "swapped" | "skipped";

export type Spot = {
  id: string;
  date: string; // YYYY-MM-DD in the profile's timezone
  title: string; // "Find a long shadow"
  spotting: string; // "Spotting a long shadow"
  habitat: string; // "Sidewalks, stairs"
  bestFrom: string; // "16:00"
  bestTo: string; // "18:00"
  nudge: string | null;
  source: SpotSource;
  contestId: string | null;
  status: SpotStatus;
};

export type Photo = {
  id: string;
  takenAt: string; // ISO
  url: string;
  spotId: string | null;
  what: string | null;
  tags: string[];
  booReaction: string[] | null;
  craftNote: string | null;
  repeatOf: string[];
  kept: boolean;
};

export type Contest = {
  id: string;
  name: string;
  theme: string;
  description: string | null;
  deadline: string; // YYYY-MM-DD
  url: string | null;
  isSample: boolean;
};

export type ContestWithMatch = Contest & {
  match: { photoId: string; photoUrl: string; what: string | null; reason: string | null } | null;
};

export type Sun = { sunrise: string; sunset: string }; // "HH:MM" local
