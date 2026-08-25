const test = require('node:test');
const assert = require('node:assert/strict');
const {
  COMMAND_ACTIONS_PER_ROUND,
  PROTOTYPE_SEAT_IDS,
  createCommandRound,
  passCommandActivation,
  refreshCommandPhase,
  resumeCommandRound,
  serializeCommandRound,
  spendCommandAction
} = require('../.tabletop-test-dist/command-phase.js');
const { BG1_ACTION_ALLOCATION, TABLETOP_COMMAND_SEAT_IDS } = require('../.tabletop-test-dist/command-seats.js');

const [futureAlpha, futureBravo, futureCharlie, coalitionWestern, coalitionCentral, coalitionEastern] = TABLETOP_COMMAND_SEAT_IDS;
const fresh = () => refreshCommandPhase(createCommandRound());

test('BG1 exposes exactly six permanent command seats', () => {
  assert.deepEqual(PROTOTYPE_SEAT_IDS, TABLETOP_COMMAND_SEAT_IDS);
  assert.equal(TABLETOP_COMMAND_SEAT_IDS.length, 6);
});

test('refresh preserves four actions per side while distributing them across three commands', () => {
  const state = fresh();
  assert.equal(state.phase, 'command');
  assert.equal(state.activeSeatId, futureAlpha);
  assert.deepEqual(state.commandActionsRemaining, BG1_ACTION_ALLOCATION);
  assert.equal([futureAlpha, futureBravo, futureCharlie].reduce((n, id) => n + state.commandActionsRemaining[id], 0), COMMAND_ACTIONS_PER_ROUND);
  assert.equal([coalitionWestern, coalitionCentral, coalitionEastern].reduce((n, id) => n + state.commandActionsRemaining[id], 0), COMMAND_ACTIONS_PER_ROUND);
});

test('refresh honours any of the six commands selected for initiative', () => {
  assert.equal(refreshCommandPhase(createCommandRound(1, futureBravo)).activeSeatId, futureBravo);
  assert.equal(refreshCommandPhase(createCommandRound(1, coalitionCentral)).activeSeatId, coalitionCentral);
});

test('actions alternate sides and rotate command ownership deterministically', () => {
  let state = fresh();
  const expected = [
    futureAlpha,
    coalitionWestern,
    futureBravo,
    coalitionCentral,
    futureCharlie,
    coalitionEastern,
    futureAlpha,
    coalitionWestern
  ];
  for (const seatId of expected) {
    assert.equal(state.activeSeatId, seatId);
    const result = spendCommandAction(state, seatId);
    assert.equal(result.ok, true);
    state = result.state;
  }
  assert.equal(state.phase, 'supply');
  assert.ok(TABLETOP_COMMAND_SEAT_IDS.every((seatId) => state.commandActionsRemaining[seatId] === 0));
});

test('out-of-turn and double spending cannot cross an action boundary', () => {
  const state = fresh();
  assert.equal(spendCommandAction(state, coalitionWestern).ok, false);
  const spent = spendCommandAction(state, futureAlpha).state;
  assert.equal(spendCommandAction(spent, futureAlpha).ok, false);
});

test('a single side pass is recovered when the opponent continues', () => {
  const passed = passCommandActivation(fresh(), futureAlpha).state;
  assert.equal(passed.activeSeatId, coalitionWestern);
  const continued = spendCommandAction(passed, coalitionWestern).state;
  assert.equal(continued.activeSeatId, futureAlpha);
  assert.equal(continued.commandActionsRemaining[futureAlpha], 2);
  assert.equal(continued.consecutivePasses, 0);
  assert.deepEqual(continued.passedSeatIds, []);
});

test('two consecutive side passes terminate the Command Phase', () => {
  const first = passCommandActivation(fresh(), futureAlpha).state;
  const second = passCommandActivation(first, coalitionWestern).state;
  assert.equal(second.phase, 'supply');
  assert.equal(second.consecutivePasses, 2);
});

test('save and resume is deterministic at command-seat action boundaries', () => {
  let uninterrupted = spendCommandAction(fresh(), futureAlpha).state;
  const resumed = resumeCommandRound(serializeCommandRound(uninterrupted));
  assert.deepEqual(resumed, uninterrupted);
  uninterrupted = spendCommandAction(uninterrupted, coalitionWestern).state;
  assert.deepEqual(spendCommandAction(resumed, coalitionWestern).state, uninterrupted);
});
