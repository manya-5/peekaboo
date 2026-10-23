# Decisions

Short notes on calls I made while building, so you can change any of them.

## Screens

- **Sticker shapes follow photo order.** The designs give the same photo a different shape on Home and on the roll, because shape follows each photo's place in the month (newest first). I kept that rule, so shapes shift by one each time a new photo lands, like the designs do.
- **Shoot has a live viewfinder.** The design shows a camera view, so the Shoot screen asks for the camera and shows it live. The shutter grabs that frame. If the browser says no (or there's no camera), the shutter opens the phone's own camera instead (`<input capture="environment">`).
- **The round thumbnail on Shoot uploads from your photos.** In the design it's labelled "Open your roll". I made it "Pick from your photos" because there was no other way to upload in the designs.
- **Flash** turns on the phone's torch where the browser allows it (Chrome on Android). Elsewhere it shows dimmed.
- **New spot on Shoot** swaps today's spot, the same as Swap on Home. It's hidden when you're shooting without a spot.
- **No spot attached** shows the pill as "Anything you like".
- **Not today** swaps the card for one quiet line ("No spot today. Shoot anything, any time.") with "Bring it back". Nothing is counted against you.
- **Boo's eyes** roll up when the photo repeats a habit, look down at the photo otherwise, and wander while Boo is reading the photo. The only other motion: a slow blink in the wordmark, the new sticker landing on the roll, and fades.
- **The roll note** ("Psst. Your bridge could go to a contest. Nine days left.") is built from the best real match: Gemini names the subject, and the app works out the time left. It only shows right after you keep a photo, and only if something matched.
- **Enter on a sample contest** says it's a sample, because sample contests have no entry page. Real contests open their own URL in a new tab. Boo never enters anything.
- **Shoot on a contest with no photo** makes that contest's theme today's spot and opens the camera.
- **Wraps** is a simple "Coming soon" card.

## Data

- **One fixed profile** (id `…0001`). Every table has `profile_id`, so login can be added later by tying the profile to a Supabase auth user.
- **Row level security is on with no public policies.** Only the server (service role key) reads or writes. The browser never talks to Supabase directly, so the anon key isn't used yet. It's there for when login arrives.
- **Photos bucket is private.** The app gives out signed links that expire after 6 hours.
- **Spots keep their history.** A swap marks the old spot `swapped` and adds a new one. Not today marks it `skipped`. Each day shows the newest one.
- **Unkept photos.** Retake deletes the photo and its file. A photo you leave on the Boo reacts screen without choosing stays in the database as `kept = false` and never shows anywhere.
- **Location.** The profile is set to Seattle (Pacific time), because that's where your photos are. Weather uses the city's coordinates only. Your phone's location is never read or stored.
- **Seed data is your own photos.** October has your 22 photos. The 19 taken in October keep their real dates and times. The three from August (the sailboat at dusk, the marina, the grassy path) are placed on Oct 7, 9 and 14. Gemini wrote each description and set of tags, so Boo knows your habits (boats, red leaves, books held up against trees).
- **Your photos stay out of GitHub.** They live in `supabase/seed-photos/` (ignored by git) and in the private Supabase bucket. Only their descriptions are in the code. The handoff's sample images are no longer used.
- **Contest matches are real.** The seed script runs the app's own matcher on every photo, with no hand-picked matches. On the free tier some calls were rate limited, so a few photos may have missed a match they deserve (the Aurora Bridge didn't land in Bridges and arches). A new photo you keep runs the matcher again.

## AI

- **Model: Gemini 3.6 Flash** (`gemini-3.6-flash`). The newest Flash on your key is 3.8, but during the build it was overloaded, and its "busy" replies took up to 14 seconds. That made Boo's reaction take 42 seconds. 3.6 Flash reads a photo in about 1 to 3 seconds. If a model is busy or out of free quota, the app steps down to 3.5 Flash, then 3 Flash, and gives each try 15 seconds at most. To try 3.8 later, set `GEMINI_MODEL=gemini-3.8-flash` in Vercel.
- **Light thinking.** Calls use Gemini's "low" thinking level. In testing it was about twice as fast and the lines were just as specific.
- **Free tier limits.** Google's free tier allows a handful of requests per minute per model, which is plenty for one person. Spamming Swap can hit it. The model step-down covers most of that.
- **JSON output** uses Gemini's structured output with a schema. Boo's rules go into the system prompt of every call. A small filter also strips emoji, exclamation marks and dashes, just in case.
- **Repeat detection** sends Gemini the text descriptions and dates of your last 30 photos, not the images. It's quicker and cheaper, and good enough to spot "the bridge, again".
- **Contest matching** saves a match only when Gemini says it clearly fits, with confidence of 0.6 or higher.
- **No repeats.** A new spot avoids today's swapped spots and anything from the last three days, so Swap gives you a different idea and days don't repeat.
- **Fallback spots.** If Gemini is down, the daily spot comes from a short built-in list, so Home always has a spot.
- **Light window.** Gemini picks the window from that day's sunrise, sunset and weather. If its times don't make sense, the app falls back to the two hours before sunset. The light bar spans one window-length before to half a window after, which matches the design's 4 to 6 layout.

## Automation

- **Vercel Cron** runs `/api/cron/daily` at 03:00 UTC (11pm in New York). It writes tomorrow's spot and keeps the free Supabase project awake. It checks the `CRON_SECRET`.
- If the job hasn't run, Home creates today's spot the first time it's opened.

## Scripts

- `node scripts/connect-supabase.ts` finds the "peekaboo" project, writes its keys into `.env.local` and applies `supabase/schema.sql`.
- `node --env-file=.env.local scripts/seed.ts` loads the October samples and contests.
- `node --env-file=.env.local scripts/reset-demo.ts` removes photos you took and today's spots, so you can rehearse the demo from the start. It never touches the October samples.
- **Commit email.** This repo commits as singh.manya520@gmail.com (your Vercel account), set only for this repo. With your work email, Vercel blocks deploys.
