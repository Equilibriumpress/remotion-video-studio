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
- Cinematic camera presets with adjustable motion strength and per-scene transition duration
- Animated SVG elevation profiles with distance, height and ascent progress
- Auto-fitted route chapters sliced by cumulative geographic distance
- Premium route-stop cards with photography, metadata and mini-route context
- Travel Sequence Composer: route + stops + media → generated Remotion scenes
- Remotion caption pages with basic, TikTok-style and active-word highlighting
- Opt-in `CameraMotionBlur` for fast camera/photo motion without HTML-in-canvas
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
AGENTS.md                 ChatGPT/Codex authoring protocol
```

## Travel showcase projects

- `kyoto-premium-showcase` — travel editorial storytelling
- `tokyo-kyoto-shinkansen` — clean station-to-station rail route
- `maplibre-route-demo` — experimental live-basemap Tokyo–Kyoto flyover
- `kyoto-morning-route` — calm photo-led Kyoto walking reel
- `kyoto-auto-story` — the same route expressed as a compact story config with generated scenes
- `scotland-roadtrip-showcase` — flowing multi-stop Highland journey
- `studio-product-showcase` — product explainer

Production requires successful image preflight and a browser Draft render. Remote Wikimedia photographs may remain in use when export works. See `projects/IMAGE-CREDITS.md` for source credits.

## Geographic route format

`geo-route` scenes use a committed `geoRoutes` dictionary in each video JSON. Route geometries follow GeoJSON `LineString` coordinate order: `[longitude, latitude]`. Add labelled stops with geographic coordinates, choose `clean`, `watercolor`, or `flow`, and animate a fraction using `progress`. The renderer fits, projects and (optionally) rotates the whole route while retaining a correct north compass. `camera: "follow"` moves a lightweight SVG camera along the active route marker; `cameraZoom` controls the follow scale. If a scene omits `distance`, the renderer derives kilometres from the stored WGS84 line. No map tiles, WebGL or routing calls run during video playback.

The Tokyo–Kyoto sample reuses a 281-point Tōkaidō rail alignment sourced from Japanese MLIT N02 FY2025 railway data. Kyoto Morning follows OSM-based historic street centre-lines. Scotland currently uses indicative geographical waypoints rather than exact road-snapped paths. To replace its waypoint line with detailed OpenStreetMap driving geometry, run `npm run routes:scotland` once on a networked authoring machine and commit the updated JSON. The script calls Valhalla once, simplifies the resulting line and needs no GitHub Actions render minutes. Public Valhalla demos have usage limits. Sources and licenses are recorded inside project route data and shown in map scenes.

## Experimental MapLibre renderer

`maplibre-route` is a separate experimental scene type based on Remotion's official MapLibre example. It reuses the same committed `geoRoutes` data as the SVG renderer, but draws a live OpenFreeMap basemap with MapLibre GL, reveals the route as GeoJSON, moves a marker along the line and updates the camera deterministically from the Remotion frame.

The stable default remains `geo-route`. MapLibre introduces WebGL, network-fetched map style/tiles and HTML canvas. Player preview therefore has more runtime dependencies than the SVG scene. Client-side MP4 export enables Remotion's experimental `allowHtmlInCanvas` option only when a project contains `maplibre-route`. Chromium is the preferred export browser. If MapLibre cannot initialize, the scene falls back to the existing geographic SVG renderer.

The reference project uses OpenFreeMap's public Liberty style and the same 281-point Japanese MLIT Tōkaidō alignment used by the standard Tokyo–Kyoto example. No API token or secret is required.

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
