import { newGame } from '../game/engine';
import type { GameState, TaskGroup } from '../game/types';
import type { TabletopBoardDefinition } from './board';
import type { TabletopPrototypeForce } from './pieces';
import type { TabletopGameState } from './state';

/**
 * The R3 terrain renderer currently keys its political and miniature layers by
 * the original vertical-slice territories.  This explicit, presentation-only
 * projection is the seam between those renderer IDs and the R5 strategic board.
 * No value returned here is ever dispatched back into the rules store.
 */
export const R5_REGION_TO_R3_TERRITORY: Readonly<Record<string, string>> = {
  london: 'GB-04', 'channel-approaches': 'FR-01', paris: 'FR-02',
  'low-countries': 'BE-01', ruhr: 'DE-02', rhine: 'DE-03',
  'alpine-west': 'CH-01', 'north-germany': 'NL-01', berlin: 'DE-05',
  bohemia: 'AT-01', warsaw: 'DE-05', 'baltic-corridor': 'NL-01',
  vienna: 'AT-01', danube: 'CH-02', 'carpathian-portal': 'CH-02',
  balkans: 'CH-01', 'western-ukraine': 'AT-01', kyiv: 'AT-01'
};

export interface RichMapPresentationAdapter {
  readonly legacyState: GameState;
  readonly regionForTerritory: Readonly<Record<string, string>>;
}

export function buildR5RichMapPresentation(
  board: TabletopBoardDefinition,
  force: TabletopPrototypeForce,
  game: TabletopGameState,
  selectedPieceId: string | null = null,
  selectedRegionId: string | null = null
): RichMapPresentationAdapter {
  const legacyState = newGame(5_605, 'standard', false);
  const pieces = Object.values(game.board.pieces);
  const taskGroups = Object.fromEntries(pieces.map((piece): [string, TaskGroup] => {
    const definition = force.definitions[piece.definitionId];
    return [piece.id, {
      id: piece.id,
      name: definition?.name ?? piece.definitionId,
      location: R5_REGION_TO_R3_TERRITORY[piece.regionId] ?? 'AT-01',
      personnel: piece.strength * 500,
      maxPersonnel: 3_000,
      functionalArmour: piece.traits.includes('armour') ? piece.strength * 12 : 0,
      damagedArmour: piece.readiness === 'damaged' ? 8 : piece.readiness === 'crippled' ? 16 : 0,
      morale: piece.readiness === 'ready' ? 90 : piece.readiness === 'damaged' ? 65 : 40,
      supply: piece.supply === 'supplied' ? 100 : piece.supply === 'strained' ? 55 : 15,
      status: piece.readiness === 'ready' ? 'ready' : 'recovering'
    }];
  }));
  const selectedPiece = selectedPieceId ? game.board.pieces[selectedPieceId] : undefined;
  const selectedR3Territory = R5_REGION_TO_R3_TERRITORY[selectedPiece?.regionId ?? selectedRegionId ?? 'paris'] ?? 'FR-02';
  const futureTerritories = new Set(pieces.filter(piece => piece.factionId === 'future-force').map(piece => R5_REGION_TO_R3_TERRITORY[piece.regionId]));
  const territories = Object.fromEntries(Object.entries(legacyState.territories).map(([id, territory]) => [id, {
    ...territory,
    controller: futureTerritories.has(id) ? 'player' as const : 'enemy' as const,
    occupation: futureTerritories.has(id) ? 'controlled' as const : 'enemy' as const,
    supplied: true
  }]));
  const knownRegions = new Set(board.regions.map(region => region.id));
  const regionForTerritory = Object.fromEntries(Object.entries(R5_REGION_TO_R3_TERRITORY)
    .filter(([region]) => knownRegions.has(region))
    .map(([region, territory]) => [territory, region]));

  return {
    legacyState: {
      ...legacyState,
      territories,
      taskGroups,
      enemyFormations: {},
      operations: {},
      selectedTaskGroupId: selectedPieceId ?? pieces[0]?.id ?? '',
      selectedTerritory: selectedR3Territory,
      targetTerritory: null,
      events: []
    },
    regionForTerritory
  };
}
