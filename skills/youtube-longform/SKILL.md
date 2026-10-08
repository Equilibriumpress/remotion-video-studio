---
name: youtube-longform
description: Build long-form YouTube videos using a continuous voiceover timeline, Remotion Series chapters, independent B-roll/graphic Sequences, captions, end cards and thumbnail metadata.
version: 1.0.0
---

# Long-form YouTube

Use this skill when the requested output is a YouTube-style long-form video rather than a short reel.

This repository adapts the proven architecture used by Remotion's own `packages/jonnys-videos/src/roller-skis` production.

Reference:
https://github.com/remotion-dev/remotion/tree/main/packages/jonnys-videos/src/roller-skis

## Core architecture

Do not compile long-form YouTube into one flat list of normal short-video scenes.

Use:
1. one continuous voiceover/music spine,
2. `Series.Sequence` for consecutive chapters,
3. nested `Sequence` overlays for B-roll and motion graphics,
4. chapter-relative captions that continue independently of overlays,
5. `premountFor={fps}` on chapters and media,
6. a dedicated YouTube end card,
7. separate thumbnail metadata.

The public Pages app uses `ProjectComposition` to route:
- short-form projects → `VideoComposition`
- `youtube-story` projects → `YouTubeComposition`

## JSON structure

A long-form project uses:

```json
{
  "template": "youtube-story",
  "format": "landscape",
  "youtube": {
    "title": "...",
    "chapters": [
      {
        "id": "chapter-01",
        "title": "...",
        "script": "...",
        "duration": 45,
        "base": {"id":"base-01","type":"hero-image","duration":45,"src":"...","title":"..."},
        "overlays": [
          {"from":12,"scene":{"id":"broll-01","type":"image","duration":8,"src":"..."}}
        ],
        "captions": [
          {"text":"...","start":0,"end":5}
        ]
      }
    ],
    "endCard": {
      "duration": 12,
      "title": "...",
      "channelName": "...",
      "subscribeLabel": "Subscribe"
    },
    "thumbnail": {
      "title": "...",
      "src": "..."
    }
  }
}
```

## Editorial rules

- Voiceover or chapter script determines chapter duration and visual beats.
- B-roll replaces or covers the base visual temporarily; it is not another chapter.
- Keep overlays short enough to preserve visual rhythm.
- Motion graphics should clarify one spoken point and then get out of the way.
- Caption timing is chapter-relative.
- B-roll and motion overlays receive a short fade-in/fade-out lifecycle while audio/captions continue.
- Avoid keeping the same visual for an entire 45–90 second chapter.
- Use maps as inserts, not permanent backgrounds, unless the story is explicitly map-led.
- End card is a real final chapter with recommendation slots; do not hide it inside a generic outro.
- Keep thumbnail copy much shorter than the video title.

## Performance

Long-form browser rendering can be memory intensive.
- always test Draft before Standard,
- premount media,
- avoid live MapLibre/WebGL across the full timeline,
- use the MapLibre snapshot renderer if needed,
- prefer SVG route graphics,
- keep remote media preflightable,
- do not add server rendering to GitHub Actions.

## Proven Remotion details retained

The adaptation intentionally preserves these structural ideas from the official Roller Ski example:
- 1920×1080 at 30fps,
- a named chapter timeline,
- `Series` for the rough cut,
- independent `Sequence` overlays,
- chapter captions,
- media premounting,
- separate motion-graphic inserts,
- route graphics as temporary B-roll,
- a dedicated YouTube end card,
- separate thumbnail metadata.

Do not copy third-party community templates with unclear or noncommercial licenses into production.

## Asset-free alternative

For a full YouTube composition without video/media downloads, consult
`skills/asset-free-youtube/SKILL.md`. The Peak District asset-free project
shows SVG maps, motion diagrams, measured titles and chart inserts, while
retaining this skill's Series/Sequence/captions/end-card architecture.
