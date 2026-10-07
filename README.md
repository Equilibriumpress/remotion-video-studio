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
- Cinematic camera presets with adjustable motion strength and per-scene transition duration
- Animated SVG elevation profiles with distance, height and ascent progress
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
- `kyoto-morning-route` — calm photo-led Kyoto walking reel
- `scotland-roadtrip-showcase` — flowing multi-stop Highland journey
- `studio-product-showcase` — product explainer

Production requires successful image preflight and a browser Draft render. Remote Wikimedia photographs may remain in use when export works. See `projects/IMAGE-CREDITS.md` for source credits.

## Geographic route format

`geo-route` scenes use a committed `geoRoutes` dictionary in each video JSON. Route geometries follow GeoJSON `LineString` coordinate order: `[longitude, latitude]`. Add labelled stops with geographic coordinates, choose `clean`, `watercolor`, or `flow`, and animate a fraction using `progress`. The renderer fits, projects and (optionally) rotates the whole route while retaining a correct north compass. `camera: "follow"` moves a lightweight SVG camera along the active route marker; `cameraZoom` controls the follow scale. If a scene omits `distance`, the renderer derives kilometres from the stored WGS84 line. No map tiles, WebGL or routing calls run during video playback.

The Tokyo–Kyoto sample reuses a 281-point Tōkaidō rail alignment sourced from Japanese MLIT N02 FY2025 railway data. Kyoto Morning follows OSM-based historic street centre-lines. Scotland currently uses indicative geographical waypoints rather than exact road-snapped paths. To replace its waypoint line with detailed OpenStreetMap driving geometry, run `npm run routes:scotland` once on a networked authoring machine and commit the updated JSON. The script calls Valhalla once, simplifies the resulting line and needs no GitHub Actions render minutes. Public Valhalla demos have usage limits. Sources and licenses are recorded inside project route data and shown in map scenes.

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
