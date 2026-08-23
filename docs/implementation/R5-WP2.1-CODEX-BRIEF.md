# R5-WP2.1 Codex Brief

Implement R5-WP2.1, Alternating Activation, using these authority documents:

- `docs/roadmap/R5_TABLETOP_ROADMAP.md`
- `docs/design/r5-tabletop-game-design.md`
- `docs/design/r5-prototype-rules-v0.1.md`
- `docs/design/r5-legacy-reuse-matrix.md`
- `docs/DEVELOPMENT_STATUS.md`

## Required outcomes

- authoritative round counter in tabletop rules state;
- exactly two active seats/factions for the prototype;
- refresh each side to 4 Command Actions per round;
- alternating one-action activations during the Command Phase;
- a single pass with actions remaining does not permanently end that side's participation if the opponent continues;
- two consecutive passes end the Command Phase;
- exhausting both sides' Command Actions ends the Command Phase;
- current side and remaining Command Actions are obvious directly on the board UI;
- deterministic save/resume remains valid at action boundaries.

## Scope guard

Do not implement WP2.2 action resolution, movement execution, attacks/combat, cards, supply gameplay, engineering, mobilisation, AI or visual polish beyond the minimum needed to understand the command phase.

The tabletop rules state is authoritative. React/UI state may hold only non-authoritative presentation/selection state.

## Validation

Add focused deterministic tests for round refresh, alternating seat order, action spending, single-pass recovery, consecutive-pass termination, zero-actions termination and save/resume safety. Run the current R5 test boundary, application typecheck and full production build.
