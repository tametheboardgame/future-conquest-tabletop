import { CENTRAL_FRONT_BOARD, adjacentRegionIds, connectionsForRegion, type TabletopBoardDefinition } from './board';
import { spendCommandAction } from './command-phase';
import { previewCombat, resolveCombat, type CombatPreview } from './combat';
import { CENTRAL_FRONT_PROTOTYPE_FORCE } from './pieces';
import {
  TABLETOP_RULES_VERSION,
  TABLETOP_STATE_VERSION,
  createTabletopSaveEnvelope,
  isTabletopSaveEnvelope,
  type TabletopFactionId,
  type TabletopGameState,
  type TabletopPieceState,
  type TabletopSeatId
} from './state';

export type CoreActionType = 'move' | 'attack' | 'recover' | 'engineer' | 'logistics' | 'scenario';
export type CoreActionRequest =
  | { type: 'move' | 'attack'; seatId: TabletopSeatId; pieceId: string; targetRegionId: string }
  | { type: 'recover' | 'logistics'; seatId: TabletopSeatId; pieceId: string }
  | { type: 'engineer'; seatId: TabletopSeatId; pieceId: string; routeId: string }
  | { type: 'scenario'; seatId: TabletopSeatId; regionId: string; scenarioActionId: 'secure-objective' };

export interface CoreActionResult {
  ok: boolean;
  state: TabletopGameState;
  reason: string;
}

export interface CoreActionRules { board: TabletopBoardDefinition }

const factionForSeat = (state: TabletopGameState, seatId: string): TabletopFactionId | null => state.seats[seatId]?.factionId ?? null;
const piecesIn = (state: TabletopGameState, regionId: string) => Object.values(state.board.pieces).filter((piece) => piece.regionId === regionId);
const maxStrength = (piece: TabletopPieceState) => CENTRAL_FRONT_PROTOTYPE_FORCE.pieces.find((candidate) => candidate.id === piece.id)?.strength ?? piece.strength;

export const DEFAULT_CORE_ACTION_RULES: CoreActionRules = { board: CENTRAL_FRONT_BOARD };

export function previewAttack(state: TabletopGameState, pieceId: string, targetRegionId: string, rules = DEFAULT_CORE_ACTION_RULES): CombatPreview | null {
  const attacker = state.board.pieces[pieceId];
  if (!attacker || !legalTargets(state, 'attack', pieceId, rules).includes(targetRegionId)) return null;
  const defenders = piecesIn(state, targetRegionId).filter((piece) => piece.factionId !== attacker.factionId);
  return previewCombat(rules.board, attacker, defenders);
}

export function createTabletopGame(): TabletopGameState {
  const regions = Object.fromEntries(CENTRAL_FRONT_BOARD.regions.map((region) => [region.id, {
    id: region.id,
    controller: (region.x > 880 ? 'future-force' : 'present-day-coalition') as TabletopFactionId,
    controlState: 'secure' as const
  }]));
  const pieces = Object.fromEntries(CENTRAL_FRONT_PROTOTYPE_FORCE.pieces.map((piece) => [piece.id, structuredClone(piece)]));
  pieces['ff-engineer-cohort-piece'] = { ...pieces['ff-engineer-cohort-piece'], supply: 'strained' };
  return {
    version: TABLETOP_STATE_VERSION, rulesVersion: TABLETOP_RULES_VERSION, mode: 'tabletop',
    scenario: { scenarioId: CENTRAL_FRONT_BOARD.id, objectiveState: {}, tracks: { scenarioActions: 0 } },
    random: { algorithm: 'fc-tabletop-prng-v1', seed: 1, cursor: 0 },
    seats: {
      'future-seat': { id: 'future-seat', factionId: 'future-force', controller: { type: 'human', localPlayer: 0 } },
      'coalition-seat': { id: 'coalition-seat', factionId: 'present-day-coalition', controller: { type: 'human', localPlayer: 1 } }
    },
    factions: {
      'future-force': { id: 'future-force', seatId: 'future-seat' },
      'present-day-coalition': { id: 'present-day-coalition', seatId: 'coalition-seat' }
    },
    round: (awaitCommandRound()), actionWindow: { type: 'none' },
    board: {
      regions, pieces,
      routes: Object.fromEntries(CENTRAL_FRONT_BOARD.connections.map((route) => [route.id, { id: route.id, status: route.id === 'r38' ? 'damaged' as const : 'intact' as const }]))
    },
    cards: { instances: {}, drawPile: [], discardPile: [], hands: { 'future-seat': [], 'coalition-seat': [] }, removedFromGame: [] },
    status: 'playing'
  };
}

function awaitCommandRound() {
  return {
    round: 1, maxRounds: CENTRAL_FRONT_BOARD.maxRounds, phase: 'command' as const,
    initiativeSeatId: 'future-seat', activeSeatId: 'future-seat',
    commandActionsRemaining: { 'future-seat': 4, 'coalition-seat': 4 }, passedSeatIds: [], consecutivePasses: 0, actionSequence: 0
  };
}

