---
name: premium-video-director
description: Translate a free-form video prompt into a premium creative brief, story beats and deterministic Remotion project specification.
version: 1.0.0
---

# Premium Video Director

Use this skill before Remotion implementation when the user starts with a natural-language video request.

The goal is not to map prompt nouns directly to scene types. First create a creative interpretation, then compile it.

## Director pipeline

1. **Prompt intent**
   - What should the viewer feel, understand or do?
   - Extract destination/topic, format, duration, audience, tone and factual constraints.
2. **Creative brief**
   - Choose one visual language and one pacing profile.
   - Define the hook in one sentence.
   - Define the final payoff in one sentence.
3. **Narrative arc**
   - Choose `journey`, `discovery`, `contrast`, or `guide`.
   - Give each beat one function: `hook`, `orient`, `travel`, `detail`, `bridge`, or `payoff`.
4. **Asset strategy**
   - Select images for composition quality, not only topical relevance.
   - Prefer a strong opener and a different strong destination/payoff image.
   - Use factual sourced route geometry for geographic claims.
5. **Map strategy**
   - `mapRole: none`: photography/place storytelling carries the video.
   - `mapRole: orient`: one supporting map moment.
   - `mapRole: hero`: orientation plus one movement-led route shot.
   - Default to `editorial`; use `maplibre` only when the basemap materially improves the story.
6. **Compile**
   - Write a compact top-level `director` object plus `story`, route data and assets.
   - Let `src/project/premiumDirector.ts` produce the actual scene list.
7. **QA**
   - No two pure map shots back-to-back unless explicitly requested.
   - Do not repeat the same layout simply because another waypoint exists.
   - One primary motion idea per shot.
   - Change visual mode roughly every 5–7 seconds.
   - End on emotional or conceptual payoff, not administrative metadata.

## Director JSON

A prompt-based travel project should contain:

```json
{
  "director": {
    "sourcePrompt": "Make a premium vertical Kyoto morning reel...",
    "goal": "inspire",
    "durationTarget": 35,
    "narrative": "journey",
    "pacing": "calm",
    "visualLanguage": "editorial",
    "mapRole": "hero",
    "mapEngine": "editorial",
    "assetBalance": "photo-led",
    "hook": "Kyoto before the city wakes",
    "payoff": "Arrive in Gion as the city comes alive"
  },
  "story": {
    "routeId": "higashiyama-walk",
    "title": "A quiet Kyoto morning",
    "stops": []
  }
}
```

The natural-language prompt is retained for traceability. The browser does not call an LLM. ChatGPT/Codex performs prompt interpretation during authoring; GitHub stores the resulting Director spec; Pages compiles it deterministically.

## Relationship to other skills

After the Director spec exists:
- use `../remotion-motion-direction/SKILL.md` for motion personality,
- use `../remotion-shot-composition/SKILL.md` for frame hierarchy,
- use `../remotion-maps/SKILL.md` for route rendering,
- use `../remotion-best-practices/SKILL.md` for technical QA.
