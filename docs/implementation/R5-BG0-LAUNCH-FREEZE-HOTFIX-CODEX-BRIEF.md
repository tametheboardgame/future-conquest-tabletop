# R5 BG0 Launch Freeze Hotfix - Codex Brief

Status: urgent production regression after BG0 merge

## User-observed defect

On the deployed GitHub Pages build, the title/startup screen loads and responds, but clicking **BEGIN CAMPAIGN** causes the game to appear to freeze / become non-interactive immediately as the restored R3 tabletop shell is revealed.

This is a BG0 blocker. Do not start BG1 or any later board-game mechanics.

## Current production architecture

- `R5StartupExperience` owns only the title/audio/settings presentation.
- `App` / `R3TabletopShell` remain mounted beneath the title launcher.
- `TerrainMapPrototypeImpl` is the preserved R3 MapLibre/Three terrain host.
- R5 state/actions remain authoritative.

## Investigation priorities

1. Reproduce the exact launch transition in a browser if any browser/runtime tooling is available.
2. Inspect `R5StartupExperience.tsx`, `startup-launcher.css`, `R3TabletopShell.tsx`, `RichMapBackdrop.tsx` and `TerrainMapPrototypeImpl.tsx` for launch-only interaction or renderer stalls.
3. Pay particular attention to the current whole-game `inert={!launched}` / `aria-hidden` transition on a large MapLibre/Three subtree. Ensure the revealed game cannot remain inert/non-interactive after launch and avoid expensive accessibility-tree or DOM work on the renderer subtree.
4. Ensure MapLibre is correctly resized/repainted when the title overlay is removed/revealed. If necessary add an explicit launch/reveal notification or safe `map.resize()`/repaint on the next animation frame.
5. Preserve terrain prewarming where useful, but do not initialise or reinitialise duplicate renderer instances on launch.
6. Check React StrictMode lifecycle interaction with MapLibre/Three and ensure launch does not trigger renderer remount/recreation.
7. Add a focused regression test for the launcher -> game transition. Prefer a browser smoke test if available; otherwise add source/unit contract coverage plus deterministic runtime hooks that make the failure diagnosable.

## Product constraints

Must preserve:
- title/startup presentation;
- title/game music transition and settings;
- physical 2.5D terrain map;
- political borders;
- city/landmark miniatures;
- Future portal presentation;
- formation miniatures;
- camera/pan/zoom;
- R5 tabletop state/action authority.

Do not restore legacy simulation UI or state authority. Do not implement command dice, cards, escalation, AI, multiplayer or other BG1+ work.

## Acceptance

After clicking BEGIN CAMPAIGN:
- launcher disappears promptly;
- game remains responsive;
- map can pan/zoom;
- formation/region selection responds;
- right action tray responds;
- settings control responds;
- no duplicate renderer is created;
- no console-breaking exception occurs;
- fallback remains usable if WebGL/terrain fails.

Run:
- `npm test`
- `npm run test:r5`
- `npx tsc --noEmit -p tsconfig.app.json`
- `npm run build`
- `git diff --check`

Commit and push the fix to `r5/bg0-launch-freeze-hotfix`, report the actual remote SHA, the root cause, exact files changed, tests run, and any browser reproduction limitation.