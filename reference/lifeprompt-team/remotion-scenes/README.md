# Background Remotion Scenes catalog

This directory is a source-pinned index of 201 third-party Remotion scene examples, not a library linked into the Pages runtime.

- Canonical source: https://github.com/lifeprompt-team/remotion-scenes
- Source commit: 02c7a84241da7010b5f59c420b0110aafd1d6f0d
- License: MIT (copyright 2026 lifeprompt-team)
- Showcase: https://lifeprompt-team.github.io/remotion-scenes/
- Index: catalog.json
- Authoring instructions: ../../../skills/remotion-scene-library/SKILL.md

Search: npm run motion:find -- "Kyoto travel watercolor transition"

## Runtime policy

The catalog is used by ChatGPT/Codex when planning videos. src/project/catalog.ts and the Vite bundle never import it. The 201 source components have not been copied into our runtime. Only an individually chosen, reviewed and adapted scene should be imported.

The index contains approximate keywords and compatibility flags:
- not-tested: no compatibility claim
- performance-review: potential frame/export complexity
- webgl-review: Three/WebGL-dependent code, separate render review required

These flags are screening hints, not passed-test results. The upstream library uses React 18 and Remotion 4 ranges plus optional 3D dependencies; this project pins its own Remotion/React versions. Check for API differences before integration.

If copying source code, retain the upstream MIT copyright and permission notice in the corresponding vendored directory. Observe the Remotion framework license separately.

This metadata-only approach does not change the Pages UI or impose render/network costs on normal videos.
