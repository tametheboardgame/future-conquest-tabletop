# R5-WP1.1 Codex Implementation Brief

## Authority

Implement `R5-WP1.1 — Prototype strategic map` from `docs/roadmap/R5_TABLETOP_ROADMAP.md`.

Read and obey before coding:

- `docs/design/r5-tabletop-game-design.md`
- `docs/design/r5-prototype-rules-v0.1.md`
- `docs/design/r5-legacy-reuse-matrix.md`
- `docs/architecture/R5-WP0.2-GAME-STATE-AUTHORITY.md`
- `src/tabletop/state.ts`

## Objective

Create the smallest useful strategic board for the tabletop proof-of-fun build. The board must be the primary interface and should make the geography, objectives and possible routes understandable at a glance.

## Deliverables

- 15–20 strategic regions.
- A meaningful adjacency network rather than a decorative partition.
- Major cities, hubs and important crossings represented at tabletop scale.
- Objective regions clearly and visibly marked.
- Reuse existing 2.5D terrain/map technology where it genuinely accelerates delivery or improves readability.
- Do not preserve the old 101-territory interaction model merely for compatibility.
- Establish static tabletop scenario/board definitions separately from mutable `TabletopGameState` state.
- Add sufficient automated validation/tests for region IDs, adjacency integrity, duplicate links, objective references and any other board-data invariants introduced.
- Integrate the prototype board into the application sufficiently that it can be viewed as the tabletop board, while keeping legacy simulation functionality isolated.

## Product constraints

- Optimise for the first ugly playable board, not visual polish.
- The map should dominate the usable game area.
- Avoid management panels and information-dense legacy UI.
- Geography should be strategically legible even with placeholder artwork.
- Existing 2.5D assets/terrain can be reused, but only where they fit the new tabletop abstraction.
- Prefer explicit, inspectable static data over clever generation for the first prototype.

## Scope guard

Do not implement:

- formation pieces or piece selection beyond any inert placeholder necessary to demonstrate board scale;
- legal move highlighting;
- movement rules;
- alternating activation or Command Actions;
- combat or dice;
- cards;
- supply gameplay;
- engineering gameplay;
- mobilisation;
- AI;
- broad visual polish.

Those belong to later R5 work packages.

## Compatibility

This branch is stacked on `r5/wp0.2-game-state-authority`. WP0.2 may receive small fixes while this work is in progress. Keep WP1.1 changes isolated enough to rebase/merge the final WP0.2 result cleanly.

Do not couple tabletop board authority back into legacy `GameState`.

## Validation

Run the relevant project tests, TypeScript checks and production build. Add targeted board-data tests. Fix failures caused by this work before declaring completion.

## Completion report

When finished, report:

1. changed files and major implementation decisions;
2. exact prototype region count and objective regions;
3. what legacy map technology was reused and what was deliberately not reused;
4. tests/checks/build commands and results;
5. any known limitations that belong to WP1.2 or later rather than expanding this WP.
