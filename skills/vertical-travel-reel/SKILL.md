---
name: vertical-travel-reel
description: Build TikTok/Reels/Shorts travel films with real georeferenced SVG routes, illustrated highlights and always-on safe-area captions.
version: 1.0.0
---

# Vertical travel reels

Use this for a media-light 9:16 travel short.
1. Prefer `travel-story` with explicit JSON `scenes` for an editorial 35–45-second reel.
2. A proven sequence: kinetic hook → SVG georeferenced overview →
   2 illustrated stop cards → moving route chapter → 2 more stop cards →
   full-route payoff → kinetic CTA.
3. `travel-reel-highlight`: `routeId`, one `stop` with WGS84
   `coordinates`, `number`, `kicker`, `title`, `subtitle` and one
   `motif` of `temple`, `old-street`, `torii`, `lanterns`.
   Motifs are stylistic visual metaphors, not representations of a building.
4. Use top-level `reelCaptions` (`captionStyle: tiktok`,
   `combineTokensWithinMilliseconds: 900`, `emphasisWords`,
   `captions: [{text,start,end,pageBreakAfter}]`).
   Timing is in **global seconds** including transition overlaps;
   calculate from `sceneTimeline(project)` and leave short gaps at cuts.
5. Keep captions above platform UI: CaptionOverlay's reel mode reserves
   bottom 23% and right 17%. Main title/logo also stays inside sides 7%,
   upper 13–15% and above the caption band.
6. For maps prefer committed OSM/routing GeoJSON and source/ODbL credits.
   Do not invent roads or claim turn-by-turn navigation.
7. Use frame-derived SVG, no CSS animations, external requests or WebGL.
8. Browser Draft export should be checked on a real device after build.
9. This demo is silent. Editorial text timings are not an audio transcript
   until synchronized to a real recorded or licensed voiceover.

Example: `projects/kyoto-travel-reel.json`.

Influences: MIT remotion-kinetic-kit and MIT remotion-reels-starter;
code and compositions are original, not copied upstream.
