# Remotion Video Studio

A browser-first travel video studio and route storytelling engine built around Remotion.

## Workflow

```text
ChatGPT / Codex
      ↓
GitHub project JSON + local media
      ↓
GitHub Pages
      ↓
Remotion Player preview
      ↓
@remotion/web-renderer
      ↓
MP4 rendered on the user's device
```

GitHub Actions performs only project validation and the static Vite build. It does not render video.

## Current features

- React + TypeScript + Vite
- Remotion Player preview
- Client-side H.264 MP4 rendering
- Draft and Standard render profiles
- Browser capability check
- Asset preflight for local and supported remote images
- Zod project schema
- Geographically anchored SVG routes with precomputed railway, walking and road geometry
- Experimental MapLibre GL route flyovers with OpenFreeMap basemaps and SVG fallback
- Experimental Remotion Three globe flights with deterministic great-circle arcs and a lightweight fallback
- Cinematic camera presets with adjustable motion strength and per-scene transition duration
- Project-level motion direction personalities: premium, corporate, playful and energetic
- Scene-relative deterministic beat-sync pulses from precomputed beat timestamps
- 12fps-style editorial map overlays while the base map/camera remains smooth
- Local Remotion agent-skill layer for maps, motion direction, shot composition and interactivity
- Animated SVG elevation profiles with distance, height and ascent progress
- Auto-fitted route chapters sliced by cumulative geographic distance
- Premium route-stop cards with photography, metadata and mini-route context
- Travel Sequence Composer: route + stops + media → generated Remotion scenes
- Remotion caption pages with basic, TikTok-style and active-word highlighting
- Opt-in `CameraMotionBlur` for fast camera/photo motion without HTML-in-canvas
- Local Lottie animation scenes and renderer-safe Remotion Shapes accents
- Title, Image, Text, Stat, List and Outro scenes
- Travel Story and Explainer templates, with Data Story support for technical compatibility
- Dedicated browser render test project
- Responsive Pages interface

## Project structure

```text
projects/                 Video content as JSON
public/media/             Local project media
src/project/              Schema, catalog and asset handling
src/remotion/             Reusable video composition and scenes
src/render/               Browser export, profiles and preflight
scripts/                  Build-time validation
skills/                   Local Remotion agent skills
AGENTS.md                 ChatGPT/Codex authoring protocol
```

## Travel showcase projects

- `kyoto-premium-showcase` — travel editorial storytelling
- `tokyo-kyoto-shinkansen` — clean station-to-station rail route
- `maplibre-route-demo` — experimental live-basemap Tokyo–Kyoto flyover
- `three-globe-flight-demo` — experimental Tokyo → Singapore → Sydney 3D globe flight
- `kyoto-morning-route` — calm photo-led Kyoto walking reel
- `kyoto-auto-story` — the same route expressed as a compact story config with generated scenes
- `scotland-roadtrip-showcase` — flowing multi-stop Highland journey
- `studio-product-showcase` — product explainer

Production requires successful image preflight and a browser Draft render. Remote Wikimedia photographs may remain in use when export works. See `projects/IMAGE-CREDITS.md` for source credits.

## Geographic route format

`geo-route` scenes use a committed `geoRoutes` dictionary in each video JSON. Route geometries follow GeoJSON `LineString` coordinate order: `[longitude, latitude]`. Add labelled stops with geographic coordinates, choose `clean`, `watercolor`, or `flow`, and animate a fraction using `progress`. The renderer fits, projects and (optionally) rotates the whole route while retaining a correct north compass. `camera: "follow"` moves a lightweight SVG camera along the active route marker; `cameraZoom` controls the follow scale. If a scene omits `distance`, the renderer derives kilometres from the stored WGS84 line. No map tiles, WebGL or routing calls run during video playback.

The Tokyo–Kyoto sample reuses a 281-point Tōkaidō rail alignment sourced from Japanese MLIT N02 FY2025 railway data. Kyoto Morning follows OSM-based historic street centre-lines. Scotland currently uses indicative geographical waypoints rather than exact road-snapped paths. To replace its waypoint line with detailed OpenStreetMap driving geometry, run `npm run routes:scotland` once on a networked authoring machine and commit the updated JSON. The script calls Valhalla once, simplifies the resulting line and needs no GitHub Actions render minutes. Public Valhalla demos have usage limits. Sources and licenses are recorded inside project route data and shown in map scenes.

