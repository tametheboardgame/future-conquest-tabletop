const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const app = readFileSync('src/App.tsx', 'utf8');
const shell = readFileSync('src/tabletop/RichMapShell.tsx', 'utf8');
const adapter = readFileSync('src/presentation/r5-rich-map-adapter.ts', 'utf8');
const css = readFileSync('src/tabletop/rich-map-shell.css', 'utf8');

test('production mounts the rich shell instead of the flat rules harness', () => {
  assert.match(app, /import \{ RichMapShell \}/);
  assert.match(app, /<RichMapShell/);
  assert.doesNotMatch(app, /<TabletopBoard/);
  assert.match(shell, /rich-map-board/);
  assert.match(css, /rich-map-terrain-shadow/);
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

test('selection and actions remain dispatcher-owned and presentation-only', () => {
  assert.match(shell, /onAction\(request\)/);
  assert.match(shell, /buildR5RichMapFrame/);
  assert.match(shell, /presentationFrame\.legalTargetRegionIds/);
  assert.doesNotMatch(shell, /Math\.random|localStorage|setGame|setState/);
});
