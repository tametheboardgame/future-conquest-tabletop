const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('rich map adapter is an explicit one-way R5 presentation boundary', () => {
  const source = fs.readFileSync('src/tabletop/rich-map-adapter.ts', 'utf8');
  assert.match(source, /buildR5RichMapPresentation/);
  assert.match(source, /Readonly<Record<string, string>>/);
  assert.doesNotMatch(source, /tabletopGameStore|\.dispatch\(|Math\.random/);
  for (const region of ['london', 'paris', 'low-countries', 'ruhr', 'berlin', 'warsaw', 'vienna', 'carpathian-portal', 'kyiv']) {
    assert.ok(source.includes(region), `missing ${region} projection`);
  }
});

test('production board mounts the rich renderer while retaining R5 dispatch', () => {
  const board = fs.readFileSync('src/tabletop/TabletopBoard.tsx', 'utf8');
  const backdrop = fs.readFileSync('src/tabletop/RichMapBackdrop.tsx', 'utf8');
  assert.match(board, /<RichMapBackdrop/);
  assert.match(board, /onAction\(request\)/);
  assert.match(backdrop, /TerrainMapPrototypeImpl/);
  assert.match(backdrop, /onSelectGroup=\{props\.onSelectPiece\}/);
  assert.doesNotMatch(backdrop, /from ['"]\.\.\/game\//);
});
