# Animate Canvas foundation

Browser-native, deterministic procedural illustration scenes integrated as a Remotion scene type.

This is an original compatibility implementation inspired by the workflow of cth9191/animate. It does not vendor upstream sources. Seven palettes are exposed through `animateStyles`. The first illustration primitive is an animated cityscape with seeded building geometry.

Scenes share the existing Remotion timeline and export system. No GitHub Action is used to render videos. Browser export support depends on the existing web-renderer and canvas capture support; validate a full MP4 export in a supported browser.

The demonstration project includes three styles and three scenes. Further shapes, style fidelity, storyboard contact sheets, director generation and audio require subsequent PRs.
