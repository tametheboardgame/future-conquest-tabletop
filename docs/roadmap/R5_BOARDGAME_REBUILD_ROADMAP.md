# R5 Board-Game Rebuild Roadmap

Status: Authoritative implementation programme after visual/rules rebaseline  
Date: 23 August 2026

## Product destination

Future Conquest should **look and sound like the visually rich pre-R5 Future Conquest**, while playing through a much simpler digital board-game rules layer.

The target is the approved concept direction:

- existing 2.5D terrain map is the board;
- existing cities, landmarks, political borders, portal, formation miniatures, camera, opening/title experience and music are retained;
- a compact left navigation rail and a collapsible right board-game tray frame the map;
- the right tray owns command dice, selected formation components, contextual actions, combat dice and tactical cards;
- the map remains the dominant surface at all times;
- the old simulation-management gameplay is removed from the player experience.

Core rule:

> Preserve the world and atmosphere. Replace the administration and mechanics.

Historical visual baseline: `89c33f6e15d7a12d9bbac0a56c94a3bc946b6d0a` (R3-WP6.6).

The visible abstract circular-node R5 board is not part of the intended finished product.

---

## Non-negotiable preservation list

The following are product assets/systems to retain unless technically impossible:

- Future Conquest title/startup experience;
- title/game music and audio settings;
- physical 2.5D terrain renderer;
- existing authored cities and landmark miniatures;
- Future portal presentation and scenario identity;
- political borders/control colouring;
- formation miniatures/markers;
- camera, zoom and pan behaviour;
- established dark military visual language;
- useful terrain, geography and route data beneath the board;
- deterministic save/PRNG architecture.

These are not legacy clutter. They are part of the game's identity.

---

## Gameplay systems to replace/remove

The board-game programme replaces player-facing simulation administration including:

- daily-turn/order bureaucracy;
- operations-management workflow;
- detailed logistics allocation and throughput dashboards;
- engineering project administration;
- maintenance/armour-wear management UI;
- production/economy screens;
- occupation administration;
- persistent battle-report clutter;
- large alert/report systems;
- detailed formation management screens;
- simulation-owned movement and combat authority.

Underlying calculations may survive only when they can be expressed through a small board-game state, marker, card, dice modifier or automatic rule.

---

# Delivery sequence

## R5-BG0 — Restore the real Future Conquest shell

Current implementation: PR #10, `r5/restore-r3-shell-boardgame`.

Deliver:

- startup/title/music restored;
- R3-WP6.6 map-first shell restored as production host;
- physical terrain, cities, landmarks, portal and formations retained;
- abstract circular-node R5 board removed from production presentation;
- thin top framing and compact left rail retained;
- minimal collapsible right tray scaffold;
- R5 state/actions remain authoritative beneath the presentation.

Exit condition:

- the deployed build is immediately recognisable as Future Conquest rather than a replacement prototype.

**Mandatory David visual acceptance gate before expanding mechanics.**

---

## R5-BG1 — Rules authority and legacy deletion boundary

Purpose: lock one clean board-game engine before adding new systems.

Deliver:

- authoritative six-command-seat state model, three seats per side;
- human/AI assignment stored independently of faction/command identity;
- standard scenario length: 8 rounds;
- explicit side/seat activation ownership;
- deterministic round/seat/save/resume state;
- Future portal and strategic objectives represented in board-game state;
- formal map between rich renderer formations/locations and board-game authority;
- delete or isolate remaining production dependencies on simulation-owned daily orders, operations, logistics administration and report state.

Initial command grouping:

### Future Force

- Future Command Alpha;
- Future Command Bravo;
- Future Command Charlie.

### Coalition

- Western Command;
- Central Command;
- Eastern Command.

Player count does not alter the number of commands. Humans/AI simply occupy the existing seats.

Exit condition:

- exactly the same scenario can run with 2–6 humans without changing force balance or available command capacity.

---

## R5-BG2 — Command dice economy

Purpose: replace fixed action counters with a visible board-game resource that creates tactical problems before decisions are made.

Prototype rule:

Each Command Seat rolls one D6 at round start:

- 1–2 = 1 Command Point;
- 3–5 = 2 Command Points;
- 6 = 3 Command Points.

Deliver:

- three visible command dice per side;
- deterministic dice roll from authoritative PRNG;
- command points attached to the seat/die that generated them;
- alternating activations between sides;
- spend one die to activate one formation belonging to that command;
- CP spending within that activation;
- one attack maximum per formation activation;
- clear right-tray presentation matching the approved concept direction.

Core CP actions initially:

- Move: 1+ CP according to terrain/route cost;
- Attack: 1 CP;
- Entrench: 1 CP;
- Recover: 1 CP;
- Reorganise: 1 CP.

Exit condition:

- a complete round produces different tactical choices from different command rolls without ever producing a useless turn.

**Playtest gate: command-dice feel before cards are introduced.**

---

## R5-BG3 — Formation components and movement

Purpose: make armies feel like board pieces rather than stat sheets.

