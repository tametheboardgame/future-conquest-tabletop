# R5 Board Game on the Preserved R3 Shell

Status: Product correction after first visual playtest  
Date: 23 August 2026

## Product decision

R5 is **not** a replacement visual game board.

The intended product is the visually rich Future Conquest game that already existed, with its opening experience, music, map, physical terrain, cities, landmarks, formation miniatures, camera and overall visual language retained, while the simulation-heavy player mechanics are replaced by simpler board-game mechanics built around pieces, dice, cards, player seats and escalation.

The failed direction was to replace the old presentation with an abstract circular-node tabletop board. That is now explicitly rejected.

## Golden visual baseline

Use repository commit:

`89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a`

(`R3-WP6.6 Command Shell Follow-up Polish & Warning Preferences`)

as the primary visual-composition reference.

The production R5 game should preserve the recognisable qualities of that shell:

- Future Conquest startup/title experience;
- existing music/audio architecture;
- thin top command/metrics framing;
- bounded left command rail and its visual language;
- the large 2.5D physical-terrain map as the dominant screen surface;
- existing borders, terrain grading, cities, landmarks and strategic-place miniatures;
- existing formation miniature visual language;
- existing pan/zoom/camera behaviour;
- contextual information appearing over/alongside the board without covering most of it;
- the same dark military visual identity, typography, panel treatment and atmosphere.

Do **not** reproduce the current R5 circular strategic-region board as a visible layer over the map.

## What changes

The old simulation's player-facing mechanics are replaced.

Remove or repurpose as player-facing systems:

- daily-turn administration;
- detailed logistics dashboards;
- engineering project management screens;
- detailed formation administration;
- operations management bureaucracy;
- persistent reports/alerts as primary interaction;
- continuous simulation-style order workflows;
- legacy game-state authority.

The old simulation may remain a source of rendering technology, data and under-the-hood consequences only where useful.

## New board-game interaction model

### Board

The existing 2.5D map **is the board**.

Pieces occupy meaningful geographic areas/cities/territories directly on that board. Selecting a piece should visually emphasise it and highlight legal destinations/targets on the physical map, not display a second abstract network.

### Side tray

A compact, collapsible board-game tray should live at the right edge of the board in the same visual language as the existing UI. It must not permanently steal a large fraction of the map.

At rest it can show:

- active player/seat;
- remaining command resources;
- dice available this round;
- the player's card hand in compact form.

Contextually it expands to show:

- selected piece summary;
- movement choice;
- combat preview;
- visible dice roll and result;
- cards that may legally be played;
- concise reinforcement/escalation events.

### Top framing

Keep the old thin metrics-bar style, but repurpose its information toward board-game state, for example:

- Round;
- active side/player;
- command resources/dice remaining;
- Future Force remaining strength/armour at a high level;
- Coalition mobilisation/escalation stage;
- strategic objectives/progress.

Exact metrics remain provisional.

### Left rail

Keep the old rail's appearance and compact icon-led interaction. Its contents should be reduced to board-game-relevant surfaces, such as Board, Forces, Cards, Escalation/Scenario and Settings/Help. Specialist simulation administration must not return merely because the old shell had buttons for it.

## Player seats

The rules/state architecture should support controller assignment by seat.

Initial useful modes:

- Future Force human vs Coalition AI;
- Future Force AI vs Coalition human;
- human vs human local/hotseat;
- AI vs AI for testing.

Later, the Coalition may be split into multiple national seats/players while unoccupied countries are AI-controlled. This should be enabled by the state model, but does not need to be implemented during the visual-shell restoration.

## Recommended dice direction

Dice should feel like physical board-game resources, not hidden random-number generators.

Recommended prototype: **command dice plus combat dice**.

At round start a side rolls a small pool of command dice. The rolled values become visible resources in the side tray. A player chooses which die to spend when activating a formation. The die value can determine/limit movement capacity or contribute to the strength/flexibility of the chosen action. This makes movement uncertainty occur before the decision, allowing the player to plan around the roll instead of losing a turn to a bad die after choosing a move.

Combat continues to use an understandable dice pool based on formation strength, terrain, posture/readiness and card effects. The dice are visibly rolled in the tray.

Exact command-die values/costs are deliberately not locked by this rebaseline.

## Recommended card direction

Cards create exceptions, opportunities and reactions while ordinary play remains possible without drawing the perfect card.

Useful families:

- Operations: forced march, prepared assault, fighting withdrawal, counterattack;
- Tactical/technology: Future Force advantages and present-day counters;
- Logistics/engineering: simplified one-shot board effects;
- Reaction: cards played during an opponent activation;
- Scenario/political events.

A small hand should be visible in the board-game tray and cards should be played against obvious map interactions.

## Recommended escalation/mobilisation direction

The Coalition should visibly become more dangerous as the game continues.

Use a dedicated **Escalation/Mobilisation deck**, separate from the normal player hand.

Recommended structure:

- cards are grouped into escalating tiers/stages so late-war assets cannot appear nonsensically on turn one;
- order within a stage is shuffled each game;
- round progression and Future Force actions advance escalation pressure;
- escalation cards introduce coherent reinforcement packages, capabilities, coordination or strategic effects;
- deployment locations should normally be constrained by the card and geography (for example a French package at a French mobilisation point), rather than being entirely random;
- if additional variability is needed, a die or short location table can choose between several legal/thematic entry locations.

This preserves surprise while keeping the map believable.

## Piece losses and armour

Replace detailed maintenance/admin gameplay with board-game state.

A formation may expose a small number of meaningful values/icons such as:

- strength;
- armour;
- readiness;
- supply/cut-off marker;
- one or two traits.

Combat losses can remove strength/armour steps or flip readiness states. The side tray can visually show which blocks/icons were lost without opening a maintenance screen.

## Core inheritance rule, clarified

**Preserve the old game's presentation and atmosphere. Replace the old game's administration and turn mechanics.**

The correct layering is:

1. preserved Future Conquest visual shell and world;
2. R5 tabletop state/rules authority;
3. visible board-game dice/cards/player controls;
4. optional legacy simulation calculations used only underneath where they improve consequences.

## Immediate delivery order

1. Restore the golden R3-WP6.6 presentation shell as the production R5 host while keeping R5 state authoritative.
2. Confirm visually that the deployed game once again looks like Future Conquest.
3. Add the compact right-hand board-game tray and seat setup in the preserved visual style.
4. Prototype command dice/movement.
5. Retain/refine visible combat dice.
6. Add the card framework and starter hands.
7. Add the escalating Coalition mobilisation deck.
8. Add human/AI controller assignment and later optional coalition-seat splitting.

No further abstract-board visual development should occur.