export const TABLETOP_STATE_VERSION = 1 as const;
export const TABLETOP_RULES_VERSION = 'r5-prototype-v0.1' as const;
export const TABLETOP_SAVE_KEY = 'future-conquest-tabletop-v1' as const;

export type TabletopFactionId = 'future-force' | 'present-day-coalition';
export type TabletopSeatId = string;
export type TabletopRegionId = string;
export type TabletopPieceId = string;
export type TabletopCardInstanceId = string;

export type TabletopJsonValue =
  | null
  | boolean
  | number
  | string
  | TabletopJsonValue[]
  | { [key: string]: TabletopJsonValue };

export interface TabletopPendingActionState {
  id: string;
  kind: string;
  actingSeatId: TabletopSeatId;
  payload: Record<string, TabletopJsonValue>;
  resolutionContext: Record<string, TabletopJsonValue>;
}

export type TabletopSeatController =
  | { type: 'human'; localPlayer: number }
  | { type: 'ai'; profileId: string };

export interface TabletopSeatState {
  id: TabletopSeatId;
  factionId: TabletopFactionId;
  controller: TabletopSeatController;
}

export interface TabletopFactionState {
  id: TabletopFactionId;
  seatId: TabletopSeatId;
}

export type TabletopRoundPhase =
  | 'refresh'
  | 'command'
  | 'supply'
  | 'control-mobilisation'
  | 'victory-check'
  | 'complete';

export interface TabletopRoundState {
  round: number;
  maxRounds: number;
  phase: TabletopRoundPhase;
  initiativeSeatId: TabletopSeatId;
  activeSeatId: TabletopSeatId;
  commandActionsRemaining: Record<TabletopSeatId, number>;
  passedSeatIds: TabletopSeatId[];
  consecutivePasses: number;
  actionSequence: number;
}

export type TabletopActionWindow =
  | {
      type: 'none';
    }
  | {
      type: 'reaction';
      actingSeatId: TabletopSeatId;
      reactingSeatId: TabletopSeatId;
      sourceActionId: string;
      pendingAction: TabletopPendingActionState;
    };

export type TabletopRegionControlState = 'secure' | 'contested';

export interface TabletopRegionState {
  id: TabletopRegionId;
  controller: TabletopFactionId | null;
  controlState: TabletopRegionControlState;
}

export type TabletopPieceKind = 'formation' | 'command' | 'garrison' | 'depot';
export type TabletopReadiness = 'ready' | 'damaged' | 'crippled';
export type TabletopSupplyState = 'supplied' | 'strained' | 'cut-off';
export type TabletopFormationTrait = 'infantry' | 'armour' | 'artillery' | 'engineer' | 'elite-future-tech';

export interface TabletopPieceState {
  id: TabletopPieceId;
  definitionId: string;
  kind: TabletopPieceKind;
  factionId: TabletopFactionId;
  regionId: TabletopRegionId;
  strength: number;
  traits: TabletopFormationTrait[];
  readiness: TabletopReadiness;
  supply: TabletopSupplyState;
  entrenched: boolean;
}

export type TabletopRouteStatus = 'intact' | 'damaged' | 'destroyed';

export interface TabletopRouteState {
  id: string;
  status: TabletopRouteStatus;
}

export interface TabletopBoardState {
  regions: Record<TabletopRegionId, TabletopRegionState>;
  pieces: Record<TabletopPieceId, TabletopPieceState>;
  routes: Record<string, TabletopRouteState>;
}

export interface TabletopCardInstanceState {
  id: TabletopCardInstanceId;
  definitionId: string;
}

export interface TabletopCardState {
  instances: Record<TabletopCardInstanceId, TabletopCardInstanceState>;
  drawPile: TabletopCardInstanceId[];
  discardPile: TabletopCardInstanceId[];
  hands: Record<TabletopSeatId, TabletopCardInstanceId[]>;
  removedFromGame: TabletopCardInstanceId[];
}

export interface TabletopRandomState {
  /** Algorithm identifier is saved so future implementations cannot silently change random behaviour. */
  algorithm: 'fc-tabletop-prng-v1';
  seed: number;
  cursor: number;
}

export interface TabletopScenarioState {
  scenarioId: string;
  objectiveState: Record<string, boolean | number | string>;
  tracks: Record<string, number>;
}

/**
 * Authoritative rules state for tabletop mode.
 *
 * This object deliberately excludes presentation-only state such as selected pieces,
 * camera position, open panels, hover state and animation progress. Rules code should
 * derive all legal actions and outcomes from this object plus static scenario data.
 */
export interface TabletopGameState {
  version: typeof TABLETOP_STATE_VERSION;
  rulesVersion: typeof TABLETOP_RULES_VERSION;
  mode: 'tabletop';
  scenario: TabletopScenarioState;
  random: TabletopRandomState;
  seats: Record<TabletopSeatId, TabletopSeatState>;
  factions: Record<TabletopFactionId, TabletopFactionState>;
  round: TabletopRoundState;
  actionWindow: TabletopActionWindow;
  board: TabletopBoardState;
  cards: TabletopCardState;
  status: 'playing' | 'future-force-victory' | 'coalition-victory' | 'draw';
}

