# Illustration Kit 1.0

Scene `elements` adds small, repeatable Canvas illustration operations to the Animate scenes.

- `rect` and `circle`: geometric components in normalized scene coordinates
- `path`: progressively drawn line from 2–32 points
- `flow`: animated dot following the progressively drawn path
- `label`: a short text annotation
- `morph`: interpolates between two equal-length polygon vertex arrays
- `from` and `to`: normalized start and end of each element's reveal
- `color`: literal six-digit hexadecimal fill/stroke
- `speed`: dot motion speed for a flow

All geometry is calculated deterministically from a Remotion frame and JSON. The Studio remains a passive viewer/rendering machine. The 60-second heat-pump demo uses schematic figures and scene subtitles. For a polished educational explainer, ChatGPT should next author dedicated realistic heat-pump components, separate narration, and genuine word-timed caption data.

## Acceptance
Run `npm run validate` and `npm run build`; inspect the Pages preview and Draft MP4 in Chromium. This documentation does not imply those tests have already passed.
