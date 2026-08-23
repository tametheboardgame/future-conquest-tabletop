# R5 Visual Shell Rebaseline

Status: Authoritative corrective direction
Date: 23 August 2026

## Why this correction exists

The first R5 micro-playtest simplified the wrong layer. R5 was intended to simplify Future Conquest's player-facing rules and administration while retaining the strongest parts of the existing visual game world. The temporary simplified tabletop shell therefore must not become the permanent visual direction.

This document clarifies the existing R5 principles and takes precedence wherever earlier implementation work implied that the 2.5D map/city/terrain presentation should be replaced.

## Non-negotiable visual inheritance

R5 SHALL retain and reuse, wherever technically viable, the existing high-quality presentation technology and assets already preserved in this repository, including:

- the 2.5D Europe/theatre map and physical terrain treatment;
- existing city, landmark and strategic-place presentation;
- formation miniatures/markers and readable faction identity;
- camera, zoom, map interaction and spatial presentation that make the world feel substantial;
- existing terrain colour/grading, board atmosphere and useful audio/visual treatment.

These systems become the digital board. They are not legacy clutter to be replaced merely because R5 uses board-game rules.

## What R5 is actually replacing

R5 replaces or hides player-facing simulation administration, not the world presentation. In particular the prototype should remove or suppress as primary interaction:

- simulation dashboards and management screens;
- granular formation administration;
- daily-time/order-management workflow;
- detailed logistics and throughput interfaces;
- engineering project administration;
- persistent report/alert clutter;
- any legacy UI that asks the player to operate the simulation rather than make a small number of consequential game decisions.

Useful calculations may remain underneath the board-game layer as already described by the R5 legacy reuse matrix.

## Permanent architecture

The intended architecture is:

1. **Rich map/presentation shell**: the preserved 2.5D terrain, cities, landmarks, miniatures and camera form the visible game board.
2. **R5 tabletop authority**: `src/tabletop` owns seats, board-game state, action legality, deterministic saves/PRNG and combat outcomes.
3. **Presentation adapter**: an explicit adapter maps R5 strategic regions, formations and transient board-game markers onto the rich legacy renderer without restoring legacy simulation state as authority.
4. **Compact board-game controls**: dice, cards, action choices, tracks and temporary contextual overlays sit on top of the map instead of replacing it.
5. **Legacy simulation services only where useful**: route, terrain, supply or other calculations can be called underneath when they add consequence without reintroducing administrative UX.

The current simplified `TabletopBoard` implementation is a proof-of-rules harness, not the target visual shell. Its useful interaction patterns may be retained, but it should not continue as the primary renderer once the rich map shell is reintegrated.

## Player/seat direction

R5 remains seat-based rather than permanently single-player. The architecture must allow either major side to be human or AI. It should not prevent later scenarios from splitting the present-day coalition into multiple human/AI seats, potentially by nation or command grouping. Exact multi-seat scenario rules are intentionally deferred until the rich board shell is restored and the core game loop is retested.

## Mobilisation/escalation direction

The present-day coalition should visibly gain forces/resources/capabilities as the game progresses. Cards, tracks, dice or combinations of these may determine timing, quantity and/or deployment location, with shuffling/randomisation used to make mobilisation develop differently between games. The exact deck/dice structure is a later product decision and is not locked by this correction.

## Immediate implementation boundary

Before cards, detailed mobilisation, AI or further feature expansion, restore the rich map as the R5 board and prove that the already-built R5 selection/movement/alternating-action/attack/dice-combat loop can operate through it.

The next playtest must therefore answer a narrower question:

> Does the simple R5 board-game rules layer feel right when played on top of the existing beautiful Future Conquest map, cities, terrain and miniatures?

Do not progress to new systemic depth until that visual-shell recovery playtest succeeds.