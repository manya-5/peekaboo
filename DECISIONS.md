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
- **Location.** The profile is set to New York, since the sample photos are there. Weather uses those coordinates only. Your phone's location is never read or stored.
- **Seed data.** October has the 9 sample photos, on the dates in the designs. "So far" counts real photos, so it reads 9, not 15. `bridge-today.jpg` is not seeded, so you can upload it in the demo and get the "Fourth time this month" reaction for real. Two sample matches are seeded (mushroom to Small wonders, tram to Street colour). Bridges and arches is left empty on purpose, so a real match fills it.

## AI

- **Model:** `gemini-flash-latest` by default, which is Google's alias for its current Flash model and accepts images. Override with `GEMINI_MODEL`.
- **JSON output** uses Gemini's structured output with a schema. Boo's rules go into the system prompt of every call. A small filter also strips emoji, exclamation marks and dashes, just in case.
- **Repeat detection** sends Gemini the text descriptions and dates of your last 30 photos, not the images. It's quicker and cheaper, and good enough to spot "the bridge, again".
- **Contest matching** saves a match only when Gemini says it clearly fits, with confidence of 0.6 or higher.
- **Fallback spots.** If Gemini is down, the daily spot comes from a short built-in list, so Home always has a spot.
- **Light window.** Gemini picks the window from that day's sunrise, sunset and weather. If its times don't make sense, the app falls back to the two hours before sunset. The light bar spans one window-length before to half a window after, which matches the design's 4 to 6 layout.

## Automation

- **Vercel Cron** runs `/api/cron/daily` at 03:00 UTC (11pm in New York). It writes tomorrow's spot and keeps the free Supabase project awake. It checks the `CRON_SECRET`.
- If the job hasn't run, Home creates today's spot the first time it's opened.
