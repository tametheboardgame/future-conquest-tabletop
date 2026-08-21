# R5 Tabletop Roadmap

Status: Initial implementation roadmap  
Date: 21 August 2026

## Goal

Build and validate a deliberately small digital tabletop version of Future Conquest before reintroducing the depth of the existing simulation.

R5 is successful only if the core play loop is enjoyable without relying on administrative complexity.

## Delivery rules

1. The existing imported simulation baseline remains preserved.
2. R5 work happens incrementally on the tabletop repository.
3. The board, pieces, cards and dice are the primary player language.
4. Existing simulation systems are reused only when they create useful consequences with a simpler presentation.
5. No major system is reintroduced before the proof-of-fun prototype is playable.
6. Each work package must leave the game in a testable state.
7. Playtest evidence outranks attachment to previous implementation effort.

---

## R5-WP0 — Foundation and Rules Lock

### R5-WP0.1 — Tabletop design foundation

Deliver:

- approved R5 tabletop design direction;
- legacy reuse matrix;
- prototype rules v0.1;
- explicit proof-of-fun criteria;
- repository README updated to identify the tabletop branch of the project.

Exit condition:

- the prototype can be explained from the design documents without referring to the old UI.

### R5-WP0.2 — Game-state authority refactor plan

Deliver:

- identify existing state objects safe to reuse;
- define seat/faction ownership model;
- define round/action state;
- define card state;
- define board-piece state;
- define deterministic save state for tabletop mode.

No gameplay implementation beyond scaffolding.

---

## R5-WP1 — Small Board Prototype

### R5-WP1.1 — Prototype strategic map

Deliver:

- 15–20 strategic regions;
- meaningful adjacency network;
- major cities/hubs/crossings represented;
- objective regions visibly marked;
- existing 2.5D terrain/map technology reused where it helps;
- no requirement to preserve the old 101-territory interaction model.

### R5-WP1.2 — Physical pieces and selection

Deliver:

- 8–12 formations per side;
- obvious faction identity;
- click/tap selection;
- legal move destinations shown directly on the board;
- visible strength/composition summary;
- movement animation kept short and readable.

Exit condition:

- a player can understand where both armies are and move a piece without opening a management screen.

---

## R5-WP2 — Round and Command System

### R5-WP2.1 — Alternating activation

Deliver:

- round counter;
- two seats;
- 4 Command Actions per side per round;
- alternating activation;
- pass/end-action handling;
- clear indication of current side and remaining actions.

### R5-WP2.2 — Core actions

Implement:

- Move;
- Attack;
- Reinforce/Recover;
- Engineer;
- Logistics;
- basic scenario action.

Exit condition:

- a complete round can be played with no cards and no AI.

---

## R5-WP3 — Combat and Dice

### R5-WP3.1 — Dice-pool combat model

Deliver:

- base combat dice from formation strength;
- terrain and posture modifiers;
- supply modifiers;
- damage/readiness modifiers;
- hit resolution;
- retreat/elimination handling;
- preview of expected relative advantage before confirmation.

### R5-WP3.2 — Combat presentation

Deliver:

- compact battle preview;
- visible dice roll;
- immediate explanation of modifiers;
- concise battle result;
- board state updates without persistent report clutter.

Exit condition:

- battles are understandable before the roll and satisfying to resolve within seconds rather than minutes.

---

## R5-WP4 — Cards

### R5-WP4.1 — Card framework

Deliver:

- draw pile/discard pile;
- player hand;
- card timing rules;
- action modifiers;
- interrupts/reactions;
- deterministic save/resume.

### R5-WP4.2 — Prototype deck

Target approximately 30 cards covering:

- Operations;
- Logistics;
- Engineering;
- Intelligence;
- Political/Occupation;
- Scenario/Event effects.

Exit condition:

- cards create tactical timing choices but ordinary movement and attacks never require drawing the correct card.

---

## R5-WP5 — Supply, Engineering and Control Abstraction

### R5-WP5.1 — Three-state supply

Deliver:

- Supplied;
- Strained;
- Cut Off;
- automatic calculation from the board/network;
- obvious markers on affected formations;
- direct explanation of how supply can be restored.

### R5-WP5.2 — Board engineering

