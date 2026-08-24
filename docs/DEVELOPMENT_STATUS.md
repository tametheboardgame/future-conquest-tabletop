# Future Conquest Tabletop Development Status

Last updated: 2026-08-24

## Current programme

The **R5 Board-Game Rebuild** is the authoritative active development programme for this repository.

Authoritative roadmap: `docs/roadmap/R5_BOARDGAME_REBUILD_ROADMAP.md`.
Supersession/background pointer: `docs/roadmap/R5_TABLETOP_ROADMAP.md`.
Authoritative rebaseline: `docs/design/R5-BOARDGAME-ON-R3-SHELL-REBASELINE.md`.
Presentation baseline: `docs/design/R5-R3-SHELL-PRESENTATION-BASELINE.md`.
Game design: `docs/design/r5-tabletop-game-design.md`.
Prototype rules: `docs/design/r5-prototype-rules-v0.1.md`.
Legacy reuse policy: `docs/design/r5-legacy-reuse-matrix.md`.

Core product rule:

> Preserve the world and atmosphere. Replace the administration and mechanics.

The original simulation repository remains separate at `tametheboardgame/future-conquest` and must not be modified by this programme.

## Current delivery state

### R5-BG0 — Restore the real Future Conquest shell

Status: **IMPLEMENTED AND MERGED, AWAITING DAVID VISUAL ACCEPTANCE**.

- PR #10 restored the R3-style map-first Future Conquest presentation over R5 rules authority.
- PR #11 addressed the first BEGIN CAMPAIGN launch-transition freeze.
- PR #12 (`R5 BG0 hotfix: stage terrain startup and gate campaign runtime`) fixed the remaining production runtime freeze and merged to `main` as `34c8768b8c46933456404b0fe5f986972ee78d87`.
- PR #12 added a real Playwright/Chromium BG0 runtime gate that clicks BEGIN CAMPAIGN and verifies the shell remains responsive.
- The BG0 package preserves startup/title/music, physical terrain capability, cities/landmarks, Future portal, political colouring, formation presentation, camera/pan/zoom and the established military visual language.
- The abstract circular-node prototype is not the intended production presentation.

**Mandatory gate:** Do not start BG1 until David explicitly confirms that the deployed build launches correctly and looks recognisably like Future Conquest again.

## Next approved sequence

`BG0 visual acceptance -> BG1 six-command-seat rules/state -> BG2 command dice -> BG3 formation components/movement -> BG4 final combat -> personal playtest -> BG5 simplified supply/recovery/reorganisation -> BG6 tactical cards -> BG7 escalation/mobilisation -> full campaign playtest -> BG8 objectives/portal/victory -> BG9 2-6 players -> BG10 AI seats -> BG11 interface convergence -> BG12 simulation/balance`

No later mechanic may be pulled forward to compensate for a weak or unaccepted earlier gate.

## Source-of-truth rule

For this repository, current `main` plus the R5 Board-Game Rebuild roadmap/design documents listed above take precedence over historical R2/R3 work packages, the superseded early R5 WP sequence, archived branches and old PR descriptions.

Inherited R3 code and documentation remain valid presentation/technical reference where explicitly retained by the reuse matrix and presentation baseline, but they are not gameplay authority.

## Required quality boundary

Current R5/product acceptance must retain:

- deterministic state and PRNG behaviour;
- save/resume integrity;
- current R5 rules/engine validation;
- TypeScript correctness;
- full production build and strict generated-asset verification;
- BG0 browser/runtime coverage for campaign launch and board responsiveness.

Historical R3 workflows may remain red when they assert superseded composition or implementation details. They must not be described as green, and they may only be retired or scoped when genuinely obsolete. Production-facing terrain, city, portal, music and presentation regressions remain blockers even when an old workflow name begins with R3.
