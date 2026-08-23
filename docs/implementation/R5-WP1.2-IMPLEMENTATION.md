# R5-WP1.2 — Physical pieces and selection

## Goal

Turn the WP1.1 strategic map into a recognisable digital board-game surface without entering WP2 turn/action execution.

## Deliverables

- 8–12 formation pieces per faction;
- obvious Future Force vs Present-Day Coalition visual identity;
- click/tap and keyboard piece selection;
- strength and composition readable from the board surface;
- multiple pieces in one region remain individually selectable;
- selected-piece destinations are highlighted directly on the board.

## State boundary

Piece positions and gameplay-facing stats belong to tabletop scenario/state data, never component-local React state.

Selection, hover and open-detail state remain non-authoritative view state.

WP1.2 may derive a **topology destination preview** from direct strategic adjacency so the interaction can be tested. It must not claim to be the final legal-action API. WP2 will replace this preview with authoritative movement legality, Command Action cost and execution rules.

## Scope exclusions

Do not add:

- movement execution;
- Command Action spending;
- alternating activation;
- combat or dice;
- cards;
- supply calculations;
- engineering;
- mobilisation;
- AI.

## Exit criteria

A player can look at the board, distinguish the two armies immediately, select any formation, read its basic strength/composition, and see where that piece could potentially move next without opening a management screen.
