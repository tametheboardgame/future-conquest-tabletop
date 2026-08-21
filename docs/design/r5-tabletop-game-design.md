# R5 — Tabletop Game Design Direction

Status: Foundation proposal  
Date: 21 August 2026  
Repository: `future-conquest-tabletop`

## 1. Purpose of the pivot

Future Conquest has developed a substantial strategic simulation, but the player-facing game has become dominated by administration, interfaces and continuous system management. The R5 tabletop direction changes the primary design question from **"what else can the simulation model?"** to **"what interesting decision does the player make next?"**

The redesign does not discard the existing work. The existing simulation becomes a library of consequences and supporting calculations that may sit underneath a much simpler game language.

The governing rule is:

> **Complex simulation underneath. Simple board-game language on top. Every turn should force a small number of consequential decisions.**

## 2. Core identity retained

The premise remains recognisably Future Conquest:

- a finite future army has been displaced into the present;
- its advanced equipment is powerful but difficult or impossible to replace;
- present-day states initially react separately, then mobilise and coordinate;
- time favours the present-day coalition;
- the invader must achieve decisive strategic objectives before mobilisation overwhelms it;
- the invasion itself helps create the future it was intended to prevent.

The redesign changes the game structure, not the premise.

## 3. Design pillars

### 3.1 The board is the main interface

The player should understand the military situation by looking at the map. Menus provide detail on demand rather than carrying the game.

The board should visibly communicate:

- who controls an area;
- where armies are;
- approximate army strength and composition;
- supply status;
- damage;
- fortifications;
- damaged or repaired infrastructure;
- strategic objectives;
- mobilisation/escalation pressure.

### 3.2 Pieces before panels

Armies, garrisons, engineers, depots, bridges and objectives should be represented as board objects wherever practical. A condition that matters tactically should normally have a visible marker.

### 3.3 Few actions, high consequence

A player should normally make only a handful of major decisions in a round. The prototype target is **4 Command Actions per player per round**.

A command action should normally alter position, force posture, supply, infrastructure or battle outcome.

### 3.4 Alternating activations

Players should not complete an entire administrative turn while everyone else waits. One side acts, then another side reacts.

The preferred structure is alternating activation:

1. active player spends a Command Action;
2. opposing player or AI spends a Command Action;
3. repeat until both sides have spent or passed;
4. resolve end-of-round mobilisation, supply and event effects.

This creates interaction and counterplay throughout the round.

### 3.5 Dice create battle uncertainty, not administrative randomness

Dice are for moments where uncertainty is dramatic and understandable: combat, desperate retreats, risky special operations or similarly exceptional actions.

Normal movement, ordinary supply tracing and routine engineering should not require random rolls.

### 3.6 Cards create exceptions and opportunities

Cards should modify or break normal rules rather than replace normal play.

The player must always retain reliable core actions such as moving, attacking and reinforcing. Cards create timing choices, combinations and surprises without making the game entirely hand-dependent.

### 3.7 Simulation must earn its visibility

A detailed system may remain underneath the game, but it should only receive substantial player-facing interface if it produces repeated, interesting decisions that cannot be expressed more clearly through pieces, tracks, cards or simple states.

## 4. Players and factions

### 4.1 Target player modes

R5 should be designed around seats rather than around a permanently single-player architecture.

Initial target modes:

- 1 player versus AI;
- 2-player local hotseat;
- 3–4 player local hotseat where scenario structure supports it;
- unoccupied seats filled by AI.

Online multiplayer is deliberately out of prototype scope. The rules and state model should avoid making it impossible later.

### 4.2 Primary asymmetric conflict

The first prototype should use two sides.

#### Future Force

Characteristics:

- fewer pieces;
- high combat quality;
- advanced equipment;
- powerful tactical cards;
- very limited replacement capacity;
- vulnerable strategic supply;
- pressure to achieve objectives quickly.

#### Present-Day Coalition

Characteristics:

- larger potential manpower and industrial base;
- weaker initial battlefield capability;
- broader replacement capacity;
- mobilisation increases strength over time;
- increasing access to coalition forces and capabilities;
- strategic incentive to delay, contain and survive.

The asymmetry is central to the game rather than a balance problem to remove.

## 5. Board and geography

### 5.1 Strategic regions

The prototype should not use the full existing territory density.

Prototype target: **15–20 strategic regions**.

A mature European scenario is expected to use approximately **30–60 meaningful strategic areas**, subject to playtesting.

Areas should exist because they matter to play, for example:

- major cities;
- ports;
- river crossings;
- mountain passes;
- airfields;
- rail junctions;
- supply hubs;
- political centres;
- portal or special scenario sites.

### 5.2 Connections

Movement is primarily between connected areas. Connections can carry properties such as:

- normal route;
- major road/rail route;
- river crossing;
- mountain route;
- sea connection;
- damaged/blocked status.

Existing route and geographic data may support the calculation, but the player sees an intelligible network.

## 6. Round structure

The prototype target is **6–8 rounds**.

Each round:

