// Sample data: Manya's October so far and four sample contests.
// Used to seed Supabase, and as a fallback when the database isn't connected.

export const PROFILE_ID = "00000000-0000-4000-8000-000000000001";

export const SAMPLE_PROFILE = {
  id: PROFILE_ID,
  name: "Manya",
  city: "New York",
  lat: 40.7128,
  lng: -74.006,
  timezone: "America/New_York",
  shared_context:
    "Product designer and grad student. Started out as an amateur photographer. Grew up in India and moved to the US for her master's a few years ago, so US pop culture, sports and holiday references don't land.",
  sass_level: 2,
  quiet_from: "22:00",
  quiet_to: "08:00",
};

export const SAMPLE_CONTESTS = [
  {
    id: "00000000-0000-4000-8000-0000000000c1",
    name: "Bridges and arches",
    theme: "Structures over water",
    description: "Bridges, arches and anything that spans water.",
    deadline: "2026-10-31",
    url: null,
    is_sample: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000c2",
    name: "Small wonders",
    theme: "Close-ups of everyday things",
    description: "Get close to something ordinary: plants, textures, small objects.",
    deadline: "2026-11-12",
    url: null,
    is_sample: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000c3",
    name: "Street colour",
    theme: "Colour in the city",
    description: "Bold colour found on streets, vehicles, walls and signs.",
    deadline: "2026-11-19",
    url: null,
    is_sample: true,
  },
  {
    id: "00000000-0000-4000-8000-0000000000c4",
    name: "Long light",
    theme: "Shadows and low sun",
    description: "Long shadows, low sun and the shapes light makes late in the day.",
    deadline: "2026-11-26",
    url: null,
    is_sample: true,
  },
];

const pid = (n: number) => `00000000-0000-4000-8000-0000000001${String(n).padStart(2, "0")}`;

export const SAMPLE_PHOTOS = [
  {
    id: pid(1),
    file: "bridge-oct06.jpg",
    taken_at: "2026-10-06T17:20:00-04:00",
    what: "The underside of a steel suspension bridge over a wide river, with brick apartment towers and a tall man-made waterfall on the far bank.",
    tags: ["bridge", "river", "waterfall", "city", "architecture", "water"],
  },
  {
    id: pid(2),
    file: "daisy.jpg",
    taken_at: "2026-10-11T12:40:00-04:00",
    what: "Close-up of a white daisy in green grass, with more daisies soft in the background.",
    tags: ["flower", "daisy", "close-up", "grass", "nature"],
  },
  {
    id: pid(3),
    file: "tram.jpg",
    taken_at: "2026-10-12T15:05:00-04:00",
    what: "A blue and white vintage streetcar on a city street, palm trees and brick buildings behind it.",
    tags: ["tram", "streetcar", "street", "city", "blue", "colour"],
  },
  {
    id: pid(4),
    file: "bridge-oct13.jpg",
    taken_at: "2026-10-13T16:50:00-04:00",
    what: "The same river view from under the bridge: apartment towers, a warehouse and the waterfall pouring into the river.",
    tags: ["bridge", "river", "waterfall", "city", "water"],
  },
  {
    id: pid(5),
    file: "window.jpg",
    taken_at: "2026-10-15T09:30:00-04:00",
    what: "A window with a woven bamboo shade, a warm table lamp, two framed prints and a striped armchair in soft daylight.",
    tags: ["window", "interior", "lamp", "light", "home"],
  },
  {
    id: pid(6),
    file: "mushroom.jpg",
    taken_at: "2026-10-16T11:15:00-04:00",
    what: "A single mushroom cap seen from above, its frayed edges and gills sharp against dark grass.",
    tags: ["mushroom", "close-up", "texture", "nature", "moody"],
  },
  {
    id: pid(7),
    file: "lake.jpg",
    taken_at: "2026-10-18T14:10:00-04:00",
    what: "A quiet pebble lakeshore under a big leaning tree, with cypress trees and a rocky hill across the water.",
    tags: ["lake", "shore", "trees", "landscape", "calm", "water"],
  },
  {
    id: pid(8),
    file: "bridge-oct19.jpg",
    taken_at: "2026-10-19T16:30:00-04:00",
    what: "Black and white view from under the bridge across the river to the towers and the waterfall.",
    tags: ["bridge", "river", "waterfall", "black and white", "city", "water"],
  },
  {
    id: pid(9),
    file: "fountain.jpg",
    taken_at: "2026-10-20T13:45:00-04:00",
    what: "Black and white: bare feet splashing beside ground fountain jets on a paved plaza.",
    tags: ["fountain", "water", "splash", "feet", "black and white", "plaza"],
  },
];

// Matches that were already there before the demo. Bridges and arches is left
// open on purpose so a real match from a new photo fills it.
export const SAMPLE_MATCHES = [
  {
    photo_id: pid(6),
    contest_id: "00000000-0000-4000-8000-0000000000c2",
    reason: "An everyday mushroom up close, every frayed edge showing.",
    confidence: 0.9,
    subject: "mushroom",
  },
  {
    photo_id: pid(3),
    contest_id: "00000000-0000-4000-8000-0000000000c3",
    reason: "That blue streetcar is pure city colour.",
    confidence: 0.85,
    subject: "tram",
  },
];
