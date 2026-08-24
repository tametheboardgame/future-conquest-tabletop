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
const css = readFileSync('src/tabletop/r3-tabletop-shell.css', 'utf8');

test('production mounts the restored R3 shell instead of either abstract board', () => {
  assert.match(app, /import \{ R3TabletopShell \}/);
  assert.match(app, /<R3TabletopShell/);
  assert.doesNotMatch(app, /<TabletopBoard|<RichMapShell/);
  assert.match(shell, /data-presentation="r3-wp6\.6-shell"/);
  assert.match(shell, /<RichMapBackdrop/);
  assert.match(backdrop, /TerrainMapPrototypeImpl/);
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

test('launch reveal avoids a whole-renderer inert transition and reflows the persistent map', () => {
  assert.doesNotMatch(startup, /inert=|aria-hidden=\{!launched\}/);
  assert.match(startup, /requestAnimationFrame/);
  assert.match(startup, /dispatchEvent\(new Event\(R5_GAME_REVEALED_EVENT\)\)/);
  assert.match(terrain, /addEventListener\(R5_GAME_REVEALED_EVENT, resizeAfterReveal\)/);
  assert.match(terrain, /mapRef\.current\?\.resize\(\)/);
  assert.match(terrain, /mapRef\.current\?\.triggerRepaint\(\)/);
  assert.doesNotMatch(startup, /launched\s*\?\s*children/);
});

test('BG0 stages the optional WebGL runtime behind launch and retains a stable map fallback', () => {
  assert.doesNotMatch(backdrop, /^import \{ TerrainMapPrototypeImpl \}/m);
  assert.match(backdrop, /lazy\(async \(\) =>/);
  assert.match(backdrop, /import\('\.\.\/components\/TerrainMapPrototypeImpl'\)/);
  assert.match(backdrop, /R5_GAME_REVEALED_EVENT/);
  assert.match(backdrop, /requestAnimationFrame/);
  assert.match(backdrop, /LazyStableMap/);
  assert.match(terrain, /readiness diagnostic/);
  assert.match(terrain, /did not settle promptly/);
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

test('rich layers stage independently and cache unsuccessful terrain readbacks', () => {
  const formations = readFileSync('src/presentation/r3-formation-miniatures-layer.ts', 'utf8');
  const world = readFileSync('src/presentation/r3-world-miniatures-layer.ts', 'utf8');
  assert.match(terrain, /setTimeout\(startTerrain, runtimeOptions\.forced \? 100 : 2_000\)/);
  assert.doesNotMatch(terrain, /Promise\.all\(\[\s*import\('\.\.\/presentation\/r3-formation-miniatures-layer'/);
  assert.match(terrain, /webglcontextlost/);
  assert.match(formations, /piece\.elevationAt = \[\.\.\.lngLat\]/);
  assert.match(world, /piece\.elevationSampled = true/);
  assert.match(formations, /elevationSampleBudget = 1/);
  assert.match(world, /elevationSampleBudget = 1/);
  assert.match(world, /this\.assetLoading/);
});

test('hardware-rich stages expose a persistent circuit breaker and forced acceptance path', () => {
  const runtime = readFileSync('src/presentation/r5-rich-runtime.ts', 'utf8');
  const probe = readFileSync('scripts/probe-r5-bg0-runtime.mjs', 'utf8');
  assert.match(runtime, /r5-rich-pending-stage/);
  assert.match(runtime, /sessionStorage\.setItem/);
  assert.match(terrain, /armRichStage\('terrain'\)/);
  assert.match(terrain, /armRichStage\('world'\)/);
  assert.match(terrain, /armRichStage\('formations'\)/);
  assert.match(terrain, /r5-rich-diagnostic/);
  assert.match(probe, /60_000/);
  assert.match(probe, /r5RichPath.*force/);
  assert.match(probe, /Rich stage/);
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
