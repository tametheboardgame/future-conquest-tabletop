# R5 BG0 Real-Hardware Freeze Hotfix

## Live acceptance failure

The merged BG0 runtime hotfix still freezes in the user's real desktop Chrome/browser after the Central Front campaign shell appears. The production shell, map and command UI render first, then the page freezes. CI remained green because the browser probe exercised SwiftShader/software fallback rather than the user's hardware-accelerated MapLibre/Three.js path.

This is now the authoritative BG0 blocker. Do not start BG1+ work.

## Product constraint

The user has explicitly said the restored R3-derived presentation is much closer to the intended board-game direction. Preserve the physical 2.5D map direction, political map, cities/landmarks/portal, formation miniatures, pan/zoom and compact command UI. Do not solve this by reverting to the abstract board or permanently removing rich visuals.

## Required engineering approach

Treat the previous fix as incomplete rather than proven. Re-investigate the actual hardware path and remove any unbounded synchronous work or render-loop/resource lifecycle that can lock the browser main/GPU thread.

Prioritise:

- MapLibre custom-layer render callbacks and Three.js renderer state-reset behaviour on a shared WebGL2 context;
- `renderer.resetState`, `renderer.render`, context ownership and resource disposal inside custom layers;
- terrain/DEM `queryTerrainElevation`, `readPixels`, synchronous GPU readbacks and per-frame retries;
- formation/city/landmark/portal model traversal, matrix work and animation inside every map render frame;
- repeated `triggerRepaint` / repaint feedback loops that never quiesce;
- multiple custom layers rendering all miniatures independently every frame;
- StrictMode double mount/unmount, duplicate timers/listeners/idle callbacks;
- MapLibre terrain/hillshade plus Three.js custom-layer GPU pressure on real hardware;
- synchronous asset decode/GLTF preparation or texture upload bursts after shell paint;
- any animation loop independent of MapLibre's own render loop.

## Diagnostic requirement

Add a production-safe diagnostic/degradation mechanism that can isolate rich subsystems without requiring DevTools. It should support staged capability gates such as terrain, world miniatures and formation miniatures, and expose enough runtime state in the UI/console/query parameter to identify which stage freezes on hardware.

Prefer automatic watchdog/circuit-breaker behaviour where feasible: rich layers should only be enabled after the prior stage has remained responsive, and failure/timeout/context-loss should leave the stable interactive command map alive. Do not rely solely on catching JavaScript exceptions because a GPU/main-thread stall may never throw one.

The critical design goal is bounded work. No rich subsystem may perform unbounded synchronous per-frame sampling, asset traversal or repaint recursion.

## Acceptance

1. BEGIN CAMPAIGN reaches the Central Front shell.
2. The browser remains responsive for at least 60 seconds after shell paint.
3. Pan/zoom and action-tray interaction remain responsive after rich-layer staging.
4. Terrain and miniatures are progressively enabled where supported.
5. If a rich subsystem cannot initialise safely, the board remains usable and identifies the disabled stage rather than freezing.
6. No duplicate renderers or independent runaway animation loops.
7. No unbounded terrain/elevation readback or custom-layer repaint loop.
8. Automated browser coverage must include a deliberately forced hardware-rich-path mode or mocked/stubbed path that does not simply choose SwiftShader fallback and call that sufficient.

## Validation

Run at minimum:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`
- extended BG0 browser runtime probe, at least 60 seconds after campaign shell paint, with repeated responsiveness heartbeats and post-window interaction

Commit and push the fix to `r5/bg0-real-hardware-freeze-hotfix`. Report the exact remote SHA, the new root-cause assessment, what was changed to bound the hardware path, and what real-hardware uncertainty remains.