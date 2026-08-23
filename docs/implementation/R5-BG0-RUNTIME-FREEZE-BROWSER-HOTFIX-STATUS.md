# BG0 runtime freeze investigation status

Active production blocker: the live game still freezes immediately after **BEGIN CAMPAIGN** after PR #11.

BG1+ remains blocked.

Required next step is not another source-only hypothesis. This branch must add and pass a current-R5 Playwright/Chromium runtime gate that clicks BEGIN CAMPAIGN and proves the shell, action tray and map remain responsive.

Current evidence from the existing R3 browser runtime workflow on the PR #11 head:

- the real Chromium click reaches campaign entry;
- repeated `GPU stall due to ReadPixels` warnings appear;
- several seconds later the terrain readiness diagnostic still reports `mapLoaded:false` and `styleLoaded:false` while individual sources report loaded;
- that legacy workflow then fails only because it looks for an obsolete pre-R5 selector.

Primary investigation areas are defined in `R5-BG0-RUNTIME-FREEZE-BROWSER-HOTFIX-BRIEF.md`, with particular attention to the current eager `TerrainMapPrototypeImpl` import versus historical R3's lazy terrain-module boundary, renderer lifecycle, StrictMode and Three/MapLibre startup.

Do not merge this branch until the dedicated current-R5 Chromium launch/runtime gate is green in addition to the normal R5/build checks.
