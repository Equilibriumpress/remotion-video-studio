# Kyoto After Dark 2.0 — SVG-directed film

Five hand-authored layered SVG compositions, separate from Canvas v1, rendered by Remotion's deterministic frame clock. Reusable: KyotoArtwork (architecture), KyotoLayeredScene (depth camera), KyotoSvgMotion (lantern light), KyotoAtmosphere (rain/reflections). No heavy image/video assets or separate clock.

**Format:** 45 seconds, 1080x1920, 30fps; five shots: alley 7s, lantern 7s, pagoda 10s, teahouse 10s, panorama 11s. `?project=kyoto-after-dark-v2`. Original `kyoto-after-dark` remains.

**Acceptance:** `npm run test:kyoto-after-dark-v2`, `npm run build`, check representative rendered frames of all five SVG shots, verify vertical cropping, inspect typography against TikTok bottom overlays, confirm in Chromium actual browser export with soundtrack. The Canvas-specific QA panel does not evaluate DOM/SVG scene pixels, so use screenshot/browser review.

**Important:** This is an original SVG-coded illustrative upgrade, not a fully art-directed frame-by-frame movie or photographic accurate Kyoto reconstruction; music is procedural and captions are editorial titles rather than word-aligned narration.