export function legalTargets(state: TabletopGameState, type: CoreActionType, pieceId?: string, rules = DEFAULT_CORE_ACTION_RULES): string[] {
  if (state.round.phase !== 'command') return [];
  const faction = factionForSeat(state, state.round.activeSeatId);
  const piece = pieceId ? state.board.pieces[pieceId] : undefined;
  if (piece && (piece.kind !== 'formation' || piece.factionId !== faction)) return [];
  if (type === 'scenario') return rules.board.objectives.filter((objective) => piecesIn(state, objective.regionId).some((p) => p.factionId === faction)
    && state.scenario.objectiveState[`secured:${state.round.activeSeatId}:${objective.regionId}`] !== true).map((objective) => objective.regionId);
  if (!piece) return [];
  if (type === 'move') return adjacentRegionIds(rules.board, piece.regionId).filter((id) => !piecesIn(state, id).some((p) => p.factionId !== faction));
  if (type === 'attack') return adjacentRegionIds(rules.board, piece.regionId).filter((id) => piecesIn(state, id).some((p) => p.factionId !== faction));
  if (type === 'recover') return piece.strength < maxStrength(piece) || piece.readiness !== 'ready' ? [piece.id] : [];
  if (type === 'logistics') return piece.supply !== 'supplied' ? [piece.id] : [];
  return piece.traits.includes('engineer') ? connectionsForRegion(rules.board, piece.regionId)
    .map((route) => route.id).filter((id) => state.board.routes[id]?.status !== 'intact') : [];
}

export function dispatchCoreAction(state: TabletopGameState, request: CoreActionRequest, rules = DEFAULT_CORE_ACTION_RULES): CoreActionResult {
  const fail = (reason: string): CoreActionResult => ({ ok: false, state, reason });
  if (request.seatId !== state.round.activeSeatId) return fail('It is not this seat’s activation.');
  const faction = factionForSeat(state, request.seatId);
  if (!faction) return fail('Unknown seat.');
  const piece = 'pieceId' in request ? state.board.pieces[request.pieceId] : undefined;
  if ('pieceId' in request && (!piece || piece.kind !== 'formation' || piece.factionId !== faction)) return fail('Select a formation owned by the current side.');
  const target = request.type === 'move' || request.type === 'attack' ? request.targetRegionId
    : request.type === 'engineer' ? request.routeId : request.type === 'scenario' ? request.regionId : request.pieceId;
  if (!legalTargets(state, request.type, piece?.id, rules).includes(target)) return fail('That target is not legal for the selected action.');
  const spent = spendCommandAction(state.round, request.seatId);
  if (!spent.ok) return fail(spent.reason);
  const next = structuredClone(state);
  next.round = spent.state;
  let reason = '';
  if (request.type === 'move' && piece) {
    next.board.pieces[piece.id].regionId = request.targetRegionId;
    next.board.regions[request.targetRegionId].controller = faction;
    reason = `${piece.definitionId} moved.`;
  } else if (request.type === 'attack' && piece) {
    const resolution = resolveCombat(state, rules.board, piece.id, request.targetRegionId);
    next.board.pieces = resolution.pieces;
    next.random = resolution.random;
    if (next.board.pieces[piece.id]
      && !Object.values(next.board.pieces).some((p) => p.regionId === request.targetRegionId && p.factionId !== faction)) {
      next.board.regions[request.targetRegionId].controller = faction;
    }
    reason = `Attack resolved: ${resolution.feedback}`;
  } else if (request.type === 'recover' && piece) {
    const current = next.board.pieces[piece.id];
    current.strength = Math.min(maxStrength(piece), current.strength + 1);
    current.readiness = current.readiness === 'crippled' ? 'damaged' : 'ready';
    reason = `${piece.definitionId} recovered.`;
  } else if (request.type === 'engineer') {
    const route = next.board.routes[request.routeId];
    route.status = route.status === 'destroyed' ? 'damaged' : 'intact';
    reason = `${request.routeId} repaired.`;
  } else if (request.type === 'logistics' && piece) {
    const current = next.board.pieces[piece.id];
    current.supply = current.supply === 'cut-off' ? 'strained' : 'supplied';
    reason = `${piece.definitionId} logistics improved.`;
  } else if (request.type === 'scenario') {
    next.scenario.objectiveState[`secured:${request.seatId}:${request.regionId}`] = true;
    next.scenario.tracks.scenarioActions = (next.scenario.tracks.scenarioActions ?? 0) + 1;
    reason = `${request.regionId} objective secured.`;
  }
  return { ok: true, state: next, reason };
}

export function serializeTabletopGame(state: TabletopGameState): string { return JSON.stringify(createTabletopSaveEnvelope(state)); }
export function resumeTabletopGame(serialized: string): TabletopGameState {
  const envelope: unknown = JSON.parse(serialized);
  if (!isTabletopSaveEnvelope(envelope)) throw new Error('Invalid tabletop save.');
  return structuredClone(envelope.state);
}
