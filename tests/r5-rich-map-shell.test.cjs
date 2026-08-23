const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const app = readFileSync('src/App.tsx', 'utf8');
const main = readFileSync('src/main.tsx', 'utf8');
const shell = readFileSync('src/tabletop/RichMapShell.tsx', 'utf8');
const backdrop = readFileSync('src/tabletop/RichMapBackdrop.tsx', 'utf8');
const adapter = readFileSync('src/presentation/r5-rich-map-adapter.ts', 'utf8');
const projection = readFileSync('src/tabletop/rich-map-adapter.ts', 'utf8');
const startup = readFileSync('src/tabletop/R5StartupExperience.tsx', 'utf8');
const css = readFileSync('src/tabletop/rich-map-shell.css', 'utf8');

test('production mounts the R3 physical terrain host and no abstract SVG board', () => {
  assert.match(app, /<RichMapShell/);
  assert.match(main, /<R5StartupExperience><App/);
  assert.match(backdrop, /TerrainMapPrototypeImpl/);
  assert.match(shell, /<RichMapBackdrop/);
  assert.doesNotMatch(shell, /<svg|tabletop-region-disc|rich-map-landmass|circular|node/i);
  assert.match(shell, /data-visual-host="r3-wp6\.6"/);
  assert.match(css, /r5-command-rail/);
});

test('preserved startup and audio presentation remains the production gateway', () => {
  assert.match(startup, /startup-launcher/);
  assert.match(startup, /audioManager\.requestMusic\(launched \? 'game' : 'title'\)/);
  assert.match(startup, /GlobalSettingsPanel/);
  assert.doesNotMatch(startup, /GameState|dispatch|newGame/);
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

test('legacy renderer state is one-way and map actions remain dispatcher-owned', () => {
  assert.match(projection, /presentation-only/);
  assert.match(projection, /No value returned here is ever dispatched back/);
  assert.match(shell, /onAction\(request\)/);
  assert.match(shell, /frame\.legalTargetRegionIds/);
  assert.match(shell, /type: 'move'/);
  assert.match(shell, /type: 'attack'/);
  assert.doesNotMatch(shell, /Math\.random|localStorage|dispatchCoreAction|setGame/);
});

test('only the minimal board-game action surface is exposed', () => {
  assert.match(shell, /MOVE/);
  assert.match(shell, /ATTACK/);
  assert.match(shell, /r5-board-tray/);
  assert.doesNotMatch(shell, /Resolve all orders|END DAY|Engineering|Logistics|Operations|command dice|card hand|escalation deck/i);
});
