export type TabletopTerrain = 'urban' | 'plains' | 'forest' | 'mountain' | 'coastal' | 'river';
export type TabletopMarker = 'capital' | 'city' | 'hub' | 'crossing';
export type TabletopObjectiveType = 'capital' | 'command-hub' | 'supply-hub' | 'portal';
export type TabletopConnectionType = 'major-corridor' | 'route' | 'river-crossing' | 'mountain-pass' | 'sea-crossing';

export interface TabletopRegionDefinition {
  id: string;
  name: string;
  shortLabel: string;
  x: number;
  y: number;
  terrain: TabletopTerrain;
  markers: TabletopMarker[];
  objectiveId?: string;
}

export interface TabletopObjectiveDefinition {
  id: string;
  regionId: string;
  label: string;
  type: TabletopObjectiveType;
}

export interface TabletopConnectionDefinition {
  id: string;
  a: string;
  b: string;
  type: TabletopConnectionType;
  label?: string;
}

export interface TabletopBoardDefinition {
  id: string;
  name: string;
  subtitle: string;
  maxRounds: number;
  regions: TabletopRegionDefinition[];
  objectives: TabletopObjectiveDefinition[];
  connections: TabletopConnectionDefinition[];
}

export const CENTRAL_FRONT_BOARD: TabletopBoardDefinition = {
  id: 'central-front-v0.1',
  name: 'The Central Front',
  subtitle: 'London to Kyiv • R5 tabletop prototype',
  maxRounds: 8,
  regions: [
    { id: 'london', name: 'London', shortLabel: 'London', x: 85, y: 285, terrain: 'urban', markers: ['capital', 'hub'], objectiveId: 'obj-london' },
    { id: 'channel-approaches', name: 'Channel Approaches', shortLabel: 'Channel', x: 205, y: 345, terrain: 'coastal', markers: ['crossing'] },
    { id: 'paris', name: 'Paris Basin', shortLabel: 'Paris', x: 315, y: 390, terrain: 'urban', markers: ['capital', 'hub'], objectiveId: 'obj-paris' },
    { id: 'low-countries', name: 'Low Countries', shortLabel: 'Low Countries', x: 350, y: 285, terrain: 'plains', markers: ['city', 'crossing'] },
    { id: 'ruhr', name: 'Ruhr Industrial Belt', shortLabel: 'Ruhr', x: 480, y: 320, terrain: 'urban', markers: ['hub'], objectiveId: 'obj-ruhr' },
    { id: 'rhine', name: 'Rhine Corridor', shortLabel: 'Rhine', x: 465, y: 425, terrain: 'river', markers: ['crossing', 'hub'] },
    { id: 'alpine-west', name: 'Western Alps', shortLabel: 'Alps', x: 500, y: 545, terrain: 'mountain', markers: ['crossing'] },
    { id: 'north-germany', name: 'North German Plain', shortLabel: 'N. Germany', x: 615, y: 270, terrain: 'plains', markers: ['hub'] },
    { id: 'berlin', name: 'Berlin', shortLabel: 'Berlin', x: 720, y: 320, terrain: 'urban', markers: ['capital', 'hub'], objectiveId: 'obj-berlin' },
    { id: 'bohemia', name: 'Bohemian Basin', shortLabel: 'Bohemia', x: 655, y: 430, terrain: 'forest', markers: ['city'] },
    { id: 'warsaw', name: 'Warsaw', shortLabel: 'Warsaw', x: 850, y: 340, terrain: 'urban', markers: ['capital', 'hub'] },
    { id: 'baltic-corridor', name: 'Baltic Corridor', shortLabel: 'Baltic', x: 835, y: 225, terrain: 'coastal', markers: ['city'] },
    { id: 'vienna', name: 'Vienna', shortLabel: 'Vienna', x: 695, y: 545, terrain: 'urban', markers: ['capital', 'hub'], objectiveId: 'obj-vienna' },
    { id: 'danube', name: 'Danube Corridor', shortLabel: 'Danube', x: 815, y: 585, terrain: 'river', markers: ['crossing', 'hub'] },
    { id: 'carpathian-portal', name: 'Carpathian Portal', shortLabel: 'Carpathians', x: 900, y: 500, terrain: 'mountain', markers: ['crossing', 'hub'], objectiveId: 'obj-carpathians' },
    { id: 'balkans', name: 'Northern Balkans', shortLabel: 'Balkans', x: 740, y: 660, terrain: 'mountain', markers: ['city'] },
    { id: 'western-ukraine', name: 'Western Ukraine', shortLabel: 'W. Ukraine', x: 1015, y: 455, terrain: 'plains', markers: ['hub'] },
    { id: 'kyiv', name: 'Kyiv', shortLabel: 'Kyiv', x: 1120, y: 405, terrain: 'urban', markers: ['capital', 'hub'], objectiveId: 'obj-kyiv' }
  ],
  objectives: [
    { id: 'obj-london', regionId: 'london', label: 'London', type: 'capital' },
    { id: 'obj-paris', regionId: 'paris', label: 'Paris', type: 'capital' },
    { id: 'obj-ruhr', regionId: 'ruhr', label: 'Ruhr', type: 'supply-hub' },
    { id: 'obj-berlin', regionId: 'berlin', label: 'Berlin', type: 'capital' },
    { id: 'obj-vienna', regionId: 'vienna', label: 'Vienna', type: 'command-hub' },
    { id: 'obj-carpathians', regionId: 'carpathian-portal', label: 'Carpathian Portal', type: 'portal' },
    { id: 'obj-kyiv', regionId: 'kyiv', label: 'Kyiv', type: 'capital' }
  ],
  connections: [
    { id: 'r01', a: 'london', b: 'channel-approaches', type: 'sea-crossing', label: 'Channel lift' },
    { id: 'r02', a: 'london', b: 'low-countries', type: 'sea-crossing', label: 'North Sea route' },
    { id: 'r03', a: 'channel-approaches', b: 'paris', type: 'major-corridor', label: 'Channel–Paris corridor' },
    { id: 'r04', a: 'channel-approaches', b: 'low-countries', type: 'route' },
    { id: 'r05', a: 'paris', b: 'low-countries', type: 'major-corridor' },
    { id: 'r06', a: 'paris', b: 'rhine', type: 'major-corridor' },
    { id: 'r07', a: 'paris', b: 'alpine-west', type: 'route' },
    { id: 'r08', a: 'low-countries', b: 'ruhr', type: 'major-corridor' },
    { id: 'r09', a: 'low-countries', b: 'north-germany', type: 'major-corridor' },
    { id: 'r10', a: 'ruhr', b: 'rhine', type: 'river-crossing' },
    { id: 'r11', a: 'ruhr', b: 'north-germany', type: 'major-corridor' },
    { id: 'r12', a: 'rhine', b: 'alpine-west', type: 'mountain-pass' },
    { id: 'r13', a: 'rhine', b: 'north-germany', type: 'route' },
    { id: 'r14', a: 'alpine-west', b: 'vienna', type: 'mountain-pass' },
    { id: 'r15', a: 'alpine-west', b: 'bohemia', type: 'mountain-pass' },
    { id: 'r16', a: 'north-germany', b: 'berlin', type: 'major-corridor' },
    { id: 'r17', a: 'north-germany', b: 'bohemia', type: 'route' },
    { id: 'r18', a: 'north-germany', b: 'warsaw', type: 'major-corridor' },
    { id: 'r19', a: 'north-germany', b: 'baltic-corridor', type: 'route' },
    { id: 'r20', a: 'berlin', b: 'bohemia', type: 'route' },
    { id: 'r21', a: 'berlin', b: 'warsaw', type: 'major-corridor' },
    { id: 'r22', a: 'berlin', b: 'baltic-corridor', type: 'route' },
    { id: 'r23', a: 'bohemia', b: 'warsaw', type: 'route' },
    { id: 'r24', a: 'bohemia', b: 'vienna', type: 'major-corridor' },
    { id: 'r25', a: 'bohemia', b: 'carpathian-portal', type: 'mountain-pass' },
    { id: 'r26', a: 'warsaw', b: 'baltic-corridor', type: 'route' },
    { id: 'r27', a: 'warsaw', b: 'western-ukraine', type: 'major-corridor' },
    { id: 'r28', a: 'warsaw', b: 'carpathian-portal', type: 'mountain-pass' },
    { id: 'r29', a: 'vienna', b: 'danube', type: 'river-crossing' },
    { id: 'r30', a: 'vienna', b: 'carpathian-portal', type: 'mountain-pass' },
    { id: 'r31', a: 'vienna', b: 'balkans', type: 'major-corridor' },
    { id: 'r32', a: 'danube', b: 'carpathian-portal', type: 'river-crossing' },
    { id: 'r33', a: 'danube', b: 'balkans', type: 'river-crossing' },
    { id: 'r34', a: 'danube', b: 'western-ukraine', type: 'route' },
    { id: 'r35', a: 'carpathian-portal', b: 'balkans', type: 'mountain-pass' },
    { id: 'r36', a: 'carpathian-portal', b: 'western-ukraine', type: 'mountain-pass' },
    { id: 'r37', a: 'carpathian-portal', b: 'kyiv', type: 'major-corridor' },
    { id: 'r38', a: 'western-ukraine', b: 'kyiv', type: 'major-corridor' },
    { id: 'r39', a: 'balkans', b: 'western-ukraine', type: 'route' }
  ]
};