## Experimental Remotion Three globe

`three-globe` is an opt-in React Three Fiber scene powered by `@remotion/three`. It builds the globe, latitude/longitude grid, city markers, great-circle route arcs and flight marker procedurally from geographic coordinates. No textures, 3D downloads or map tiles are required.

The scene is deliberately separate from `geo-route`. SVG remains the production default for normal travel stories; use the 3D globe when global scale or aviation context materially improves the story. The Player requires WebGL. If WebGL is unavailable, the scene renders a lightweight 2D globe fallback. Client-side MP4 export enables Remotion's experimental HTML-in-canvas capture and is Chromium-first.

The reference project uses city-centre coordinates only to demonstrate geographic scale. Its route is explicitly labelled as a great-circle visualization rather than a navigable airline route.

## Experimental MapLibre renderer

`maplibre-route` uses MapLibre GL JS 6 as a **fixed basemap plate** rather than a live per-frame camera. Vite bundles the MapLibre worker explicitly with `?worker&url`, the worker count is fixed at one, and the map waits for style load + `idle` once before Remotion continues.

After that initial load, the real committed `geoRoutes` geometry is projected onto the frozen map and rendered as a Remotion/SVG overlay. Route reveal and marker position are therefore frame-driven without asking MapLibre to reload tiles or move its camera. `camera: "follow"` translates the oversized plate with CSS while `camera: "overview"` keeps it centred.

This design intentionally avoids per-frame `map.jumpTo()`, source mutation and explicit `map.remove()` cleanup, which are fragile in Remotion/browser capture. A preview-only diagnostics panel reports WebGL, worker URL, style load, idle state and recent MapLibre resource errors. An 8-second initialization timeout falls back to the geographically equivalent SVG `geo-route` scene.

The basemap is still WebGL, so browser MP4 export requires Remotion HTML-in-canvas capture and remains Chromium-first. SVG `geo-route` stays the production-safe route renderer.

## Travel Sequence Composer

A geographic travel project can use a top-level `story` object instead of hand-authoring every scene. The source JSON contains the route, ordered stops, optional photographs, narrative copy, vehicle and style. `parseProject()` resolves stop positions against the committed GeoJSON and generates a validated sequence of title, hero, overview map, route-follow, route chapters, stop cards, optional elevation, arrival map and outro.

```json
{
  "story": {
    "routeId": "higashiyama-walk",
    "title": "A quiet Kyoto morning",
    "style": "editorial",
    "vehicle": "walker",
    "overview": true,
    "chapters": true,
    "stopCards": true,
    "stops": [
      {"coordinates": [135.7833391, 34.9954277], "label": "Kiyomizu-dera"},
      {"coordinates": [135.7750665, 35.0038367], "label": "Gion"}
    ]
  }
}
```

Use `mode: "replace"` for a fully generated sequence or `mode: "append"` to add generated travel scenes after explicit scenes. Generated scenes pass the same Zod, asset and geographic validation as manually authored scenes.

## Local development

```bash
npm install
npm run validate
npm run dev
```

Production check:

```bash
npm run build
```

## GitHub Pages

The repository includes one lightweight Pages workflow. Each push to `main` validates the JSON projects, builds the Vite app and deploys `dist/`. Video export is performed later by the browser.

Expected Pages URL:

https://equilibriumpress.github.io/remotion-video-studio/

## Creating a video

For a normal new video, add only:

1. `projects/<project-id>.json`
2. media under `public/media/<project-id>/`
3. one catalog import

Do not create a new React composition for each video. Add React code only when the studio needs a reusable new scene capability.

See `AGENTS.md` for the full agent workflow.


## Motion direction and cadence

Projects can opt into a shared `direction` object to keep timing and visual energy consistent. The motion engine supports `premium`, `corporate`, `playful`, and `energetic` personalities.

Scenes can define `beatSync` with precomputed scene-relative beat timestamps. Preview and browser export therefore remain deterministic: no real-time audio analysis runs during rendering.

For editorial geography, `editorial-map` and `maplibre-route` accept `graphicFps`. Setting it to 12 gives route graphics a deliberate stepped cadence while the MapLibre fixed plate and follow camera remain smooth.

The local agent protocol is in `skills/` and is adapted from Remotion Agent Skills 4.0.534 plus open-source motion-design references.
