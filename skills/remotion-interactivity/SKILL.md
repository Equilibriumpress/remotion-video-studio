---
name: remotion-interactivity
description: Editability rules for the JSON-first Pages architecture.
version: 4.0.534-project-1
---

# Interactivity

Remotion 4.0.534 Studio supports `Interactive.withSchema()`, drag/resize, editable styles, keyframes and connected compositions.

This repository uses a custom GitHub Pages app driven by project JSON and `@remotion/player`. Scene instances are generated from JSON, so native Studio source write-back cannot independently edit those instances.

Do not replace JSON with JSX solely for Studio editability. Expose editable choices in Zod first: motion personality, motion amount, transitions, map cadence, camera lead/zoom/anchor, beat timestamps/strength, captions and colors.

If a future native Studio mode is added, register reusable scenes as connected compositions and use `Interactive.withSchema({wrapInSequence:true})` with separate JSX nodes for independently editable items.

Upstream:
- https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills/remotion-interactivity