export function connectionsForRegion(board: TabletopBoardDefinition, regionId: string): TabletopConnectionDefinition[] {
  return board.connections.filter((connection) => connection.a === regionId || connection.b === regionId);
}

export function adjacentRegionIds(board: TabletopBoardDefinition, regionId: string): string[] {
  return connectionsForRegion(board, regionId).map((connection) => (
    connection.a === regionId ? connection.b : connection.a
  ));
}

export function validateTabletopBoard(board: TabletopBoardDefinition): string[] {
  const errors: string[] = [];
  const regionIds = new Set<string>();
  const objectiveIds = new Set<string>();
  const undirectedLinks = new Set<string>();

  for (const region of board.regions) {
    if (regionIds.has(region.id)) errors.push(`Duplicate region id: ${region.id}`);
    regionIds.add(region.id);
  }

  for (const objective of board.objectives) {
    if (objectiveIds.has(objective.id)) errors.push(`Duplicate objective id: ${objective.id}`);
    objectiveIds.add(objective.id);
    if (!regionIds.has(objective.regionId)) errors.push(`Objective ${objective.id} references unknown region ${objective.regionId}`);
    const region = board.regions.find((candidate) => candidate.id === objective.regionId);
    if (region && region.objectiveId !== objective.id) {
      errors.push(`Objective ${objective.id} does not match region ${objective.regionId} objectiveId`);
    }
  }

  for (const region of board.regions) {
    if (region.objectiveId && !objectiveIds.has(region.objectiveId)) {
      errors.push(`Region ${region.id} references unknown objective ${region.objectiveId}`);
    }
  }

  for (const connection of board.connections) {
    if (!regionIds.has(connection.a)) errors.push(`Connection ${connection.id} references unknown region ${connection.a}`);
    if (!regionIds.has(connection.b)) errors.push(`Connection ${connection.id} references unknown region ${connection.b}`);
    if (connection.a === connection.b) errors.push(`Connection ${connection.id} is a self-link`);
    const linkKey = [connection.a, connection.b].sort().join('::');
    if (undirectedLinks.has(linkKey)) errors.push(`Duplicate undirected link: ${linkKey}`);
    undirectedLinks.add(linkKey);
  }

  for (const region of board.regions) {
    if (connectionsForRegion(board, region.id).length === 0) errors.push(`Isolated region: ${region.id}`);
  }

  return errors;
}

const boardErrors = validateTabletopBoard(CENTRAL_FRONT_BOARD);
if (boardErrors.length > 0) {
  throw new Error(`Invalid Central Front board:\n${boardErrors.join('\n')}`);
}
