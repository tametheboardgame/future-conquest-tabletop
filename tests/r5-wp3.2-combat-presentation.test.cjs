const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createTabletopGame, dispatchCoreAction } = require('../.tabletop-test-dist/core-actions.js');

const boardSource = readFileSync('src/tabletop/TabletopBoard.tsx', 'utf8');
const cssSource = readFileSync('src/tabletop/tabletop-board.css', 'utf8');

function legalCombat() {
  const state = createTabletopGame();
  state.board.pieces['ff-spearhead-alpha-piece'].regionId = 'carpathian-portal';
  state.board.pieces['pc-polish-first-piece'].regionId = 'western-ukraine';
  return { state, result: dispatchCoreAction(state, { type: 'attack', seatId: 'future-seat', pieceId: 'ff-spearhead-alpha-piece', targetRegionId: 'western-ukraine' }) };
}

test('presentation receives the dispatcher-owned dice and outcome without rerolling', () => {
  const { result } = legalCombat();
  assert.equal(result.ok, true);
  assert.ok(result.combat);
  assert.deepEqual(result.combat.attackerRolls.filter((die) => die >= 5).length, result.combat.attackerHits);
  assert.deepEqual(result.combat.defenderRolls.filter((die) => die >= 5).length, result.combat.defenderHits);
  assert.deepEqual(result.combat.pieces, result.state.board.pieces);
  assert.doesNotMatch(boardSource, /Math\.random|resolveCombat|rollCombatDie/);
  assert.match(boardSource, /setCombatResult\(result\.combat\)/);
});

test('preview and result expose required labelled combat information', () => {
  for (const label of ['Combat preview', 'Attacker', 'Defender', 'Combat modifiers', 'Authoritative result', 'Combat resolved', 'hit', 'miss', 'No retreat', 'eliminated']) {
    assert.match(boardSource, new RegExp(label, 'i'), `missing ${label}`);
  }
});

test('continue dismisses the result into the already-advanced activation', () => {
  const { result } = legalCombat();
  assert.equal(result.state.round.activeSeatId, 'coalition-seat');
  assert.match(boardSource, /setCombatResult\(null\)/);
  assert.match(boardSource, /Continue to next activation/);
});

test('dialogs, focus targets, touch sizing and narrow-screen controls remain available', () => {
  assert.match(boardSource, /role="dialog"/);
  assert.match(boardSource, /aria-labelledby="combat-preview-title"/);
  assert.match(boardSource, /aria-labelledby="combat-result-title"/);
  assert.match(boardSource, /autoFocus/);
  assert.match(cssSource, /min-height:\s*44px/);
  assert.match(cssSource, /@media \(max-width: 600px\)[\s\S]*tabletop-combat-actions/);
});
