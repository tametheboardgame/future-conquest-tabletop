const test = require('node:test');
const assert = require('node:assert/strict');
const {
  commandSeatForFormation,
  createTabletopGame,
  dispatchCoreAction,
  resumeTabletopGame,
  serializeTabletopGame
} = require('../.tabletop-test-dist/core-actions.js');
const { TABLETOP_COMMAND_SEAT_IDS } = require('../.tabletop-test-dist/command-seats.js');

const act = (state, request) => dispatchCoreAction(state, { seatId: state.round.activeSeatId, ...request });
const setActive = (state, seatId) => ({ ...state, round: { ...state.round, activeSeatId: seatId } });
const verifyBoundary = (before, result, changed) => {
  assert.equal(result.ok, true);
  assert.equal(result.state.round.commandActionsRemaining[before.round.activeSeatId], before.round.commandActionsRemaining[before.round.activeSeatId] - 1);
  assert.notEqual(result.state.round.activeSeatId, before.round.activeSeatId);
  changed(result.state);
  assert.deepEqual(resumeTabletopGame(serializeTabletopGame(result.state)), result.state);
};

test('Move uses adjacency, updates the authoritative piece, spends once and resumes', () => {
  const state = createTabletopGame();
  const result = act(state, { type: 'move', pieceId: 'ff-spearhead-alpha-piece', targetRegionId: 'bohemia' });
  verifyBoundary(state, result, next => assert.equal(next.board.pieces['ff-spearhead-alpha-piece'].regionId, 'bohemia'));
});

test('Attack uses deterministic authoritative resolution', () => {
  let state = createTabletopGame();
  state.board.pieces['pc-polish-first-piece'].regionId = 'western-ukraine';
  const result = act(state, { type: 'attack', pieceId: 'ff-spearhead-alpha-piece', targetRegionId: 'western-ukraine' });
  verifyBoundary(state, result, next => {
    assert.equal(next.random.cursor, 5);
    assert.match(result.reason, /3 vs 2 dice/);
  });
});

test('Recover respects scenario formation maximum', () => {
  const state = createTabletopGame();
  state.board.pieces['ff-spearhead-alpha-piece'].strength = 5;
  state.board.pieces['ff-spearhead-alpha-piece'].readiness = 'damaged';
  const result = act(state, { type: 'recover', pieceId: 'ff-spearhead-alpha-piece' });
  verifyBoundary(state, result, next => { assert.equal(next.board.pieces['ff-spearhead-alpha-piece'].strength, 6); assert.equal(next.board.pieces['ff-spearhead-alpha-piece'].readiness, 'ready'); });
});

test('Engineer repairs one connected damaged route for its owning command', () => {
  const state = setActive(createTabletopGame(), 'future-charlie');
  const result = act(state, { type: 'engineer', pieceId: 'ff-engineer-cohort-piece', routeId: 'r38' });
  verifyBoundary(state, result, next => assert.equal(next.board.routes.r38.status, 'intact'));
});

test('Logistics improves one eligible command-owned formation', () => {
  const state = setActive(createTabletopGame(), 'future-charlie');
  const result = act(state, { type: 'logistics', pieceId: 'ff-engineer-cohort-piece' });
  verifyBoundary(state, result, next => assert.equal(next.board.pieces['ff-engineer-cohort-piece'].supply, 'supplied'));
});

test('basic scenario hook secures an occupied objective', () => {
  const state = createTabletopGame();
  const result = act(state, { type: 'scenario', regionId: 'kyiv', scenarioActionId: 'secure-objective' });
  verifyBoundary(state, result, next => { assert.equal(next.scenario.objectiveState['secured:future-seat:kyiv'], true); assert.equal(next.scenario.tracks.scenarioActions, 1); });
});

test('out-of-turn, enemy ownership, wrong-command ownership, illegal target and ineligible actions do not mutate or spend', () => {
  const requests = [
    { type: 'move', seatId: 'coalition-seat', pieceId: 'pc-british-expeditionary-piece', targetRegionId: 'channel-approaches' },
    { type: 'move', seatId: 'future-seat', pieceId: 'pc-british-expeditionary-piece', targetRegionId: 'channel-approaches' },
    { type: 'move', seatId: 'future-seat', pieceId: 'ff-vanguard-one-piece', targetRegionId: 'bohemia' },
    { type: 'move', seatId: 'future-seat', pieceId: 'ff-spearhead-alpha-piece', targetRegionId: 'london' },
    { type: 'recover', seatId: 'future-seat', pieceId: 'ff-spearhead-alpha-piece' }
  ];
  for (const request of requests) {
    const state = createTabletopGame();
    const json = JSON.stringify(state);
    const result = dispatchCoreAction(state, request);
    assert.equal(result.ok, false);
    assert.equal(JSON.stringify(result.state), json);
    assert.equal(state.round.commandActionsRemaining['future-seat'], 2);
  }
});

test('eight successful core actions rotate through six commands and exhaust the phase', () => {
  let state = createTabletopGame();
  for (let i = 0; i < 8; i++) {
    const seat = state.round.activeSeatId;
    const piece = Object.values(state.board.pieces).find(p => commandSeatForFormation(p.id) === seat);
    assert.ok(piece, `expected a formation for ${seat}`);
    piece.readiness = 'damaged';
    const result = act(state, { type: 'recover', pieceId: piece.id });
    assert.equal(result.ok, true);
    state = result.state;
  }
  assert.equal(state.round.phase, 'supply');
  assert.ok(TABLETOP_COMMAND_SEAT_IDS.every((seatId) => state.round.commandActionsRemaining[seatId] === 0));
});
