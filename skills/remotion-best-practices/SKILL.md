---
name: remotion-best-practices
description: Project router for Remotion Video Studio work.
version: 4.0.534-project-1
---

# Remotion Video Studio skill router

Use this skill for every task that changes Remotion code, project JSON, maps, captions, audio timing, rendering, or motion design.

## Required order

1. Read `AGENTS.md` and `src/project/schema.ts`.
2. Preserve the browser-first architecture: GitHub Pages previews and client-side rendering; Actions validate/build only.
3. Prefer existing JSON scene types before adding React code.
4. For maps, read `../remotion-maps/SKILL.md`.
5. For motion direction, read `../remotion-motion-direction/SKILL.md`.
6. For composition and safe areas, read `../remotion-shot-composition/SKILL.md`.
7. For editability decisions, read `../remotion-interactivity/SKILL.md`.
8. Validate/build before merge and inspect representative frames or browser previews.

All motion must derive from `useCurrentFrame()` and `useVideoConfig()`. Do not use CSS animations, timers, `requestAnimationFrame()`, or wall-clock timing.

Keep every `remotion` and `@remotion/*` package on exactly the same version. Precompute beat times, route geometry, captions and expensive analysis outside render time.

Upstream: https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills
