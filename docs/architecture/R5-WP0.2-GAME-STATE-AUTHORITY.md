# R5-WP0.2 — Game-State Authority Refactor Plan

Status: Implemented architecture/scaffolding  
Date: 21 August 2026  
Parent: R5 tabletop foundation

## Purpose

Define a clean, deterministic state authority for tabletop mode before any R5 gameplay is implemented.

This package deliberately does **not** rewrite movement, combat, cards, supply, AI or the board renderer. It establishes the state boundary those systems will use.

## Governing rule

The legacy `GameState` remains the authority for the imported simulation only.

R5 tabletop rules must use a distinct `TabletopGameState` authority. Legacy systems may be consumed through explicit adapters, but they must not force legacy turn structure, single-player assumptions, detailed administration or UI selection state into the tabletop rules engine.

The initial scaffold lives at:

`src/tabletop/state.ts`

## Existing state audit

### Safe to reuse directly or with thin adapters

#### Static strategic geography

Useful legacy objects:

- `TerritoryDefinition`;
- `StrategicNodeDefinition`;
- `StrategicRouteDefinition`;
- authored territory and route datasets.

Reason:

These primarily describe geography and connectivity rather than old turn rules. They can seed the 15–20-region prototype or supply map/render metadata.

Constraint:

The tabletop scenario owns its region list. It is not required to expose every legacy territory or preserve the old 101-territory interaction model.

#### Strategic route condition concepts

Useful legacy objects:

- `StrategicRouteState`;
- route status/condition helpers;
- route lookup and adjacency helpers.

Reason:

Infrastructure state remains strategically useful.

Constraint:

The tabletop authority initially exposes only board-relevant route state: Intact, Damaged or Destroyed. Detailed capacity, upgrade and throughput calculations can remain behind an adapter when later packages demonstrate a need for them.

#### Existing rendering identifiers and physical-map data

The 2.5D board renderer, territory geometry, marker positions and visual assets are reusable technology.

They are not rules authority. Rendering code must consume tabletop state rather than mutate it.

#### Persistence pattern

The legacy project demonstrates versioned local persistence and migration discipline.

That pattern is reusable. The legacy save key and legacy `GameState` schema are not.

### Reuse only under the hood

The following may later contribute calculations or conversion data, but must not become tabletop authority:

- detailed logistics allocations;
- supply paths and throughput;
- engineering project detail;
- order-of-battle detail;
- enemy mobilisation schedules;
- casualty and armour detail;
- legacy pathfinding;
- escalation and strategic-response calculations.

These systems may feed a simpler tabletop result such as supply state, readiness, route condition, formation strength or mobilisation-track change.

### Do not reuse as tabletop authority

#### Legacy `GameState`

The current simulation state combines:

- day/turn progression;
- single-player and enemy-specific ownership assumptions;
- selected territory and selected formation UI state;
- detailed logistics;
- engineering workflows;
- intelligence reports;
- enemy orders;
- battle operations;
- administrative occupation state;
- legacy save-version history.

Importing it into tabletop mode would recreate the coupling R5 exists to remove.

#### `TaskGroup` and `EnemyFormation` as separate player/enemy models

R5 uses one board-piece model for both factions. A human or AI seat controls a faction through the same legal-action interface.

Legacy task groups and enemy formations may be converted into scenario pieces, but neither type is authoritative in tabletop mode.

#### Presentation selection state

Legacy fields such as selected territory, target territory and selected task group are not rules state.

R5 explicitly separates `TabletopViewState` from `TabletopGameState` so camera, hover, selection, panels and animation can be discarded without changing a save or a game result.

## Seat and faction ownership model

R5 is seat-driven rather than player-versus-enemy driven.

### Seat

A seat contains:

- stable seat ID;
- faction ID;
- controller type.

Controller types are:

- local human;
- AI profile.

The same faction rules therefore operate whether the seat is human or AI.

### Faction

The initial factions are:

- `future-force`;
- `present-day-coalition`.

Faction state points to its controlling seat. Board pieces point to a faction, not directly to a human or AI controller.

This allows later hotseat, AI substitution and additional seats without rewriting formation ownership.

## Round and action authority

`TabletopRoundState` owns:

- round number;
- maximum rounds;
- current phase;
- initiative seat;
- active seat;
- Command Actions remaining per seat;
- passed seats;
- consecutive-pass count;
- monotonically increasing action sequence.

Initial phases mirror Prototype Rules v0.1:

1. Refresh;
2. Command;
3. Supply;
4. Control and Mobilisation;
5. Victory Check;
6. Complete.

A reaction window is represented explicitly in authoritative state so a future save can resume at an action/reaction boundary without relying on transient UI state.

No action-resolution rules are implemented by WP0.2.

## Card authority

Card definitions are static scenario/rules data and do not need to be duplicated in every save.

The authoritative card state stores:

- card instances and their definition IDs;
- exact draw-pile order;
- exact discard-pile order;
- exact hand contents by seat;
- cards removed from the game.

This is sufficient for deterministic save/resume and hidden-hand hotseat later.

No card effects or timing engine are implemented by WP0.2.

## Board-piece authority

R5 uses one shared `TabletopPieceState` model.

Initial piece kinds:

- formation;
- command;
- garrison;
- depot.

Initial piece state includes:

- stable piece ID;
- static definition ID;
- faction;
- region;
- strength;
- composition traits;
- readiness;
- supply state;
- entrenchment.

Initial composition traits:

- Infantry;
- Armour;
- Artillery;
- Engineer;
- Elite/Future Tech.

Initial readiness:

- Ready;
- Damaged;
- Crippled.

Initial supply:

- Supplied;
- Strained;
- Cut Off.

This deliberately avoids detailed personnel, armour maintenance and order-of-battle administration in the prototype authority.

## Region and infrastructure authority

Tabletop regions store only mutable scenario state:

- region ID;
- controlling faction or no controller;
- Secure or Contested control state.

Static names, geometry, terrain and adjacency belong in scenario definitions.

Tabletop routes initially store:

- route ID;
- Intact, Damaged or Destroyed status.

Detailed network calculations may later be derived from legacy route data behind an adapter.

## Deterministic tabletop saves

R5 tabletop saves use a distinct envelope:

- format: `future-conquest-tabletop`;
- state version: `1`;
- rules version: `r5-prototype-v0.1`;
- storage key reserved as `future-conquest-tabletop-v1`.

The save contains all mutable rules state required to resume at an action boundary.

### Randomness rule

No tabletop rule may call ambient randomness directly.

Authoritative state records:

- PRNG algorithm identifier;
- seed;
- random cursor.

Future dice rolls, shuffles and random effects must consume this deterministic random stream and advance the cursor through the rules engine.

WP0.2 defines the state contract only; the random engine is implemented when the first random tabletop mechanic is added.

### Card determinism

The exact card-instance order in draw piles is saved. Loading a game must never reshuffle unless a rules action explicitly performs a shuffle.

### Action determinism

`actionSequence` is saved and monotonically increases as authoritative actions are implemented. It provides a stable ordering primitive for generated action IDs, telemetry and future replay/debugging.

### Presentation exclusion

The following must not affect deterministic save results:

- selected piece;
- selected region;
- hover state;
- open menu/panel;
- camera position;
- animation progress;
- transient notification state.

These belong in `TabletopViewState` or component-local UI state.

## Legacy save isolation

Tabletop mode must not silently load or migrate the old `future-conquest-slice-v0.x` simulation saves into the new rules authority.

If a later conversion/import tool is useful, it must be an explicit one-way scenario conversion with clear validation. It is not part of normal save loading.

This avoids accidental coupling between two different games that happen to share assets and simulation technology.

## Authority flow

Expected R5 architecture:

1. Scenario definitions provide static regions, routes, card definitions, piece definitions and objectives.
2. `TabletopGameState` contains all mutable deterministic rules state.
3. Rules functions accept state plus an explicit action and return the next state.
4. Human UI and AI both submit actions through the same legal-action API.
5. Legacy calculations are accessed only through explicit adapters where useful.
6. Renderer reads authoritative state plus non-authoritative view state.
7. Save system serialises only the tabletop save envelope.

## Implementation boundaries for later packages

### WP1

May introduce prototype region definitions, piece definitions and board adapters.

It must not add a second competing source of truth for piece positions or control.

### WP2

Implements legal actions and alternating activation against `TabletopRoundState`.

It should not mutate state from UI components directly.

### WP3

Adds deterministic dice resolution using the saved random stream.

### WP4

Adds card definitions/effects on top of the existing card-instance authority.

### WP5

Adds supply and engineering calculation/adapters while preserving the three-state player-facing model.

### WP7

Adds hotseat and AI controllers without changing faction ownership or action rules.

## WP0.2 exit checklist

- Existing reusable state/data objects identified: complete.
- Seat/faction ownership model defined: complete.
- Round/action state defined: complete.
- Card state defined: complete.
- Board-piece state defined: complete.
- Deterministic save state defined: complete.
- Legacy simulation state isolated from tabletop authority: complete.
- Gameplay implementation beyond scaffolding: intentionally not started.
