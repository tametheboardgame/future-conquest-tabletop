import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from 'react';
import type { TerrainMapPrototypeProps } from '../components/TerrainMapPrototypeImpl';
import { R5_GAME_REVEALED_EVENT } from './launch-transition';
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

const LazyTerrainMap = lazy(async () => {
  const module = await import('../components/TerrainMapPrototypeImpl');
  return { default: module.TerrainMapPrototypeImpl } as { default: ComponentType<TerrainMapPrototypeProps> };
});
const LazyStableMap = lazy(async () => {
  const module = await import('../components/MapView');
  return { default: module.MapView };
});

export function RichMapBackdrop(props: Props) {
  const [available, setAvailable] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const scene = useMemo(() => buildR5RichMapPresentation(
    props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId
  ), [props.board, props.force, props.game, props.selectedPieceId, props.selectedRegionId]);
  useEffect(() => {
    let frame: number | undefined;
    let delay: number | undefined;
    const reveal = () => {
      // Give the launcher-removal and shell-layout frames priority. Importing
      // MapLibre and allocating WebGL resources must never block that paint.
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          // Keep a short, bounded interaction window for the newly revealed
          // shell before optional GPU work starts.
          delay = window.setTimeout(() => {
            const forceRichPath = new URLSearchParams(window.location.search).get('r5RichPath') === 'force';
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            const debug = gl?.getExtension('WEBGL_debug_renderer_info');
            const renderer = debug ? String(gl?.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? '') : '';
            gl?.getExtension('WEBGL_lose_context')?.loseContext();
            if (!forceRichPath && /swiftshader|software/i.test(renderer)) {
              console.warn(`Software WebGL renderer detected (${renderer}); using the stable command map.`);
              setAvailable(false);
              return;
            }
            setRevealed(true);
          }, 1_000);
        });
      });
    };
    window.addEventListener(R5_GAME_REVEALED_EVENT, reveal, { once: true });
    return () => {
      window.removeEventListener(R5_GAME_REVEALED_EVENT, reveal);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      if (delay !== undefined) window.clearTimeout(delay);
    };
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
    {!revealed ? <div className="r3-terrain-prototype-loading" role="status">Terrain renderer staged until campaign launch…</div> : <Suspense fallback={<div className="r3-terrain-prototype-loading" role="status">Loading terrain command map…</div>}><LazyTerrainMap
      state={scene.legacyState}
      onSelect={territoryId => {
        const regionId = scene.regionForTerritory[territoryId];
        if (regionId) props.onSelectRegion(regionId);
      }}
      onSelectGroup={props.onSelectPiece}
      onFallback={() => setAvailable(false)}
      presentationProfile="full"
    /></Suspense>}
  </div>;
}
