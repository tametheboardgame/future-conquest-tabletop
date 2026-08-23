# Codex Brief — Restore the R3-WP6.6 Visual Shell for R5 Board-Game Play

## Objective

Correct the failed visual direction by restoring the recognisable Future Conquest presentation from historical commit `89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a` as the production R5 host, while keeping the newer `src/tabletop` state/action/combat layer authoritative.

This is **not** another attempt to place the old renderer behind the abstract R5 board. The visible abstract circular-node/region board must go.

## Authority

Read first:

- `docs/design/R5-BOARDGAME-ON-R3-SHELL-REBASELINE.md`
- `docs/roadmap/R5_TABLETOP_ROADMAP.md`
- `docs/design/r5-tabletop-game-design.md`
- `docs/design/r5-prototype-rules-v0.1.md`
- `docs/design/r5-legacy-reuse-matrix.md`
- `docs/DEVELOPMENT_STATUS.md`

Use historical commit `89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a` as the golden visual-composition reference.

## Required visual restoration

Restore/reuse from the historical shell wherever practical:

- startup/title/opening experience;
- existing music/audio startup behaviour and settings;
- thin top title/metrics framing;
- compact left command rail styling/layout;
- map-first workspace geometry;
- production 2.5D terrain renderer;
- political/territory borders and visual grading;
- strategic-place/city/landmark miniatures;
- formation miniatures and their visual treatment;
- pan/zoom/camera behaviour;
- existing dark military typography/panel visual language;
- compact contextual overlays rather than giant permanent panels.

The deployed result should look substantially like the historical R3-WP6.6 game screen, not like the current R5 Central Front abstract board.

## Rules/state boundary

Do **not** restore the legacy `GameState` as production authority.

Keep authoritative:

- tabletop seats/round state;
- deterministic tabletop PRNG/save state;
- tabletop formation/piece state;
- alternating activation semantics;
- current R5 action dispatcher;
- current R5 combat resolution.

Historical simulation components may be reused as presentation/data adapters only. Any legacy state needed by a renderer must be derived one-way from R5 state and never dispatched back into the tabletop store.

## Interaction requirements

On the restored physical map a player must be able to:

- select an R5 formation via the visible formation miniature/marker;
- see legal R5 destinations/targets highlighted directly on geographic territories/locations without showing the abstract circular-node board;
- choose Move or Attack through a compact contextual control in the historical visual style;
- execute through the existing R5 dispatcher;
- alternate to the next seat after a successful action;
- see the existing deterministic combat dice/result presentation in a compact contextual/tray treatment;
- continue play without entering old operations/logistics/admin workflows.

The old left rail may be visually preserved while specialist simulation screens are removed, disabled or repurposed to board-game-relevant surfaces. Do not leave dead navigation that opens legacy admin gameplay.

## Board-game tray scaffold

Create the minimum visual scaffold for a future collapsible right-edge board-game tray in the historical style. It may initially host only current R5 selected-piece/action/combat information and must not lock new dice/card mechanics in this PR.

Do not create a giant permanent side panel. The map remains dominant.

## Explicit removals

The following must not be visible production gameplay after this PR:

- the current R5 circular region rings/nodes;
- the abstract R5 landmass/network artwork;
- daily-turn/end-day simulation controls;
- detailed legacy logistics dashboard;
- engineering-project administration;
- operations bureaucracy;
- old persistent report clutter;
- simulation-owned movement/combat orders.

## Do not implement yet

Do not implement new command-dice rules, cards, escalation deck, mobilisation balance, AI controllers or coalition seat splitting in this PR. This package exists to get the presentation foundation correct first.

## Testing

Add/adjust tests that protect the real product boundary, including:

- production app mounts the restored historical-style shell rather than the abstract R5 board;
- startup/audio shell remains reachable;
- R5 tabletop store remains authoritative;
- map selection routes to R5 piece selection;
- legal map targets derive from R5 rules;
- Move/Attack dispatch through R5 action authority;
- no legacy engine action dispatcher is called by production board interactions;
- deterministic save/PRNG and current combat tests continue to pass.

Run:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

## Exit condition

The production build once again looks recognisably like the pre-R5 Future Conquest game at the golden R3-WP6.6 baseline, including its opening/music/map/cities/miniatures/visual identity, while the actual playable actions are the simpler deterministic R5 board-game actions. The abstract node-board presentation is no longer visible.

Commit and PUSH all implementation work directly to the existing feature branch and report the actual remote SHA. Fix routine in-scope defects autonomously.