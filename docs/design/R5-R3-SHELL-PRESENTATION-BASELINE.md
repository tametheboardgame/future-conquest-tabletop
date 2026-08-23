# R5 Presentation Baseline: Preserve the R3 Game Shell

Status: Product-owner correction
Date: 23 August 2026

## Decision

R5 changes the gameplay mechanics, not the established Future Conquest presentation identity.

The production visual baseline is the pre-R5 R3 map-first game shell, specifically the R3-WP6.6-era presentation around commit `89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a`.

Do not approximate that presentation inside a new tabletop board. Reuse the existing shell, startup/title experience, music, map renderer, terrain, political boundaries, cities, landmarks, formations, camera behaviour, labels, overlays and general visual language wherever they remain technically viable.

## What R5 replaces

R5 replaces the simulation-facing rules and administration that made the game too complex:

- daily-turn/order bureaucracy;
- management-heavy formation UI;
- detailed logistics administration;
- engineering administration;
- persistent alerts/reports and diagnostic clutter;
- simulation-specific movement/order workflows;
- single-player-only action assumptions.

These must not regain gameplay authority merely because the visual shell is reused.

## What R5 keeps

The existing R5 tabletop state/rules remain authoritative for:

- seats and factions;
- alternating activations;
- command actions;
- piece location/state;
- legal Move and Attack actions;
- deterministic PRNG/save state;
- dice-pool combat and combat results.

Presentation may adapt R5 state into legacy renderer inputs, but legacy simulation state must not feed back into R5 authority.

## Board-game layer

The old map is the board.

Board-game UI should be added around and over it, not replace it. The intended future interaction language is:

- selectable formations directly on the rich map;
- concise legal move/attack highlighting;
- visible physical dice rolls for combat and any later approved dice-driven mechanics;
- a compact side/drawer area for dice, current action, cards and contextual results;
- cards as tactile exceptions/modifiers rather than management screens;
- simple visible piece degradation/loss states instead of detailed maintenance workflows;
- local human/AI seats later using the same rules interface.

## Immediate implementation boundary

This recovery package is presentation integration only. It must:

1. restore the R3-WP6.6-era application shell as the production R5 presentation baseline;
2. preserve title/opening/music and map-first visual identity;
3. remove or disable old simulation-authority UI/actions while keeping reusable presentation components;
4. bind R5 formations, selection, legal Move/Attack targets and dice combat into the restored shell;
5. retain the already-working R5 short battle loop and deterministic state;
6. keep the map visually dominant.

Do not implement the card framework, mobilisation/escalation redesign, AI, detailed supply/engineering, new fundamental dice mechanics or new art in this recovery package.

## Exit condition

A playtester should look at the application and immediately recognise the established Future Conquest game shown in the R3 map-first build, while the interactions they perform are the simpler R5 board-game interactions.

If the result instead looks like a newly designed tabletop UI with the old terrain merely embedded as a backdrop, the package has failed.