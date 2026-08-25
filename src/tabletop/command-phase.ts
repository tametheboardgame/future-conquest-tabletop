import {
  BG1_ACTION_ALLOCATION,
  FUTURE_COMMAND_SEAT_IDS,
  TABLETOP_COMMAND_SEAT_IDS,
  commandSeatDefinition,
  commandSeatFaction,
  commandSeatIdsForFaction,
  createBg1CommandActions,
  opposingFaction
} from './command-seats';
import type { TabletopFactionId, TabletopRoundState, TabletopSeatId } from './state';

/** Retained only as the pre-BG2 total action budget per side. */
export const COMMAND_ACTIONS_PER_ROUND = 4 as const;
export const PROTOTYPE_SEAT_IDS = TABLETOP_COMMAND_SEAT_IDS;

export type CommandPhaseResult =
  | { ok: true; state: TabletopRoundState }
  | { ok: false; state: TabletopRoundState; reason: string };

function actionsRemainingForFaction(state: TabletopRoundState, factionId: TabletopFactionId): number {
  return commandSeatIdsForFaction(factionId)
    .reduce((total, seatId) => total + (state.commandActionsRemaining[seatId] ?? 0), 0);
}

function nextSeatForFaction(state: TabletopRoundState, factionId: TabletopFactionId): TabletopSeatId | null {
  const seatIds = commandSeatIdsForFaction(factionId);
  const spent = COMMAND_ACTIONS_PER_ROUND - actionsRemainingForFaction(state, factionId);
  const startIndex = ((spent % seatIds.length) + seatIds.length) % seatIds.length;
  for (let offset = 0; offset < seatIds.length; offset += 1) {
    const seatId = seatIds[(startIndex + offset) % seatIds.length];
    if ((state.commandActionsRemaining[seatId] ?? 0) > 0) return seatId;
  }
  return null;
}

export function createCommandRound(
  round = 1,
  initiativeSeatId: TabletopSeatId = FUTURE_COMMAND_SEAT_IDS[0]
): TabletopRoundState {
  if (!commandSeatDefinition(initiativeSeatId)) {
    throw new Error(`Unknown command initiative seat: ${initiativeSeatId}`);
  }
  return {
    round,
    maxRounds: 8,
    phase: 'refresh',
    initiativeSeatId,
    activeSeatId: initiativeSeatId,
    commandActionsRemaining: Object.fromEntries(TABLETOP_COMMAND_SEAT_IDS.map((seatId) => [seatId, 0])),
    passedSeatIds: [],
    consecutivePasses: 0,
    actionSequence: 0
  };
}

/**
 * BG1 enters Command Phase with all six permanent seats present. Until BG2
 * command dice land, the old four-actions-per-side capacity is distributed
 * deterministically 2/1/1 across each side's three commands.
 */
export function refreshCommandPhase(state: TabletopRoundState): TabletopRoundState {
  const initiativeFaction = commandSeatFaction(state.initiativeSeatId);
  if (!initiativeFaction) throw new Error(`Unknown command initiative seat: ${state.initiativeSeatId}`);
  const refreshed: TabletopRoundState = {
    ...state,
    phase: 'command',
    commandActionsRemaining: createBg1CommandActions(),
    passedSeatIds: [],
    consecutivePasses: 0,
    actionSequence: 0
  };
  return {
    ...refreshed,
    activeSeatId: nextSeatForFaction(refreshed, initiativeFaction) ?? state.initiativeSeatId
  };
}

function finishIfExhausted(state: TabletopRoundState): TabletopRoundState {
  const exhausted = TABLETOP_COMMAND_SEAT_IDS.every((seatId) => (state.commandActionsRemaining[seatId] ?? 0) === 0);
  return exhausted ? { ...state, phase: 'supply' } : state;
}

/** Spends exactly one action at a deterministic command-seat boundary. */
export function spendCommandAction(state: TabletopRoundState, seatId: TabletopSeatId): CommandPhaseResult {
  if (state.phase !== 'command') return { ok: false, state, reason: 'The Command Phase is not active.' };
  if (seatId !== state.activeSeatId) return { ok: false, state, reason: 'It is not this command seat’s activation.' };
  const factionId = commandSeatFaction(seatId);
  if (!factionId) return { ok: false, state, reason: 'Unknown command seat.' };
  if ((state.commandActionsRemaining[seatId] ?? 0) <= 0) {
    return { ok: false, state, reason: 'This command seat has no actions remaining.' };
  }

  const remaining = {
    ...state.commandActionsRemaining,
    [seatId]: state.commandActionsRemaining[seatId] - 1
  };
  const advanced = finishIfExhausted({
    ...state,
    commandActionsRemaining: remaining,
    passedSeatIds: [],
    consecutivePasses: 0,
    actionSequence: state.actionSequence + 1
  });
  if (advanced.phase !== 'command') return { ok: true, state: advanced };

  const opponent = opposingFaction(factionId);
  const activeSeatId = actionsRemainingForFaction(advanced, opponent) > 0
    ? nextSeatForFaction(advanced, opponent)
    : nextSeatForFaction(advanced, factionId);
  return {
    ok: true,
    state: { ...advanced, activeSeatId: activeSeatId ?? seatId }
  };
}

/** A pass yields this side's activation; two consecutive side passes end Command Phase. */
export function passCommandActivation(state: TabletopRoundState, seatId: TabletopSeatId): CommandPhaseResult {
  if (state.phase !== 'command') return { ok: false, state, reason: 'The Command Phase is not active.' };
  if (seatId !== state.activeSeatId) return { ok: false, state, reason: 'It is not this command seat’s activation.' };
  const factionId = commandSeatFaction(seatId);
  if (!factionId) return { ok: false, state, reason: 'Unknown command seat.' };

  const consecutivePasses = state.consecutivePasses + 1;
  const passedSeatIds = [...state.passedSeatIds.filter((id) => id !== seatId), seatId];
  if (consecutivePasses >= 2) {
    return {
      ok: true,
      state: {
        ...state,
        phase: 'supply',
        passedSeatIds,
        consecutivePasses,
        actionSequence: state.actionSequence + 1
      }
    };
  }

  const opponent = opposingFaction(factionId);
  const activeSeatId = actionsRemainingForFaction(state, opponent) > 0
    ? nextSeatForFaction(state, opponent)
    : nextSeatForFaction(state, factionId);
  return {
    ok: true,
    state: {
      ...state,
      activeSeatId: activeSeatId ?? seatId,
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
  const keys = Object.keys(state.commandActionsRemaining ?? {});
  const validSeats = keys.length === TABLETOP_COMMAND_SEAT_IDS.length
    && TABLETOP_COMMAND_SEAT_IDS.every((seatId) => (
      Number.isInteger(state.commandActionsRemaining?.[seatId])
      && state.commandActionsRemaining[seatId] >= 0
      && state.commandActionsRemaining[seatId] <= BG1_ACTION_ALLOCATION[seatId]
    ));
  if (!Number.isInteger(state.round) || state.round < 1
    || !commandSeatDefinition(state.initiativeSeatId)
    || !commandSeatDefinition(state.activeSeatId)
    || !validSeats
    || !state.passedSeatIds.every((seatId) => Boolean(commandSeatDefinition(seatId)))
    || !Number.isInteger(state.actionSequence)
    || !Number.isInteger(state.consecutivePasses)) {
    throw new Error('Invalid command round save.');
  }
  return structuredClone(state);
}
