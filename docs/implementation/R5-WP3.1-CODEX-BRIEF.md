# R5-WP3.1 Codex Brief — Dice-pool combat model

## Goal
Replace the WP2.2 placeholder Attack resolution with the smallest complete deterministic dice-pool combat model required by the authoritative R5 roadmap.

## Required delivery
- derive base combat dice from attacking and defending formation strength;
- apply terrain modifiers;
- apply posture modifiers where supported by current tabletop state;
- apply supply modifiers using the simplest existing/current tabletop condition available, without implementing WP5 supply gameplay;
- apply damage/readiness modifiers;
- resolve hits deterministically from the tabletop PRNG/save-state contract;
- apply losses/readiness effects to authoritative formation state;
- support retreat and elimination handling;
- provide a pre-confirmation relative-advantage preview that explains the principal modifiers;
- integrate combat through the existing WP2.2 authoritative action dispatcher so Attack still consumes exactly one Command Action and alternates activation correctly;
- preserve deterministic save/resume before and after combat.

## Product rules
Combat must be quick to understand and resolve. The board remains the primary interface. Do not reintroduce legacy simulation panels or detailed administration.

Use simple dice conventions and modifier values where the roadmap does not specify exact numbers. Prefer transparent rules that can be tuned later over simulation depth.

## Architecture guard
- tabletop rules state remains authoritative;
- React remains presentation-only;
- the combat resolver should be a replaceable/pure rules module called by the existing action layer;
- use the existing deterministic PRNG/save-state contract, do not use Math.random for authoritative outcomes;
- do not implement WP3.2 polished dice animation/presentation beyond the minimum preview/result UI needed to test WP3.1;
- do not implement cards, full supply systems, mobilisation, AI, or later R5 packages.

## Deterministic tests
Cover at minimum:
- base dice derivation from formation strength;
- terrain modifier effects;
- posture/supply/readiness modifier effects where applicable;
- deterministic rolls for a fixed PRNG state;
- hit application;
- retreat;
- elimination;
- invalid attack rejection without mutation/action cost;
- successful attack consumes exactly one Command Action and alternates the side;
- save/resume reproduces the same combat result from the same pre-combat state;
- preview reports relative advantage and meaningful modifier reasons without mutating state.

## Validation
Run:
- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

## Completion
Commit and PUSH directly to `r5/wp3.1-dice-pool-combat`. Report the actual remote GitHub SHA and whether the WP3.1 roadmap deliverables are satisfied. Fix routine in-scope engineering defects autonomously.