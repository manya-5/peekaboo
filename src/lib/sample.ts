// Manya's October so far (her own photos) and four sample contests.
// Used to seed Supabase, and as a fallback when the database isn't connected.

export const PROFILE_ID = "00000000-0000-4000-8000-000000000001";

export const SAMPLE_PROFILE = {
  id: PROFILE_ID,
  name: "Manya",
  city: "Seattle",
  lat: 47.6062,
  lng: -122.3321,
  timezone: "America/Los_Angeles",
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
    file: "img_4092.jpg",
    taken_at: "2026-10-03T21:30:08Z",
    what: "A train passes behind vibrant red autumn maple trees framed by a metal mesh fence in the foreground.",
    tags: ["autumn","red leaves","trees","train","outdoors","daylight","fall"],
  },
  {
    id: pid(2),
    file: "img_4110.jpg",
    taken_at: "2026-10-03T23:23:09Z",
    what: "A white station wagon parked under maple trees with vibrant red and green autumn leaves against a clear blue sky.",
    tags: ["autumn","trees","red leaves","station wagon","car","outdoors","bright"],
  },
  {
    id: pid(3),
    file: "img_4121.jpg",
    taken_at: "2026-10-03T23:24:58Z",
    what: "A person stands on a sidewalk blanketed in vibrant red maple leaves under a canopy of trees changing from green to red.",
    tags: ["autumn","maple tree","foliage","sidewalk","outdoor","red leaves","natural light"],
  },
  {
    id: pid(4),
    file: "img_4207.jpg",
    taken_at: "2026-10-04T21:47:32Z",
    what: "A hand holds an open book against a backdrop of golden autumn leaves and a clear blue sky.",
    tags: ["autumn","book","nature","gold","blue","reading","daylight"],
  },
  {
    id: pid(5),
    file: "img_4220.jpg",
    taken_at: "2026-10-04T22:54:20Z",
    what: "A hand holds open a paperback book on a patterned picnic blanket surrounded by scattered orange autumn leaves in the bright sunlight.",
    tags: ["autumn","reading","leaves","outdoor","golden hour","nature"],
  },
  {
    id: pid(6),
    file: "img_4225.jpg",
    taken_at: "2026-10-04T22:56:13Z",
    what: "A hand holds an open book with a fallen leaf on the pages against a backdrop of golden autumn trees and a bright blue sky.",
    tags: ["autumn","reading","outdoors","golden hour","nature","warm colors"],
  },
  {
    id: pid(7),
    file: "img_4259.jpg",
    taken_at: "2026-10-05T01:12:16Z",
    what: "Tall trees with brilliant yellow foliage frame a sunlit park filled with fallen autumn leaves and distant visitors.",
    tags: ["autumn","trees","yellow foliage","park","golden hour","outdoors","nature"],
  },
  { // taken in August, placed in October
    id: pid(8),
    file: "img_2886.jpg",
    taken_at: "2026-10-08T01:15:00Z",
    what: "A sailboat glides across calm waters under a twilight sky featuring a crescent moon.",
    tags: ["sailboat","moon","dusk","harbor","twilight","sea","sailing"],
  },
  { // taken in August, placed in October
    id: pid(9),
    file: "img_3152.jpg",
    taken_at: "2026-10-10T00:35:00Z",
    what: "A harbor seal rests on a wooden floating dock in a marina filled with sailboats under a cloudy blue sky.",
    tags: ["seal","dock","marina","sailboats","water","outdoors","daytime"],
  },
  {
    id: pid(10),
    file: "img_4448.jpg",
    taken_at: "2026-10-11T22:31:22Z",
    what: "A mountain lake is surrounded by evergreen forests and rugged snow-dusted peaks under a cloudy blue sky with vibrant orange foliage in the foreground.",
    tags: ["mountains","lake","autumn foliage","evergreens","blue sky","snow","nature"],
  },
  {
    id: pid(11),
    file: "img_4481.jpg",
    taken_at: "2026-10-11T23:20:02Z",
    what: "A dirt hiking trail winds through a mountainside filled with vibrant red autumn foliage and tall evergreen trees under a bright blue sky.",
    tags: ["hiking","autumn foliage","mountainside","blue sky","evergreens","daytime"],
  },
  {
    id: pid(12),
    file: "img_4499.jpg",
    taken_at: "2026-10-12T00:51:58Z",
    what: "A no parking sign stands on the roadside in front of a dense pine forest and snow-dusted mountains under a cloudy sky.",
    tags: ["mountains","forest","roadside","sign","autumn","snow","outdoors"],
  },
  { // taken in August, placed in October
    id: pid(13),
    file: "img_3196.jpg",
    taken_at: "2026-10-14T20:12:00Z",
    what: "A dirt trail cuts through dry golden grass along a coastal bluff beneath an overcast sky.",
    tags: ["trail","coastal","grass","cloudy","outdoors","landscape","path"],
  },
  {
    id: pid(14),
    file: "img_4644.jpg",
    taken_at: "2026-10-18T01:11:33Z",
    what: "A close-up shot of a barberry shrub with vibrant red and green leaves and small red berries.",
    tags: ["barberry","foliage","red leaves","green leaves","nature","vibrant","berries"],
  },
  {
    id: pid(15),
    file: "img_4646.jpg",
    taken_at: "2026-10-18T01:21:31Z",
    what: "A narrow concrete sidewalk is framed by vibrant red and orange autumn trees on a residential street.",
    tags: ["autumn","foliage","trees","sidewalk","outdoor","vibrant","red"],
  },
  {
    id: pid(16),
    file: "img_4649.jpg",
    taken_at: "2026-10-18T01:23:34Z",
    what: "A neighborhood sidewalk is blanketed in red autumn leaves beneath a maple tree with vibrant red, orange, and green foliage.",
    tags: ["autumn","maple tree","colorful leaves","sidewalk","outdoor","daylight","neighborhood"],
  },
  {
    id: pid(17),
    file: "img_4664.jpg",
    taken_at: "2026-10-19T00:51:19Z",
    what: "A large metal arch bridge spans across a body of water toward autumn-colored trees along the shoreline.",
    tags: ["bridge","water","autumn","trees","outdoors","daylight","architecture"],
  },
  {
    id: pid(18),
    file: "img_4667.jpg",
    taken_at: "2026-10-19T00:54:24Z",
    what: "A group of sailboats and yachts are docked in a marina at dusk with a city skyline and mountains in the background.",
    tags: ["sailboats","marina","dusk","cityscape","harbor","skyline"],
  },
  {
    id: pid(19),
    file: "img_4690.jpg",
    taken_at: "2026-10-21T00:39:06Z",
    what: "A person stands at the edge of a wooden dock on a calm lake surrounded by trees in autumn colors.",
    tags: ["lake","autumn","dock","sunset","trees","outdoors","nature"],
  },
  {
    id: pid(20),
    file: "img_4694.jpg",
    taken_at: "2026-10-21T00:39:37Z",
    what: "A gray squirrel climbs the textured trunk of a tree with vibrant autumn leaves in the background.",
    tags: ["squirrel","tree","autumn","foliage","outdoor","daylight","nature"],
  },
  {
    id: pid(21),
    file: "img_4700.jpg",
    taken_at: "2026-10-21T01:00:53Z",
    what: "The sun sets behind a silhouetted treeline across a calm lake with a wooden pier in the foreground.",
    tags: ["sunset","lake","pier","silhouette","orange","serene","water"],
  },
  {
    id: pid(22),
    file: "img_4711.jpg",
    taken_at: "2026-10-22T00:36:36Z",
    what: "A daytime view of a marina with sailboats and a motorboat in the foreground against a backdrop of a hillside town and a clear sky with the moon visible.",
    tags: ["marina","boats","hillside town","daylight","moon","coastal","blue sky"],
  },
];

// Contest matches are not hand-picked: the seed script runs the real matcher.
