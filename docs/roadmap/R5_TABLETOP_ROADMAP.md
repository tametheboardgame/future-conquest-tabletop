# R5 Tabletop Roadmap

Status: **Superseded implementation programme**  
Superseded: 23 August 2026

The original R5 roadmap successfully established the new deterministic tabletop rules layer, alternating activation and dice-combat prototype, but its assumption that a new small/abstract strategic board should become the production presentation was rejected during visual playtesting.

The authoritative implementation roadmap is now:

- `docs/roadmap/R5_BOARDGAME_REBUILD_ROADMAP.md`

The governing product direction is:

> **Preserve the visually rich Future Conquest world and atmosphere. Replace the administration and gameplay mechanics with a simpler board-game rules layer.**

## What remains valid from the original R5 programme

Completed R5 work remains valuable where it provides:

- deterministic board-game state/save/PRNG;
- seats/faction ownership boundaries;
- alternating activation;
- legal Move/Attack dispatch;
- dice-pool combat foundations;
- presentation-only React boundary;
- tests protecting deterministic state and action authority.

Those systems are to be transplanted into the restored pre-R5 Future Conquest presentation rather than discarded.

## What is no longer authoritative

The following previous assumptions are retired:

- the abstract circular-node/tabletop SVG should become the permanent production board;
- visual polish can be deferred until after core rules validation;
- the old map/cities/portal/opening/music are merely optional legacy assets;
- the game should progress directly from the original WP3 sequence into the old WP4–WP9 plan.

The existing rich presentation is now a product requirement, not a polish pass.

## Current delivery sequence

Follow `R5_BOARDGAME_REBUILD_ROADMAP.md` in this order:

`BG0 restored shell → BG1 rules/state lock → BG2 command dice → BG3 formation components/movement → BG4 combat → playtest → BG5 supply/recovery/reorganisation → BG6 tactical cards → BG7 escalation/mobilisation → campaign playtest → BG8 objectives/portal/victory → BG9 2–6 player assignment → BG10 AI seats → BG11 interface convergence → BG12 balance/simulation`

Historical details from the original roadmap remain available in repository history if needed for implementation archaeology, but automated agents and Codex must use `R5_BOARDGAME_REBUILD_ROADMAP.md` for new work.