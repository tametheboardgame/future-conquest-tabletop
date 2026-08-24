# R5 BG0 real-hardware freeze differential brief

## Authoritative user result

The merged/deployed BG0 remediation on `main` at `9dc94e3257b2daf9c98cda59fee55ab467ea8342` still hard-freezes on the affected real desktop browser immediately after clicking **BEGIN CAMPAIGN**.

This overrides CI confidence. The R5 BG0 Chromium gate passed in GitHub, but it does not reproduce the affected hardware/browser failure.

## What is already known

Preserve the good work already merged:

- production MapLibre/Three lifecycle was restored close to the old working non-tabletop implementation;
- terrain module is prewarmed and mounted behind the launcher;
- the throwaway WebGL probe/delayed terrain mount was removed;
- formation/world elevation reads are bounded;
- hillshade shares the single terrain DEM source/cache;
- CI can reach a settled FULL scene, render physical formations/world pieces, remain responsive for >=60 seconds and interact normally;
- the old non-tabletop `tametheboardgame/future-conquest` map worked on the user's hardware, so do not replace the visual direction with the old abstract board.

## New implication

The failure occurs at the launcher transition itself. The next job is to distinguish, on real hardware, among:

1. launcher/audio/shell reveal logic;
2. making an already-mounted MapLibre canvas visible/composited;
3. the R5 rich-map adapter/state payload;
4. custom world/formation layers;
5. terrain/MapLibre itself.

Do not keep guessing from headless Chromium. Build a safe differential that lets the affected real browser answer this in one short test pass.

## Required diagnostic implementation

Add an explicit **diagnostic-only** query mode. It must never alter ordinary production behaviour when absent.

Recommended query: `?r5HardwareDiag=<mode>` with these modes:

- `shell`: normal R5 game shell and launcher transition, but do **not** mount `RichMapBackdrop`, MapLibre, Three, DEM or stable fallback. Render a lightweight labelled placeholder in the map area. This answers whether BEGIN CAMPAIGN itself/audio/shell reveal freezes without map work.
- `stable`: mount the existing non-WebGL `MapView` presentation instead of `TerrainMapPrototype`. Keep the same R5 adapter/state and shell. This answers whether R5 state + launcher are healthy when WebGL is absent.
- `terrain-none`: mount the normal production `TerrainMapPrototype` with explicit diagnostic scene mode `none` so MapLibre + terrain run but world/formation custom layers do not. Do not add heavy tracing to normal mode.
- `terrain-world`: MapLibre + terrain + world layer only.
- `terrain-formations`: MapLibre + terrain + formation layer only.
- `full`: exact normal rich scene, but with diagnostic logging enabled.

If existing `r5Diagnostic=1&r5Scene=...` already supplies the last four modes, reuse it rather than duplicating code. The key missing modes are a no-map shell transition and a non-WebGL stable-map transition.

## Launch-transition parity check

Compare `src/tabletop/R5StartupExperience.tsx` line-by-line with the old working `src/components/StartupExperience.tsx` launcher-to-game transition.

Specific current differences to challenge:

- R5 dispatches `R5_GAME_REVEALED_EVENT` one RAF after `launched=true`; old production has no equivalent custom reveal event. Remove it if no longer required by any live code.
- R5 startup shell lacks old production's `aria-hidden`/`inert` parity while covered. Restore parity unless there is a documented R5 reason not to.
- confirm the launcher unmount/class transition itself does not force an R5-only canvas resize/recreate/camera mutation;
- instrument only diagnostic mode with timestamps around click, `audioManager.unlock`, `setLaunched`, launcher removal, shell class change, first ResizeObserver callback, map resize/padding/camera event, and first rendered frame.

Do not add per-render diagnostics to ordinary production sessions.

## Real-hardware test contract

The diagnostic build should make it trivial for the user to test the modes in this order:

1. `shell`
2. `stable`
3. `terrain-none`
4. `terrain-world`
5. `terrain-formations`
6. `full`

Each mode should show a persistent small diagnostic badge before launch so the user can confirm which mode loaded. After BEGIN CAMPAIGN, if the browser remains responsive, display a simple status line such as `LAUNCHED / RESPONSIVE` and the mode name. Do not require DevTools.

Report the exact deployed diagnostic URLs in the PR comment once available.

## CI requirements

Keep ordinary BG0 acceptance strict. Additionally add cheap contract coverage that:

- diagnostic modes are opt-in only;
- ordinary URL still uses FULL rich renderer;
- `shell` creates zero MapLibre/WebGL/Three runtime;
- `stable` creates zero MapLibre/WebGL/Three runtime;
- diagnostic instrumentation is absent on ordinary FULL mode unless explicitly enabled.

Run:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`
- existing BG0 gate.

## Decision rule after real-hardware differential

- If `shell` freezes: investigate launcher/audio/shell transition only. Do not touch renderer.
- If `shell` works but `stable` freezes: investigate R5 shell/adapter/state rendering.
- If `stable` works but `terrain-none` freezes: issue is MapLibre/terrain/canvas visibility or hardware graphics path.
- If `terrain-none` works and one custom-layer mode freezes: isolate that layer.
- If all isolated modes work but `full` freezes: investigate combined GPU/resource pressure.

Do not merge a guessed production workaround from this PR merely because CI is green. First deploy the differential and stop for the user's real-hardware results unless the diagnostic itself exposes an obvious deterministic bug.

Do not start BG1+.