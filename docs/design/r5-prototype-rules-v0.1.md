# Future Conquest: Tabletop — Prototype Rules v0.1

Status: Rules prototype for implementation and playtest  
Date: 21 August 2026

These rules are intentionally small. They exist to test whether the core game is enjoyable before deeper simulation systems are reintroduced.

## 1. Prototype scenario

Two sides contest a compact European theatre of approximately 15–20 strategic regions.

- **Future Force** must seize and hold designated strategic objectives before the campaign clock expires.
- **Present-Day Coalition** must deny those objectives until mobilisation matures, or destroy/capture the Future command element.

Prototype length: **8 rounds maximum**.

## 2. Components

Each side begins with approximately:

- 8–12 formation pieces;
- faction control markers;
- one hand of cards;
- one Command Action counter/track.

Shared components:

- strategic board;
- dice;
- supply markers;
- damage/readiness markers;
- entrenchment markers;
- bridge/route state markers;
- mobilisation track;
- round track.

## 3. Formation profile

A prototype formation has only the information required for tabletop decisions:

- **Strength** — normally 1–4;
- **Traits** — zero or more of Infantry, Armour, Artillery, Engineer, Elite/Future Tech;
- **Readiness** — Ready, Damaged or Crippled;
- **Supply** — Supplied, Strained or Cut Off;
- **Region**;
- **Entrenched** — yes/no.

Detailed internal order of battle is not directly managed.

## 4. Round sequence

Each round has five stages.

### A. Refresh

- advance round marker if required;
- refresh both sides to **4 Command Actions**;
- draw cards up to the scenario hand limit;
- resolve scheduled mobilisation/reinforcement entries.

### B. Alternating Command Phase

The initiative side takes one action, then the opponent takes one action. Continue until both sides have spent all Command Actions or passed.

A side that passes with actions remaining may act later in the same round if the opponent continues acting, unless both sides pass consecutively.

### C. Supply Check

Recalculate each formation as Supplied, Strained or Cut Off.

### D. Control and Mobilisation

- update region control;
- advance mobilisation if the scenario requires it;
- resolve round-end objective effects;
- apply any persistent Cut Off attrition specified by the scenario.

### E. Victory Check

Check immediate victory conditions. If none apply and Round 8 has ended, apply scenario end conditions.

## 5. Core Command Actions

Each normally costs **1 Command Action**.

### Move

Move one formation to one connected legal region.

Baseline rules:

- movement into an enemy-occupied region is not a normal Move; use Attack;
- severely damaged routes or special terrain may block movement;
- card or trait effects may permit extra movement.

### Attack

Choose one friendly formation and one adjacent enemy formation/region, then resolve combat.

Additional friendly formations may support only if explicitly allowed by scenario, trait or card rules. The first prototype should keep multi-formation attacks limited to avoid complex stacking rules.

### Reinforce / Recover

Improve one eligible formation according to faction rules.

Examples:

- Coalition: replace lost strength from available reinforcement pool;
- Future Force: recover limited strength/readiness where scenario resources permit.

Cut Off formations cannot normally reinforce.

### Engineer

One eligible Engineer formation may perform one local engineering effect such as:

- repair bridge;
- demolish bridge;
- repair strategic route;
- entrench;
- establish or relocate a depot.

Some engineering cards may remove the Engineer prerequisite or improve the action.

### Logistics

Perform one scenario-legal logistics action, such as:

- establish/move depot;
- priority resupply;
- reopen a route when prerequisites are met;
- temporary airlift through a card or special capability.

The logistics action changes board state; it does not open a logistics management workflow.

### Scenario Action

Used for an objective-specific interaction such as securing a command centre, activating a portal site or sabotaging a strategic asset.

## 6. Supply

Supply is calculated from controlled supply sources/depots through usable friendly routes.

### Supplied

- no combat penalty;
- may reinforce/recover;
- normal access to actions.

### Strained

- **-1 combat die** to a minimum of 1 unless another rule says otherwise;
- reinforcement/recovery may be limited by scenario rule;
- marker is visibly attached to the formation.

### Cut Off

- **-2 combat dice** to a minimum of 1;
- cannot normally reinforce/recover;
- may suffer one step of readiness/strength loss after remaining Cut Off for a full round;
- obvious CUT OFF marker must be displayed;
- selection UI must explain the route or condition required to restore supply.

The exact network algorithm may use legacy route data, but these three states are the default player-facing result.

## 7. Combat

The goal is fast, legible uncertainty.

### Step 1 — Build attack dice

Start with dice equal to attacker Strength.

Then apply relevant modifiers, for example:

- +1 die for a favourable Armour interaction;
- +1 die for Artillery support where allowed;
- +1 die for an Elite/Future Tech advantage where scenario rules grant it;
- -1 die for Strained supply;
- -2 dice for Cut Off;
- -1 die for Damaged readiness;
- -2 dice for Crippled readiness;
- terrain/fortifications may remove attack dice or add defender protection.

Minimum attack pool: 1 die unless attack is illegal.

### Step 2 — Build defence dice

Start with dice equal to defender Strength.

Possible modifiers:

- terrain bonus;
- Entrenched bonus;
- readiness and supply penalties;
- card effects.

Minimum defence pool: 1 die unless the defender is automatically overrun by a specific rule.

### Step 3 — Roll

Prototype hit threshold: **5+ on a d6**.

Each 5 or 6 is one hit.

### Step 4 — Compare hits

Each side applies hits suffered.

