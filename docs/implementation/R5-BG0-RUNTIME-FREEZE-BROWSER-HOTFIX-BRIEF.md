# R5 BG0 Runtime Freeze Browser Hotfix

## Production failure

The live BG0 shell still freezes immediately after the player clicks **BEGIN CAMPAIGN**, even after PR #11 removed the whole-game `inert`/`aria-hidden` transition and added MapLibre resize/repaint on reveal.

Treat the user report as authoritative. BG1 and all later board-game mechanics remain blocked.

## New evidence

The existing `R3 WP2B browser runtime probe` already launches real Playwright Chromium and clicks BEGIN CAMPAIGN. On PR #11 head it logged repeated WebGL/GPU stall messages after launch:

- `GPU stall due to ReadPixels`
- after several seconds the R3 terrain readiness diagnostic still reported `mapLoaded:false` and `styleLoaded:false`, even though individual sources reported loaded.

The legacy workflow then failed on a stale post-R5 selector (`[data-command-view="map"]`), so it does not currently prove or disprove R5 launch responsiveness.

Also important: historical R3-WP6.6 `StartupExperience` itself used `inert`/`aria-hidden`, so the first hotfix cannot be treated as the complete root-cause explanation.

A material architectural difference is that historical R3 used a lazy terrain module boundary:

- `const TerrainMapPrototype = lazy(() => loadTerrainMapModule()...)`
- `Suspense` around the production terrain host
- `prewarmTerrainMapModule()`

Current R5 `RichMapBackdrop` imports `TerrainMapPrototypeImpl` eagerly. Investigate whether eager MapLibre/Three loading/mounting, hidden WebGL rendering, reveal-time GPU composition, StrictMode lifecycle, world/formation miniature layer startup, or a combination is causing the production freeze.

## Mandatory first step: current R5 browser gate

Add a dedicated GitHub Actions Playwright/Chromium runtime workflow for the **current R5 shell**, based on the useful installation/preview pattern in `.github/workflows/r3-wp2b-browser-runtime-probe.yml` but with current selectors and acceptance criteria.

The gate must build the exact PR head, start `vite preview`, install Playwright Chromium, then:

1. open the unqualified production entry URL;
2. capture console, page errors and failed requests;
3. confirm the BEGIN CAMPAIGN button is clickable;
4. click BEGIN CAMPAIGN and require the launcher to disappear promptly;
5. prove the page main thread remains responsive after the click, for example with bounded `page.evaluate` / animation-frame heartbeat checks;
6. require `.r3-tabletop-shell` to be visible;
7. require the action tray toggle to be clickable and to change state;
8. verify there is never more than one MapLibre canvas / production terrain renderer;
9. wait for the terrain host to reach `ready`, a deliberately handled warning/fallback state, or otherwise produce explicit diagnostics rather than hanging indefinitely;
10. interact with the map enough to prove pan/zoom remains responsive where MapLibre is active;
11. capture a screenshot/artifact and relevant diagnostics;
12. fail on uncaught page errors or a blocked/unresponsive main thread.

Do not keep stale R3 command-view selectors in this new gate.

## Fix requirements

Use the browser gate to reproduce/characterise the actual current-R5 failure before declaring a root cause. Fix the smallest robust cause found.

High-priority areas to investigate:

- restore a lazy terrain-module boundary similar to historical R3 rather than eagerly importing `TerrainMapPrototypeImpl` into the initial application bundle;
- avoid doing expensive MapLibre/Three/WebGL work while the title experience is covering the game if that is contributing to the freeze;
- stage heavy terrain/world/formation miniature startup so the launcher can transition and the UI can paint responsively first;
- verify React StrictMode does not cause overlapping asynchronous renderer initialisations or duplicate WebGL resources;
- profile/check `WorldMiniaturesLayer` and `FormationMiniaturesLayer` startup for synchronous work or repeated `ReadPixels`/GPU stalls;
- ensure map source/style settlement does not create a render loop;
- preserve a functional fallback if the physical renderer cannot settle quickly.

Do not simply disable the physical map, cities, portal, landmarks or formation miniatures as the final solution. Temporary diagnostic switches are allowed only to isolate the cause.

## Preservation boundary

Must preserve:

- title/startup and music;
- 2.5D terrain as the intended production board;
- political borders;
- cities/landmarks;
- Future portal;
- formation miniatures;
- camera/pan/zoom;
- compact R5 board-game shell and tray;
- R5 state/action authority;
- deterministic save/PRNG architecture.

Do not start command dice, cards, escalation, BG1+, AI or multiplayer work.

## Validation

Required before merge:

- dedicated current-R5 Chromium launch/runtime gate GREEN;
- `npm test`;
- `npm run test:r5`;
- `npx tsc --noEmit -p tsconfig.app.json`;
- `npm run build`;
- `git diff --check`.

The browser gate is now a **required BG0 acceptance check**. Source-contract tests alone are not sufficient for this bug.
