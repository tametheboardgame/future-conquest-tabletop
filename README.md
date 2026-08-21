# Future Conquest: Tabletop

A digital tabletop strategy redesign of **Future Conquest**.

A finite future army has been displaced into present-day Europe. It is technologically dominant but cannot replace its best troops or equipment. Present-day forces begin fragmented, then mobilise and become increasingly dangerous. The invader must achieve decisive strategic objectives before time turns the war against it.

## Why this repository exists

This repository was imported from the original `future-conquest` simulation codebase on 21 August 2026 at commit `e6440635e7d85924fe2920979a6facb14e6993ef`.

The original project had accumulated substantial simulation depth but too much player-facing administration. This repository explores a different game structure built around a digital board, physical pieces, alternating activations, cards and dice.

The design principle is:

> **Complex simulation underneath. Simple board-game language on top. Every turn should force a small number of consequential decisions.**

The original simulation repository remains separate and intact.

## Current status

**R5 tabletop foundation / proof-of-fun design.**

No major legacy system should be expanded until the small tabletop prototype demonstrates that the core game loop is enjoyable.

Initial prototype target:

- 15–20 strategic regions;
- 2 asymmetric factions;
- 8–12 formation pieces per side;
- 4 Command Actions per side per round;
- alternating activation;
- 6–8 round scenario;
- fast dice-pool combat;
- approximately 30 cards;
- Supplied / Strained / Cut Off logistics;
- visible engineering and infrastructure effects;
- 2-player local hotseat;
- basic AI able to control either seat.

## R5 design documents

- [R5 Tabletop Game Design Direction](docs/design/r5-tabletop-game-design.md)
- [Prototype Rules v0.1](docs/design/r5-prototype-rules-v0.1.md)
- [Legacy Reuse Matrix](docs/design/r5-legacy-reuse-matrix.md)
- [R5 Tabletop Roadmap](docs/roadmap/R5_TABLETOP_ROADMAP.md)

## Preserved legacy design and research

The imported repository retains the original Future Conquest research, world-state data, maps, simulations and visual work. These are assets, not automatic requirements for the tabletop rules.

Key legacy documents include:

- [Original Phase 1: Game Identity and Vision](docs/design/phase-01-game-identity.md)
- [Original Phase 2: European Campaign Map Design](docs/design/phase-02-map-design.md)
- [Design Decision Register](docs/research/decisions.md)
- [Research Source Register](docs/research/sources.md)
- [World State Overview](docs/world-state/overview.md)

## Repository safety

The exact imported simulation state is preserved on:

`archive/imported-simulation-baseline-2026-08-21`

Tabletop foundation work begins on:

`r5/tabletop-foundation`

The original Future Conquest repository also has its own preserved R4 simulation branch.

## Development rule

Technology and simulation may be reused when they reduce implementation effort or produce interesting consequences. Administrative interface is not inherited by default.

A legacy system only earns its way back into the tabletop game when playtesting demonstrates that it improves decisions, tension, clarity or consequence enough to justify its complexity.
