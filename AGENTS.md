# Remotion Video Studio agent protocol

## Goal

Create premium travel videos and route stories that preview and render from GitHub Pages. Keep final video rendering on the user's device. GitHub Actions only validates and builds the static site.

For illustrated procedural videos, read `skills/animate-director/SKILL.md`. Animate scenes are generated from reviewed storyboard beats and use existing Remotion browser export with experimental Canvas capture. Do not claim Safari/iPad MP4 compatibility without an end-to-end test.

## New video workflow

Before designing motion from a prompt, consult skills/remotion-scene-library/SKILL.md and search the pinned 201-entry background catalog if a motion technique beyond existing presets would improve the story. The catalog is authoring-only. Do not load it in the browser or imply all 201 source components are already runnable. Integrate and validate selected examples individually.


1. Read `skills/youtube-longform/SKILL.md` when the user requests a long-form YouTube video. Read `skills/premium-video-director/SKILL.md` for short prompt-led video.
2. Read `src/project/schema.ts`.
3. Prefer `youtube-story` for long-form narrated YouTube work, `travel-story` for short travel and routes. Use `explainer` for product videos. Keep `data-story` for technical compatibility and internal experiments.
4. For prompt-led travel videos, prefer top-level `director` + `story`: ChatGPT/Codex interprets the prompt once, then the deterministic Premium Director compiler creates the shot sequence.
5. Use plain `story` when the user wants a straightforward route sequence without creative direction, and explicit `scenes` for bespoke edits or unsupported structures.
6. Create one JSON file in `projects/`.
7. Use existing licensed remote photo URLs when browser asset preflight and export work. Keep source credits. Local files under `public/media/<project-id>/` remain an option when an external host fails.
8. Use repository-relative paths for media stored in this repository.
9. Register the project in `src/project/catalog.ts`.
10. Run `npm run validate`.
11. Run `npm run build`.
12. Open a PR with a short description of the prompt, creative direction, compiled shot arc and any new scene capability.

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


## Agent skill layer

Before changing Remotion code or project JSON, read `skills/remotion-best-practices/SKILL.md`. The local skills adapt Remotion 4.0.534 Agent Skills to this browser-first repository and add project-specific map, motion-direction, shot-composition and interactivity rules.

Upstream references:
- Remotion Agent Skills 4.0.534: https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills
- Motion design craft: https://github.com/iart-ai/motion-design-skills
- Editorial maps: https://github.com/iart-ai/map-animation-skills
- Motion graphics QA patterns: https://github.com/haidrrrry/claude-remotion-skill

Native Remotion Studio `Interactive.withSchema()` is useful for JSX-authored connected compositions, but this repository remains JSON-first. Do not replace project JSON with JSX solely for Studio source write-back. Expose editability through Zod and the Pages UI first.

### Motion direction

Projects may define a top-level `direction` object with `personality`, `baseTimingSeconds`, `focalPoint`, `transitionFamily` and optional notes. The motion engine uses the personality to tune entrance speed, spring behavior and overall movement intensity. Keep one primary motion idea per shot.

### Beat sync

Scenes may define `beatSync` with scene-relative beat timestamps, strength and decay. Beat detection happens before rendering; never analyze audio on the render clock.

### Editorial cadence

`editorial-map` and `maplibre-route` support `graphicFps`. Use `graphicFps: 12` for stepped editorial overlays while keeping the composition and MapLibre camera/plate smooth.

### Prompt → Premium Director → Remotion

Do not translate a free-form prompt directly into scene types. First create a `director` brief with:
- source prompt
- goal and audience
- target duration
- narrative arc
- pacing and visual language
- map role / engine
- asset balance
- one-sentence hook
- one-sentence payoff
- explicit avoid rules

The repository then compiles `director + story` into scene roles: `hook`, `orient`, `travel`, `detail`, `bridge`, and `payoff`. The Studio displays the retained source prompt and scene roles so the translation can be reviewed.

Premium Director currently targets geographic travel stories. Do not pretend that the browser is semantically interpreting the natural-language prompt: the agent performs that interpretation during authoring; the browser compiler is deterministic.

### Long-form YouTube

Long-form YouTube uses a separate composition architecture inspired by Remotion's official `packages/jonnys-videos/src/roller-skis` project. Do not flatten a 5–10 minute video into the short-form `TransitionSeries`.

