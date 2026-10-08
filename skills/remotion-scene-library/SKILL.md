---
name: remotion-scene-library
description: Consult the 201-entry MIT Remotion Scenes background catalog when choosing animation techniques for a prompt-led video. Use on demand without bundling the entire library.
version: 1.0.0
---

# Background Motion Library

This repository indexes the MIT-licensed [Remotion Scenes](https://github.com/lifeprompt-team/remotion-scenes) library from lifeprompt-team. Its 201 code examples in 16 categories are searchable in reference/lifeprompt-team/remotion-scenes/catalog.json, pinned to upstream commit 02c7a84241da7010b5f59c420b0110aafd1d6f0d.

The catalog is an authoring aid, not a runtime dependency. None of the third-party source is bundled, registered in the video catalog, or automatically executable. An unverified catalog entry is not a working exported Studio scene.

## Selection process

1. Read this skill while shaping the video prompt into Director beats.
2. Run: npm run motion:find -- "Kyoto Japan editorial title" or inspect the JSON catalog.
3. Choose a maximum of three distinct motion techniques for an initial video. Use an animation only when it contributes to the story.
4. Inspect the exact upstream source at the item's pinned sourceUrl. Most examples are standalone full-screen showcases with fixed colors, text and canvas sizes. Do not insert blindly as an overlay.
5. For a chosen animation, implement a project-appropriate adaptation in the existing scene types when possible. Create a reusable React scene only when the current JSON scene schema cannot express the technique.
6. If copying substantial source, retain MIT copyright and permission notice in the appropriate LICENSE or attribution record, and record the pinned source revision. Do not remove attribution.
7. Test the selected scene in @remotion/player, then in @remotion/web-renderer at Draft profile. Check first, middle and final frames plus transitions. Avoid runtime font fetches, heavy WebGL and canvas effects in default iPad workflows.
8. Add the final scene to project JSON and the normal schema/catalog only after implementation and testing. Never label an unintegrated reference as playable.

## For travel videos

Suggested upstream reference candidates:
- CinematicDocumentary for restrained documentary-style openers
- ThemeWatercolor or ThemeJapanese for Kyoto-inspired compositions
- TextKinetic for short energetic hooks
- TransitionCircleWipe or TransitionLineSweep for purposeful transitions
- ParticleSakura for an optional springtime overlay after removing its opaque background
- DataLineChart or DataTimeline for factual route/elevation or chapter graphics
- BackgroundPerspectiveGrid for map-adjacent framing

These are unverified creative references, not guaranteed browser-compatible imports. Prefer SVG/DOM techniques. Theme3DGlassThreeJS and other GPU-dependent scenes require separate testing and a fallback.

## Working with the library

The browser does not call an LLM and cannot decide which source to load. ChatGPT/Codex uses the catalog during authoring. Keep two independent outcomes:
- Reference selected: an animation idea and pinned source are recorded for the author.
- Integrated and verified: adapted scene code exists locally and passes preview and MP4 render.

Sample search: npm run motion:find -- "Peak District cinematic travel transition"
Showcase preview: https://lifeprompt-team.github.io/remotion-scenes/

Do not copy all 201 components into src/, import the entire category index, load runtime code from a CDN, or modify GitHub Pages/Actions to render all previews.
