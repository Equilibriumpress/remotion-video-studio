# Animate end-to-end Chromium test

Run from the published GitHub Pages build in desktop Chromium. Actions only build and publish, they do not encode the video.

1. Open the Tokyo Animate example and run Animation quality check.
2. Inspect at least the first, middle and last frame. Check legibility, no cut-off text and obvious blank frames.
3. Choose Draft and click Render MP4.
4. The export panel validates the Blob by decoding MP4 metadata locally before offering download.
5. Open the downloaded file in Chromium or a media player, verify the entire timeline, generated score, transitions and end frame.
6. Repeat at Standard profile. Verify aspect ratio and audio.
7. Note any browser version and device model. Repeat on iPad Safari separately before claiming support.

Pass criteria: no validation errors, preview fully plays, MP4 downloads, metadata decode succeeds, full-length playback has audible music, and there are no visually blank frames. The metadata verifier does not by itself establish audio decoding, frame-by-frame correctness or full playback.

A genuine automated Chromium test requires an accessible build and browser environment. Do not label this checklist as passed before it is performed.
