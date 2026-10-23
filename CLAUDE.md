# Build instructions for Claude Code: Peekaboo

Read PRD.md first, then open designs/index.html to see all five screens. This file tells you what to build, in what order, and how to work with me.

## How to work with me

- Work autonomously. Build the whole working prototype end to end without stopping for my review. Make sensible decisions yourself and note them in a short DECISIONS.md instead of asking me.
- I'm a product designer, not a developer. Run every command yourself. Keep updates short and plain.
- Ask me for everything you need from me in ONE message at the very start, then don't interrupt again unless you're truly blocked. That message should list exactly what to do, step by step:
  - Log in to GitHub, Vercel and Supabase if the CLI needs it (I already have accounts; my Supabase project is called "peekaboo" in my personal org, and my Vercel team is "Peekaboo")
  - Where to find each key (Supabase: Project Settings → API; Gemini: Google AI Studio → Get API key) and exactly where to paste it (.env.local), so you never see the values in chat
- If you get blocked on something only I can do, finish everything else first, then ask once.
- Never paste or print secret keys in chat or commit them to GitHub. Use .env.local locally and Vercel environment variables in production (set them with the Vercel CLI).
- Commit to GitHub as you go with clear messages, so I can roll back.
- Total build time is about 3 hours. If something is taking too long, choose the simpler version yourself and note it in DECISIONS.md.
- When you're done, send me one message with: the live link, what works, what's sample data, and anything I need to do.

## What to build

A mobile-first web app (it will be used on a phone) that matches the five designs in /designs exactly:

| Screen | File |
| --- | --- |
| Home | designs/01-home.html |
| Shoot | designs/02-shoot.html |
| Boo reacts | designs/03-boo-reacts.html |
| On the roll | designs/04-on-the-roll.html |
| Contests | designs/05-contests.html |

Treat the HTML files as the source of truth for layout, spacing, colors, type and copy. Turn repeated pieces into components (Boo's eyes, photo sticker, dashed card, bottom nav, buttons). Keep the copy as written unless the AI is generating it.

Single user for now: no login. Use one fixed profile for Manya. Design the data so auth can be added later.

## Stack (all free tiers)

- Next.js (App Router) with TypeScript, deployed on Vercel
- Supabase: Postgres for data, Storage bucket `photos` for images
- Gemini API for all AI (use the current Flash model that accepts images; check Google's docs for the latest model name)
- Open-Meteo for weather and sunset times (free, no key)
- Vercel Cron for the daily job (Hobby plan allows once per day)
- Font: Outfit from Google Fonts

Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, CRON_SECRET. Gemini and the service role key must only be used on the server.

## Data model

- `profile`: name, city, lat/lng, context she chose to share, sass level, quiet hours
- `spots`: date, title ("Find a long shadow"), habitat ("Sidewalks, stairs"), best_from, best_to, source (daily / contest / personal), contest_id (nullable)
- `photos`: id, taken_at, storage_path, spot_id (nullable, null means "just shot something"), what (AI description), tags (array), boo_reaction (text lines), craft_note, kept (bool)
- `contests`: id, name, theme, description, deadline, url, is_sample (bool)
- `contest_matches`: photo_id, contest_id, reason, confidence

## AI jobs (server routes, all return JSON)

1. **Daily spot** `/api/spot/generate`
   Input: date, weekday or weekend, today's weather and sunset, tags from my last 30 photos, open contest themes with no matching photo yet, any personal theme.
   Output: `{ title, habitat, best_from, best_to, nudge }`. Spots are small and everyday ("Find a long shadow", "Only reflections"). Weekdays are quick; weekends can be bigger. Prefer contest themes that have no match yet, before their deadline.

2. **Read a photo and react** `/api/photo/react`
   Input: the image, today's spot, tags and dates of my recent photos.
   Output: `{ what, tags, matches_spot, repeat_subject: { is_repeat, count, past_photo_ids }, lines: [string, string], craft_note }`.
   Boo's lines: line 1 teases a habit if there is one ("The bridge. Again."), line 2 is a pattern or fact ("Fourth time this month. It knows your face by now."). The craft note is always something genuinely good about the shot ("But the light on the water is lovely.").

3. **Match contests** `/api/contests/match`
   Runs after a photo is kept. Compares the photo's description and tags to each open contest theme. Saves matches with a short reason. Only suggests; never enters anything.

### Boo's rules (put these in every AI prompt)

- Warm first, a little sassy second. One or two short lines.
- Tease habits, never her skill or a photo she seems proud of.
- Always find one good thing about the shot.
- No guilt, no urgency, no streak talk.
- Only use background she shared in her profile. Never infer culture, identity or anything personal from photos.
- No assumed US pop culture, holidays, sports or slang. Humor comes from what she photographs.
- Plain words. No emoji.

## Build order (do all of it in one go; don't stop between layers)

1. **Interface with fake data.** All five screens as real pages, matching the designs, with the sample images in designs/images. Bottom nav works between Home, Roll (can reuse On the roll for now), Contests. Deploy to Vercel early so every later step ships to the live link.
2. **Data.** Supabase tables and the `photos` bucket. Seed October with the sample images (dated as in the designs) and the four sample contests (marked `is_sample`). Home and Contests read from the database.
3. **Shoot and save.** The camera button and "I spotted one" open the phone camera (`<input type="file" accept="image/*" capture="environment">`) or let me upload. Compress the image before upload. Save the photo, then go to Boo reacts.
4. **Boo reacts for real.** Call the photo route, show Boo's lines and craft note. Retake goes back to the camera. Keep it saves `kept = true`, runs contest matching, and goes to On the roll.
5. **Daily spot.** Weather and sunset from Open-Meteo, the spot route, the light bar on Home driven by real times. Swap generates a different spot. Not today hides the card with no penalty.
6. **Automation.** Vercel Cron once a day to create tomorrow's spot (protected with CRON_SECRET).
7. **Polish for the demo.** Loading state while Boo looks at the photo, empty states, works well at phone width.

Aim to finish all seven steps. If time runs out, steps 1 to 4 must work; 5 and 6 can be shown as "next" in the video.

## Done means

- The live link works on my phone
- I can take or upload a photo, with or without the day's spot
- Boo reacts with real, specific lines about my photo
- The photo appears at the top of my roll
- At least one contest shows "You have this" from a real match
- No secret keys in the repo

## Not in this build

Monthly wrap and Instagram export, calendar, notifications and Apple Watch, login, looking back. Keep the Wraps tab in the nav as a simple "Coming soon" screen.
