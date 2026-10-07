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
- Local asset preflight
- Zod project schema
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

Production still requires local media copies, asset preflight and a browser Draft render. See `projects/IMAGE-CREDITS.md` for the source photographs used in the new travel examples.

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