/**
 * Non-authoritative client state. It may be discarded and rebuilt without changing
 * the rules outcome or invalidating a deterministic save.
 */
export interface TabletopViewState {
  selectedRegionId: TabletopRegionId | null;
  selectedPieceId: TabletopPieceId | null;
  hoveredRegionId: TabletopRegionId | null;
  openPanel: string | null;
}

export interface TabletopSaveEnvelope {
  format: 'future-conquest-tabletop';
  version: typeof TABLETOP_STATE_VERSION;
  state: TabletopGameState;
}

export function createTabletopSaveEnvelope(state: TabletopGameState): TabletopSaveEnvelope {
  return {
    format: 'future-conquest-tabletop',
    version: TABLETOP_STATE_VERSION,
    state
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIntegerAtLeast(value: unknown, minimum: number): value is number {
  return Number.isInteger(value) && (value as number) >= minimum;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isJsonValue(value: unknown): value is TabletopJsonValue {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (!isRecord(value)) return false;
  return Object.values(value).every(isJsonValue);
}

function isJsonRecord(value: unknown): value is Record<string, TabletopJsonValue> {
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isFactionId(value: unknown): value is TabletopFactionId {
  return value === 'future-force' || value === 'present-day-coalition';
}

function isSeatController(value: unknown): value is TabletopSeatController {
  if (!isRecord(value)) return false;
  if (value.type === 'human') return isIntegerAtLeast(value.localPlayer, 0);
  return value.type === 'ai' && typeof value.profileId === 'string';
}

function isSeatState(value: unknown): value is TabletopSeatState {
  return isRecord(value)
    && typeof value.id === 'string'
    && isFactionId(value.factionId)
    && isSeatController(value.controller);
}

function isFactionState(value: unknown): value is TabletopFactionState {
  return isRecord(value)
    && isFactionId(value.id)
    && typeof value.seatId === 'string';
}

function isRoundPhase(value: unknown): value is TabletopRoundPhase {
  return value === 'refresh'
    || value === 'command'
    || value === 'supply'
    || value === 'control-mobilisation'
    || value === 'victory-check'
    || value === 'complete';
}

function isNumberRecord(value: unknown, minimum?: number): value is Record<string, number> {
  if (!isRecord(value)) return false;
  return Object.values(value).every((entry) => (
    minimum === undefined ? isFiniteNumber(entry) : isIntegerAtLeast(entry, minimum)
  ));
}

function isRoundState(value: unknown): value is TabletopRoundState {
  return isRecord(value)
    && isIntegerAtLeast(value.round, 1)
    && isIntegerAtLeast(value.maxRounds, 1)
    && isRoundPhase(value.phase)
    && typeof value.initiativeSeatId === 'string'
    && typeof value.activeSeatId === 'string'
    && isNumberRecord(value.commandActionsRemaining, 0)
    && isStringArray(value.passedSeatIds)
    && isIntegerAtLeast(value.consecutivePasses, 0)
    && isIntegerAtLeast(value.actionSequence, 0);
}

function isPendingActionState(value: unknown): value is TabletopPendingActionState {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.kind === 'string'
    && typeof value.actingSeatId === 'string'
    && isJsonRecord(value.payload)
    && isJsonRecord(value.resolutionContext);
}

function isActionWindow(value: unknown): value is TabletopActionWindow {
  if (!isRecord(value)) return false;
  if (value.type === 'none') return true;
  if (value.type !== 'reaction') return false;
  return typeof value.actingSeatId === 'string'
    && typeof value.reactingSeatId === 'string'
    && typeof value.sourceActionId === 'string'
    && isPendingActionState(value.pendingAction)
    && value.pendingAction.id === value.sourceActionId
    && value.pendingAction.actingSeatId === value.actingSeatId;
}

function isRegionState(value: unknown): value is TabletopRegionState {
  return isRecord(value)
    && typeof value.id === 'string'
    && (value.controller === null || isFactionId(value.controller))
    && (value.controlState === 'secure' || value.controlState === 'contested');
}

function isPieceKind(value: unknown): value is TabletopPieceKind {
  return value === 'formation' || value === 'command' || value === 'garrison' || value === 'depot';
}

function isFormationTrait(value: unknown): value is TabletopFormationTrait {
  return value === 'infantry'
    || value === 'armour'
    || value === 'artillery'
    || value === 'engineer'
    || value === 'elite-future-tech';
}

function isPieceState(value: unknown): value is TabletopPieceState {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.definitionId === 'string'
    && isPieceKind(value.kind)
    && isFactionId(value.factionId)
    && typeof value.regionId === 'string'
    && isFiniteNumber(value.strength)
    && value.strength >= 0
    && Array.isArray(value.traits)
    && value.traits.every(isFormationTrait)
    && (value.readiness === 'ready' || value.readiness === 'damaged' || value.readiness === 'crippled')
    && (value.supply === 'supplied' || value.supply === 'strained' || value.supply === 'cut-off')
    && typeof value.entrenched === 'boolean';
}

function isRouteState(value: unknown): value is TabletopRouteState {
  return isRecord(value)
    && typeof value.id === 'string'
    && (value.status === 'intact' || value.status === 'damaged' || value.status === 'destroyed');
}

function isKeyedRecord<T>(
  value: unknown,
  validator: (entry: unknown) => entry is T,
  getId: (entry: T) => string
): value is Record<string, T> {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(([key, entry]) => validator(entry) && getId(entry) === key);
}

function isBoardState(value: unknown): value is TabletopBoardState {
  return isRecord(value)
    && isKeyedRecord(value.regions, isRegionState, (entry) => entry.id)
    && isKeyedRecord(value.pieces, isPieceState, (entry) => entry.id)
    && isKeyedRecord(value.routes, isRouteState, (entry) => entry.id);
}

function isCardInstanceState(value: unknown): value is TabletopCardInstanceState {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.definitionId === 'string';
}

function isHandsRecord(value: unknown): value is Record<TabletopSeatId, TabletopCardInstanceId[]> {
  return isRecord(value) && Object.values(value).every(isStringArray);
}

function isCardState(value: unknown): value is TabletopCardState {
  if (!isRecord(value)
    || !isKeyedRecord(value.instances, isCardInstanceState, (entry) => entry.id)
    || !isStringArray(value.drawPile)
    || !isStringArray(value.discardPile)
    || !isHandsRecord(value.hands)
    || !isStringArray(value.removedFromGame)) return false;

  const instanceIds = new Set(Object.keys(value.instances));
  const referencedIds = [
    ...value.drawPile,
    ...value.discardPile,
    ...Object.values(value.hands).flat(),
    ...value.removedFromGame
  ];
  return referencedIds.every((id) => instanceIds.has(id));
}

function isRandomState(value: unknown): value is TabletopRandomState {
  return isRecord(value)
    && value.algorithm === 'fc-tabletop-prng-v1'
    && isFiniteNumber(value.seed)
    && isIntegerAtLeast(value.cursor, 0);
}

function isObjectiveState(value: unknown): value is TabletopScenarioState['objectiveState'] {
  return isRecord(value) && Object.values(value).every((entry) => (
    typeof entry === 'boolean' || typeof entry === 'string' || isFiniteNumber(entry)
  ));
}

function isScenarioState(value: unknown): value is TabletopScenarioState {
  return isRecord(value)
    && typeof value.scenarioId === 'string'
    && isObjectiveState(value.objectiveState)
    && isNumberRecord(value.tracks);
}

function isGameStatus(value: unknown): value is TabletopGameState['status'] {
  return value === 'playing'
    || value === 'future-force-victory'
    || value === 'coalition-victory'
    || value === 'draw';
}

function isTabletopGameState(value: unknown): value is TabletopGameState {
  if (!isRecord(value)
    || value.version !== TABLETOP_STATE_VERSION
    || value.rulesVersion !== TABLETOP_RULES_VERSION
    || value.mode !== 'tabletop'
    || !isScenarioState(value.scenario)
    || !isRandomState(value.random)
    || !isKeyedRecord(value.seats, isSeatState, (entry) => entry.id)
    || !isRecord(value.factions)
    || !isRoundState(value.round)
    || !isActionWindow(value.actionWindow)
    || !isBoardState(value.board)
    || !isCardState(value.cards)
    || !isGameStatus(value.status)) return false;

  const futureFaction = value.factions['future-force'];
  const coalitionFaction = value.factions['present-day-coalition'];
  if (!isFactionState(futureFaction)
    || !isFactionState(coalitionFaction)
    || futureFaction.id !== 'future-force'
    || coalitionFaction.id !== 'present-day-coalition') return false;

  const seats = value.seats as Record<string, TabletopSeatState>;
  if (!seats[futureFaction.seatId] || seats[futureFaction.seatId].factionId !== 'future-force') return false;
  if (!seats[coalitionFaction.seatId] || seats[coalitionFaction.seatId].factionId !== 'present-day-coalition') return false;
  if (!seats[value.round.initiativeSeatId] || !seats[value.round.activeSeatId]) return false;
  if (!Object.keys(value.round.commandActionsRemaining).every((seatId) => Boolean(seats[seatId]))) return false;
  if (!value.round.passedSeatIds.every((seatId) => Boolean(seats[seatId]))) return false;

  if (value.actionWindow.type === 'reaction') {
    if (!seats[value.actionWindow.actingSeatId] || !seats[value.actionWindow.reactingSeatId]) return false;
  }

  const regions = value.board.regions as Record<string, TabletopRegionState>;
  const pieces = value.board.pieces as Record<string, TabletopPieceState>;
  if (!Object.values(pieces).every((piece) => Boolean(regions[piece.regionId]))) return false;

  const hands = value.cards.hands as Record<string, string[]>;
  if (!Object.keys(hands).every((seatId) => Boolean(seats[seatId]))) return false;

  return true;
}

export function isTabletopSaveEnvelope(value: unknown): value is TabletopSaveEnvelope {
  if (!isRecord(value)) return false;
  return value.format === 'future-conquest-tabletop'
    && value.version === TABLETOP_STATE_VERSION
    && isTabletopGameState(value.state);
}
