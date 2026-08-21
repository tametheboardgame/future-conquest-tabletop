# R5 Legacy Reuse Matrix

Status: Initial disposition  
Date: 21 August 2026

## Purpose

The tabletop redesign begins from a mature simulation codebase. This document prevents two opposite mistakes:

1. throwing away useful technology simply because the rules are changing; or
2. preserving complexity simply because it already exists.

Every legacy system receives an initial disposition. These are not permanent architectural decisions; they are constraints for the proof-of-fun prototype.

## Disposition definitions

- **KEEP / REUSE DIRECTLY** — already supports the tabletop game with little conceptual change.
- **KEEP UNDER THE HOOD** — retain calculation/data, expose a much simpler result.
- **SIMPLIFY / REBUILD PRESENTATION** — concept survives but the player-facing implementation changes substantially.
- **ADVANCED / LATER** — potentially valuable after the core game is proven.
- **REMOVE FROM PROTOTYPE** — do not spend prototype scope on it.

---

| Existing area | R5 disposition | Tabletop treatment |
|---|---|---|
| 2.5D map renderer / terrain presentation | **KEEP / REUSE DIRECTLY** | Strong asset. Reframe it as a digital game board with clear strategic regions and physical markers. |
| Terrain data | **KEEP UNDER THE HOOD** | Use terrain to modify movement/combat, but present only relevant properties and modifiers. |
| Existing detailed territory catalogue | **ADVANCED / LATER** | Retain research/data. Prototype uses 15–20 strategic regions; mature scenarios may use 30–60. |
| World-state data and research pipeline | **ADVANCED / LATER** | Valuable for scenario generation and contemporary flavour, not required to prove the core game. |
| Formation visual models / physical army markers | **KEEP / REUSE DIRECTLY** | Central to tabletop presentation. Improve readability rather than replacing with rows/panels. |
| Formation selection on map | **KEEP / REUSE DIRECTLY** | Must become one of the primary interaction paths. |
| Existing formation-management panels | **REMOVE FROM PROTOTYPE** | Replace detailed management with compact piece state and contextual actions. |
| Detailed order of battle | **KEEP UNDER THE HOOD** | May generate broad traits/strength, but not routinely administered by the player. |
| Existing movement/pathfinding | **KEEP UNDER THE HOOD** | Reuse where practical to validate legal movement, but present simple region-to-region movement. |
| Route graph | **KEEP UNDER THE HOOD** | Useful for movement/supply. Player sees meaningful connections, not raw graph complexity. |
| Detailed route throughput model | **KEEP UNDER THE HOOD** | Collapse result primarily to Supplied / Strained / Cut Off. |
| Supply activation rules | **SIMPLIFY / REBUILD PRESENTATION** | Keep network consequences but turn supply into visible board states and depot/route decisions. |
| Cut-off calculations | **KEEP UNDER THE HOOD** | High strategic value. Surface as an unmistakable piece marker and direct recovery guidance. |
| Logistics dashboards / detailed logistics UI | **REMOVE FROM PROTOTYPE** | Replace with board traces, supply markers, depots and a few logistics actions/cards. |
| Engineering simulation | **KEEP UNDER THE HOOD** | Preserve network consequences where useful. |
| Engineering projects UI | **SIMPLIFY / REBUILD PRESENTATION** | Engineering becomes direct board actions: repair/demolish bridge, repair route, entrench, depot. |
| Bridge/route damage state | **KEEP / REUSE DIRECTLY** | Excellent tabletop state if visibly represented on the board. |
| Armour wear/degradation | **KEEP UNDER THE HOOD** | Compress to Ready / Damaged / Crippled or equivalent small readiness state. |
| Detailed armour maintenance UI | **REMOVE FROM PROTOTYPE** | No maintenance administration during proof-of-fun. |
| Casualty and strength modelling | **KEEP UNDER THE HOOD** | Use to drive formation strength/losses; present compact values. |
| Garrisons | **SIMPLIFY / REBUILD PRESENTATION** | Represent with garrison pieces/strength markers rather than hidden assignments. |
| Occupation system | **SIMPLIFY / REBUILD PRESENTATION** | Prototype uses Secure / Contested and, only if needed, a short unrest track. |
| Loyalty calculations | **ADVANCED / LATER** | Can return as political/occupation mechanics if playtests justify it. |
| Diplomacy | **REMOVE FROM PROTOTYPE** | Too distant from core proof-of-fun loop. Scenario/event cards can stand in for major effects. |
| Escalation system | **SIMPLIFY / REBUILD PRESENTATION** | Convert to one visible Mobilisation/Escalation track with clear unlocks and pressure. |
| Reinforcement timelines | **KEEP UNDER THE HOOD** | Useful to schedule coalition growth, but present as visible upcoming mobilisation milestones. |
| Enemy intent/intelligence system | **ADVANCED / LATER** | May return as reconnaissance/fog mechanics; prototype can begin mostly open-information. |
| Existing combat calculations | **REVIEW / PARTIAL REUSE** | Preserve useful terrain/strength inputs where possible, but combat resolution becomes a fast dice-pool game. |
| Battle reports | **SIMPLIFY / REBUILD PRESENTATION** | Replace persistent report-heavy UI with brief result animation and optional detail. |
| Existing AI command model | **REVIEW / PARTIAL REUSE** | Reuse evaluation ideas, but AI must act through the same tabletop legal-action interface as a human seat. |
| Existing single-player assumptions | **REMOVE / REFACTOR** | State model must support seats controlled by human or AI. |
| Save system and migrations | **KEEP / REUSE DIRECTLY WHERE POSSIBLE** | Preserve robust persistence infrastructure, but create a distinct tabletop save authority/version. |
| Alerts/notifications framework | **SIMPLIFY / REBUILD PRESENTATION** | Prefer board state and temporary contextual feedback. Alerts should be exceptional. |
| Existing menu/navigation shell | **REMOVE FROM PROTOTYPE AS PRIMARY UX** | Board is primary interface. Retain only compact settings/help/scenario access. |
| 2.5D physical terrain colour/visual passes | **KEEP / REUSE DIRECTLY** | Strongly aligned with digital tabletop identity. |
| Existing audio/music architecture | **KEEP / REUSE DIRECTLY** | Not core to rules, but no reason to discard working audio systems. |
| Scenario framework | **KEEP / REUSE DIRECTLY WHERE PRACTICAL** | Good foundation if it can host new region sets, objectives, seats and round limits. |
| Daily-turn clock | **REMOVE FROM PROTOTYPE** | Replace with 6–8 major rounds for first scenario. |
| Full-Europe simultaneous conquest victory | **ADVANCED / LATER** | Not the prototype objective. Use clear strategic-objective scenarios first. |
| Nuclear escalation | **REMOVE FROM PROTOTYPE** | Possible advanced scenario/system after core game validation. |
| Naval warfare depth | **REMOVE FROM PROTOTYPE** | Sea links may exist; detailed naval systems wait. |
| Air warfare depth | **REMOVE FROM PROTOTYPE** | Air support can initially be a trait/card/modifier. |
| Weather simulation | **REMOVE FROM PROTOTYPE** | May later return as scenario event/modifier if worthwhile. |
| Historical/research documentation | **KEEP / REUSE DIRECTLY** | Retain as source material and scenario design evidence. |

