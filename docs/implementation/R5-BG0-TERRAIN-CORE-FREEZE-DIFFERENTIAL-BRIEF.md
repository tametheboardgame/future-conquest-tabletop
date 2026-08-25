# R5 BG0 Terrain-Core Freeze Differential

## Authoritative real-hardware result

The real desktop has now isolated the first failing diagnostic mode:

- `?r5HardwareDiag=shell` PASS
- `?r5HardwareDiag=stable` PASS
- `?r5HardwareDiag=terrain-none` HARD FREEZE

The ordinary/full production scene also now gets through launcher transition and visibly renders the full command map before freezing shortly afterwards.

Therefore the current failure boundary is inside the MapLibre / DEM / base-terrain path itself. The custom Three.js world and formation miniature layers are not required to reproduce the freeze and must not be touched in this work package.

Real hardware is authoritative. A green headless/SwiftShader gate is not proof of a fix.

## Goal

Create a second, narrower, diagnostic-only differential inside `terrain-none` so one real-hardware pass can identify which base-terrain subsystem causes the hard freeze. Do not guess a permanent renderer workaround yet.

## Required new diagnostic modes

Preserve existing six `r5HardwareDiag` modes and ordinary production behaviour. Add terrain-core modes with visible persistent badges/status:

1. `maplibre-base`
   - Construct the normal MapLibre map/camera/GeoJSON political overlays.
   - NO raster DEM source.
   - NO MapLibre terrain.
   - NO hillshade.
   - NO world/formation custom layers.
   - Must remain an actual MapLibre/WebGL path, not the stable SVG map.

2. `dem-source`
   - Same as `maplibre-base` plus the single bounded `r3-wp2b-terrain-dem` raster-dem source.
   - Do NOT attach it as MapLibre `terrain`.
   - Do NOT add hillshade.
   - This isolates DEM tile fetch/decode/cache cost from terrain mesh rendering.

3. `terrain-mesh`
   - Same as `dem-source`, with MapLibre `terrain` enabled using the existing production exaggeration/profile.
   - NO hillshade layer.
   - Isolates terrain mesh / elevation rendering.

4. `hillshade-only`
   - Same as `dem-source`, add the existing hillshade layer using the shared DEM source.
   - Do NOT enable MapLibre `terrain`.
   - Isolates hillshade GPU/tile work.

5. Existing `terrain-none`
   - Keep current production-equivalent base terrain: shared DEM + terrain + hillshade, no custom Three layers.

Recommended real-hardware test order:
`maplibre-base` -> `dem-source` -> `terrain-mesh` -> `hillshade-only` -> existing `terrain-none`.

## Implementation constraints

- Diagnostic-only. Ordinary URL must remain exactly the current full production renderer.
- Preserve the single shared DEM cache. Never reintroduce a duplicate hillshade DEM source.
- Preserve bounded elevation/readback policy.
- Do not add a fallback renderer, delayed startup, throwaway WebGL context, or production SwiftShader behaviour.
- Do not touch world/formation Three.js renderer architecture in this PR.
- Do not weaken existing BG0 product checks.
- Diagnostic code must not add heavy observers/per-frame tracing to ordinary production.

## Useful instrumentation

For explicit terrain-core diagnostic modes only, expose a compact visible status and `window.__r5TerrainCoreDiagnostic` snapshot containing at minimum:

- mode
- launch timestamp
- map constructed timestamp
- MapLibre `load` timestamp
- current map/style/tiles loaded booleans
- DEM source present/loaded
- terrain attached yes/no
- hillshade present yes/no
- render/repaint counters if already cheaply available
- last successful one-second main-thread heartbeat timestamp

Do not perform synchronous GPU readbacks merely for diagnostics.

## Acceptance before user retest

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`
- existing R5 BG0 browser gate green on exact remote head
- new diagnostic contract tests prove each mode includes/excludes the intended terrain subsystem
- ordinary production URL contract unchanged

Once the diagnostic build is deployed, STOP and ask for real-hardware results in the specified order. Do not implement a permanent terrain fix until the first failing terrain-core mode is known.

No BG1+ work before BG0 real-hardware stability acceptance.
