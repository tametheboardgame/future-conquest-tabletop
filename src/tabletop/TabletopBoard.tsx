import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  adjacentRegionIds,
  connectionsForRegion,
  type TabletopBoardDefinition,
  type TabletopRegionDefinition
} from './board';
import type { TabletopPrototypeForce } from './pieces';
import type { TabletopFormationTrait, TabletopPieceState } from './state';

function terrainGlyph(region: TabletopRegionDefinition): string {
  switch (region.terrain) {
    case 'mountain': return '▲';
    case 'river': return '≈';
    case 'forest': return '♣';
    case 'coastal': return '≋';
    case 'urban': return '◆';
    default: return '•';
  }
}

function traitGlyph(trait: TabletopFormationTrait): string {
  switch (trait) {
    case 'infantry': return 'I';
    case 'armour': return 'A';
    case 'artillery': return 'R';
    case 'engineer': return 'E';
    case 'elite-future-tech': return '✦';
  }
}

function traitName(trait: TabletopFormationTrait): string {
  switch (trait) {
    case 'infantry': return 'Infantry';
    case 'armour': return 'Armour';
    case 'artillery': return 'Artillery';
    case 'engineer': return 'Engineer';
    case 'elite-future-tech': return 'Future Tech';
  }
}

const pieceOffsets = [
  { x: -25, y: -56 },
  { x: 25, y: -56 },
  { x: -25, y: -91 },
  { x: 25, y: -91 },
  { x: 0, y: -126 }
];

function piecesByRegion(pieces: TabletopPieceState[]): Map<string, TabletopPieceState[]> {
  const result = new Map<string, TabletopPieceState[]>();
  for (const piece of pieces) {
    const regionPieces = result.get(piece.regionId) ?? [];
    regionPieces.push(piece);
    result.set(piece.regionId, regionPieces);
  }
  return result;
}

interface TabletopBoardProps {
  board: TabletopBoardDefinition;
  force: TabletopPrototypeForce;
}

