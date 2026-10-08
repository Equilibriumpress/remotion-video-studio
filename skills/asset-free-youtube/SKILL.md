---
name: asset-free-youtube
description: Produce long-form YouTube motion graphics without video, photos, audio, raster media or WebGL.
version: 1.0.0
---

# Asset-free YouTube motion graphics

When a user asks for a premium YouTube video without heavy source assets:

1. Keep a single `youtube-story` with named `Series.Sequence` chapters.
2. Write spoken scripts, then chapter-relative captions. Audio is optional.
   Be explicit when the demo is silent rather than claiming generated voiceover.
3. Combine 3–6 shot families, not one layout repeated endlessly:
   `kinetic-title`, `motion-diagram`, `geo-route`, `chart`,
   `timeline`, `chapter-number`, `editorial-map`.
4. Use `motion-diagram` with `layout: "arc"` for three explanatory nodes
   and `layout: "serpentine"` for four to six ordered steps.
   Prefer short node labels and details. Each diagram reveals its
   connectors and keeps a continuous travelling signal.
5. Put motion graphics inside `youtube.chapters[].overlays` as short
   independent `Sequence` inserts. No permanent media layer is needed.
6. Never invent altitude, journey distance, temperatures or travel time.
   For charts use data from a named verifiable source or explicitly labelled
   counts drawn from the project itself.
7. Keep geography accurate: use the committed `geoRoutes`, disclose
   when an editorial line is not road-snapped navigation.
8. Use SVG primitives and `useCurrentFrame()`, not browser timers,
   state effects, remote map tiles or WebGL. The same source must work in
   Player and browser export, including iPad where supported.
9. Run validation, the asset-free test and the full build. Check preview
   at beginning, chapter boundaries and end card; try Draft MP4 in browser.

## References / attribution

- [Sub Level marketing videos](https://github.com/sub-level/marketing-videos)
  (MIT): frame-measured typography, scene grammar and 16:9/9:16 variation.
- [Lunamos paper2video](https://github.com/Lunamos/paper2video)
  (MIT): chart/story coherence, factual narration and visual QA.
- [Shimmy0530 BTC Explained](https://github.com/Shimmy0530/btc-explained):
  long-form chapters and reusable procedurally animated diagrams.
  No code copied; license not established.

Only original local components are shipped, not third-party source code or media.
