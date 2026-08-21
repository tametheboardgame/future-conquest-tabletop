import type {
  TabletopFactionId,
  TabletopFormationTrait,
  TabletopPieceState
} from './state';
import type { TabletopBoardDefinition } from './board';

export interface TabletopFormationDefinition {
  id: string;
  name: string;
  shortLabel: string;
  factionId: TabletopFactionId;
  traits: TabletopFormationTrait[];
}

export interface TabletopPrototypeForce {
  definitions: Record<string, TabletopFormationDefinition>;
  pieces: TabletopPieceState[];
}

const futureDefinitions: TabletopFormationDefinition[] = [
  { id: 'ff-spearhead-alpha', name: 'Spearhead Alpha', shortLabel: 'A1', factionId: 'future-force', traits: ['armour', 'elite-future-tech'] },
  { id: 'ff-spearhead-beta', name: 'Spearhead Beta', shortLabel: 'A2', factionId: 'future-force', traits: ['armour', 'elite-future-tech'] },
  { id: 'ff-vanguard-one', name: 'Vanguard One', shortLabel: 'V1', factionId: 'future-force', traits: ['infantry', 'elite-future-tech'] },
  { id: 'ff-vanguard-two', name: 'Vanguard Two', shortLabel: 'V2', factionId: 'future-force', traits: ['infantry', 'elite-future-tech'] },
  { id: 'ff-siege-group', name: 'Siege Group', shortLabel: 'SG', factionId: 'future-force', traits: ['artillery', 'elite-future-tech'] },
  { id: 'ff-hunter-group', name: 'Hunter Group', shortLabel: 'HG', factionId: 'future-force', traits: ['armour', 'infantry', 'elite-future-tech'] },
  { id: 'ff-engineer-cohort', name: 'Engineer Cohort', shortLabel: 'EN', factionId: 'future-force', traits: ['engineer', 'elite-future-tech'] },
  { id: 'ff-rift-guard', name: 'Rift Guard', shortLabel: 'RG', factionId: 'future-force', traits: ['infantry', 'artillery', 'elite-future-tech'] }
];

const coalitionDefinitions: TabletopFormationDefinition[] = [
  { id: 'pc-british-expeditionary', name: 'British Expeditionary Corps', shortLabel: 'UK', factionId: 'present-day-coalition', traits: ['infantry', 'armour'] },
  { id: 'pc-french-first', name: 'French I Corps', shortLabel: 'F1', factionId: 'present-day-coalition', traits: ['infantry', 'armour'] },
  { id: 'pc-french-second', name: 'French II Corps', shortLabel: 'F2', factionId: 'present-day-coalition', traits: ['infantry', 'artillery'] },
  { id: 'pc-benelux', name: 'Benelux Corps', shortLabel: 'BX', factionId: 'present-day-coalition', traits: ['infantry', 'engineer'] },
  { id: 'pc-rhine-defence', name: 'Rhine Defence Corps', shortLabel: 'RD', factionId: 'present-day-coalition', traits: ['infantry', 'artillery'] },
  { id: 'pc-ruhr-reserve', name: 'Ruhr Reserve', shortLabel: 'RR', factionId: 'present-day-coalition', traits: ['armour'] },
  { id: 'pc-north-german', name: 'North German Corps', shortLabel: 'NG', factionId: 'present-day-coalition', traits: ['infantry', 'armour'] },
  { id: 'pc-berlin-guard', name: 'Berlin Guard', shortLabel: 'BG', factionId: 'present-day-coalition', traits: ['infantry', 'artillery'] },
  { id: 'pc-polish-first', name: 'Polish I Corps', shortLabel: 'P1', factionId: 'present-day-coalition', traits: ['infantry', 'armour'] },
  { id: 'pc-polish-second', name: 'Polish II Corps', shortLabel: 'P2', factionId: 'present-day-coalition', traits: ['infantry', 'artillery'] },
  { id: 'pc-danube', name: 'Danube Corps', shortLabel: 'DC', factionId: 'present-day-coalition', traits: ['infantry', 'engineer'] },
  { id: 'pc-balkan', name: 'Balkan Group', shortLabel: 'BK', factionId: 'present-day-coalition', traits: ['infantry'] }
];

const definitions = [...futureDefinitions, ...coalitionDefinitions];

function formation(
  definitionId: string,
  regionId: string,
  strength: number,
  traits: TabletopFormationTrait[],
  factionId: TabletopFactionId
): TabletopPieceState {
  return {
    id: `${definitionId}-piece`,
    definitionId,
    kind: 'formation',
    factionId,
    regionId,
    strength,
    traits,
    readiness: 'ready',
    supply: 'supplied',
    entrenched: false
  };
}

