import type {
  TabletopFactionId,
  TabletopSeatController,
  TabletopSeatId,
  TabletopSeatState
} from './state';

export const FUTURE_COMMAND_SEAT_IDS = ['future-seat', 'future-bravo', 'future-charlie'] as const;
export const COALITION_COMMAND_SEAT_IDS = ['coalition-seat', 'coalition-central', 'coalition-eastern'] as const;
export const TABLETOP_COMMAND_SEAT_IDS = [...FUTURE_COMMAND_SEAT_IDS, ...COALITION_COMMAND_SEAT_IDS] as const;

export type TabletopCommandSeatId = typeof TABLETOP_COMMAND_SEAT_IDS[number];

export interface TabletopCommandSeatDefinition {
  id: TabletopCommandSeatId;
  label: string;
  shortLabel: string;
  factionId: TabletopFactionId;
}

export const TABLETOP_COMMAND_SEATS: Readonly<Record<TabletopCommandSeatId, TabletopCommandSeatDefinition>> = {
  'future-seat': { id: 'future-seat', label: 'Future Command Alpha', shortLabel: 'Alpha', factionId: 'future-force' },
  'future-bravo': { id: 'future-bravo', label: 'Future Command Bravo', shortLabel: 'Bravo', factionId: 'future-force' },
  'future-charlie': { id: 'future-charlie', label: 'Future Command Charlie', shortLabel: 'Charlie', factionId: 'future-force' },
  'coalition-seat': { id: 'coalition-seat', label: 'Western Command', shortLabel: 'Western', factionId: 'present-day-coalition' },
  'coalition-central': { id: 'coalition-central', label: 'Central Command', shortLabel: 'Central', factionId: 'present-day-coalition' },
  'coalition-eastern': { id: 'coalition-eastern', label: 'Eastern Command', shortLabel: 'Eastern', factionId: 'present-day-coalition' }
};

/**
 * BG1 keeps the pre-command-dice prototype at four actions per side so adding
 * command seats does not silently triple force capacity. BG2 replaces this
 * distribution with one visible command die per seat.
 */
export const BG1_ACTION_ALLOCATION: Readonly<Record<TabletopCommandSeatId, number>> = {
  'future-seat': 2,
  'future-bravo': 1,
  'future-charlie': 1,
  'coalition-seat': 2,
  'coalition-central': 1,
  'coalition-eastern': 1
};

export function commandSeatDefinition(seatId: TabletopSeatId): TabletopCommandSeatDefinition | null {
  return TABLETOP_COMMAND_SEATS[seatId as TabletopCommandSeatId] ?? null;
}

export function commandSeatLabel(seatId: TabletopSeatId): string {
  return commandSeatDefinition(seatId)?.label ?? seatId;
}

export function commandSeatFaction(seatId: TabletopSeatId): TabletopFactionId | null {
  return commandSeatDefinition(seatId)?.factionId ?? null;
}

export function commandSeatIdsForFaction(factionId: TabletopFactionId): readonly TabletopCommandSeatId[] {
  return factionId === 'future-force' ? FUTURE_COMMAND_SEAT_IDS : COALITION_COMMAND_SEAT_IDS;
}

export function opposingFaction(factionId: TabletopFactionId): TabletopFactionId {
  return factionId === 'future-force' ? 'present-day-coalition' : 'future-force';
}

export function createBg1CommandActions(): Record<TabletopSeatId, number> {
  return Object.fromEntries(TABLETOP_COMMAND_SEAT_IDS.map((seatId) => [seatId, BG1_ACTION_ALLOCATION[seatId]]));
}

const HUMAN_FUTURE: TabletopSeatController = { type: 'human', localPlayer: 0 };
const HUMAN_COALITION: TabletopSeatController = { type: 'human', localPlayer: 1 };

/** Default two-human assignment. Command identity and controller assignment are deliberately separate. */
export function createDefaultCommandSeats(): Record<TabletopSeatId, TabletopSeatState> {
  const controllerFor = (seatId: TabletopCommandSeatId): TabletopSeatController => {
    if (seatId === 'future-seat') return HUMAN_FUTURE;
    if (seatId === 'coalition-seat') return HUMAN_COALITION;
    return { type: 'ai', profileId: 'standard-command-ai' };
  };
  return Object.fromEntries(TABLETOP_COMMAND_SEAT_IDS.map((seatId) => [seatId, {
    id: seatId,
    factionId: TABLETOP_COMMAND_SEATS[seatId].factionId,
    controller: controllerFor(seatId)
  }]));
}

export function createEmptyCommandHands(): Record<TabletopSeatId, string[]> {
  return Object.fromEntries(TABLETOP_COMMAND_SEAT_IDS.map((seatId) => [seatId, []]));
}

export function hasCompleteCommandSeatSet(seats: Record<string, TabletopSeatState>): boolean {
  const keys = Object.keys(seats);
  return keys.length === TABLETOP_COMMAND_SEAT_IDS.length
    && TABLETOP_COMMAND_SEAT_IDS.every((seatId) => {
      const seat = seats[seatId];
      return seat?.id === seatId && seat.factionId === TABLETOP_COMMAND_SEATS[seatId].factionId;
    });
}

/**
 * Explicit authority map from visible formation pieces to one of the six
 * permanent command seats. The map is independent of human/AI assignment.
 */
export const COMMAND_SEAT_BY_PIECE_ID: Readonly<Record<string, TabletopCommandSeatId>> = {
  'ff-spearhead-alpha-piece': 'future-seat',
  'ff-spearhead-beta-piece': 'future-seat',
  'ff-hunter-group-piece': 'future-seat',
  'ff-vanguard-one-piece': 'future-bravo',
  'ff-vanguard-two-piece': 'future-bravo',
  'ff-siege-group-piece': 'future-bravo',
  'ff-engineer-cohort-piece': 'future-charlie',
  'ff-rift-guard-piece': 'future-charlie',

  'pc-british-expeditionary-piece': 'coalition-seat',
  'pc-french-first-piece': 'coalition-seat',
  'pc-french-second-piece': 'coalition-seat',
  'pc-benelux-piece': 'coalition-seat',
  'pc-rhine-defence-piece': 'coalition-central',
  'pc-ruhr-reserve-piece': 'coalition-central',
  'pc-north-german-piece': 'coalition-central',
  'pc-berlin-guard-piece': 'coalition-central',
  'pc-polish-first-piece': 'coalition-eastern',
  'pc-polish-second-piece': 'coalition-eastern',
  'pc-danube-piece': 'coalition-eastern',
  'pc-balkan-piece': 'coalition-eastern'
};

export function commandSeatForPiece(pieceId: string): TabletopCommandSeatId | null {
  return COMMAND_SEAT_BY_PIECE_ID[pieceId] ?? null;
}

export function seatOwnsPiece(seatId: TabletopSeatId, pieceId: string): boolean {
  return commandSeatForPiece(pieceId) === seatId;
}
