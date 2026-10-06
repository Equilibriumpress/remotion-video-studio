# Remotion Video Studio agent protocol

## Goal

Create data-driven videos that preview and render from GitHub Pages. Keep final video rendering on the user's device. GitHub Actions only validates and builds the static site.

## New video workflow

1. Read `src/project/schema.ts`.
2. Choose one existing template: `travel-story`, `explainer`, or `data-story`.
3. Create one JSON file in `projects/`.
4. Put local media in `public/media/<project-id>/`.
5. Use repository-relative media paths such as `/media/<project-id>/photo.jpg`.
6. Register the project in `src/project/catalog.ts`.
7. Run `npm run validate`.
8. Run `npm run build`.
9. Open a PR with a short description of the video and any new scene capability.

## Rules

- Do not create new React code for a normal content-only video.
- Reuse existing scene types before adding a new one.
- Do not hotlink remote images for rendered projects. Browser canvas export is more reliable with same-origin assets.
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

Use: `title`, `image`, `hero-image`, `split-image`, `text`, `quote`, `stat`, `list`, `timeline`, `comparison`, `chart`, `video`, `caption-video`, `outro`.

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