export const CENTRAL_FRONT_PROTOTYPE_FORCE: TabletopPrototypeForce = {
  definitions: Object.fromEntries(definitions.map((definition) => [definition.id, definition])),
  pieces: [
    formation('ff-spearhead-alpha', 'carpathian-portal', 6, ['armour', 'elite-future-tech'], 'future-force'),
    formation('ff-spearhead-beta', 'western-ukraine', 6, ['armour', 'elite-future-tech'], 'future-force'),
    formation('ff-vanguard-one', 'kyiv', 5, ['infantry', 'elite-future-tech'], 'future-force'),
    formation('ff-vanguard-two', 'western-ukraine', 5, ['infantry', 'elite-future-tech'], 'future-force'),
    formation('ff-siege-group', 'western-ukraine', 5, ['artillery', 'elite-future-tech'], 'future-force'),
    formation('ff-hunter-group', 'carpathian-portal', 5, ['armour', 'infantry', 'elite-future-tech'], 'future-force'),
    formation('ff-engineer-cohort', 'kyiv', 4, ['engineer', 'elite-future-tech'], 'future-force'),
    formation('ff-rift-guard', 'kyiv', 5, ['infantry', 'artillery', 'elite-future-tech'], 'future-force'),

    formation('pc-british-expeditionary', 'london', 4, ['infantry', 'armour'], 'present-day-coalition'),
    formation('pc-french-first', 'paris', 4, ['infantry', 'armour'], 'present-day-coalition'),
    formation('pc-french-second', 'paris', 3, ['infantry', 'artillery'], 'present-day-coalition'),
    formation('pc-benelux', 'low-countries', 3, ['infantry', 'engineer'], 'present-day-coalition'),
    formation('pc-rhine-defence', 'rhine', 4, ['infantry', 'artillery'], 'present-day-coalition'),
    formation('pc-ruhr-reserve', 'ruhr', 3, ['armour'], 'present-day-coalition'),
    formation('pc-north-german', 'north-germany', 4, ['infantry', 'armour'], 'present-day-coalition'),
    formation('pc-berlin-guard', 'berlin', 4, ['infantry', 'artillery'], 'present-day-coalition'),
    formation('pc-polish-first', 'warsaw', 4, ['infantry', 'armour'], 'present-day-coalition'),
    formation('pc-polish-second', 'baltic-corridor', 3, ['infantry', 'artillery'], 'present-day-coalition'),
    formation('pc-danube', 'vienna', 3, ['infantry', 'engineer'], 'present-day-coalition'),
    formation('pc-balkan', 'balkans', 3, ['infantry'], 'present-day-coalition')
  ]
};

export function validatePrototypeForce(
  board: TabletopBoardDefinition,
  force: TabletopPrototypeForce
): string[] {
  const errors: string[] = [];
  const regionIds = new Set(board.regions.map((region) => region.id));
  const pieceIds = new Set<string>();

  for (const [definitionId, definition] of Object.entries(force.definitions)) {
    if (definition.id !== definitionId) errors.push(`Formation definition key mismatch: ${definitionId}`);
  }

  for (const piece of force.pieces) {
    if (pieceIds.has(piece.id)) errors.push(`Duplicate piece id: ${piece.id}`);
    pieceIds.add(piece.id);

    const definition = force.definitions[piece.definitionId];
    if (!definition) {
      errors.push(`Piece ${piece.id} references unknown definition ${piece.definitionId}`);
      continue;
    }
    if (definition.factionId !== piece.factionId) errors.push(`Piece ${piece.id} faction does not match definition`);
    if (!regionIds.has(piece.regionId)) errors.push(`Piece ${piece.id} references unknown region ${piece.regionId}`);
    if (piece.kind !== 'formation') errors.push(`Prototype piece ${piece.id} is not a formation`);
    if (piece.strength <= 0) errors.push(`Prototype piece ${piece.id} has non-positive strength`);
  }

  const futureCount = force.pieces.filter((piece) => piece.factionId === 'future-force').length;
  const coalitionCount = force.pieces.filter((piece) => piece.factionId === 'present-day-coalition').length;
  if (futureCount < 8 || futureCount > 12) errors.push(`Future Force piece count out of range: ${futureCount}`);
  if (coalitionCount < 8 || coalitionCount > 12) errors.push(`Coalition piece count out of range: ${coalitionCount}`);

  return errors;
}
