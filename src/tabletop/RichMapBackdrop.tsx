import { useMemo, useState } from 'react';
import { TerrainMapPrototypeImpl } from '../components/TerrainMapPrototypeImpl';
import type { TabletopBoardDefinition } from './board';
import type { TabletopPrototypeForce } from './pieces';
import type { TabletopGameState } from './state';
import { buildR5RichMapPresentation } from './rich-map-adapter';

interface Props {
  board: TabletopBoardDefinition;
  force: TabletopPrototypeForce;
  game: TabletopGameState;
  selectedPieceId: string | null;
  selectedRegionId: string | null;
  onSelectPiece: (pieceId: string) => void;
  onSelectRegion: (regionId: string) => void;
}

export function RichMapBackdrop(props: Props) {
  const [available, setAvailable] = useState(true);
  const scene = useMemo(() => buildR5RichMapPresentation(
    props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId
  ), [props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId]);
  if (!available) return <div className="r5-rich-map-fallback" aria-label="Terrain renderer unavailable" />;
  return <div className="r5-rich-map" aria-label="Physical terrain, landmark and formation presentation">
    <TerrainMapPrototypeImpl
      state={scene.legacyState}
      onSelect={territoryId => {
        const regionId = scene.regionForTerritory[territoryId];
        if (regionId) props.onSelectRegion(regionId);
      }}
      onSelectGroup={props.onSelectPiece}
      onFallback={() => setAvailable(false)}
      presentationProfile="full"
    />
  </div>;
}