export function TabletopBoard({ board, force }: TabletopBoardProps) {
  const [selectedRegionId, setSelectedRegionId] = useState('paris');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const regionsById = useMemo(
    () => new Map(board.regions.map((region) => [region.id, region])),
    [board.regions]
  );
  const regionPieces = useMemo(() => piecesByRegion(force.pieces), [force.pieces]);
  const selectedPiece = selectedPieceId
    ? force.pieces.find((piece) => piece.id === selectedPieceId) ?? null
    : null;
  const selectedDefinition = selectedPiece ? force.definitions[selectedPiece.definitionId] : null;
  const selectedRegion = regionsById.get(selectedPiece?.regionId ?? selectedRegionId) ?? board.regions[0];
  const topologyDestinationIds = useMemo(
    () => new Set(selectedPiece ? adjacentRegionIds(board, selectedPiece.regionId) : []),
    [board, selectedPiece]
  );
  const adjacent = selectedRegion
    ? adjacentRegionIds(board, selectedRegion.id).flatMap((id) => {
        const region = regionsById.get(id);
        return region ? [region] : [];
      })
    : [];
  const selectedConnections = selectedRegion ? connectionsForRegion(board, selectedRegion.id) : [];
  const objectiveByRegion = useMemo(
    () => new Map(board.objectives.map((objective) => [objective.regionId, objective])),
    [board.objectives]
  );
  const futureCount = force.pieces.filter((piece) => piece.factionId === 'future-force').length;
  const coalitionCount = force.pieces.length - futureCount;

  const selectPiece = (piece: TabletopPieceState) => {
    setSelectedPieceId(piece.id);
    setSelectedRegionId(piece.regionId);
  };

  const selectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    if (!topologyDestinationIds.has(regionId)) setSelectedPieceId(null);
  };

  return (
    <main className="tabletop-shell">
      <header className="tabletop-header">
        <div className="tabletop-brand">
          <span className="tabletop-eyebrow">Future Conquest</span>
          <div>
            <h1>{board.name}</h1>
            <p>{board.subtitle}</p>
          </div>
        </div>
        <div className="tabletop-round-strip" aria-label="Prototype status">
          <div><span>Build</span><strong>R5-WP1.2</strong></div>
          <div><span>Future</span><strong>{futureCount}</strong></div>
          <div><span>Coalition</span><strong>{coalitionCount}</strong></div>
        </div>
      </header>

      <section className="tabletop-board-stage" aria-label={`${board.name} strategic board`}>
        <svg className="tabletop-board-svg" viewBox="0 150 1200 580" role="img" aria-label="Strategic tabletop map from London to Kyiv">
          <defs>
            <pattern id="tabletop-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" className="tabletop-grid-line" fill="none" />
            </pattern>
            <filter id="tabletop-shadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="8" stdDeviation="7" floodOpacity="0.35" />
            </filter>
          </defs>

          <rect x="0" y="150" width="1200" height="580" className="tabletop-water" />
          <rect x="0" y="150" width="1200" height="580" fill="url(#tabletop-grid)" />
          <path
            className="tabletop-landmass"
            d="M35 240 C120 190 210 235 265 270 C360 215 475 210 565 225 C670 175 805 185 905 220 C1035 235 1145 305 1190 370 L1180 520 C1080 590 1010 585 925 555 C850 700 700 735 610 650 C520 665 430 620 390 535 C275 535 185 480 125 410 C75 390 45 330 35 240 Z"
          />

          <g aria-label="Strategic routes">
            {board.connections.map((connection) => {
              const a = regionsById.get(connection.a);
              const b = regionsById.get(connection.b);
              if (!a || !b) return null;
              const focusRegionId = selectedPiece?.regionId ?? selectedRegion?.id;
              const highlighted = focusRegionId
                ? connection.a === focusRegionId || connection.b === focusRegionId
                : false;
              return (
                <line
                  key={connection.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={`tabletop-route tabletop-route--${connection.type}${highlighted ? ' is-highlighted' : ''}`}
                >
                  <title>{connection.label ?? `${a.name} to ${b.name}`} · {connection.type}</title>
                </line>
              );
            })}
          </g>

          <g aria-label="Strategic regions">
            {board.regions.map((region) => {
              const selected = region.id === selectedRegion?.id;
              const objective = objectiveByRegion.get(region.id);
              const destination = topologyDestinationIds.has(region.id);
              return (
                <g
                  key={region.id}
                  transform={`translate(${region.x} ${region.y})`}
                  className={`tabletop-region tabletop-region--${region.terrain}${selected ? ' is-selected' : ''}${objective ? ' is-objective' : ''}${destination ? ' is-destination' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${region.name}, ${region.terrain}${objective ? `, objective ${objective.label}` : ''}${destination ? ', potential destination' : ''}`}
                  aria-pressed={selected}
                  onClick={() => selectRegion(region.id)}
                  onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectRegion(region.id);
                    }
                  }}
                >
                  {destination && <circle className="tabletop-destination-ring" r="45" />}
                  <circle className="tabletop-region-halo" r={objective ? 39 : 34} />
                  <circle className="tabletop-region-disc" r={objective ? 28 : 24} filter="url(#tabletop-shadow)" />
                  <text className="tabletop-region-glyph" textAnchor="middle" y="5">{terrainGlyph(region)}</text>
                  {objective && <circle className="tabletop-objective-ring" r="34" />}
                  <text className="tabletop-region-label" textAnchor="middle" y={objective ? 55 : 49}>{region.shortLabel}</text>
                  {region.markers.includes('hub') && <text className="tabletop-marker" textAnchor="middle" x="31" y="-24">H</text>}
                  {region.markers.includes('crossing') && <text className="tabletop-marker" textAnchor="middle" x="-31" y="-24">X</text>}
                  {objective && <text className="tabletop-objective-star" textAnchor="middle" x="0" y="-40">★</text>}
                </g>
              );
            })}
          </g>

          <g aria-label="Formation pieces">
            {board.regions.flatMap((region) => {
              const pieces = regionPieces.get(region.id) ?? [];
              return pieces.map((piece, index) => {
                const definition = force.definitions[piece.definitionId];
                if (!definition) return null;
                const offset = pieceOffsets[index] ?? { x: (index - 2) * 18, y: -126 };
                const selected = piece.id === selectedPieceId;
                const composition = piece.traits.map(traitGlyph).join('');
                return (
                  <g
                    key={piece.id}
                    transform={`translate(${region.x + offset.x} ${region.y + offset.y})`}
                    className={`tabletop-piece tabletop-piece--${piece.factionId}${selected ? ' is-selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${definition.name}, strength ${piece.strength}, ${piece.traits.map(traitName).join(', ')}`}
                    aria-pressed={selected}
                    onClick={(event: MouseEvent<SVGGElement>) => {
                      event.stopPropagation();
                      selectPiece(piece);
                    }}
                    onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        selectPiece(piece);
                      }
                    }}
                  >
                    <rect className="tabletop-piece-shadow" x="-22" y="-15" width="44" height="34" rx="4" />
                    <rect className="tabletop-piece-counter" x="-22" y="-18" width="44" height="34" rx="4" />
                    <text className="tabletop-piece-name" textAnchor="middle" y="-5">{definition.shortLabel}</text>
                    <text className="tabletop-piece-composition" textAnchor="start" x="-17" y="9">{composition}</text>
                    <text className="tabletop-piece-strength" textAnchor="end" x="17" y="9">{piece.strength}</text>
                  </g>
                );
              });
            })}
          </g>
        </svg>

        <div className="tabletop-legend" aria-label="Map legend">
          <span><i className="legend-piece legend-piece--future" /> Future Force</span>
          <span><i className="legend-piece legend-piece--coalition" /> Coalition</span>
          <span><i className="legend-destination" /> Potential move</span>
          <span><b>★</b> Objective</span>
          <span><b>H</b> Hub</span>
        </div>

        {selectedPiece && selectedDefinition && selectedRegion ? (
          <aside className="tabletop-inspector tabletop-piece-inspector" aria-live="polite">
            <div className="tabletop-inspector-heading">
              <div>
                <span>{selectedPiece.factionId === 'future-force' ? 'Future Force' : 'Present-Day Coalition'}</span>
                <h2>{selectedDefinition.name}</h2>
              </div>
              <strong>STR {selectedPiece.strength}</strong>
            </div>
            <div className="tabletop-piece-traits">
              {selectedPiece.traits.map((trait) => <span key={trait}>{traitName(trait)}</span>)}
            </div>
            <p className="tabletop-adjacent-list">
              <span>Position</span>
              {selectedRegion.name}
            </p>
            <p className="tabletop-adjacent-list">
              <span>Potential destinations</span>
              {adjacent.map((region) => region.shortLabel).join(' · ')}
            </p>
          </aside>
        ) : selectedRegion && (
          <aside className="tabletop-inspector" aria-live="polite">
            <div className="tabletop-inspector-heading">
              <div>
                <span>{selectedRegion.terrain}</span>
                <h2>{selectedRegion.name}</h2>
              </div>
              {objectiveByRegion.get(selectedRegion.id) && <strong>Objective</strong>}
            </div>
            <div className="tabletop-inspector-stats">
              <div><span>Links</span><strong>{selectedConnections.length}</strong></div>
              <div><span>Adjacent</span><strong>{adjacent.length}</strong></div>
              <div><span>Forces</span><strong>{regionPieces.get(selectedRegion.id)?.length ?? 0}</strong></div>
            </div>
            <p className="tabletop-adjacent-list">
              <span>Connected to</span>
              {adjacent.map((region) => region.shortLabel).join(' · ')}
            </p>
          </aside>
        )}

        <div className="tabletop-prototype-note">
          Select a formation to preview adjacent destinations. Movement execution arrives in WP2.
        </div>
      </section>
    </main>
  );
}