Deliver:

- compact component model visible in right tray;
- Infantry steps;
- Armour steps;
- optional Artillery/Air/Engineer/Future-tech traits where they create clear rules;
- Ready → Damaged → Destroyed armour state;
- formation strength derived directly from surviving functional components;
- movement by real geographic regions/territories on the existing map;
- route/terrain data automatically converted into intelligible CP costs;
- legal destination highlights directly on the rich map;
- short existing movement animation retained where useful;
- formation split/merge/reorganisation through component transfer, not an order-of-battle editor.

Exit condition:

- a player can read a formation, move it and understand its remaining combat capability without opening a management screen.

---

## R5-BG4 — Final core combat model

Purpose: convert the existing dice prototype into the board-game combat model used by the finished rules.

Baseline model:

- functional components generate base dice;
- terrain/entrenchment supply defender dice/modifiers;
- supply/readiness/components create simple visible modifiers;
- 5 = hit;
- 6 = critical hit;
- critical hits damage functional armour where present;
- ordinary losses are allocated by the owning player;
- both sides roll simultaneously;
- defender retreats if attacker causes more hits and both survive;
- tied result means defender holds;
- no legal retreat can create encirclement loss;
- one attack resolves in one compact event.

Deliver:

- authoritative pre-roll preview;
- visible dice in right tray;
- concise modifier reasons;
- visible component damage/removal;
- retreat/capture/elimination on the map;
- no persistent report screen.

Exit condition:

- combat is understood before commitment and completed in seconds.

**Major playtest gate: movement + command dice + combat must be fun before deeper systems.**

---

## R5-BG5 — Supply, entrenchment, recovery and reorganisation

Purpose: retain manoeuvre consequences without restoring military ERP gameplay.

### Supply

Default player-facing states:

- Supplied;
- Cut Off.

Prototype effects for Cut Off:

- -1 combat die;
- cannot Recover;
- after two consecutive end phases Cut Off, lose one component;
- selecting the warning shows the broken supply path/condition directly on the board.

Detailed route/network calculations may remain underneath but are automatic.

### Entrenchment

- 1 CP;
- visible marker/state;
- +1 defending combat die;
- removed by moving/attacking.

### Recovery

- 1 CP;
- requires supply/eligible location;
- Coalition can restore allowed components according to mobilisation rules;
- Future Force can restore personnel more readily than destroyed advanced armour.

### Reorganisation

- 1 CP;
- transfer components between co-located friendly formations;
- split or merge formations using visible pieces/components.

Exit condition:

- these systems create tactical board decisions and no dedicated administration screen is required.

---

## R5-BG6 — Tactical cards

Purpose: create timing, surprise and faction flavour without making core actions card-dependent.

Deliver framework first:

- faction/team draw pile;
- discard pile;
- hand;
- deterministic shuffle/save/resume;
- card timing windows;
- one-card-per-side-per-activation/combat prototype restriction;
- right-tray card hand presentation.

Prototype hand rules:

- starting hand: 3;
- draw 1 per round;
- hand limit: 5;
- every card has a specific effect plus a useful generic discard use.

Example families:

Future:

- Precision Strike;
- Sensor Fusion;
- Rapid Redeployment;
- Electronic Warfare;
- Field Repair;
- Decoy Swarm.

Coalition:

- Fighting Withdrawal;
- Local Knowledge;
- Emergency Reserves;
- Counterattack;
- Air Support;
- Emergency Bridging;
- Intelligence Warning.

Exit condition:

- cards create difficult timing choices, but Move and Attack remain reliable core actions.

---

## R5-BG7 — Coalition escalation and mobilisation deck

Purpose: make time itself the Coalition's strategic weapon and remove the need for a production economy.

Deliver a staged Escalation Deck:

### Stage I — Local Response
Rounds 1–2.

### Stage II — National Mobilisation
Rounds 3–5.

### Stage III — Coalition War Footing
Rounds 6–8.

Campaign construction target:

- choose/shuffle 2 Stage I cards;
- 3 Stage II cards;
- 3 Stage III cards;
- stack stages in order;
- reveal one escalation card each round.

Cards introduce reinforcements/capabilities at sensible geographic choices rather than arbitrary impossible locations.

The Coalition grows substantially stronger with time. Future Force advanced losses remain difficult to replace.

Exit condition:

- the Future player feels a clear race against time and the Coalition player experiences a satisfying escalation arc.

**Playtest gate: full eight-round campaign without AI.**

---

## R5-BG8 — Scenario objectives, portal and victory

Purpose: make conquest serve the scenario rather than becoming Risk-style total elimination.

Deliver:

- 5–7 strategic objective locations using existing cities/hubs;
- Future portal retained visually and mechanically;
- Future Force objective target, prototype: control 4 of 6 objectives at an End Phase including at least one Major Objective;
- Coalition immediate win for capturing/neutralising the Future Portal where scenario permits;
- Coalition wins if Future Force fails its objective by end of Round 8;
- clear objective markers integrated into the rich map;
- victory/defeat presentation using preserved Future Conquest visual/audio language.

