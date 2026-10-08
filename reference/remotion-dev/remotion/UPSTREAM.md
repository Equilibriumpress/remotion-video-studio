# Upstream Remotion Roller Ski reference

This directory contains an unmodified source snapshot of Remotion's official Roller Ski video example.

- Source: https://github.com/remotion-dev/remotion/tree/5f253b8a298e10c8007677ba2bd8c541303603f0/packages/jonnys-videos/src/roller-skis
- Upstream commit: `5f253b8a298e10c8007677ba2bd8c541303603f0`
- Exact copied source folder: `packages/jonnys-videos/src/roller-skis/`
- Upstream license: `LICENSE.md`
- Upstream package README: `packages/jonnys-videos/README.md`

The Roller Ski source files remain byte-for-byte identical to upstream. The Vite application now directly imports the original NordicRoutes component. It also offers the original IntroLowerThird motion via `src/remotion/upstream-compat/IntroLowerThird.tsx`, because the published Remotion interactivity schema does not accept the upstream text field definitions. The visuals and interpolation code are unchanged, but the schema registration is omitted. The full rough cut, its external footage, and the WebGL blueprint are not integrated. Native composition metadata lives in `projects/roller-skis-original-*.json`. This is separate from the JSON-first long-form YouTube compositor.
