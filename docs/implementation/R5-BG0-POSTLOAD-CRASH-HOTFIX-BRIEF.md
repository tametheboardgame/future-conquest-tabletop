# R5 BG0 Post-load Campaign Crash Hotfix

## Live acceptance evidence

Current production/main now reaches the intended campaign shell: The Central Front map, compact top command bar, left command rail and right activation tray render successfully. The user reports that after reaching this loaded campaign view, the application then crashes/freezes.

The user also confirms the current visual direction is much closer to the intended digital board-game presentation. Preserve that direction.

## Objective

Fix the real post-load runtime crash on current `main` without regressing the restored Future Conquest visual shell or R5 tabletop authority.

## Investigation priority

The failure occurs after the campaign view has painted, so investigate delayed/staged runtime work rather than only the BEGIN CAMPAIGN transition:

- delayed hardware-WebGL terrain activation after the shell becomes interactive;
- MapLibre style/source settlement and resize/repaint handling;
- Three.js city, landmark, portal and formation-miniature layer startup;
- duplicated or overlapping WebGL/render loops under React StrictMode;
- GPU resource churn, `readPixels`, context loss, runaway animation frames or repeated layer recreation;
- post-load timers/idle callbacks that progressively restore rich presentation;
- renderer error/context-loss paths that currently allow the whole app to fail instead of degrading gracefully.

Use the existing R5 Chromium runtime probe as a base, but extend it so acceptance runs long enough for every normally scheduled rich layer to initialise. It must prove continued main-thread responsiveness, one renderer, usable map interaction and tray interaction after the delayed rich-layer window, not only immediately after launch.

## Preservation boundary

Do not solve this by permanently removing or hiding the presentation the user wants. Preserve ordinary campaign access to:

- 2.5D terrain;
- political borders;
- cities and landmarks;
- Future portal;
- formation miniatures;
- pan/zoom/camera behaviour;
- current R3-derived command shell and R5 tabletop action tray.

A bounded progressive-staging strategy is acceptable. A renderer/layer failure must degrade to a usable board rather than crash/freeze the application.

Keep `src/tabletop` authoritative for R5 state, deterministic save/PRNG, legal actions, movement and combat. Do not restore legacy simulation authority.

## Scope guard

BG0 remediation only. No BG1+ mechanics, command dice, cards, escalation, mobilisation, AI, multiplayer expansion, new combat balance or redesign of the current board-game rules.

## Required validation

- reproduce or characterise the post-load failure in Chromium where possible;
- extend the current R5 browser runtime gate to cover the delayed rich-renderer window and post-load interaction;
- `npm test`;
- `npm run test:r5`;
- `npx tsc --noEmit -p tsconfig.app.json`;
- `npm run build`;
- `git diff --check`.

Commit and PUSH the fix to `r5/bg0-postload-crash-hotfix`. Report the actual remote SHA, root cause, browser evidence and any graceful-degradation behaviour added.
