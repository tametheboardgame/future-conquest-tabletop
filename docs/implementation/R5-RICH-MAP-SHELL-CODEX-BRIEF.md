# Codex Brief — R5 Rich Map Shell Recovery

## Objective

Correct the R5 presentation architecture by restoring the best existing Future Conquest map/city/terrain/miniature presentation as the visible R5 board while preserving the already-working R5 tabletop rules authority.

Read these as authority before changing code:

- `docs/design/R5-VISUAL-SHELL-REBASELINE.md`
- `docs/roadmap/R5_TABLETOP_ROADMAP.md`
- `docs/design/r5-tabletop-game-design.md`
- `docs/design/r5-prototype-rules-v0.1.md`
- `docs/design/r5-legacy-reuse-matrix.md`
- `docs/DEVELOPMENT_STATUS.md`

## First task: audit before implementation

Inspect the existing visual stack preserved in this repository. At minimum inspect:

- `src/components/MapView.tsx`;
- `src/presentation/map-scene-adapter.ts`;
- `src/presentation/r3-renderer-foundation.ts`;
- `src/presentation/r3-formation-miniatures-layer.ts`;
- `src/presentation/r3-landmark-miniature-assets.ts`;
- physical-terrain / map grading / camera / terrain projection modules;
- relevant generated/public city, landmark and terrain assets;
- the prior R3 application composition only to understand how the renderer was mounted.

Identify the smallest existing renderer/composition that reproduces the rich 2.5D map David was expecting. Reuse that technology rather than recreating a new flat board.

## Required implementation

1. Make the rich existing map presentation the primary visible R5 game board.
2. Keep `src/tabletop` as authoritative for R5 board-game state, seats, legal actions, deterministic saves/PRNG and combat.
3. Add an adapter between R5 strategic regions/formations and the legacy visual renderer. Do not make legacy `GameState` or the daily-turn simulation authoritative again.
4. Render/select the R5 formations using existing miniature/marker presentation where technically viable.
5. Map R5 regions/objectives/legal destinations onto the rich map without bringing back the old management interface.
6. Preserve R5 Move, alternating activation, Attack and deterministic dice-pool combat behaviour through the rich board.
7. Keep combat/action UI compact and contextual over the board. The board must remain visible and dominant.
8. Hide/remove from the R5 composition legacy simulation dashboards, detailed logistics/admin panels, daily clock/order workflow, persistent alerts/reports and other simulation-first interface noise.
9. Preserve camera/zoom/pan and the visually valuable terrain/city/landmark treatment.
10. Keep the existing simplified `TabletopBoard` only as an internal/test harness if useful. It must no longer be the production visual direction.

## Scope guard

This is a visual-shell recovery and integration package, not a new rules package.

Do NOT implement or redesign:

- card framework/decks;
- mobilisation/escalation deck mechanics;
- detailed supply or engineering;
- AI controllers;
- multi-seat coalition rules;
- new combat balance;
- new narrative/lore;
- replacement art direction.

Do not touch `tametheboardgame/future-conquest`.

## Quality requirements

- Reuse existing assets/renderer rather than duplicating them.
- No second authoritative game state.
- No `Math.random` for authoritative R5 outcomes.
- R5 actions must remain deterministic and save/resume safe.
- Existing R5 rules tests must continue to pass.
- Add focused adapter/integration tests that prove rendering IDs/selection/legal-target/action dispatch use R5 authority rather than legacy simulation mutation.
- Keep production static-hosting build working.

Run at minimum:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

## Exit condition

The deployed R5 application visibly resembles the rich Future Conquest 2.5D map/city/terrain presentation David already liked, while the actual player interaction is the simpler R5 board-game loop. A player can select a formation, see legal board-game choices, move/attack through R5 authority, resolve dice combat, and continue alternating play without encountering the old simulation administration UI.

Commit and PUSH directly to `r5/rebaseline-rich-map-shell`. Report the remote GitHub SHA, key legacy visual modules reused, any unavoidable presentation gaps, and whether the recovery playtest exit condition is satisfied. Fix routine in-scope engineering defects autonomously.