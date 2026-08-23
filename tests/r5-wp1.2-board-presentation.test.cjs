const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const boardSource = readFileSync('src/tabletop/TabletopBoard.tsx', 'utf8');
const boardStyles = readFileSync('src/tabletop/tabletop-board.css', 'utf8');

test('tabletop board keeps the full SVG reachable on narrow displays', () => {
  const narrowViewportStyles = boardStyles.match(/@media \(max-width: 900px\) \{([\s\S]*)\}\s*$/)?.[1];

  assert.ok(narrowViewportStyles, 'expected narrow-viewport board styles');
  assert.match(narrowViewportStyles, /\.tabletop-board-svg\s*\{[^}]*width:\s*100%;[^}]*transform:\s*none;/s);
  assert.doesNotMatch(narrowViewportStyles, /\.tabletop-board-svg\s*\{[^}]*width:\s*150%/s);
});

test('piece legend preserves the strategic route keys from WP1.1', () => {
  assert.match(boardSource, /Major corridor/);
  assert.match(boardSource, /> Route</);
  assert.match(boardSource, /Pass \/ crossing/);
});
