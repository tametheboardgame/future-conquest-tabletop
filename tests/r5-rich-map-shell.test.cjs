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
const hardwareDiagnostic = readFileSync('src/tabletop/r5-hardware-diagnostic.ts', 'utf8');

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

test('real-hardware differential is explicit and keeps light modes free of rich runtimes', () => {
  assert.match(hardwareDiagnostic, /r5HardwareDiag/);
  assert.match(hardwareDiagnostic, /'shell', 'stable', 'terrain-none', 'terrain-world', 'terrain-formations', 'full'/);
  assert.match(hardwareDiagnostic, /: 'production'/);
  assert.match(app, /readR5HardwareDiagnosticMode/);
  assert.match(backdrop, /diagnosticMode === 'shell' \? null : buildR5RichMapPresentation/);
  assert.match(backdrop, /diagnosticMode !== 'shell' && props\.diagnosticMode !== 'stable'/);
  assert.match(backdrop, /diagnosticMode === 'stable'/);
  assert.match(startup, /LAUNCHED \/ RESPONSIVE/);
  assert.match(startup, /aria-hidden=\{!launched\}/);
  assert.doesNotMatch(startup, /R5_GAME_REVEALED_EVENT|r5:game-revealed/);
});

test('renderer files retain known-good production ownership and startup', () => {
  const formations = readFileSync('src/presentation/r3-formation-miniatures-layer.ts', 'utf8');
  const world = readFileSync('src/presentation/r3-world-miniatures-layer.ts', 'utf8');
  assert.match(terrain, /sceneMode === 'formations' \|\| sceneMode === 'full' \? import\('\.\.\/presentation\/r3-formation-miniatures-layer'\) : null/);
  assert.doesNotMatch(terrain, /r5-rich-runtime|R5_GAME_REVEALED_EVENT|armRichStage/);
  assert.doesNotMatch(formations, /r3-shared-three-renderer/);
  assert.doesNotMatch(world, /r3-shared-three-renderer/);
});

test('dedicated R5 Chromium gate covers launch, responsiveness, tray, renderer and map interaction', () => {
  const workflow = readFileSync('.github/workflows/r5-bg0-browser-runtime.yml', 'utf8');
  const probe = readFileSync('scripts/probe-r5-bg0-runtime.mjs', 'utf8');
  assert.match(workflow, /Checkout exact PR head/);
  assert.match(workflow, /probe-r5-bg0-runtime\.mjs/);
  assert.doesNotMatch(workflow, /R5_CHROMIUM_SOFTWARE_WEBGL/);
  assert.match(probe, /chromium\.launch\(\{ headless: true \}\)/);
  assert.doesNotMatch(probe, /swiftshader|enable-unsafe-swiftshader|control\.click/);
  assert.match(probe, /BEGIN CAMPAIGN/);
  assert.match(probe, /main-thread heartbeat/);
  assert.match(probe, /setTimeout\(resolve, 0\)/);
  assert.match(probe, /\.r3-tabletop-shell/);
  assert.match(probe, /\.r3-tray-toggle/);
  assert.match(probe, /maplibre/);
  assert.match(probe, /pageerror/);
  assert.match(probe, /terrain-none/);
  assert.match(probe, /LAUNCHED \/ RESPONSIVE/);
  assert.match(probe, /data-status/);
  assert.match(probe, /terrain-formations/);
  assert.match(probe, /terrain-world/);
  assert.match(probe, /maplibregl-canvas/);
  assert.match(probe, /r3FormationMiniatures/);
  assert.match(probe, /r3WorldMiniatures/);
  assert.match(probe, /R5 isolation result/);
  assert.match(probe, /r5HardwareDiag/);
  assert.match(probe, /screenshot/);
});

test('CI diagnostics isolate custom layers without weakening the full-scene gate', () => {
  const workflow = readFileSync('.github/workflows/r5-bg0-browser-runtime.yml', 'utf8');
  const probe = readFileSync('scripts/probe-r5-bg0-runtime.mjs', 'utf8');
  assert.match(probe, /'shell', 'stable', 'terrain-none', 'terrain-world', 'terrain-formations', 'full'/);
  assert.match(probe, /r5HardwareDiag/);
  assert.match(backdrop, /diagnosticScene/);
  assert.match(terrain, /diagnosticScene = 'full'/);
  assert.match(terrain, /sceneMode === 'world' \|\| sceneMode === 'full'/);
  assert.match(terrain, /sceneMode === 'formations' \|\| sceneMode === 'full'/);
  assert.match(terrain, /triggerRepaintCount/);
  assert.match(terrain, /dirtyFlags/);
  assert.match(terrain, /paddingRequestCount/);
  assert.match(terrain, /paddingSkippedCount/);
  assert.match(terrain, /paddingHistory/);
  assert.match(terrain, /if \(!changed\)[\s\S]*return;[\s\S]*map\.setPadding\(padding\)/);
  assert.match(terrain, /applySafePadding\('initial'\)/);
  assert.match(terrain, /applySafePadding\('toolbar-resize-observer'\)/);
  assert.match(terrain, /cameraMutationHistory/);
  assert.match(terrain, /'jumpTo', 'easeTo', 'flyTo', 'setCenter', 'setZoom', 'setPitch'/);
  assert.match(terrain, /transformEventHistory/);
  assert.match(terrain, /sourceCacheHistory/);
  assert.match(terrain, /campaign-fronts first reload diagnostic/);
  assert.match(terrain, /firstCampaignFrontsReload/);
  assert.match(terrain, /firstReloadAwaitingLoadedObservation/);
  assert.match(terrain, /firstPostReloadLoaded/);
  assert.match(terrain, /wallClock: new Date\(\)\.toISOString\(\)/);
  assert.match(terrain, /camera: cameraDiagnosticSnapshot\(map\)/);
  assert.match(terrain, /sourceState: state/);
  assert.match(terrain, /toolbarLifecycle/);
  assert.match(terrain, /map-load-react-status-transition/);
});

test('terrain elevation readbacks are bounded and null retries are cached', () => {
  const formations = readFileSync('src/presentation/r3-formation-miniatures-layer.ts', 'utf8');
  const world = readFileSync('src/presentation/r3-world-miniatures-layer.ts', 'utf8');
  for (const layer of [formations, world]) {
    assert.match(layer, /ELEVATION_SAMPLES_PER_FRAME/);
    assert.match(layer, /ELEVATION_NULL_RETRY_MS/);
    assert.match(layer, /ELEVATION_SAMPLE_INTERVAL_MS/);
    assert.match(layer, /elevationBudget > 0/);
    assert.match(layer, /terrainReady/);
    assert.match(layer, /nextElevationAttemptAt/);
    assert.match(layer, /elevationSampleAttempts/);
    assert.match(layer, /elevationNullSamples/);
  }
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
