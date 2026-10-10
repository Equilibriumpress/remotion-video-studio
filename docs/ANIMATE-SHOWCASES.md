# Animate showcase acceptance

Six video examples are catalogued under `projects/animate-*.json`. `npm run test:animate-showcases` validates all six projects and runs during `npm run build`.

## Browser validation

Open [Remotion Video Studio](https://equilibriumpress.github.io/remotion-video-studio/) on desktop Chromium. For every showcase, inspect scene start, middle and end, run Animation quality check, and use Draft export. Verify MP4 playback and soundtrack. Repeat Standard for Kyoto in Layers.

The code checks scene type, duration, frame count, render dimensions, motif, camera and presence of procedural score. They do not verify visual beauty, audible soundtrack, actual browser MP4 success, or Safari compatibility. Do not report browser export passed before an actual end-to-end test.

## Visual notes

The illustration assets are schematic Canvas primitives, not photorealistic or historically faithful representations. New motifs support technical demonstrations. A full editorial asset library requires separately authored scene geometry and design review.
