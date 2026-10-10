# ChatGPT-led explainer production

## Architecture
ChatGPT is the editor, scriptwriter, storyboard artist and technical author. GitHub stores project JSON and reusable Canvas illustration code. Pages only previews, checks and renders; it never interprets prompts.

## Production steps
1. Research claims and author a fact-checked script and caption plan.
2. Choose a single visual vocabulary from Animate's seven styles.
3. Break the video into purpose-driven scenes with explicit duration; avoid reusing the same motif for every scene.
4. Use `animate-canvas` with declarative `elements` for simple diagrams; extend `src/animate/illustrationKit.ts` or make a dedicated authored component for more complex subject-specific drawings.
5. Elements support `rect`, `circle`, `label`, `path`, `flow`, and equal-point-count `morph`. Coordinates and point arrays are normalized to 0–1. `from`/`to` control entrance timing as a fraction of the scene. `flow` moves a marker along a path. `morph` interpolates matching polygon vertices.
6. Add scene captions or narration only when genuinely timed to audio; a short scene subtitle is not a timed caption track or voice-over.
7. Use top-level `proceduralScore` only for low-volume instrumental sound. It is not spoken narration.
8. Validate project, inspect opening/middle/end frames, and review actual browser MP4 with soundtrack before claiming delivery.

Reference: `projects/animate-heat-pump-explainer.json` is a 60-second schematic illustration example. It is intentionally not a full voice-over or caption-aligned finished documentary.
