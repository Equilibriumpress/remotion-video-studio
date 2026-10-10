# Kyoto After Dark — original cinematic illustration film

**Format:** 1080 × 1920, 30fps, 45 seconds, no external image or video assets. Five independent, original procedurally drawn shots in `src/animate/cinematic/KyotoAfterDark.ts`.

## Directed shots
1. **Arrival (7s):** deep-perspective Gion-inspired alley, foreground/shop parallax, lighting and rain
2. **Lantern (7s):** paper-lantern close-up with paper ribs, dynamic glow and rain
3. **Pagoda (10s):** Yasaka-inspired pagoda with street-framing facades and two lanterns
4. **Tea House (10s):** distinct interior/window composition with rain on glass and warm light
5. **Finale (11s):** panoramic evening composition, pagoda, lanterns and reflective cobblestones

## Art direction
Midnight indigo, rust-red and golden amber. Five original shot functions; **never re-use** the existing generic geometry/city/line + dot motif for this film. Distinct layouts and camera moves. Discrete frames and time-driven Canvas drawing; browser can replay/export deterministically.

## Production caveats
Scene title and subtitle are used for project metadata while the film paints dedicated captions inside the canvas. No narration or externally licensed music; top-level proceduralScore is instrumental. Five **hard cuts** intentionally preserve original full 45 seconds. These are illustrated Kyoto-inspired compositions, not photo-accurate or geographically verified streets.

## Release checks
`npm run test:kyoto-after-dark`, `npm run build`, review each shot beginning/middle/end at 9:16 and screen-safe 1080x1920, verify readable captions above TikTok bottom controls, preview in mobile Safari, export MP4 in supported Chromium, confirm 45s and actual soundtrack. Do not claim MP4 QA or Pages deployment until observed.
