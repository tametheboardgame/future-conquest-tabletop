# R5-WP3.2 Codex Brief — Combat Presentation

## Objective

Turn the authoritative WP3.1 dice-pool combat model into a clear, tactile tabletop combat interaction without changing its rules authority.

## Required delivery

- Present the pre-confirmation combat preview as a compact board-game combat panel showing attacker, defender, relative dice pools and the reasons for modifiers.
- On confirmation, visibly roll/present the authoritative dice results produced by WP3.1. Presentation must consume the existing deterministic result, never generate a second result.
- Clearly distinguish hits, misses, losses, readiness effects, retreat and elimination.
- Keep the board visible and primary. Combat presentation should overlay or sit contextually rather than navigating away into a simulation-style screen.
- Provide a concise dismiss/continue flow after resolution so play returns naturally to the alternating Command Action loop.
- Ensure keyboard/touch-friendly controls and narrow-screen usability.
- Preserve authoritative game state, PRNG, save/resume and exactly-one-action attack semantics from WP3.1.

## Architecture boundary

React is presentation only. `src/tabletop/combat.ts`, the core action dispatcher and authoritative store remain the rules/state authority. Do not re-roll, duplicate combat state, or use `Math.random` for authoritative outcomes.

## Scope guard

Do not alter combat balance unless required to fix a genuine defect. Do not implement cards, full supply gameplay, mobilisation, AI, or legacy R3 simulation interfaces. Do not begin WP4 systems.

## Validation

Add focused deterministic/presentation tests proving the UI displays the authoritative preview/result and cannot change the resolved outcome. Preserve existing WP3.1 tests.

Run:

- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

## Exit condition

A player can initiate an attack from the board, understand the odds/modifiers before committing, see the actual dice/result clearly after committing, understand losses/retreat/elimination, dismiss the result and continue the alternating round, with no duplicate rules authority or non-deterministic presentation behaviour.