1. **Round Start** — draw/refill cards, reveal scheduled mobilisation/events, refresh command resources.
2. **Command Phase** — alternating Command Actions.
3. **Battle Resolution** — battles may resolve immediately when initiated; any delayed effects complete here.
4. **Supply Check** — compute each formation's visible supply state.
5. **Control and Mobilisation** — resolve territory control, objectives, reinforcements, escalation and mobilisation.
6. **Victory Check** — determine immediate victory/defeat or proceed to next round.

The objective is a round that feels like a chapter in a campaign rather than a day of administration.

## 7. Command Actions

Prototype baseline: **4 Command Actions per side per round**.

Core actions should include:

- **Move** — move one eligible formation along allowed connection(s).
- **Attack** — initiate battle against an adjacent enemy-held region or formation.
- **Reinforce/Recover** — add allowed replacement strength, recover readiness or consolidate.
- **Engineer** — build, repair, demolish or entrench where eligible.
- **Logistics** — establish/move a depot, prioritise a route or restore a supply arrangement.
- **Reconnaissance** — improve information or expose concealed capability where fog-of-war is used.
- **Special/Scenario Action** — objective-specific actions.

Cards may improve these actions, reduce their cost, chain them, interrupt an opponent, or create exceptional actions.

## 8. Army pieces

The army piece is the main military object.

Each formation must communicate at a glance:

- faction;
- broad strength;
- major composition traits;
- supply state;
- readiness/damage;
- entrenchment;
- cut-off status.

The first prototype should avoid requiring the player to manage detailed internal orders of battle.

Possible composition traits:

- Infantry;
- Armour;
- Artillery;
- Air support;
- Engineer support;
- Future-tech elite.

Composition should alter a small number of visible combat rules rather than produce a large stats sheet.

## 9. Combat and dice

### 9.1 Design goal

Before rolling, the player should be able to understand the approximate odds and why.

The interface should be able to express a battle in language such as:

> Attacker: 6 dice. Defender: 4 dice. You have the advantage, but the attack is not safe.

### 9.2 Prototype combat model

The exact values are provisional, but the first rules engine should use a small dice pool.

Example structure:

- formation strength supplies base dice;
- favourable combined-arms traits add dice;
- terrain/fortifications add defender protection or remove attacker dice;
- Strained supply applies a modest penalty;
- Cut Off applies a severe penalty and blocks reinforcement;
- damage/readiness can remove dice;
- cards can add, reroll, cancel or convert dice;
- each die meeting the hit threshold causes a hit;
- hits translate into strength loss, damage, retreat or elimination according to simple rules.

Combat must resolve quickly enough that several battles per round remain enjoyable.

### 9.3 Dice restrictions

Do not roll dice for:

- normal movement;
- normal supply tracing;
- ordinary reinforcement;
- routine bridge repair when prerequisites are satisfied;
- basic control changes.

## 10. Supply and logistics

The detailed logistics network may remain useful underneath the game, but the default player-facing representation is three states:

### Supplied

- normal combat;
- may reinforce/recover;
- normal movement and special-action access.

### Strained

- modest combat penalty;
- reduced or restricted reinforcement;
- clearly visible warning marker.

### Cut Off

- severe combat/readiness penalty;
- cannot normally reinforce;
- may suffer attrition at round end if the condition persists;
- highly visible board marker;
- interface identifies the nearest route or condition required to restore supply.

The player should interact with logistics through visible routes, depots, hubs, cards and a few command actions rather than by operating a throughput dashboard.

## 11. Engineering

Engineering should become a tactical board system.

Core board effects can include:

- repair bridge;
- demolish bridge;
- repair strategic route;
- build temporary crossing;
- entrench;
- establish depot;
- repair airfield or rail hub.

Engineering may require an engineer-capable formation, an Engineer action, a card, or some combination depending on effect strength.

Infrastructure changes should be physically visible on the board.

## 12. Cards

### 12.1 Deck structure

Prototype target: approximately **30 cards total** across both sides and/or shared decks.

Card families:

- Operations;
- Logistics;
- Engineering;
- Intelligence;
- Political/Occupation;
- Scenario/Event.

### 12.2 Example cards

Operations:

- Blitz;
- Forced March;
- Prepared Assault;
- Counterattack;
- Fighting Withdrawal;
- Strategic Bombardment.

Logistics:

- Emergency Airlift;
- Strategic Stockpile;
- Convoy;
- Priority Resupply;
- Interdict Supply Route.

Engineering:

- Bailey Bridge;
- Emergency Repairs;
- Demolish Crossing;
- Entrench;
- Temporary Airstrip.

Political/Occupation:

- Martial Law;
- Local Collaboration;
- Propaganda Campaign;
- Resistance Activity;
- Emergency Administration.

### 12.3 Card rules

Cards should normally do one or more of the following:

- modify an action;
- alter dice;
- create an interrupt/reaction;
- temporarily break a rule;
- accelerate a normal action;
- create a strategic dilemma.

Cards should not be required merely to perform ordinary movement or combat.

## 13. Reinforcement and mobilisation

### Future Force

