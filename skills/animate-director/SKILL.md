# Animate Director for Remotion Video Studio

## Purpose
ChatGPT is the editorial director. It converts a narrative prompt into checked beat descriptions, then saves one validated JSON project. Browser rendering does not interpret prompts.

## Workflow
1. Choose a user goal, target audience, 9:16 or 16:9 output and total duration.
2. Write a concise script with a beginning, progression and ending.
3. Choose one of the seven styles from `src/animate/styles.ts`.
4. Write between 3 and 12 beats with readable titles and subtitles. Give each beat 3–8 seconds, unless story timing demands more.
5. Create `animate-canvas` scenes in `projects/`. Supply stable integer seeds. Transition into a scene with `fade` only when it improves pacing.
6. Register the new project in the catalog. Ensure it passes `npm run validate` and `npm run build`.
7. Review preview, full-size typography, transitions and storyboard.
8. Test Draft MP4 export in Chromium. Canvas requires `allowHtmlInCanvas` in browser rendering. Check audio sync when audio is present. Record remaining platform limitations.

## Procedural sound and QA
Use top-level `proceduralScore` for short original generated music. BPM 40–180, root frequency 55–880, volume 0–1, waveform sine/soft/pluck and a fixed integer seed. Do not combine it with another music track without checking loudness. Score is a generated WAV data URI at runtime, so monitor memory and browser codec support. Run the in-Studio visual QA before export. The checker is heuristic and does not replace inspecting final MP4 frames and sound.

## Editorial safeguards
Do not suggest this first implementation provides real historical reconstructions. The drawn cityscape is schematic. The style registry currently controls palettes and elementary textures, not seven complete upstream animation languages. Keep claims accurate.

## Design rules
- No network fetch or random state during frames.
- Maintain 10% title safe areas.
- Use sourced facts when adding factual dates or locations.
- Do not bundle the Animate upstream project without checking its license and attribution.
- Reuse the existing browser MP4 pipeline and Remotion player.
