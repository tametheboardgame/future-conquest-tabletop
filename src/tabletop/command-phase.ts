import type { TabletopRoundState, TabletopSeatId } from './state';

export const COMMAND_ACTIONS_PER_ROUND = 4 as const;
export const PROTOTYPE_SEAT_IDS = ['future-seat', 'coalition-seat'] as const;

export type CommandPhaseResult =
  | { ok: true; state: TabletopRoundState }
  | { ok: false; state: TabletopRoundState; reason: string };

function otherSeat(seatId: TabletopSeatId): TabletopSeatId {
  const index = PROTOTYPE_SEAT_IDS.indexOf(seatId as typeof PROTOTYPE_SEAT_IDS[number]);
  if (index < 0) throw new Error(`Unknown prototype seat: ${seatId}`);
  return PROTOTYPE_SEAT_IDS[index === 0 ? 1 : 0];
}

export function createCommandRound(round = 1, initiativeSeatId: TabletopSeatId = PROTOTYPE_SEAT_IDS[0]): TabletopRoundState {
  if (!PROTOTYPE_SEAT_IDS.includes(initiativeSeatId as typeof PROTOTYPE_SEAT_IDS[number])) {
    throw new Error(`Unknown prototype initiative seat: ${initiativeSeatId}`);
  }
  return {
    round,
    maxRounds: 8,
    phase: 'refresh',
    initiativeSeatId,
    activeSeatId: initiativeSeatId,
    commandActionsRemaining: Object.fromEntries(
      PROTOTYPE_SEAT_IDS.map((seatId) => [seatId, 0])
    ),
    passedSeatIds: [],
    consecutivePasses: 0,
    actionSequence: 0
  };
}

/** Enters Command Phase and authoritatively refreshes both prototype seats. */
export function refreshCommandPhase(state: TabletopRoundState): TabletopRoundState {
  return {
    ...state,
    phase: 'command',
    activeSeatId: state.initiativeSeatId,
    commandActionsRemaining: Object.fromEntries(
      PROTOTYPE_SEAT_IDS.map((seatId) => [seatId, COMMAND_ACTIONS_PER_ROUND])
    ),
    passedSeatIds: [],
    consecutivePasses: 0,
    actionSequence: 0
  };
}

function finishIfExhausted(state: TabletopRoundState): TabletopRoundState {
  const exhausted = PROTOTYPE_SEAT_IDS.every((seatId) => state.commandActionsRemaining[seatId] === 0);
  return exhausted ? { ...state, phase: 'supply' } : state;
}

/** Spends exactly one action at a deterministic action boundary. Action resolution belongs to WP2.2. */
export function spendCommandAction(state: TabletopRoundState, seatId: TabletopSeatId): CommandPhaseResult {
  if (state.phase !== 'command') return { ok: false, state, reason: 'The Command Phase is not active.' };
  if (seatId !== state.activeSeatId) return { ok: false, state, reason: 'It is not this seat’s activation.' };
  if ((state.commandActionsRemaining[seatId] ?? 0) <= 0) {
    return { ok: false, state, reason: 'This seat has no Command Actions remaining.' };
  }

  const opponent = otherSeat(seatId);
  const remaining = { ...state.commandActionsRemaining, [seatId]: state.commandActionsRemaining[seatId] - 1 };
  const nextSeat = remaining[opponent] > 0 ? opponent : seatId;
  return {
    ok: true,
    state: finishIfExhausted({
      ...state,
      activeSeatId: nextSeat,
      commandActionsRemaining: remaining,
      passedSeatIds: [],
      consecutivePasses: 0,
      actionSequence: state.actionSequence + 1
    })
  };
}

/** Passes this activation only; an opponent action restores normal alternation. */
export function passCommandActivation(state: TabletopRoundState, seatId: TabletopSeatId): CommandPhaseResult {
  if (state.phase !== 'command') return { ok: false, state, reason: 'The Command Phase is not active.' };
  if (seatId !== state.activeSeatId) return { ok: false, state, reason: 'It is not this seat’s activation.' };

  const opponent = otherSeat(seatId);
  const consecutivePasses = state.consecutivePasses + 1;
  const passedSeatIds = [...state.passedSeatIds.filter((id) => id !== seatId), seatId];
  return {
    ok: true,
    state: {
      ...state,
      phase: consecutivePasses >= 2 ? 'supply' : 'command',
      activeSeatId: opponent,
      passedSeatIds,
      consecutivePasses,
      actionSequence: state.actionSequence + 1
    }
  };
}

export function serializeCommandRound(state: TabletopRoundState): string {
  return JSON.stringify(state);
}

export function resumeCommandRound(serialized: string): TabletopRoundState {
  const value: unknown = JSON.parse(serialized);
  if (!value || typeof value !== 'object') throw new Error('Invalid command round save.');
  const state = value as TabletopRoundState;
  const validSeats = PROTOTYPE_SEAT_IDS.every((seatId) => (
    Number.isInteger(state.commandActionsRemaining?.[seatId])
    && state.commandActionsRemaining[seatId] >= 0
    && state.commandActionsRemaining[seatId] <= COMMAND_ACTIONS_PER_ROUND
  ));
  if (!Number.isInteger(state.round) || state.round < 1
    || !PROTOTYPE_SEAT_IDS.includes(state.initiativeSeatId as typeof PROTOTYPE_SEAT_IDS[number])
    || !PROTOTYPE_SEAT_IDS.includes(state.activeSeatId as typeof PROTOTYPE_SEAT_IDS[number])
    || !validSeats
    || !Number.isInteger(state.actionSequence)
    || !Number.isInteger(state.consecutivePasses)) {
    throw new Error('Invalid command round save.');
  }
  return structuredClone(state);
}
