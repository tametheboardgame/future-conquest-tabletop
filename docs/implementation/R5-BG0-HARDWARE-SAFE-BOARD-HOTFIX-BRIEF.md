# R5 BG0 Known-Good R3 Map Lifecycle Recovery

## User correction

David has correctly challenged the assumption that MapLibre/WebGL itself is unsuitable. The previous non-tabletop Future Conquest production build used this MapLibre/Three.js terrain map successfully on the same class of desktop browser. Therefore the goal is NOT to replace the live map with a DOM/SVG imitation.

The authoritative problem is that the R5 tabletop branch does not run the old production map through the same lifecycle and integration path.

## Evidence from the known-good non-tabletop production repo

Reference repository: `tametheboardgame/future-conquest`, current `main` immediately before the tabletop pivot.

Known-good architecture:

1. `App.tsx` mounts the terrain map as the normal Command Map renderer from initial application render.
2. `App.tsx` calls `prewarmTerrainMapModule()` when terrain is requested.
3. `r3-terrain-loader.ts` preloads the optional terrain runtime/module and terrain manifest before the player reveals the campaign.
4. `StartupExperience` keeps the application children mounted behind the title/intro overlay. The map is therefore allowed to initialise before BEGIN CAMPAIGN rather than beginning all MapLibre/worker/DEM/WebGL work during the reveal transition.
5. Production uses the `TerrainMapPrototype` wrapper and `r3-terrain-loader`, not a direct post-launch import of `TerrainMapPrototypeImpl`.
6. The production renderer uses the existing MapLibre/Three stack with the same dependency family as the tabletop repo (`maplibre-gl ^6.0.0`, `three ^0.179.1`, React 19).
7. Current non-tabletop `main` remains the source of truth for the stable renderer files and lifecycle. Preserve its MapLibre/Three behavior unless R5 adaptation genuinely requires a narrow change.

## Divergences introduced by the R5 recovery

The tabletop implementation currently:

- waits for `R5_GAME_REVEALED_EVENT` before permitting the terrain renderer to mount;
- waits two animation frames plus a one-second timeout after BEGIN CAMPAIGN;
- creates a throwaway WebGL context to inspect the renderer, explicitly loses that context, then shortly afterwards creates the real MapLibre context;
- imports `TerrainMapPrototypeImpl` directly rather than using the known-good `TerrainMapPrototype` + `r3-terrain-loader` boundary;
- has accumulated PR #12/#14/#15 lifecycle/staging/shared-renderer/circuit-breaker changes that do not exist in the known-good non-tabletop renderer.

These differences mean we have not actually been testing "the old working map with new board-game rules". We have been testing a materially different renderer startup path.

## Required implementation direction

1. **Do not replace MapLibre/Three.js with a hardware-safe SVG/DOM board.** The known-good live map is the target.
2. Use `tametheboardgame/future-conquest` current `main` as the golden production renderer baseline. Audit and, where practical, transplant the exact current production versions of:
   - `src/presentation/r3-terrain-loader.ts`
   - `src/components/TerrainMapPrototype.tsx`
   - `src/components/TerrainMapPrototypeImpl.tsx`
   - `src/presentation/r3-world-miniatures-layer.ts`
   - `src/presentation/r3-formation-miniatures-layer.ts`
   - any directly required shared helpers/assets/styles.
3. Restore the old startup lifecycle: prewarm the terrain module/runtime before campaign reveal and keep the terrain host mounted behind the launcher, as the non-tabletop production app does.
4. Remove the R5-specific throwaway WebGL renderer probe / `WEBGL_lose_context` cycle from the normal path.
5. Remove or bypass R5-only renderer modifications from PR #12/#14/#15 unless comparison proves they are required. Prefer the known-good renderer behavior over speculative mitigations.
6. Keep ONLY the R5 authority boundary around the renderer:
   - R5 state/save/PRNG/actions/combat remain authoritative;
   - the existing one-way R5 -> legacy presentation adapter may feed renderer-compatible state;
   - map selection callbacks return to R5 piece/region selection and Move/Attack dispatch;
   - no historical simulation action authority returns.
7. Do not bring the old abstract circular-node board back.
8. Do not start BG1+.

## Investigation requirement

Before coding blindly, produce a file-by-file/lifecycle comparison between current tabletop `main` and non-tabletop production `main`. Identify every renderer/startup difference that can execute from app load through the first 10 seconds of terrain startup.

Particular attention:

- module preload timing;
- launcher-hidden vs post-launch renderer mounting;
- worker setup timing;
- WebGL context creation count and order;
- `TerrainMapPrototype` wrapper behavior;
- terrain source prewarm/manifest timing;
- MapLibre constructor options;
- terrain style/DEM activation;
- miniature layer `onAdd`, renderer ownership and projection matrix behavior;
- StrictMode create/dispose cycles;
- CSS/container geometry while the launcher is covering the app;
- R5 adapter changes that could cause source churn during initial load.

## Acceptance

The implementation must establish a "known-good parity mode" whose map startup/lifecycle matches non-tabletop production as closely as possible while R5 remains authoritative.

Required validation:

- source-contract test proving terrain prewarm occurs before campaign reveal;
- source-contract test proving normal R5 path does not wait for the reveal event to create the terrain host;
- source-contract test proving the throwaway WebGL probe is gone;
- exact renderer file/lifecycle parity report against `tametheboardgame/future-conquest` current `main`;
- existing R5 rules tests remain green;
- `npm test`;
- `npm run test:r5`;
- `npx tsc --noEmit -p tsconfig.app.json`;
- `npm run build`;
- `git diff --check`;
- browser gate exercises the parity path for at least 60 seconds and reports renderer/context count, but CI software rendering is supporting evidence only.

Final BG0 acceptance still requires David's affected desktop because that is the machine on which the old non-tabletop map worked and the current R5 map freezes.

## Scope

BG0 renderer-integration recovery only. No gameplay expansion, cards, mobilisation, AI, balance work or new art direction.