# History of AI — Production dossier

Original 60-second Cut Paper animation produced for this repository. Inspired by general procedural-animation techniques, not a reproduction of upstream code or an upstream video.

**Narrative:** Alan Turing's 1950 question → 1956 Dartmouth workshop → early optimism → funding setbacks → expert systems → Deep Blue vs Garry Kasparov (1997) → data-driven learning → 2012 deep learning landmark → public release of ChatGPT (2022) → broader applications → open-ended future.

**Sources to validate editorially before publication:** Alan Turing, *Computing Machinery and Intelligence* (Mind, 1950); Dartmouth Summer Research Project proposal (1955/1956); IBM Deep Blue 1997 match records; AlexNet/ImageNet 2012 proceedings; OpenAI ChatGPT November 30, 2022 launch. On-screen text intentionally avoids unsupported numerical impact estimates.

**Art direction:** creamy cut-paper backdrop, soft charcoal silhouettes, teal secondary ink, orange spark across 12 scenes. Figures are scalable geometry, not archival likenesses. A spark shares the same exit and entry coordinates across scenes. The handoff system currently coordinates keyed geometry; it is not a full cross-scene shape compositor.

**Sound:** browser-generated instrumental score only. No voice-over or word-level captions. Scene subtitles are editorial notes, not a timed transcript.

**Technical QA:** `npm run test:history-ai` checks 1800 frames/30fps, 12 scenes, figure presence, and keyed spark. Still required before marking release complete: actual successful GitHub Pages build, first/middle/end screenshot review, Chromium browser MP4 export, playback with audio, no blank frames, text collision QA.
