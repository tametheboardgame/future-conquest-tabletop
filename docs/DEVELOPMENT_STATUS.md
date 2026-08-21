# Future Conquest Tabletop Development Status

Last updated: 2026-08-21

## Current programme

R5 Tabletop is the **authoritative active development programme** for this repository.

Authoritative roadmap: `docs/roadmap/R5_TABLETOP_ROADMAP.md`.
Authoritative design: `docs/design/r5-tabletop-game-design.md`.
Prototype rules: `docs/design/r5-prototype-rules-v0.1.md`.
Legacy reuse policy: `docs/design/r5-legacy-reuse-matrix.md`.

The imported R2/R3 simulation code and documentation are preserved as legacy/reference material only. They are **not** authority for selecting new work in `future-conquest-tabletop`.

The original simulation repository remains separate at `tametheboardgame/future-conquest`.

## Current R5 work

1. **R5-WP0.1 - Tabletop design foundation**
   - PR #1: `R5: establish tabletop design foundation`.
   - Establishes R5 design, rules, roadmap and legacy-reuse authority.

2. **R5-WP0.2 - Game-state authority refactor plan**
   - PR #2: `R5-WP0.2: establish tabletop game-state authority`.
   - Defines tabletop-specific deterministic state/save boundaries, seats/factions, round/action state, cards and board-piece state.
   - Stacked on WP0.1 until the foundation is merged.

3. **R5-WP1.1 - Prototype strategic map**
   - PR #3: `R5-WP1.1: prototype strategic map`.
   - Targets the first board-dominant 15-20 region tabletop map.
   - Stacked on WP0.2 while foundation work lands.

## Delivery priority

Reach the first **ugly playable** tabletop loop as quickly as possible:

`WP0 -> WP1 board/pieces -> WP2 alternating actions + Move/Attack -> WP3 dice combat -> first micro-playtest`

Cards, detailed supply, engineering, mobilisation, AI and additional visual polish must not delay the first micro-playtest unless technically required.

## Source-of-truth rule

For this repository, the current `main` branch plus the R5 documents listed above take precedence over inherited R2/R3 roadmap/status documents, historical PR text, archived branches and prior simulation instructions.

Any automated worker, Codex task or supervisor must follow R5 unless David explicitly authorises a different programme.

Inherited R3 documents remain available for technical/reference history only and must not be interpreted as active programme authority.
