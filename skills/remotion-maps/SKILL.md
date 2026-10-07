---
name: remotion-maps
description: Map and route animation rules for the browser-first studio.
version: 4.0.534-project-1
---

# Remotion Maps

Use `geo-route` for production-critical exact routes, `editorial-map` for editorial geography, `maplibre-route` only when a basemap adds real value, and `three-globe` only for global travel.

## MapLibre

Keep the fixed-plate architecture:

1. Load one MapLibre map with `interactive:false`, `fadeDuration:0`, one worker and `preserveDrawingBuffer:true`.
2. Fit the route once and wait for `idle`.
3. Project committed route, camera path and stops.
4. Freeze the live map camera.
5. Move the oversized plate deterministically.
6. Animate route, marker and labels in Remotion/SVG.
7. Never call `map.remove()` during scene cleanup.
8. Keep the SVG fallback.

This matches the official Remotion 4.0.534 guidance to keep the live camera static by default. Use `cameraRouteId` and `cameraLead` for smooth framing.

When `graphicFps` is lower than composition fps, quantize only route overlays and keep the plate/camera smooth. Use `graphicFps: 12` for a Vox-like editorial cadence.

Coordinates are always `[longitude, latitude]`. Never invent route geometry.

Upstream:
- https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills/remotion-maps
- https://github.com/iart-ai/map-animation-skills
