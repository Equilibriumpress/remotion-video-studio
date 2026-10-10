# History of AI 2.0 — Quality benchmark

A separate versioned 15-scene Cut Paper film; original v1 remains available. This is an independently coded illustration study, not copied upstream video.

## Story
1950 Turing question; 1956 Dartmouth; symbolic AI and optimism; setbacks and AI winter; expert systems; 1997 Deep Blue; data-driven approaches; 2012 deep learning; 2017 Transformer paper; 2022 ChatGPT; contemporary uses and open questions.

## Improvements over v1
- Eight authored paper-object compositions with layered silhouette geometry, shadows and light texture instead of generic icons alone
- Nine-point polygon morph per scene with position and color interpolation
- Named shared orange-spark visual anchor at constant normalized coordinates
- Author-specified beat visual pulses and instrumental procedure score
- 15 chapters, 60 seconds at 30fps, 13 fades and one hard cut

## Remaining gaps
- Morph interpolates within scenes; it is not yet a full scene-to-scene compositor that automatically carries arbitrary vertices through crossfade boundaries
- Beat effects use authored time cues; musical waveform/onset analysis and beat-aligned score generation are not implemented
- Figures are procedural silhouettes rather than illustration-for-illustration equivalents of the upstream film
- No narration or word-aligned captions. Subtitles are scene labels, not a caption transcript

## Human/technical acceptance
Run `npm run build` and inspect first/middle/last frames of every chapter in Chromium, including scene boundaries and the sole hard cut. Export Draft and Standard MP4, then play files with audio. Review text safety and compare to v1. Do not call this end-to-end verified until browser export and playback are actually observed.

Editorial references to confirm: Alan Turing (1950); Dartmouth proposal (1955/1956); IBM Deep Blue vs Kasparov (1997); AlexNet/ImageNet (2012); Vaswani et al. 'Attention Is All You Need' (2017); ChatGPT public release (2022).