---

## Core inheritance rule

R5 should preferentially inherit **technology, data and consequences**, not **administrative interface**.

Examples:

- Keep the route graph; remove the need to operate a route-throughput screen.
- Keep cut-off detection; show a CUT OFF marker under the miniature.
- Keep infrastructure consequences; let the player repair a visible bridge with one meaningful action.
- Keep mobilisation research; express it through a track that changes the coalition's available pieces and cards.
- Keep armour degradation; express it as a small readiness state unless deeper handling proves fun.

## Systems that must earn their way back

The following should not return to the main tabletop interface until repeated playtests demonstrate a clear decision-making benefit:

- granular formation management;
- detailed logistics administration;
- detailed occupation administration;
- loyalty management;
- diplomacy;
- production/economy chains;
- maintenance workflows;
- full intelligence analysis;
- complex air/naval rules;
- extensive alert/report surfaces.

## Technical isolation recommendation

Where practical, new tabletop rules should sit behind a distinct rules/state layer rather than being interwoven with the old daily-turn simulation. Legacy systems can be called as services or adapters when useful.

This makes it possible to:

- compare old and new mechanics;
- remove an inherited system cleanly;
- keep the original simulation repository intact;
- test tabletop rules independently;
- avoid hidden coupling forcing old UI concepts back into the game.

## Review point

This matrix must be revisited at R5-WP9 after real playtests. The default answer at that stage is not "restore everything". Each system must demonstrate that it creates decisions, tension, clarity or meaningful consequence proportionate to its complexity cost.
