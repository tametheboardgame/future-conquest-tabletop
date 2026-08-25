# R5-BG1 Rules Authority and Legacy Boundary

Status: implementation branch

## Authoritative command model

Future Conquest now has six permanent command seats. Player count never creates or removes commands.

Future Force:
- Future Command Alpha (`future-seat`)
- Future Command Bravo (`future-bravo`)
- Future Command Charlie (`future-charlie`)

Coalition:
- Western Command (`coalition-seat`)
- Central Command (`coalition-central`)
- Eastern Command (`coalition-eastern`)

Human/AI assignment is stored on each seat as a controller property. It does not alter faction identity, formation ownership, force balance or command capacity.

The default two-player setup assigns Future Alpha to local player 0 and Western Command to local player 1. The other four seats use the standard AI controller. BG9 may reassign any of the same six seats to additional humans without changing the scenario.

## Temporary pre-BG2 action budget

BG1 must not triple the prototype action economy merely because three commands now exist on each side. Until command dice replace fixed actions in BG2, the existing four-actions-per-side capacity is distributed 2/1/1 across each side's three commands.

This is deliberately temporary. BG2 replaces the allocation with one command die and Command Point pool per seat.

## Formation authority

Every visible formation piece is explicitly assigned to one permanent command seat in `src/tabletop/command-seats.ts`. Core actions reject a formation if it belongs to the correct faction but the wrong active command.

The mapping is independent of controller assignment. Changing a seat from AI to Human cannot move formations between commands or change available force capacity.

## Scenario authority

The board-game state remains authoritative for:
- the eight-round campaign limit;
- active command seat and deterministic activation sequence;
- formation positions and combat state;
- strategic objective definitions and control actions;
- the Carpathian Portal state;
- deterministic PRNG state;
- save/resume at action boundaries.

## Presentation boundary

The R3/MapLibre/Three visual stack remains presentation only. `rich-map-adapter.ts` projects R5 regions, control and formations into the legacy renderer data shape. Nothing returned by that projection is allowed to become gameplay authority or be dispatched back into the R5 rules store.

The following inherited systems are therefore not authoritative in R5 tabletop mode:
- daily orders;
- legacy operations state;
- logistics administration screens/state;
- engineering project administration;
- production/economy management;
- old report/event workflow;
- legacy simulation movement/combat authority.

Renderer-compatible values may still be constructed transiently by the presentation adapter when required to draw the existing Future Conquest world.

## BG1 exit condition

BG1 is complete when:
- exactly six command seats exist in new game state;
- each side always has exactly three commands;
- Human/AI assignment is independent from command identity;
- the same forces and temporary action capacity exist regardless of controller assignment;
- every formation belongs to exactly one command;
- side activations alternate deterministically through command seats;
- the portal and strategic objective structure exist in authoritative scenario state;
- saves preserve the six-seat structure and legacy two-seat saves cannot silently resume as BG1 games;
- the existing rich map remains a one-way presentation of R5 authority.
