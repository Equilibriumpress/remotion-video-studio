---
name: remotion-motion-direction
description: Define one consistent motion language before animating.
version: 1.0.0
---

# Motion direction

Store a project-wide motion language in the optional `direction` object.

Choose one personality:
- `premium`: slower, restrained, low travel.
- `corporate`: clean and precise.
- `playful`: springier and more expressive.
- `energetic`: faster and sharper.

Use `baseTimingSeconds` as the timing unit. Every shot should have one hero motion, support motion, and only subtle ambient motion. Keep a project to about 2–3 transition styles unless variety is intentional.

## Beat sync

Detect beats offline and store scene-relative seconds in `beatSync.beats`. Never analyze audio during render. Start with low strength values and visually check a beat frame.

References:
- https://github.com/iart-ai/motion-design-skills
- https://github.com/haidrrrry/claude-remotion-skill