Deliver visible board effects for at least:

- repair bridge;
- demolish bridge;
- repair route;
- entrench;
- establish/move depot.

### R5-WP5.3 — Control and garrisons

Deliver:

- visible control markers;
- simple secure/contested state;
- garrison representation;
- scenario-objective control checks.

Exit condition:

- logistics and engineering influence manoeuvre without requiring the player to administer a logistics application.

---

## R5-WP6 — Mobilisation, Reinforcement and Asymmetry

### R5-WP6.1 — Coalition mobilisation track

Deliver:

- visible mobilisation track;
- scheduled unlocks/reinforcement improvements;
- meaningful pressure on the Future Force to move quickly.

### R5-WP6.2 — Future-force attrition economy

Deliver:

- limited recovery/replacement;
- persistent loss of elite capability;
- simple representation of advanced-equipment degradation;
- no detailed maintenance administration in the prototype.

Exit condition:

- both sides have different strategic incentives and neither feels like a recoloured copy of the other.

---

## R5-WP7 — Local Multiplayer and AI

### R5-WP7.1 — Hotseat

Deliver:

- 2-player local hotseat first;
- side-change transition;
- hidden-hand privacy treatment where required;
- save/resume at any action boundary.

Stretch target:

- 3–4 seats for later scenarios.

### R5-WP7.2 — Basic AI seat controller

Deliver AI capable of using the same legal action interface as a human for:

- movement;
- attacks;
- reinforcement;
- objective pursuit;
- basic supply repair;
- simple card play.

The initial AI need not be sophisticated. It must provide credible pressure and complete games reliably.

Exit condition:

- either side can be human or AI without changing the rules engine.

---

## R5-WP8 — First Complete Scenario

### R5-WP8.1 — Proof-of-fun scenario

Target:

- 15–20 regions;
- 2 factions;
- 8–12 formations each;
- around 30 cards;
- 4 Command Actions each round;
- 6–8 rounds;
- asymmetric victory conditions;
- mobilisation clock;
- supply and engineering interaction;
- hotseat and AI modes.

Example structure:

- Future Force must seize and hold a small set of strategic hubs before the final round;
- Coalition wins by denying those objectives until mobilisation matures or by destroying/capturing the future command element.

### R5-WP8.2 — Playtest instrumentation

Record:

- game length;
- number of meaningful battles;
- average actions used per round;
- cards played/held/discarded;
- regions that never matter;
- frequency of supply decisions;
- victory timing;
- obvious dominant strategies;
- points where the player opens a detailed panel instead of reading the board;
- subjective playtest notes: tension, surprise, confusion, downtime and memorable moments.

---

## R5-WP9 — Earn-Back Review

After repeated prototype playtests, review every major legacy system and classify it as:

- **KEEP UNDER THE HOOD** — useful calculation, simplified presentation;
- **RETURN IN SIMPLIFIED FORM** — adds decisions worth the interface cost;
- **SCENARIO/ADVANCED RULE** — valuable but not part of the core loop;
- **REMOVE FROM TABLETOP** — complexity does not improve play.

Candidates include:

- detailed route throughput;
- armour wear;
- occupation administration;
- loyalty;
- escalation;
- intelligence confidence;
- diplomacy;
- air/naval systems;
- weather;
- detailed formation management;
- world-state data.

No item returns merely because substantial implementation effort already exists.

---

## First implementation boundary

Coding should initially stop at the minimum required to prove these questions:

1. Is moving pieces around this board satisfying and clear?
2. Does alternating activation create useful counterplay?
3. Are four Command Actions enough to create difficult choices?
4. Are battles tense without feeling arbitrary?
5. Do cards create interesting timing decisions?
6. Does supply create manoeuvre decisions instead of administration?
7. Does the mobilisation clock force the two sides to play differently?
8. Is a complete 6–8 round game enjoyable enough to immediately replay?

If the answer to the final question is no, improve the rules before increasing scope.

## Suggested implementation order

`WP0 → WP1 → WP2 → WP3 → first micro-playtest → WP4 → WP5 → WP6 → second playtest → WP7 → WP8 → repeated playtest → WP9`

The first micro-playtest should happen as soon as two people can move and fight with placeholder pieces. Visual polish must not delay rule validation.
