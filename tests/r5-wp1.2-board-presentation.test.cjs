const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const boardSource = readFileSync('src/tabletop/TabletopBoard.tsx', 'utf8');

test('tabletop board keeps the full SVG reachable on narrow displays', () => {
  assert.match(boardSource, /style=\{\{ width: '100%', maxWidth: '100%', transform: 'none' \}\}/);
});

test('piece legend preserves the strategic route keys from WP1.1', () => {
  assert.match(boardSource, /Major corridor/);
  assert.match(boardSource, /> Route</);
  assert.match(boardSource, /Pass \/ crossing/);
});
