# Remotion Video Studio agent protocol

## Goal

Create premium travel videos and route stories that preview and render from GitHub Pages. Keep final video rendering on the user's device. GitHub Actions only validates and builds the static site.

## New video workflow

1. Read `src/project/schema.ts`.
2. Prefer `travel-story` for travel and routes. Use `explainer` for product videos. Keep `data-story` for technical compatibility and internal experiments.
3. Create one JSON file in `projects/`.
4. Use existing licensed remote photo URLs when browser asset preflight and export work. Keep source credits. Local files under `public/media/<project-id>/` remain an option when an external host fails.
5. Use repository-relative paths for media stored in this repository.
6. Register the project in `src/project/catalog.ts`.
7. Run `npm run validate`.
8. Run `npm run build`.
9. Open a PR with a short description of the video and any new scene capability.

## Rules

- Do not create new React code for a normal content-only video.
- Reuse existing scene types before adding a new one.
- Licensed remote images are permitted when preview, preflight and video export work. Document the image sources; fall back to local media only if needed.
- Keep scene IDs unique inside a project and project IDs unique across the repository.
- Keep all `remotion` and `@remotion/*` packages on exactly the same version.
- Do not add server rendering, Lambda, FFmpeg rendering or video rendering to GitHub Actions.
- Test Draft before Standard on resource-constrained devices.
- A new reusable scene type must work in both `@remotion/player` and `@remotion/web-renderer`.
- Prefer SVG and renderer-safe primitives for core graphics.
- Keep project content separate from template and scene implementation.

## Definition of done

A project is done when validation passes, the Pages preview plays from first to last frame, asset preflight succeeds and a Draft MP4 renders in a supported browser.


## Premium motion system

Prefer scene + motion + transition composition over custom React for content videos.

### Scene library

Use: `title`, `image`, `hero-image`, `split-image`, `photo-mask`, `kinetic-title`, `chapter-number`, `lower-third`, `callout`, `text`, `quote`, `stat`, `list`, `timeline`, `comparison`, `chart`, `line-chart`, `donut-chart`, `route-map`, `location-card`, `progress-route`, `map-overlay`, `video`, `caption-video`, `outro`.

### Motion presets

Use one of: `none`, `fade-rise`, `slow-push`, `pan-left`, `pan-right`, `pop`, `drift-up`, `zoom-out`.

Use `slow-push` and `zoom-out` mainly for visual media. Use `fade-rise`, `pop` and `drift-up` for typography and data.

### Transition presets

Use one of: `cut`, `fade`, `slide-left`, `slide-up`, `wipe`, `zoom`.

Limit one project to two or three transition styles unless the brief asks for a deliberately energetic edit.

### Media

For browser-rendered video, use `video` or `caption-video` with local assets under `public/media/<project-id>/`. Use `caption-video` captions as scene-relative seconds.

Project-level `audio.music` and `audio.voiceover` are supported. Keep audio local and use explicit volume values.


### SVG typography and image treatments

For `kinetic-title`, choose `style`: `stacked`, `word-reveal`, or `oversize`. Use `highlight` for one emphasized word and `align` for left or centered layouts.

For `photo-mask`, choose `shape`: `portrait`, `circle`, or `window`. Optional `treatment` values are `natural`, `warm`, and `dark`. Optional `frame` values are `none`, `thin`, and `offset`.

Prefer restrained combinations. One strong mask or kinetic treatment per sequence is usually enough.


### Geographically faithful routes

Use `geo-route` for videos portraying a real railway, pedestrian route or road trip. Provide a top-level `geoRoutes` entry containing WGS84 `LineString` coordinates in `[longitude, latitude]` order, a route mode (`rail`, `walking`, `driving`) and source attribution. Scenes reference a `routeId` plus georeferenced `stops`. Reuse the route across scenes and vary `progress`, `style`, and `mapRotation` to tell the story. The map draws SVG from precomputed geographic data; it does not fetch tiles or call live routing APIs during render. Optional `contextLines` must also be geographically sourced.

- `tokyo-kyoto-shinkansen`: Japan MLIT FY2025 rail track, already reduced to an animated line.
- `kyoto-morning-route`: measured and OpenStreetMap-based streets of Southern Higashiyama.
- `scotland-roadtrip-showcase`: geographical town/road waypoints remain indicative until fully road-snapped; the optional one-time authoring command `npm run routes:scotland` fetches a Valhalla route and saves the road geometry in the project JSON. Do not call these illustrative waypoint links exact navigable roads.
- Always show appropriate map-data attribution within the video and the project documentation. Validate stops against the path; do not invent routes from arbitrary normalized positions.

### Lightweight SVG maps

Use `route-map`, `location-card`, `progress-route`, and `map-overlay` for stylized geographic motion when a live basemap is unnecessary. Legacy scenes use normalized 0–1 scene space. Do not present them as geographically exact. Keep routes to a small number of meaningful stops and use `contextPath` only for lightweight SVG geography.

Do not introduce map tiles or WebGL into these scenes.

### Showcase references

Use these projects as composition references:

- `kyoto-premium-showcase` for photography + route + editorial masks.
- `tokyo-kyoto-shinkansen` for clean station-to-station route explainers, journey progress and train imagery.
- `kyoto-morning-route` for watercolor walking routes, editorial image masks and calm pacing.
- `scotland-roadtrip-showcase` for flow-style maps, multi-stop routes and landscape-led travel films.
- `studio-product-showcase` for kinetic typography and explainer pacing.


### Launch motion language

Use `launch-hero`, `feature-grid`, and `cta` for product launches, app promos, research explainers, and high-energy intros.

The visual language is: restrained particle fields, HUD-style corner brackets, scanner lines, staggered feature cards, and a focused CTA finale. Do not use every effect in every scene; preserve contrast between dense launch scenes and quieter explanatory scenes.


### Travel-route motion language

For travel stories, prefer `route-map` with a deliberate map style:

- `clean` for product/data contexts.
- `watercolor` for editorial travel and place storytelling.
- `flow` for energetic journeys and abstract movement.

Route points may use `icon`: `pin`, `temple`, `nature`, `station`, or `city`. Use `detail` for a short time, distance, or contextual cue. The route engine performs a subtle zoom-out while drawing the line and moving the active marker.


### Travel-first positioning

Position the studio as a travel video studio and route storytelling engine. Prioritize destination footage or licensed photos, SVG route animation, stop callouts and concise captions. The public catalog highlights travel examples plus one product explainer. Keep research-only data scenes out of the public showcase list.

Images may remain remote when they pass preflight and export tests. Preserve Wikimedia attribution. Preserve source, creator and license attribution in project documentation. The local asset preflight and browser Draft render remain mandatory release checks.

### Combined data motion

Use `bar-line-chart` when two related series should be read together. The animation order is deliberate: bars grow first, the line draws second, labels follow, and the final line point receives a subtle pulse. This pattern is preferable to showing multiple disconnected chart scenes when the comparison belongs in one visual.
