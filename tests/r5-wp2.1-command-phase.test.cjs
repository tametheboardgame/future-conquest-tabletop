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

const [future, coalition] = PROTOTYPE_SEAT_IDS;
const fresh = () => refreshCommandPhase(createCommandRound());

test('refresh gives both seats four actions and initiative', () => {
  const state = fresh();
  assert.equal(state.phase, 'command');
  assert.equal(state.activeSeatId, future);
  assert.deepEqual(state.commandActionsRemaining, {
    [future]: COMMAND_ACTIONS_PER_ROUND,
    [coalition]: COMMAND_ACTIONS_PER_ROUND
  });
});

test('one action is spent per activation and play alternates', () => {
  const first = spendCommandAction(fresh(), future);
  assert.equal(first.ok, true);
  assert.equal(first.state.commandActionsRemaining[future], 3);
  assert.equal(first.state.activeSeatId, coalition);
  const second = spendCommandAction(first.state, coalition);
  assert.equal(second.state.commandActionsRemaining[coalition], 3);
  assert.equal(second.state.activeSeatId, future);
});

test('out-of-turn and double spending cannot cross an action boundary', () => {
  const state = fresh();
  assert.equal(spendCommandAction(state, coalition).ok, false);
  const spent = spendCommandAction(state, future).state;
  assert.equal(spendCommandAction(spent, future).ok, false);
});

test('a single pass is recovered when the opponent continues', () => {
  const passed = passCommandActivation(fresh(), future).state;
  assert.equal(passed.activeSeatId, coalition);
  const continued = spendCommandAction(passed, coalition).state;
  assert.equal(continued.activeSeatId, future);
  assert.equal(continued.commandActionsRemaining[future], 4);
  assert.equal(continued.consecutivePasses, 0);
  assert.deepEqual(continued.passedSeatIds, []);
});

test('two consecutive passes terminate the Command Phase', () => {
  const first = passCommandActivation(fresh(), future).state;
  const second = passCommandActivation(first, coalition).state;
  assert.equal(second.phase, 'supply');
  assert.equal(second.consecutivePasses, 2);
});

test('both sides exhausting actions terminates the Command Phase', () => {
  let state = fresh();
  for (let index = 0; index < COMMAND_ACTIONS_PER_ROUND * 2; index += 1) {
    state = spendCommandAction(state, state.activeSeatId).state;
  }
  assert.equal(state.phase, 'supply');
  assert.equal(state.commandActionsRemaining[future], 0);
  assert.equal(state.commandActionsRemaining[coalition], 0);
});

test('save and resume is deterministic at action boundaries', () => {
  let uninterrupted = spendCommandAction(fresh(), future).state;
  const resumed = resumeCommandRound(serializeCommandRound(uninterrupted));
  assert.deepEqual(resumed, uninterrupted);
  uninterrupted = spendCommandAction(uninterrupted, coalition).state;
  assert.deepEqual(spendCommandAction(resumed, coalition).state, uninterrupted);
});
