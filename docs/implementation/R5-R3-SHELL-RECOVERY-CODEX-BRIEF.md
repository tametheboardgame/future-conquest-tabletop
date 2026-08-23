# Codex Brief: R5 Full R3 Shell Recovery

## Authority

Read first:

1. `docs/design/R5-R3-SHELL-PRESENTATION-BASELINE.md`
2. `docs/roadmap/R5_TABLETOP_ROADMAP.md`
3. `docs/design/r5-tabletop-game-design.md`
4. `docs/design/r5-prototype-rules-v0.1.md`
5. `docs/design/r5-legacy-reuse-matrix.md`
6. `docs/DEVELOPMENT_STATUS.md`

Product-owner direction overrides the previous rich-backdrop approximation in PR #9.

## Objective

Restore the R3-WP6.6-era Future Conquest application presentation, approximately commit `89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a`, as the actual production shell for R5. Do not merely mount `TerrainMapPrototypeImpl` underneath `RichMapShell`.

The old game's visual identity should survive: startup/title flow, music architecture, compact top metrics/header treatment where appropriate, left map-first command rail, terrain/map surface, political boundaries, city/landmark miniatures, formation miniatures, camera controls, labels and established atmosphere.

The simulation gameplay must not survive as authority. `src/tabletop` remains authoritative for R5 seats, actions, piece state, deterministic save/PRNG and dice combat.

## Required implementation approach

- Inspect the R3-WP6.6-era `App.tsx`, shell CSS, `CommandNavigation`, `TerrainMapPrototype`, map UX/presentation modules and startup/audio composition from commit `89c33f6e...`.
- Reuse those components/styles directly where practical. Prefer restoring proven source from history over recreating visual approximations.
- Create a clean presentation/controller boundary that projects R5 state into the restored shell and maps shell selections/actions back to the R5 dispatcher.
- Remove/disable simulation-specific navigation destinations and management panels from the production R5 path. A reduced rail may retain the established visual treatment but expose only useful board-game destinations/settings.
- Ensure clicking/tapping actual rich-map formation miniatures selects the corresponding R5 piece.
- Show legal R5 Move/Attack choices directly on the rich map without bringing back the old order workflow.
- Retain current alternating activation, command action counts, Move/Attack semantics and deterministic dice-pool combat.
- Present combat using compact board-game dice/results UI. A slim contextual side drawer/panel over the old shell is acceptable; a full-screen replacement board is not.
- Preserve opening/title/music behaviour from the old experience unless incompatible with the R5 build. Do not silently delete it.
- Preserve map camera, terrain, cities/landmarks and atmosphere as first-class production visuals.

## Explicitly do not do

- Do not use `RichMapShell` as the dominant production layout.
- Do not display the current abstract R5 strategic-board SVG as the primary board.
- Do not resurrect old daily-turn, operation, logistics, engineering, intelligence or territory administration as gameplay authority.
- Do not implement cards yet.
- Do not redesign mobilisation/escalation.
- Do not implement AI or online multiplayer.
- Do not invent new fundamental dice mechanics.
- Do not create new art when a preserved R3 asset/component already exists.

## Geography

R5 board legality/state remains authoritative even if the preserved visual geography needs adaptation. Do not collapse eastern R5 regions into western anchors as a permanent solution. Where existing full-Europe map/city presentation data exists in repository history, reuse it. If an R5 region lacks a renderer anchor, add the minimum presentation-only geographic mapping necessary while keeping the underlying R5 region distinct.

## Quality gates

Run and pass:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

Add focused tests proving:

- restored shell is the production R5 entry composition;
- legacy simulation state/actions are not authoritative;
- rich-map formation selection reaches R5 selection;
- legal Move/Attack targets originate from R5 rules;
- combat still resolves through R5 deterministic dice state;
- startup/music integration remains present;
- map remains the dominant first viewport rather than being displaced by new board chrome.

## Delivery

Work only on branch `r5/restore-r3-shell-boardgame` and the PR created for this package. Commit and push directly to that branch. Fix routine in-scope engineering defects autonomously.

Report the remote SHA, the exact R3 components/assets restored, tests run, and any unavoidable presentation gap versus the R3-WP6.6 baseline.