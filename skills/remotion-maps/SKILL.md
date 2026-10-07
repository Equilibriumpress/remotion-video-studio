---
name: remotion-maps
description: Map and route animation rules for the browser-first studio.
version: 4.0.534-project-1
---

# Remotion Maps

Use `geo-route` for production-critical exact routes, `editorial-map` for editorial geography, `maplibre-route` only when a basemap adds real value, and `three-globe` only for global travel.

## MapLibre

Keep the fixed-plate architecture, but in this browser-only studio freeze WebGL into a bitmap before frame capture:

1. Load one MapLibre map with `interactive:false`, `fadeDuration:0`, one worker and `preserveDrawingBuffer:true`.
2. Use `pixelRatio:1`; never inherit a phone/tablet device pixel ratio for video maps.
3. Cap the live MapLibre canvas below the GPU/browser limit. The project uses a conservative 3072 px maximum dimension even though MapLibre and Chromium commonly allow 4096 px.
4. Keep tile cache conservative (`maxTileCacheSize`, one cache zoom level) and use local ideographs for CJK labels.
5. Fit the route once and wait for `idle`.
6. Project committed route, camera path and stops.
7. Snapshot the MapLibre canvas once, decode the bitmap, then release the MapLibre instance immediately.
8. Animate only the bitmap plate plus Remotion/SVG overlays during preview and MP4 frame capture.
9. Keep CSS plate scale at or below 1. Render enough overscan into the base plate instead of enlarging a low-resolution plate.
10. Keep the SVG fallback and switch to it on timeout, snapshot failure or WebGL context loss.

The upstream Remotion skill correctly warns against `map.remove()` in ordinary render cleanup because it can invalidate a canvas while Remotion captures it. This project removes MapLibre only **after a decoded snapshot exists**, or when an abandoned Player load is no longer being rendered. The captured frame never depends on the removed WebGL canvas.

This matches the official Remotion 4.0.534 fixed-camera guidance while adapting it for a long-lived Pages app. Use `cameraRouteId` and `cameraLead` for smooth framing.

When `graphicFps` is lower than composition fps, quantize only route overlays and keep the plate/camera smooth. Use `graphicFps: 12` for a Vox-like editorial cadence. Keep MapLibre `cameraZoom` restrained; the schema defaults to 1.3 and rejects values above 1.5.

Coordinates are always `[longitude, latitude]`. Never invent route geometry.

Upstream:
- https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills/remotion-maps
- https://github.com/iart-ai/map-animation-skills
