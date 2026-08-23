const test = require('node:test');
const assert = require('node:assert/strict');
const { CENTRAL_FRONT_BOARD } = require('../.tabletop-test-dist/board.js');
const { previewCombat, resolveCombat } = require('../.tabletop-test-dist/combat.js');
const { createTabletopGame, dispatchCoreAction, previewAttack, resumeTabletopGame, serializeTabletopGame } = require('../.tabletop-test-dist/core-actions.js');

const setup = () => {
  const state = createTabletopGame();
  const attacker = state.board.pieces['ff-spearhead-alpha-piece'];
  const defender = state.board.pieces['pc-polish-first-piece'];
  attacker.regionId = 'carpathian-portal';
  defender.regionId = 'western-ukraine';
  return { state, attacker, defender };
};

test('base dice derive from total formation strength', () => {
  const { attacker, defender } = setup();
  const preview = previewCombat(CENTRAL_FRONT_BOARD, attacker, [defender]);
  assert.equal(preview.attackerDice, 3);
  assert.equal(preview.defenderDice, 2);
});

test('terrain and entrenched posture improve defence', () => {
  const { attacker, defender } = setup();
  defender.regionId = 'carpathian-portal';
  defender.entrenched = true;
  const preview = previewCombat(CENTRAL_FRONT_BOARD, attacker, [defender]);
  assert.equal(preview.defenderDice, 5);
  assert.ok(preview.modifiers.some((m) => m.reason.includes('mountain terrain')));
  assert.ok(preview.modifiers.some((m) => m.reason.includes('entrenched posture')));
});

test('supply and readiness penalties apply to either pool', () => {
  const { attacker, defender } = setup();
  attacker.supply = 'strained'; attacker.readiness = 'damaged';
  defender.supply = 'cut-off'; defender.readiness = 'crippled';
  const preview = previewCombat(CENTRAL_FRONT_BOARD, attacker, [defender]);
  assert.equal(preview.attackerDice, 1);
  assert.equal(preview.defenderDice, 1);
  assert.equal(preview.modifiers.filter((m) => m.reason.includes('supply')).length, 2);
  assert.equal(preview.modifiers.filter((m) => m.reason.includes('readiness')).length, 2);
});

test('fixed PRNG state repeats rolls, hits and save/resume outcomes', () => {
  const { state, attacker } = setup();
  state.random = { algorithm: 'fc-tabletop-prng-v1', seed: 42, cursor: 7 };
  const resumed = resumeTabletopGame(serializeTabletopGame(state));
  const a = resolveCombat(state, CENTRAL_FRONT_BOARD, attacker.id, 'western-ukraine');
  const b = resolveCombat(resumed, CENTRAL_FRONT_BOARD, attacker.id, 'western-ukraine');
  assert.deepEqual(a, b);
  assert.equal(a.random.cursor, 12);
  assert.equal(a.attackerHits, a.attackerRolls.filter((die) => die >= 5).length);
});

test('hits reduce strength and readiness', () => {
  const { state, attacker, defender } = setup();
  for (let seed = 0; seed < 1000; seed++) {
    state.random.seed = seed; state.random.cursor = 0;
    const result = resolveCombat(state, CENTRAL_FRONT_BOARD, attacker.id, defender.regionId);
    if (result.attackerHits > 0 && result.attackerHits < defender.strength) {
      assert.equal(result.pieces[defender.id].strength, defender.strength - result.attackerHits);
      assert.equal(result.pieces[defender.id].readiness, 'damaged');
      return;
    }
  }
  assert.fail('expected a deterministic seed producing a non-lethal hit');
});

test('winning combat retreats survivors to a deterministic legal region', () => {
  const { state, attacker, defender } = setup();
  for (let seed = 0; seed < 1000; seed++) {
    state.random.seed = seed;
    const result = resolveCombat(state, CENTRAL_FRONT_BOARD, attacker.id, defender.regionId);
    if (result.attackerHits > result.defenderHits && result.attackerHits < defender.strength) {
      assert.equal(result.retreatedTo, 'balkans');
      assert.equal(result.pieces[defender.id].regionId, 'balkans');
      return;
    }
  }
  assert.fail('expected a deterministic retreat seed');
});

test('lethal hits eliminate formations', () => {
  const { state, attacker, defender } = setup();
  defender.strength = 1;
  for (let seed = 0; seed < 1000; seed++) {
    state.random.seed = seed;
    const result = resolveCombat(state, CENTRAL_FRONT_BOARD, attacker.id, defender.regionId);
    if (result.attackerHits) {
      assert.equal(result.pieces[defender.id], undefined);
      assert.ok(result.eliminated.includes(defender.id));
      return;
    }
  }
  assert.fail('expected a deterministic elimination seed');
});

test('dispatcher rejects invalid attack without mutation or action cost', () => {
  const state = createTabletopGame();
  const before = JSON.stringify(state);
  const result = dispatchCoreAction(state, { type: 'attack', seatId: 'future-seat', pieceId: 'ff-spearhead-alpha-piece', targetRegionId: 'london' });
  assert.equal(result.ok, false);
  assert.equal(JSON.stringify(state), before);
  assert.equal(result.state, state);
});

test('successful attack spends exactly one action and alternates', () => {
  const { state, attacker, defender } = setup();
  const result = dispatchCoreAction(state, { type: 'attack', seatId: 'future-seat', pieceId: attacker.id, targetRegionId: defender.regionId });
  assert.equal(result.ok, true);
  assert.equal(result.state.round.commandActionsRemaining['future-seat'], 3);
  assert.equal(result.state.round.activeSeatId, 'coalition-seat');
});

test('preview explains relative advantage and does not mutate state', () => {
  const { state, attacker, defender } = setup();
  defender.entrenched = true;
  const before = JSON.stringify(state);
  const preview = previewAttack(state, attacker.id, defender.regionId);
  assert.ok(preview);
  assert.ok(['attacker', 'defender', 'even'].includes(preview.advantage));
  assert.ok(preview.modifiers.some((modifier) => modifier.reason.includes('entrenched')));
  assert.equal(JSON.stringify(state), before);
  assert.equal(state.random.cursor, 0);
});
