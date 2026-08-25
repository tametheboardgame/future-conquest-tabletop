const test = require('node:test');
const assert = require('node:assert/strict');
const {
  COMMAND_SEAT_BY_PIECE_ID,
  TABLETOP_COMMAND_SEAT_IDS,
  TABLETOP_COMMAND_SEATS,
  commandSeatForPiece,
  commandSeatIdsForFaction
} = require('../.tabletop-test-dist/command-seats.js');
const { CENTRAL_FRONT_BOARD } = require('../.tabletop-test-dist/board.js');
const { createTabletopGame, resumeTabletopGame, serializeTabletopGame } = require('../.tabletop-test-dist/core-actions.js');

test('BG1 game state contains exactly six permanent command seats', () => {
  const state = createTabletopGame();
  assert.deepEqual(Object.keys(state.seats).sort(), [...TABLETOP_COMMAND_SEAT_IDS].sort());
  assert.equal(commandSeatIdsForFaction('future-force').length, 3);
  assert.equal(commandSeatIdsForFaction('present-day-coalition').length, 3);
  for (const seatId of TABLETOP_COMMAND_SEAT_IDS) {
    assert.equal(state.seats[seatId].factionId, TABLETOP_COMMAND_SEATS[seatId].factionId);
  }
});

test('default two-player assignment does not change command identities', () => {
  const state = createTabletopGame();
  const humanSeats = Object.values(state.seats).filter((seat) => seat.controller.type === 'human');
  const aiSeats = Object.values(state.seats).filter((seat) => seat.controller.type === 'ai');
  assert.equal(humanSeats.length, 2);
  assert.equal(aiSeats.length, 4);
  assert.deepEqual(humanSeats.map((seat) => seat.id).sort(), ['coalition-seat', 'future-seat']);
  const before = commandSeatForPiece('ff-vanguard-one-piece');
  state.seats['future-bravo'].controller = { type: 'human', localPlayer: 2 };
  assert.equal(commandSeatForPiece('ff-vanguard-one-piece'), before);
});

test('every formation has one explicit command owner matching its faction', () => {
  const state = createTabletopGame();
  assert.equal(Object.keys(COMMAND_SEAT_BY_PIECE_ID).length, Object.keys(state.board.pieces).length);
  for (const piece of Object.values(state.board.pieces)) {
    const seatId = commandSeatForPiece(piece.id);
    assert.ok(seatId, `missing command seat for ${piece.id}`);
    assert.equal(state.seats[seatId].factionId, piece.factionId);
  }
});

test('portal and strategic objectives exist in authoritative scenario state', () => {
  const state = createTabletopGame();
  assert.equal(state.round.maxRounds, 8);
  assert.equal(state.scenario.objectiveState.portalRegionId, 'carpathian-portal');
  assert.equal(state.scenario.objectiveState.portalStatus, 'active');
  assert.equal(state.scenario.objectiveState.strategicObjectiveCount, CENTRAL_FRONT_BOARD.objectives.length);
});

test('BG1 save/resume preserves six seats and rejects the legacy two-seat shape', () => {
  const state = createTabletopGame();
  assert.deepEqual(resumeTabletopGame(serializeTabletopGame(state)), state);

  const envelope = JSON.parse(serializeTabletopGame(state));
  for (const seatId of ['future-bravo', 'future-charlie', 'coalition-central', 'coalition-eastern']) {
    delete envelope.state.seats[seatId];
    delete envelope.state.round.commandActionsRemaining[seatId];
    delete envelope.state.cards.hands[seatId];
  }
  assert.throws(() => resumeTabletopGame(JSON.stringify(envelope)), /BG1|Legacy/);
});
