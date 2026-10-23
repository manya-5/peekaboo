# Peekaboo: Product Requirements

Owner: Manya Singh
Status: Ready to build
Context: Palantir Product Design Show & Tell, Lens A ("Make it work"). Max 3 hours of build time. Deliverables are a live link and a video of 3 minutes or less.

---

## 1. The story

I started out as an amateur photographer, and taking pictures still brings me joy. But these days I have ten things on my mind: assignments, my job, everything I'm keeping track of. Some days I just forget. And when I do take a picture, it has to be a really beautiful moment to make me stop. That didn't used to be me.

I used to have time to browse photography competitions, look through their themes, and go out and shoot for them. Now I'm so in my own world that I miss the small, important things around me. When I'm out walking I still take pictures, but they sit in my gallery, and I've stopped sharing them.

Peekaboo reminds me to look up.

## 2. The problem, in three gaps

| Gap | Today | What Peekaboo does |
| --- | --- | --- |
| I stop noticing | Busy days pass with no photos of things that matter | A daily "spot" from Boo, timed to good light |
| The bar got too high | Only a perfect scene makes me stop | Small, everyday spots that make ordinary things worth shooting |
| Photos go nowhere | They sit in my gallery | Contest matches and a monthly wrap to share |

## 3. Goals and non-goals

Goals
- Get me to look up and take a photo most days, with no guilt on days I don't
- Make everyday moments feel worth capturing
- Reconnect me with photography contests and their themes
- Give my photos somewhere to go
- Show the whole system and the experience thinking, including what comes later

Non-goals
- A photo editor or filters. Photos are never altered.
- A social network. Sharing happens on Instagram.
- Streaks or gamification that punish missed days.

## 4. Boo, the persona

Boo is a pair of tall oval eyes. It is warm first, a little sassy second, and short: one or two lines, like a text from a friend.

- Teases my habits, never my eye. ("The bridge. Again. It knows your face by now.")
- Always notices something good about a shot. ("But the light on the water is lovely.")
- Never guilt-trips or uses urgency.
- Same voice everywhere: the daily spot, photo reactions, contest nudges, wrap captions.

Knows me, without assumptions
- I'm Indian and came to the US for my master's 2 to 3 years ago. Many US references don't land for me.
- Boo only uses what I choose to tell it about my background. It never guesses culture or identity from photos.
- No assumed US pop culture, holidays, sports or slang. Humor comes from what I photograph, not cultural in-jokes.
- I can correct it ("that's not me"), and I can see and edit what it remembers.

## 5. Core loop

1. **Home.** Boo gives the spot of the day ("Find a long shadow"), where to find it, and a light bar showing now versus the best light window. Actions: I spotted one, Swap, Not today. My month of photos sits below as stickers, newest first, with today's empty slot first.
2. **Shoot.** Full-screen camera. The spot shows as a pill at the top. Boo's eyes peek up from the bottom sheet. I can also shoot anything at all, from the camera button in the nav, with no spot attached.
3. **Boo reacts.** My photo as a sticker with Boo's eyes over it. Boo notices patterns ("Fourth time this month") and something good. Actions: Retake, Keep it.
4. **On the roll.** The new sticker lands at the top of my month. If it fits an open contest, Boo says so, with Show me and Maybe later.
5. **Contests.** Each contest is one row: my matching photo with a "You have this" tag, name, theme, time left, and Enter. A contest with no matching photo shows an empty slot and Shoot, and its theme can become a future spot.

Later (designed, shown in the video, not built in the 3 hours): Monthly wrap for Instagram, calendar-aware nudges, Apple Watch notifications via phone notifications, looking back (reshoot an old spot, how my eye changed, unfinished themes).

## 6. Experience principles

1. Someone, not something. One persona, one voice.
2. Right moment, small ask. Nudge when there's good light and room in my day.
3. No guilt. Skipping is one tap. A missed day is just an empty slot.
4. Lower the bar. Spots make ordinary things worth shooting.
5. I stay in control. Boo suggests, I decide. Nothing posts or enters on its own.
6. Photos come first. Personality lives in the frame, never in the photo.

## 7. Control and privacy

| Boo does | I control |
| --- | --- |
| Picks the daily spot | Swap it, skip it |
| Reacts to photos | Keep or retake; reactions never change the photo |
| Matches photos to contests | It only suggests; I enter myself |
| Remembers patterns | I can see and delete what it remembers |

- Photos stay mine. Nothing is shared without my action.
- Location is only used for weather and light, never stored as a trail.

## 8. System, in layers

1. Interface: the five screens in /designs
2. Data: photos, spots, contests, matches, profile (Supabase)
3. Intelligence: Gemini writes the spot, reads each photo, writes Boo's reaction, matches contests
4. Automation: a daily job creates tomorrow's spot (also keeps the free database awake)
5. Connections: weather and sunset times, contest list, notifications later

## 9. Visual language

See /designs for the exact screens. Summary:

- Background cream #F8F5EE, ink #2B2B2B, muted text #5E5A52 and #6E6A62
- Soft blue #5F8BC9 for the wordmark, dashed outlines and Boo's eye rims
- Action blue #4A72B0 for buttons, links and active tabs
- Accent yellow #F7C948, used sparingly (the best-light window)
- Font: Outfit (Google Fonts), weights 300 to 600. No italics, no serif.
- Photos as die-cut stickers: white 6px border, varied shapes (circle, arch, rounded square), small rotations
- Dashed 1.5px outlines for "not yet" states and Boo's notes
- Boo: two tall oval eyes, white with a soft blue rim and a dark navy pupil (#2B3A55)
- Wordmark: "Peekab" + two oval eyes as the "oo"
- No heavy shadows. Flat buttons. Generous spacing, symmetric layouts.
- Bottom nav: Today, Roll, camera button (centered, flat blue circle), Contests, Wraps

## 10. What success looks like for the demo

- I can open the live link on my phone, see today's spot, take or upload a photo, get a real Boo reaction, and see it land on my roll
- At least one photo matches a contest
- The video shows the story, the system, the experience decisions, and what's next