No player elimination: a command that loses all formations retains command relevance, for example by transferring reduced command capacity to a friendly command until reinforced.

Exit condition:

- every campaign has urgency, a finite ending and meaningful geographic objectives.

---

## R5-BG9 — 2–6 player local multiplayer

Purpose: make player count an assignment problem, not a balance problem.

Deliver:

- six permanent Command Seats;
- setup screen assigns each seat to Human or AI;
- 2-human baseline: one controls all Future commands, one all Coalition commands;
- 3–6 humans divide the same six commands between players;
- optional uneven team sizes such as 1v2 or 2v3;
- later advanced scenario support for individual European groupings/countries without changing the core action rules;
- hotseat transition/privacy treatment for hands/dice where needed;
- save/resume at any activation boundary.

Exit condition:

- 2, 3, 4, 5 and 6 human games all use the same scenario balance and round length.

---

## R5-BG10 — AI command seats

Purpose: allow any unoccupied seat to be filled by AI using exactly the same legal rules as a human.

Deliver AI over the same authoritative action interface for:

- command-die allocation;
- formation activation;
- movement;
- attacks;
- retreats/casualty allocation;
- recovery/entrench/reorganisation;
- card timing;
- reinforcement placement;
- objective pursuit.

Difficulty changes decision quality/risk tolerance rather than hidden bonuses.

Exit condition:

- any combination from solo player + five AI seats through six humans can complete a legal campaign.

---

## R5-BG11 — Interface convergence to approved concept

Purpose: make the final systems feel like one designed digital board game rather than accumulated UI.

Deliver:

- map remains dominant;
- top bar contains only scenario/round/current side/command/escalation essentials;
- left rail limited to Board, Forces, Scenario and Settings unless playtesting proves another permanent destination necessary;
- collapsible right board-game tray contains command dice, selected formation, contextual actions, combat preview/results and tactical cards;
- map overlays replace separate management pages wherever possible;
- cities, portal, objectives and formations remain visual objects on the board;
- controller/touch/keyboard accessibility without bloating the map;
- preserve music, title sequence and atmosphere;
- remove any production-visible remnants of the abstract prototype or old simulation dashboards.

Exit condition:

- a screenshot of normal play broadly matches the approved concept direction while using the real Future Conquest assets/map rather than newly invented replacement art.

---

## R5-BG12 — Balance, simulation and repeated playtesting

Purpose: tune the game rather than add systems.

Maintain deterministic headless simulation of the actual board-game rules and collect:

- Future/Coalition win rate;
- victory round distribution;
- objective-control progression;
- command-die usefulness and wasted CP;
- attack frequency;
- average dice advantage by side/round;
- component loss by type;
- Future advanced-armour survival;
- reinforcement value by escalation card;
- card play/discard rates;
- seat/command contribution;
- frequency/duration of Cut Off states;
- dominant openings and stalled games.

Pair simulations with human playtest evidence for:

- tension;
- clarity;
- downtime;
- memorable decisions;
- frustration from randomness;
- whether players care about the map;
- whether any panel feels like administration rather than play.

Balance parameters should be data/config driven where possible so simulations do not require UI changes.

Exit condition:

- no dominant strategy, acceptable win-rate band, good eight-round pacing and repeated human playtest desire to play again.

---

# Deletion/earn-back pass

After the core campaign works, audit inherited simulation code.

Every major legacy system must be classified:

- **PRESENTATION ASSET — KEEP**;
- **UNDER-THE-HOOD CALCULATION — KEEP IF IT EARNS ITS COST**;
- **BOARD-GAME ABSTRACTION — REPLACED**;
- **ADVANCED/SCENARIO RULE — DEFER**;
- **REMOVE**.

No player-facing system returns because it already exists or took substantial effort to build.

---

# Mandatory development gates

Do not run straight through this roadmap without playtesting.

1. **BG0 visual gate** — does this look like Future Conquest again?
2. **BG2 command-dice gate** — do dice create interesting choices rather than frustration?
3. **BG4 core-loop gate** — are movement and combat fun?
4. **BG7 campaign gate** — does escalation create a compelling eight-round arc?
5. **BG9 multiplayer gate** — does adding humans avoid increasing downtime/game length?
6. **BG12 balance gate** — tune before adding optional systems.

At a failed gate, fix or simplify the current rules. Do not add another subsystem to compensate for a weak core loop.

---

# Immediate next sequence from current state

`BG0 restore/accept shell → lock BG1 rules/state → BG2 command dice → BG3 components/movement → BG4 combat → personal playtest → BG5 supply/recovery/reorganisation → BG6 cards → BG7 escalation → full human-vs-human campaign playtest → BG8 victory/portal refinement → BG9 2–6 players → BG10 AI → BG11 interface convergence → BG12 balance/simulation`

This programme deliberately keeps cards, escalation and AI out until the map-first movement/combat loop is enjoyable.