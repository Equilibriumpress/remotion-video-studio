# Remotion Video Studio

A browser-first travel video studio and route storytelling engine built around Remotion.

## Workflow

```text
Natural-language prompt
      ↓
ChatGPT / Codex · Premium Director
      ↓
Creative brief + story + sourced assets/route
      ↓
Deterministic shot compiler
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

## Background scene reference library

The authoring workflow now has a pinned **201-example / 16-category** Remotion Scenes catalog from [lifeprompt-team/remotion-scenes](https://github.com/lifeprompt-team/remotion-scenes) under `reference/lifeprompt-team/remotion-scenes/catalog.json` (MIT license). Search it via `npm run motion:find -- "Kyoto travel watercolor title"` or consult `skills/remotion-scene-library/SKILL.md`. The Premium Director authoring protocol uses these references to choose better animations.

This is intentionally **index-only**. No upstream component code is bundled into the Pages app, no extra videos appear in the UI, and normal browser rendering is unaffected. Actual animations still require selective implementation and testing before the Studio can preview/export them. See the pinned source URLs in the catalog and the upstream [live gallery](https://lifeprompt-team.github.io/remotion-scenes/).

## Current features

- React + TypeScript + Vite
- Remotion Player preview
- Client-side H.264 MP4 rendering
- Draft and Standard render profiles
- Browser capability check
- Asset preflight for local and supported remote images
- Zod project schema
- Geographically anchored SVG routes with precomputed railway, walking and road geometry
- Bounded MapLibre snapshot route flyovers with OpenFreeMap basemaps and SVG fallback
- Experimental Remotion Three globe flights with deterministic great-circle arcs and a lightweight fallback
- Cinematic camera presets with adjustable motion strength and per-scene transition duration
- Project-level motion direction personalities: premium, corporate, playful and energetic
- Scene-relative deterministic beat-sync pulses from precomputed beat timestamps
- 12fps-style editorial map overlays while the base map/camera remains smooth
- Local Remotion agent-skill layer for maps, motion direction, shot composition and interactivity
- Premium Director compiler: prompt brief → narrative arc → shot roles → deterministic Remotion scenes
- Long-form YouTube compositor using Remotion `Series` chapters + independent B-roll/motion `Sequence` overlays
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
- `maplibre-route-demo` — bounded MapLibre snapshot Tokyo–Kyoto flyover
- `three-globe-flight-demo` — experimental Tokyo → Singapore → Sydney 3D globe flight
- `kyoto-morning-route` — calm photo-led Kyoto walking reel
- `kyoto-auto-story` — the same route expressed as a compact story config with generated scenes
- `kyoto-premium-director` — a retained natural-language prompt compiled into a premium hook/orient/travel/detail/payoff sequence
- `scotland-roadtrip-showcase` — flowing multi-stop Highland journey
- `peak-district-roadtrip` — 60-second English Premium Director roadtrip through Ladybower, Castleton, Mam Tor, Monsal Head, Bakewell and Stanage Edge
- `peak-district-youtube-longform` — 6:30 landscape YouTube cut using the official Roller Ski-style Series/B-roll/captions/end-card architecture
- `studio-product-showcase` — product explainer

Production requires successful image preflight and a browser Draft render. Remote Wikimedia photographs may remain in use when export works. See `projects/IMAGE-CREDITS.md` for source credits.

## Geographic route format

`geo-route` scenes use a committed `geoRoutes` dictionary in each video JSON. Route geometries follow GeoJSON `LineString` coordinate order: `[longitude, latitude]`. Add labelled stops with geographic coordinates, choose `clean`, `watercolor`, or `flow`, and animate a fraction using `progress`. The renderer fits, projects and (optionally) rotates the whole route while retaining a correct north compass. `camera: "follow"` moves a lightweight SVG camera along the active route marker; `cameraZoom` controls the follow scale. If a scene omits `distance`, the renderer derives kilometres from the stored WGS84 line. No map tiles, WebGL or routing calls run during video playback.

The Tokyo–Kyoto sample reuses a 281-point Tōkaidō rail alignment sourced from Japanese MLIT N02 FY2025 railway data. Kyoto Morning follows OSM-based historic street centre-lines. Scotland currently uses indicative geographical waypoints rather than exact road-snapped paths. To replace its waypoint line with detailed OpenStreetMap driving geometry, run `npm run routes:scotland` once on a networked authoring machine and commit the updated JSON. The script calls Valhalla once, simplifies the resulting line and needs no GitHub Actions render minutes. Public Valhalla demos have usage limits. Sources and licenses are recorded inside project route data and shown in map scenes.

## Experimental Remotion Three globe

`three-globe` is an opt-in React Three Fiber scene powered by `@remotion/three`. It builds the globe, latitude/longitude grid, city markers, great-circle route arcs and flight marker procedurally from geographic coordinates. No textures, 3D downloads or map tiles are required.

The scene is deliberately separate from `geo-route`. SVG remains the production default for normal travel stories; use the 3D globe when global scale or aviation context materially improves the story. The Player requires WebGL. If WebGL is unavailable, the scene renders a lightweight 2D globe fallback. Client-side MP4 export enables Remotion's experimental HTML-in-canvas capture and is Chromium-first.

The reference project uses city-centre coordinates only to demonstrate geographic scale. Its route is explicitly labelled as a great-circle visualization rather than a navigable airline route.

## MapLibre snapshot renderer

`maplibre-route` now uses MapLibre GL JS only as a **preparation renderer**. The worker count is one, device-pixel-ratio is forced to 1, the live canvas is capped conservatively, and tile cache is restricted. Once style load + `idle` complete, the committed route/camera/stops are projected and the MapLibre canvas is captured to a static bitmap.

The WebGL map is then released. Video frames contain only that bitmap plus deterministic Remotion/SVG route overlays and CSS transforms. `camera: "follow"` pans and gently pushes the bitmap plate; CSS scale approaches 1 from below and never enlarges the prepared map beyond its native snapshot resolution.

This removes the two largest failure modes of the previous implementation: oversized high-DPR WebGL buffers and a live WebGL context surviving for the full scene or across Player remounts. MapLibre export no longer enables Remotion's experimental HTML-in-canvas capture. A context loss, snapshot failure or initialization timeout automatically falls back to the equivalent SVG `geo-route` scene.

The project safety cap is 3072 px for either live canvas dimension, with a default MapLibre follow zoom of 1.3. Diagnostics report GPU limits, actual plate dimensions, snapshot status and safe zoom.

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


## Prompt → Premium Director

The studio now separates semantic direction from rendering. ChatGPT/Codex turns a natural-language request into a compact `director` brief plus factual `story`, route and asset data. The browser does **not** call an LLM. `src/project/premiumDirector.ts` deterministically expands that brief into a shot plan.

The Director controls goal, target duration, narrative, pacing, visual language, map role, map engine, asset balance, hook, payoff and avoid rules. Generated scenes receive explicit roles: `hook`, `orient`, `travel`, `detail`, `bridge`, and `payoff`.

This makes the creative translation reviewable: the Studio shows the original prompt, Director choices and scene roles. Build validation checks that Director outputs contain a hook/payoff and can reject back-to-back pure map shots when that rule is enabled.

See `projects/kyoto-premium-director.json` for the reference example and `skills/premium-video-director/SKILL.md` for the authoring protocol.


## Long-form YouTube compositor

Long-form projects use `template: "youtube-story"` and a top-level `youtube` timeline. This intentionally mirrors the architecture used by Remotion's own Roller Ski production in `packages/jonnys-videos/src/roller-skis`.

`YouTubeComposition.tsx` uses:
- one continuous voiceover/music layer,
- `Series.Sequence` for consecutive named chapters,
- nested `Sequence` overlays for B-roll and motion graphics,
- chapter-relative captions that keep running while overlays change,
- one-second chapter/media premounting,
- a dedicated YouTube end card,
- separate thumbnail metadata.

Short-form videos continue to use `VideoComposition` and `TransitionSeries`; `ProjectComposition` routes between both renderers. The reference long-form project is `projects/peak-district-youtube-longform.json`, which is 6 minutes 30 seconds at 1920×1080/30fps.


## Exact upstream Roller Ski reference

The original Remotion Roller Ski example is vendored unchanged under:

`reference/remotion-dev/remotion/packages/jonnys-videos/src/roller-skis/`

It is pinned to upstream commit `5f253b8a298e10c8007677ba2bd8c541303603f0`. All 22 source files in that folder were verified by Git blob SHA to be byte-for-byte identical to upstream. The matching Remotion `LICENSE.md`, package README and an `UPSTREAM.md` provenance note are stored alongside it under `reference/remotion-dev/remotion/`.

## Original Remotion Roller Skis previews

Two standalone entries in the Studio use the original Roller Skis animations
from `reference/remotion-dev/remotion/packages/jonnys-videos/src/roller-skis/`:

- **Roller Skis · Original Nordic Routes**: 180 frames at 30 fps, with the original GPX-derived route data and animated SVG drawing.
- **Roller Skis · Original Lower Third**: 108 frames at 30 fps, using the original entrance and exit animation. A compatibility adapter copies the original render logic but omits the unsupported interactivity schema registration.

These are native Remotion compositions, not JSON recreations. The Nordic Routes component imports unchanged upstream code. The lower-third preserves upstream motion and visuals through a local compatibility adapter. Their small JSON project files contain selection metadata only. Preview and browser export share the same component. The full upstream film is not included as a working Studio project, because it uses external motion footage, audio, and more intensive WebGL rendering. See `reference/remotion-dev/remotion/UPSTREAM.md` for attribution and source.

## Asset-free YouTube motion graphics

The `peak-district-asset-free-youtube` project is a complete **3:20, 1920×1080**
YouTube-oriented motion-graphics demonstration, with seven narrated-script chapters
and a YouTube end card. It is a silent, caption-led example; scripts are supplied
for a future recorded narration, not synthesized audio.

- No video, photos, audio, tile requests, external fonts, heavy assets or WebGL.
- Uses a new reusable `motion-diagram` scene: six-node route flows and three-node
  arcs with progressively revealed connectors, deterministic progress pulses,
  typography, chapter pacing and accessible source labels.
- Reuses existing georeferenced SVG routes, kinetic titles, animated category
  bar charts, chapter numbers, captions and end cards.
- The Peak District route comes from the earlier editorial geometry and is
  labelled **illustrative, not turn-by-turn navigation**.
- Categorical bar counts describe the six chosen stops, not external statistics.
- All scene data lives in `projects/peak-district-asset-free-youtube.json`.
- Test: `npm run test:asset-free-youtube`.

The references are methodological rather than copied code: MIT-licensed
[sub-level/marketing-videos](https://github.com/sub-level/marketing-videos),
[paper2video](https://github.com/Lunamos/paper2video) and the frame-driven
long-form scene architecture in [BTC Explained](https://github.com/Shimmy0530/btc-explained).
No upstream source code or media from these three projects is bundled.
See `skills/asset-free-youtube/SKILL.md` for the authoring protocol.

