export const TABLETOP_STATE_VERSION = 1 as const;
export const TABLETOP_RULES_VERSION = 'r5-prototype-v0.1' as const;
export const TABLETOP_SAVE_KEY = 'future-conquest-tabletop-v1' as const;

export type TabletopFactionId = 'future-force' | 'present-day-coalition';
export type TabletopSeatId = string;
export type TabletopRegionId = string;
export type TabletopPieceId = string;
export type TabletopCardInstanceId = string;

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

export function isTabletopSaveEnvelope(value: unknown): value is TabletopSaveEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Partial<TabletopSaveEnvelope>;
  return candidate.format === 'future-conquest-tabletop'
    && candidate.version === TABLETOP_STATE_VERSION
    && Boolean(candidate.state)
    && candidate.state?.mode === 'tabletop'
    && candidate.state?.version === TABLETOP_STATE_VERSION;
}
