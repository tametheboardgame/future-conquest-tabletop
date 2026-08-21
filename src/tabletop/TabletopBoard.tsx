import { useMemo, useState } from 'react';
import {
  adjacentRegionIds,
  connectionsForRegion,
  type TabletopBoardDefinition,
  type TabletopRegionDefinition
} from './board';

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

export function TabletopBoard({ board }: { board: TabletopBoardDefinition }) {
  const [selectedRegionId, setSelectedRegionId] = useState('paris');
  const regionsById = useMemo(
    () => new Map(board.regions.map((region) => [region.id, region])),
    [board.regions]
  );
  const selectedRegion = regionsById.get(selectedRegionId) ?? board.regions[0];
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
          <div><span>Build</span><strong>R5-WP1.1</strong></div>
          <div><span>Round</span><strong>1 / {board.maxRounds}</strong></div>
          <div><span>Objectives</span><strong>{board.objectives.length}</strong></div>
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
              const highlighted = selectedRegion
                ? connection.a === selectedRegion.id || connection.b === selectedRegion.id
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
              return (
                <g
                  key={region.id}
                  transform={`translate(${region.x} ${region.y})`}
                  className={`tabletop-region tabletop-region--${region.terrain}${selected ? ' is-selected' : ''}${objective ? ' is-objective' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${region.name}, ${region.terrain}${objective ? `, objective ${objective.label}` : ''}`}
                  aria-pressed={selected}
                  onClick={() => setSelectedRegionId(region.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedRegionId(region.id);
                    }
                  }}
                >
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
        </svg>

        <div className="tabletop-legend" aria-label="Map legend">
          <span><i className="legend-line legend-line--major" /> Major corridor</span>
          <span><i className="legend-line legend-line--route" /> Route</span>
          <span><i className="legend-line legend-line--pass" /> Pass / crossing</span>
          <span><b>★</b> Objective</span>
          <span><b>H</b> Hub</span>
        </div>

        {selectedRegion && (
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
              <div><span>Markers</span><strong>{selectedRegion.markers.length}</strong></div>
            </div>
            <p className="tabletop-adjacent-list">
              <span>Connected to</span>
              {adjacent.map((region) => region.shortLabel).join(' · ')}
            </p>
          </aside>
        )}

        <div className="tabletop-prototype-note">
          Board only. Formations and legal moves arrive in WP1.2.
        </div>
      </section>
    </main>
  );
}
