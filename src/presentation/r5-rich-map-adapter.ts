import type { TabletopBoardDefinition, TabletopTerrain } from '../tabletop/board';
import { legalTargets, type CoreActionType } from '../tabletop/core-actions';
import type { TabletopFormationDefinition } from '../tabletop/pieces';
import type { TabletopFactionId, TabletopGameState } from '../tabletop/state';
import { R3_PHYSICAL_TERRAIN_ASSET_PATH } from './r3-physical-terrain-colour';
import { landmarkMiniatureAssetForNode } from './r3-landmark-miniature-assets';

export const R5_RICH_MAP_SCENE_VERSION = 1 as const;

export interface R5RichMapRegionPresentation {
  renderId: `r5-region:${string}`;
  regionId: string;
  label: string;
  x: number;
  y: number;
  terrain: TabletopTerrain;
  objective: boolean;
  selected: boolean;
  legalTarget: boolean;
  landmarkAssetId?: string;
}

export interface R5RichMapFormationPresentation {
  renderId: `r5-formation:${string}`;
  pieceId: string;
  regionId: string;
  label: string;
  factionId: TabletopFactionId;
  strength: number;
  selected: boolean;
}

export interface R5RichMapFrame {
  sceneVersion: typeof R5_RICH_MAP_SCENE_VERSION;
  authority: 'r5-tabletop';
  terrainAssetUrl: string;
  regions: readonly R5RichMapRegionPresentation[];
  formations: readonly R5RichMapFormationPresentation[];
  legalTargetRegionIds: readonly string[];
}

/**
 * Projects immutable R5 rules state into renderer-only IDs and coordinates.
 * Selection is transient input; legality always comes from the tabletop dispatcher.
 */
const LANDMARK_NODE_BY_REGION: Readonly<Record<string, string>> = { london: 'N-LONDON', paris: 'N-PARIS', 'low-countries': 'N-BRUSSELS' };

export function buildR5RichMapFrame(input: {
  board: TabletopBoardDefinition;
  game: Readonly<TabletopGameState>;
  definitions: Readonly<Record<string, TabletopFormationDefinition>>;
  selectedPieceId: string | null;
  selectedRegionId: string | null;
  action: CoreActionType;
}): R5RichMapFrame {
  const targets = legalTargets(input.game, input.action, input.selectedPieceId ?? undefined);
  const targetSet = new Set(targets);
  return Object.freeze({
    sceneVersion: R5_RICH_MAP_SCENE_VERSION,
    authority: 'r5-tabletop' as const,
    terrainAssetUrl: `${import.meta.env.BASE_URL}${R3_PHYSICAL_TERRAIN_ASSET_PATH}`,
    legalTargetRegionIds: Object.freeze([...targets]),
    regions: Object.freeze(input.board.regions.map(region => Object.freeze({
      renderId: `r5-region:${region.id}` as const,
      regionId: region.id,
      label: region.name,
      x: region.x,
      y: region.y,
      terrain: region.terrain,
      objective: Boolean(region.objectiveId),
      selected: region.id === input.selectedRegionId,
      legalTarget: targetSet.has(region.id),
      landmarkAssetId: landmarkMiniatureAssetForNode(LANDMARK_NODE_BY_REGION[region.id] ?? '')?.assetId
    }))),
    formations: Object.freeze(Object.values(input.game.board.pieces).map(piece => Object.freeze({
      renderId: `r5-formation:${piece.id}` as const,
      pieceId: piece.id,
      regionId: piece.regionId,
      label: input.definitions[piece.definitionId]?.shortLabel ?? piece.definitionId,
      factionId: piece.factionId,
      strength: piece.strength,
      selected: piece.id === input.selectedPieceId
    })))
  });
}
