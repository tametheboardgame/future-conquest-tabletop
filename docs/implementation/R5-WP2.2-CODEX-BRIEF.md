# R5-WP2.2 Codex Brief

## Objective

Implement the six core tabletop Command Actions on top of the merged WP2.1 alternating-activation system so a complete cardless round can be played through the board.

## Required actions

1. Move
   - select one formation owned by the current seat;
   - move it to one legal adjacent region;
   - consume exactly one Command Action;
   - update authoritative tabletop piece state deterministically.

2. Attack
   - select one current-seat formation and an adjacent enemy-occupied region;
   - create the smallest deterministic pre-WP3 attack resolution needed to make Attack executable now;
   - keep the API shaped so WP3 can replace the placeholder resolution with dice-pool combat without rewriting the command system;
   - consume exactly one Command Action.

3. Reinforce / Recover
   - recover or reinforce one eligible current-seat formation using a simple deterministic rule;
   - cap values at scenario-defined maxima;
   - consume exactly one Command Action.

4. Engineer
   - implement one simple board engineering effect using existing region/route state, preferring repair/ready-state scaffolding that WP5 can extend later;
   - consume exactly one Command Action.

5. Logistics
   - implement one simple deterministic logistics effect using existing tabletop state, without introducing the WP5 three-state supply system early;
   - consume exactly one Command Action.

6. Basic scenario action
   - implement a generic scenario-action hook plus at least one concrete prototype action that changes authoritative scenario state;
   - consume exactly one Command Action.

## Rules and architecture

- WP2.1 command-phase state remains the sole authority for current seat, remaining actions, passes and phase termination.
- Every successful core action must pass through one authoritative action-dispatch/legal-action interface.
- Invalid, out-of-turn or unaffordable actions must not mutate state or consume a Command Action.
- React/UI state remains presentation only.
- Reuse existing board regions, adjacency and formation state. Do not create parallel board authority.
- Preserve deterministic save/resume at action boundaries.
- Keep action implementations intentionally small and readable. This package proves the round loop, not final subsystem depth.

## Scope guard

Do not implement:

- WP3 dice-pool combat or combat presentation;
- cards;
- full three-state supply;
- full board-engineering catalogue;
- mobilisation;
- AI;
- legacy simulation panels/state authority.

Minimal forward-compatible interfaces for WP3/WP5 are allowed where required.

## Presentation

- expose the six actions from the board with compact controls;
- show the currently selected action and legal targets directly on the board where practical;
- give immediate concise feedback after an action;
- keep the board as the primary interface and avoid adding management panels.

## Tests

Add focused deterministic coverage for:

- each of the six action types;
- action ownership/current-seat enforcement;
- legal-target validation;
- exactly-one Command Action consumption on success;
- zero consumption on invalid action;
- alternation after each successful action;
- end-of-command-phase interaction after actions are exhausted;
- save/resume after each action type.

## Validation

Run and report:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

Commit and push directly to `r5/wp2.2-core-actions`. Report the remote GitHub SHA and whether the WP2.2 exit condition is satisfied.
