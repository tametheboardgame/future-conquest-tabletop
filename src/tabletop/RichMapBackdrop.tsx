import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { loadTerrainMapModule, prewarmTerrainMapModule } from '../presentation/r3-terrain-loader';
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

const LazyTerrainMap = lazy(() => loadTerrainMapModule().then(module => ({ default: module.TerrainMapPrototype })));
const LazyStableMap = lazy(async () => {
  const module = await import('../components/MapView');
  return { default: module.MapView };
});

export function RichMapBackdrop(props: Props) {
  const [available, setAvailable] = useState(true);
  const scene = useMemo(() => buildR5RichMapPresentation(
    props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId
  ), [props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId]);
  useEffect(() => {
    prewarmTerrainMapModule();
  }, []);
  if (!available) return <div className="r5-rich-map-fallback" aria-label="Terrain renderer unavailable">
    <Suspense fallback={<div role="status">Loading stable command map…</div>}><LazyStableMap
      state={scene.legacyState}
      onSelect={territoryId => {
        const regionId = scene.regionForTerritory[territoryId];
        if (regionId) props.onSelectRegion(regionId);
      }}
      onSelectGroup={props.onSelectPiece}
    /></Suspense>
  </div>;
  return <div className="r5-rich-map" aria-label="Physical terrain, landmark and formation presentation">
    <Suspense fallback={<div className="r3-terrain-prototype-loading" role="status">Loading terrain command map…</div>}><LazyTerrainMap
      state={scene.legacyState}
      onSelect={territoryId => {
        const regionId = scene.regionForTerritory[territoryId];
        if (regionId) props.onSelectRegion(regionId);
      }}
      onSelectGroup={props.onSelectPiece}
      onFallback={() => setAvailable(false)}
      presentationProfile="full"
    /></Suspense>
  </div>;
}
