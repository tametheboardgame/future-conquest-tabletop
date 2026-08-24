const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const app = readFileSync('src/App.tsx', 'utf8');
const main = readFileSync('src/main.tsx', 'utf8');
const shell = readFileSync('src/tabletop/R3TabletopShell.tsx', 'utf8');
const backdrop = readFileSync('src/tabletop/RichMapBackdrop.tsx', 'utf8');
const adapter = readFileSync('src/presentation/r5-rich-map-adapter.ts', 'utf8');
const projection = readFileSync('src/tabletop/rich-map-adapter.ts', 'utf8');
const startup = readFileSync('src/tabletop/R5StartupExperience.tsx', 'utf8');
const terrain = readFileSync('src/components/TerrainMapPrototypeImpl.tsx', 'utf8');
const loader = readFileSync('src/presentation/r3-terrain-loader.ts', 'utf8');
const css = readFileSync('src/tabletop/r3-tabletop-shell.css', 'utf8');

test('production mounts the restored R3 shell instead of either abstract board', () => {
  assert.match(app, /import \{ R3TabletopShell \}/);
  assert.match(app, /<R3TabletopShell/);
  assert.doesNotMatch(app, /<TabletopBoard|<RichMapShell/);
  assert.match(shell, /data-presentation="r3-wp6\.6-shell"/);
  assert.match(shell, /<RichMapBackdrop/);
  assert.match(backdrop, /loadTerrainMapModule/);
  assert.doesNotMatch(shell, /tabletop-board-svg|rich-map-board|<svg/);
  assert.match(css, /r3-command-rail/);
  assert.match(css, /r3-map-host/);
});

test('historical startup, title and audio host remains the production entry', () => {
  assert.match(main, /<R5StartupExperience><App \/><\/R5StartupExperience>/);
  assert.match(main, /r3-wp6-6-command-shell-follow-up\.css/);
  assert.match(startup, /startup-launcher/);
  assert.match(startup, /audioManager\.requestMusic\(launched \? 'game' : 'title'\)/);
  assert.match(startup, /GlobalSettingsPanel/);
  assert.doesNotMatch(startup, /GameState|dispatchCoreAction|newGame/);
});

test('known-good terrain lifecycle is mounted and prewarmed behind the launcher', () => {
  assert.doesNotMatch(startup, /launched\s*\?\s*children/);
  assert.match(startup, /launcher-covered/);
  assert.match(backdrop, /prewarmTerrainMapModule\(\)/);
  assert.match(backdrop, /loadTerrainMapModule/);
  assert.match(backdrop, /LazyTerrainMap/);
  assert.doesNotMatch(backdrop, /R5_GAME_REVEALED_EVENT|requestAnimationFrame|setTimeout/);
  assert.doesNotMatch(backdrop, /createElement\('canvas'\)|getContext\('webgl'\)|WEBGL_lose_context/);
  assert.match(loader, /import\('\.\.\/components\/TerrainMapPrototype'\)/);
});

test('renderer files retain known-good production ownership and startup', () => {
  const formations = readFileSync('src/presentation/r3-formation-miniatures-layer.ts', 'utf8');
  const world = readFileSync('src/presentation/r3-world-miniatures-layer.ts', 'utf8');
  assert.match(terrain, /Promise\.all\(\[\s*import\('\.\.\/presentation\/r3-formation-miniatures-layer'/);
  assert.doesNotMatch(terrain, /r5-rich-runtime|R5_GAME_REVEALED_EVENT|armRichStage/);
  assert.doesNotMatch(formations, /r3-shared-three-renderer/);
  assert.doesNotMatch(world, /r3-shared-three-renderer/);
});

test('dedicated R5 Chromium gate covers launch, responsiveness, tray, renderer and map interaction', () => {
  const workflow = readFileSync('.github/workflows/r5-bg0-browser-runtime.yml', 'utf8');
  const probe = readFileSync('scripts/probe-r5-bg0-runtime.mjs', 'utf8');
  assert.match(workflow, /Checkout exact PR head/);
  assert.match(workflow, /probe-r5-bg0-runtime\.mjs/);
  assert.match(probe, /BEGIN CAMPAIGN/);
  assert.match(probe, /main-thread heartbeat/);
  assert.match(probe, /\.r3-tabletop-shell/);
  assert.match(probe, /\.r3-tray-toggle/);
  assert.match(probe, /Duplicate terrain runtime/);
  assert.match(probe, /maplibre/);
  assert.match(probe, /pageerror/);
  assert.match(probe, /requestfailed/);
  assert.match(probe, /progressiveWindowMs/);
  assert.match(probe, /webglcontextlost/);
  assert.match(probe, /animationFrames/);
  assert.match(probe, /runtimeEvidence/);
  assert.match(probe, /screenshot/);
});

test('adapter projects stable renderer ids from R5 authority and legal actions', () => {
  assert.match(adapter, /authority: 'r5-tabletop'/);
  assert.match(adapter, /legalTargets\(input\.game/);
  assert.match(adapter, /r5-region:\$\{region\.id\}/);
  assert.match(adapter, /r5-formation:\$\{piece\.id\}/);
  assert.match(adapter, /Object\.freeze/);
  assert.doesNotMatch(adapter, /from '..\/game\/types'|Math\.random|dispatchCoreAction/);
  assert.match(shell, /data-authority="r5-tabletop"/);
});

test('legacy renderer projection is one-way and actions remain dispatcher-owned', () => {
  assert.match(projection, /presentation-only/);
  assert.match(projection, /No value returned here is ever dispatched back/);
  assert.match(shell, /legalTargets\(game, action/);
  assert.match(shell, /onSelectPiece=\{selectPiece\}/);
  assert.match(shell, /onAction\(\{ type: 'move'/);
  assert.match(shell, /onAction\(\{ type: 'attack'/);
  assert.doesNotMatch(shell, /from '..\/game\/engine'|issueMove|beginOperation|Math\.random|localStorage|setGame|setState/);
});

test('only compact tabletop actions are exposed over the map', () => {
  assert.match(shell, />Move</);
  assert.match(shell, />Attack</);
  assert.match(shell, /r3-board-tray/);
  assert.doesNotMatch(shell, /Resolve all orders|END DAY|Engineering|Logistics|Operations|command dice|card hand|escalation deck/i);
});