Future-force losses are intentionally difficult to replace.

Possible sources of limited recovery:

- recovered wounded personnel;
- cannibalised equipment;
- converted present-day auxiliaries;
- rare scenario rewards.

The future side should feel increasingly stretched even while winning.

### Present-Day Coalition

The coalition grows stronger with time.

A visible **Mobilisation Track** should unlock or improve:

- reinforcement volume;
- armour/artillery availability;
- air capability;
- coalition coordination;
- strategic cards;
- stronger AI/player command options.

This creates a built-in campaign clock.

## 14. Territory control and occupation

Control should be board-readable.

A region normally changes to secure control when scenario requirements are met, such as:

- enemy combat formation removed or forced out;
- required strategic site occupied;
- supply/authority requirement satisfied.

Occupation complexity should be compressed into a small number of states or an unrest track when needed.

Possible states:

- Secure;
- Contested;
- Unrest;
- Revolt.

Garrisons should exist as pieces or explicit strength rather than hidden administrative assignments.

## 15. Intelligence and fog of war

The prototype may begin with mostly open information to simplify testing.

Later scenarios may use uncertain information through:

- facedown/contact markers;
- approximate strength bands;
- reconnaissance actions;
- intelligence cards;
- confidence indicators.

Fog of war should create decisions, not obscure basic usability.

## 16. Victory conditions

The first prototype must not require colouring the entire map.

Scenario victory should be clear, finite and visible.

Example Future Force victory conditions:

- hold three strategic capitals at the end of Round 7;
- maintain control of the portal plus two supply hubs;
- capture specified command centres before mobilisation reaches a threshold.

Example Coalition victory conditions:

- prevent the Future Force objective until Round 8;
- destroy/capture the future command unit;
- push the invader below a viable strength threshold;
- reach maximum mobilisation while retaining required strategic areas.

The eventual grand campaign may use broader conquest objectives, but should still contain intermediate strategic objectives and clocks.

## 17. AI and local multiplayer architecture

The game state should represent multiple player seats with a common action API.

A seat can be controlled by:

- local human;
- AI;
- later, potentially remote human.

The AI should choose from the same legal actions and cards available to a human seat wherever possible.

Hotseat requires:

- clear side-change transition;
- optional hidden-hand privacy screen;
- no assumption that one faction is permanently controlled by AI;
- deterministic save/resume of current seat, round and action state.

## 18. Interface direction

The primary play screen should be dominated by:

- board/map;
- pieces;
- current objective;
- round/mobilisation information;
- remaining Command Actions;
- current hand of cards;
- context action controls for the selected piece/region.

Detailed information should appear on selection or hover/tap and disappear when no longer needed.

The 2.5D work remains strategically valuable because it can support a physical tabletop presentation:

- miniature-style formations;
- flags/control markers;
- bridges and destroyed bridges;
- depots and fortifications;
- animated movement;
- visible damage;
- dice animation;
- cards played onto the board.

## 19. Systems deliberately excluded from the first prototype

The prototype should resist reintroducing the full simulation too early.

Exclude unless absolutely required for the proof of fun:

- detailed political administration;
- granular equipment maintenance;
- extensive production chains;
- detailed weather modelling;
- full diplomatic simulation;
- large territory counts;
- detailed order-of-battle management;
- complex naval warfare;
- strategic nuclear systems;
- online multiplayer;
- long-form campaign progression.

These systems may return only after the core loop is demonstrably enjoyable.

## 20. First playable prototype target

The first deliberate proof-of-fun should contain approximately:

- 15–20 regions;
- 2 factions;
- 8–12 army pieces per side;
- 4 Command Actions per side per round;
- alternating activation;
- 6–8 rounds;
- one combat dice system;
- three supply states;
- basic engineering effects;
- reinforcements/mobilisation;
- around 30 cards;
- 2-player hotseat;
- basic AI capable of occupying either seat;
- one clear scenario with asymmetric victory conditions.

## 21. Proof-of-fun criteria

Before substantial legacy systems are reintroduced, playtesting must demonstrate that players repeatedly experience meaningful choices such as:

- attack now or reinforce first;
- spend the final Command Action repairing a route or exploiting a breakthrough;
- commit a powerful card now or save it for a likely counterattack;
- push a damaged elite formation one region further or preserve it;
- cut an enemy supply line instead of attacking directly;
- sacrifice territory to buy mobilisation time;
- choose which strategic objective matters most this round.

A test session should produce identifiable moments of tension, surprise, recovery and consequence without requiring the player to understand the underlying simulation architecture.

If the small prototype is not fun, the rules are changed before the scope is expanded.

## 22. Design authority

This document supersedes prior assumptions where they conflict with the tabletop prototype, especially:

- single-player-only architecture;
- one-day turns;
- conquest of every required territory as the only primary victory structure;
- large territory counts as a prerequisite for strategic depth;
- detailed player-facing administration of simulation systems.

It does **not** delete or invalidate prior research, world-state data, map work, simulation code or visual assets. Their future use is governed by the R5 legacy reuse matrix and playtest evidence.