Use:
- one continuous voiceover/music spine,
- `Series.Sequence` chapters,
- nested `Sequence` B-roll and motion-graphic inserts,
- chapter-relative captions,
- `premountFor={fps}` for chapters and media,
- a dedicated end card,
- thumbnail metadata.

The compositor is `src/remotion/YouTubeComposition.tsx`; `ProjectComposition` selects it automatically when a project has a top-level `youtube` object. See `projects/peak-district-youtube-longform.json` for the reference project.

## Premium motion system

Prefer scene + motion + transition composition over custom React for content videos.

### Scene library

Use: `title`, `image`, `hero-image`, `split-image`, `photo-mask`, `kinetic-title`, `chapter-number`, `lower-third`, `callout`, `text`, `quote`, `stat`, `list`, `timeline`, `comparison`, `chart`, `line-chart`, `donut-chart`, `geo-route`, `maplibre-route`, `editorial-map`, `travel-hud`, `three-globe`, `three-vehicle`, `audio-reactive`, `elevation-route`, `route-chapter`, `route-stop`, `route-map`, `location-card`, `progress-route`, `map-overlay`, `lottie`, `video`, `caption-video`, `caption-demo`, `appstore-creative`, `outro`.

### Motion presets

Use one of: `none`, `fade-rise`, `slow-push`, `pan-left`, `pan-right`, `pop`, `drift-up`, `zoom-out`, `cinematic-push`, `cinematic-pull`, `pan-and-zoom`, `float-horizontal`.

Use `cinematic-push`, `cinematic-pull`, and `pan-and-zoom` for slower photo-led travel sequences. Use `slow-push` and `zoom-out` mainly for visual media. Use `fade-rise`, `pop` and `drift-up` for typography and data. Set `motionAmount` between roughly 0.6 and 1.1 for restrained travel edits. Use optional `motionBlur` only on fast movement or whip-style scenes; start around 4–5 samples and a 90–140° shutter angle. Keep it off for static typography and most route maps because every sample increases browser render work.

### Transition presets

Use one of: `cut`, `fade`, `slide-left`, `slide-up`, `wipe`, `zoom`, `soft-zoom`, `whip-left`, `iris`.

Limit one project to two or three transition styles unless the brief asks for a deliberately energetic edit. `transitionDuration` overrides the default 0.45-second overlap and accepts 0.15–1.5 seconds.

### Media

For browser-rendered video, use `video` or `caption-video` with local assets under `public/media/<project-id>/`. Use `caption-video` captions as scene-relative seconds. The renderer converts these segments to the official Remotion `Caption[]` model and groups them with `createTikTokStyleCaptions()`. Choose `captionStyle: "basic"`, `"tiktok"`, `"word-highlight"`, `"editorial-highlight"`, `"karaoke"`, `"pill"`, or `"cinematic"`; use `combineTokensWithinMilliseconds`, optional `breakOnSilenceAfterMilliseconds`, `emphasisWords`, and `captionPosition` to control page rhythm.

Project-level `audio.music` and `audio.voiceover` are supported. Keep audio local and use explicit volume values.

Use `lottie` for small reusable animated assets such as route pulses, compass flourishes, transport icons and editorial accents. Store JSON under `public/media/` so preflight and browser export are deterministic. The scene uses the SVG Lottie renderer. Prefer `@remotion/shapes` for simple arrows, circles, sparks and callouts instead of importing a Lottie file for geometry that can stay pure SVG.


### SVG typography and image treatments

For `kinetic-title`, choose `style`: `stacked`, `word-reveal`, `oversize`, `split`, or `zoom`. Use `highlight` for one emphasized word and `align` for left or centered layouts.

For `photo-mask`, choose `shape`: `portrait`, `circle`, or `window`. Optional `treatment` values are `natural`, `warm`, and `dark`. Optional `frame` values are `none`, `thin`, and `offset`.

Prefer restrained combinations. One strong mask or kinetic treatment per sequence is usually enough.


### Geographically faithful routes

### Experimental Remotion Three

Use `three-globe` only for global-scale travel, aviation or geographic perspective where 3D adds information. The scene uses `@remotion/three` + React Three Fiber with a procedural sphere, grid and great-circle arcs; do not add runtime textures, remote 3D models or terrain downloads to the default implementation. Keep `dpr={1}` and modest geometry detail so browser preview remains usable on tablets.