Prototype damage model:

- first hit normally reduces Strength by 1;
- when Strength would fall below 1, the formation is eliminated;
- scenario/trait/card rules may convert a hit into retreat or readiness damage instead.

### Step 5 — Determine control/retreat

If the defender is eliminated or forced to retreat, the attacker may advance into the region if eligible.

If both sides remain, the defender retains the region unless another rule says otherwise.

### Battle preview requirement

Before confirmation, the interface must show:

- attacker dice;
- defender dice;
- all current modifiers;
- plain-language assessment such as Advantage / Even / Risky / Desperate.

The player must never have to infer hidden arithmetic from multiple panels.

## 8. Readiness

Readiness compresses several legacy concepts including equipment condition and operational wear.

### Ready

No penalty.

### Damaged

-1 combat die.

### Crippled

-2 combat dice and may have movement restrictions if the scenario uses them.

Recovery requires a Reinforce/Recover action, a suitable supply state and any faction-specific resource requirement.

## 9. Entrenchment

An eligible formation may Entrench through an Engineer action or card.

Prototype effect: **+1 defence die** while defending that region.

Entrenchment is lost when the formation leaves the region.

## 10. Bridges and routes

Key crossings may have visible bridge markers.

States:

- Intact;
- Damaged;
- Destroyed.

A destroyed bridge blocks ordinary movement across that connection until repaired or bypassed by a valid effect.

The board must visibly change when infrastructure changes state.

## 11. Cards

Each side has a hand limit defined by scenario; prototype default is **5 cards**.

At round refresh, draw until hand limit unless a faction/scenario rule says otherwise.

Cards use one of four timing classes:

- **Action** — played as that side's activation, usually costing 1 Command Action;
- **Modifier** — played while resolving one of the side's actions;
- **Reaction** — played during an opponent action when the trigger is met;
- **Round/Event** — resolved at a specified phase.

Cards may:

- add/remove/reroll dice;
- permit unusual movement;
- repair/demolish infrastructure;
- restore supply;
- interrupt attacks;
- accelerate reinforcement;
- expose/hide information;
- create political or scenario effects.

A player never needs a specific card merely to make an ordinary legal move or attack.

## 12. Mobilisation

The coalition has a visible Mobilisation Track.

Prototype track: **0–5**.

Mobilisation rises automatically over time and may also respond to scenario events or Future Force behaviour.

Example unlock pattern:

- Level 0: fragmented local response;
- Level 1: regional reinforcements;
- Level 2: coordinated coalition movement;
- Level 3: stronger armour/artillery reinforcement;
- Level 4: advanced coalition operations/cards;
- Level 5: full mobilisation / major coalition advantage.

Exact unlocks are scenario data and subject to balance testing.

Future Force therefore plays against both the opponent and the clock.

## 13. Region control

A region is controlled by a side when its scenario control requirements are satisfied.

Prototype default:

- no enemy formation in the region;
- friendly formation/garrison has secured it;
- any special objective requirement is met.

Regions should display control directly through colour, flag or marker.

## 14. Garrisons

A captured region may require a garrison to remain Secure.

Prototype implementation should use a simple garrison marker/value. Do not open a separate occupation-management screen.

If an ungarrisoned region is vulnerable under scenario rules, it may become Contested at round end.

## 15. Future command element

The Future general/command element remains a strategically important piece.

Prototype principles:

- loss/capture may trigger immediate Future Force defeat;
- proximity may grant a modest command/combat benefit;
- the piece must create a positioning dilemma rather than demand constant babysitting.

Exact bonus to be balanced in playtest.

## 16. Prototype victory conditions

The first implemented scenario should use asymmetric goals.

Suggested baseline:

### Future Force victory

At the end of any round from Round 5 onward, control **3 designated strategic objectives**, including at least one major supply/command hub.

### Coalition victory

Any one of:

- prevent Future victory through the end of Round 8;
- destroy/capture the Future command element;
- reduce the Future Force below the scenario viability threshold.

This structure intentionally makes delay a valid Coalition strategy and creates a hard tempo problem for the Future Force.

## 17. Initial balance targets

These are hypotheses, not commitments:

- Future Force should win early battles more often than it loses them;
- losing a Future formation should feel materially painful;
- Coalition should become more dangerous each round;
- direct frontal attacks should not always be the best choice;
- cutting supply should sometimes be more valuable than attacking;
- every side should regularly face more attractive actions than it has Command Actions available.

## 18. Playtest questions

After each game, record:

1. Did either player have turns where the best action was obvious and uninteresting?
2. Did four Command Actions feel restrictive in a good way or merely frustrating?
3. Did alternating activation create meaningful reactions?
4. Were battle odds understandable before rolling?
5. Did the dice create drama without deciding everything?
6. Were cards useful choices or just random bonuses?
7. Did supply alter manoeuvre decisions?
8. Did players understand Cut Off states immediately from the board?
9. Did the Coalition mobilisation clock affect both players' plans?
10. Which regions never mattered?
11. Which rules were repeatedly forgotten?
12. Was there at least one memorable decision or reversal?
13. At game end, did the players want an immediate rematch?

## 19. Rule-change discipline

During proof-of-fun development:

- change one major rule family at a time where practical;
- record why the rule changed;
- do not add depth solely to solve a presentation problem;
- prefer removing a weak rule over surrounding it with more rules;
- do not import a legacy system unless the playtest problem being solved is clearly identified.

Version this document as rules materially change.