The 3D route is a visualization, not a navigable flight path. Use sourced geographic coordinates for stops and say so in the scene when a path is illustrative. Browser MP4 export is experimental because the Three.js canvas requires HTML-in-canvas capture; prefer Chromium. Keep an SVG-based project or scene available for production-critical output.

### Experimental MapLibre maps

Use `maplibre-route` only when a real basemap materially improves the story. MapLibre GL JS 6 must use the Vite-bundled worker URL and one worker. The production pattern is a **bounded snapshot plate**: load the style once, fit the route once, wait for `idle`, project the route geometry, capture the WebGL canvas to a bitmap, then release MapLibre before normal scene playback or MP4 frame capture.

Use `pixelRatio: 1`, keep the live map canvas at or below the project safety cap (3072 px maximum dimension), restrict tile cache, keep pitch/bearing static and use local CJK ideographs. Do not use per-frame `map.jumpTo()`. CSS plate transforms must never upscale above 1; build enough overscan into the prepared plate instead.

The upstream Remotion rule not to call `map.remove()` during render cleanup still applies. Removal here is allowed only after the snapshot has decoded, or for an abandoned non-rendering Player load. Map exports therefore use Remotion's normal DOM compositor; only live Three.js scenes require experimental HTML-in-canvas.

The route overlay may intentionally run at a lower `graphicFps` while camera/plate movement remains smooth. Fall back to the equivalent SVG `geo-route` on timeout, snapshot failure, missing WebGL or context loss. Diagnostics should expose style/idle/snapshot state, GPU limits, plate size and safe zoom.

Use `geo-route` for videos portraying a real railway, pedestrian route or road trip. Provide a top-level `geoRoutes` entry containing WGS84 `LineString` coordinates in `[longitude, latitude]` order, a route mode (`rail`, `walking`, `driving`) and source attribution. Scenes reference a `routeId` plus georeferenced `stops`. Reuse the route across scenes and vary `progress`, `style`, and `mapRotation` to tell the story. Use `camera: "follow"` with a restrained `cameraZoom` for movement-led sequences and `camera: "overview"` for orientation or arrival scenes. When `distance` is omitted, the scene derives route kilometres from the committed coordinates. The map draws SVG from precomputed geographic data; it does not fetch tiles or call live routing APIs during render. Optional `contextLines` must also be geographically sourced.

For movement-led route scenes, add `vehicle` with type `train`, `car`, `walker`, `bike`, or `plane`. The glyph follows the same progress value as the route and rotates from the local path bearing. Keep vehicle graphics SVG-only so browser export remains deterministic.

Use `elevation-route` when measured or sourced elevation samples are available. Store reusable samples in `elevationProfiles`, keep distances strictly increasing, and label synthetic/test data explicitly. The scene animates distance, current elevation and cumulative ascent without runtime terrain requests.

Use `route-chapter` to focus a long trip on one geographic leg. `startProgress` and `endProgress` are measured along cumulative route distance, then the segment is automatically fitted to the frame. This avoids index-based slicing on uneven GeoJSON geometries.

Use `route-stop` for editorial arrival, POI and waypoint moments. Layouts are `editorial`, `minimal`, `split`, and `photo-map`. When `routeId` and `routeProgress` are provided, the stop card includes a mini-map rendered from the same committed GeoJSON source.

### Travel Sequence Composer

Use a top-level `story` object for conventional route-led travel videos. Provide a sourced `routeId`, 2–8 georeferenced stops, optional photographs and concise editorial copy. The composer derives stop progress from the actual route and generates reusable scene types instead of a second rendering system. `mode: "replace"` makes the generated sequence the project timeline, while `mode: "append"` adds it after explicit scenes. Generated scenes still pass schema, asset and geographic validation. Do not supply invented route, elevation, time or distance data as factual travel information.

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
- `three-globe-flight-demo` for global-scale aviation stories where a 3D globe adds perspective.
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

## Vertical Travel Reels

For TikTok/Reels travel films with no media, read `skills/vertical-travel-reel/SKILL.md`. The reusable `travel-reel-highlight` SVG scene, real `geoRoutes`, and top-level `reelCaptions` keep 9:16 footage deterministic and captions in platform-safe zones. Reference: `projects/kyoto-travel-reel.json`. Global reel captions are only supported on vertical, non-YouTube projects.
