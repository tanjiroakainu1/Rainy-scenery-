import * as THREE from 'three'

export const CASTLE = {
  wallHeight: 5,
  upperRise: 5,
  wallThickness: 0.6,
  corridorWidth: 6.5,
  outerSize: 72,
  innerSize: 48,
  towerRadius: 4.5,
  towerHeight: 16,
  gateWidth: 6,
  playerHeight: 1.7,
  playerRadius: 0.38,
  moveSpeed: 5,
  lookSensitivity: 0.002,
  mobileLookSensitivity: 0.004,
  groundEyeY: 1.7,
  upperEyeY: 6.7,
  outdoorExtent: 42,
} as const

export const COLORS = {
  stoneDark: '#4a4642',
  stoneMid: '#5a5550',
  stoneLight: '#6a6560',
  floor: '#3a3632',
  upperFloor: '#423e3a',
  grass: '#1a2418',
  grassLight: '#243020',
  path: '#2a2620',
  bark: '#2a1e14',
  foliage: '#0f1a0c',
  torch: '#ff9933',
  fog: '#1a1824',
  blood: '#5a1010',
  iron: '#4a4a4e',
} as const

export type WallSegment = {
  position: [number, number, number]
  size: [number, number, number]
}

export type Pillar = {
  position: [number, number, number]
  radius: number
  height: number
}

export type Torch = {
  position: [number, number, number]
  flickerOffset: number
}

export type StairStep = {
  position: [number, number, number]
  size: [number, number, number]
}

export type StairZone = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  bottomY: number
  topY: number
  axis: 'x' | 'z'
  ascending: boolean
}

export type FloorZone = {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  eyeY: number
}

export type MapPath = {
  x: number
  z: number
  w: number
  d: number
  level: 'ground' | 'upper'
}

export type MapWallLine = {
  x1: number
  z1: number
  x2: number
  z2: number
}

export type CastleLayout = {
  walls: WallSegment[]
  pillars: Pillar[]
  torches: Torch[]
  stairs: StairStep[]
  upperFloors: WallSegment[]
  stairZones: StairZone[]
  floorZones: FloorZone[]
  mapPaths: MapPath[]
  mapWallLines: MapWallLine[]
  spawn: [number, number, number]
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  half: number
}

function addWall(
  walls: WallSegment[],
  x: number,
  z: number,
  w: number,
  d: number,
  height: number = CASTLE.wallHeight,
  yBase = 0,
) {
  walls.push({
    position: [x, yBase + height / 2, z],
    size: [w, height, d],
  })
}

function addFloor(
  floors: WallSegment[],
  x: number,
  z: number,
  w: number,
  d: number,
  y: number,
) {
  floors.push({
    position: [x, y, z],
    size: [w, 0.25, d],
  })
}

function addMapPath(paths: MapPath[], x: number, z: number, w: number, d: number, level: MapPath['level'] = 'ground') {
  paths.push({ x, z, w, d, level })
}

function wallToMapLine(wall: WallSegment): MapWallLine | null {
  if (wall.position[1] > 8) return null
  const [wx, , wz] = wall.position
  const [sw, , sd] = wall.size
  if (sw >= sd) {
    return { x1: wx - sw / 2, z1: wz, x2: wx + sw / 2, z2: wz }
  }
  return { x1: wx, z1: wz - sd / 2, x2: wx, z2: wz + sd / 2 }
}

function buildMapData(
  walls: WallSegment[],
  floorZones: FloorZone[],
  half: number,
  innerHalf: number,
  corridorWidth: number,
  outdoorExtent: number,
): { mapPaths: MapPath[]; mapWallLines: MapWallLine[] } {
  const mapPaths: MapPath[] = []
  const ring = half - innerHalf
  const cw = corridorWidth

  // Outdoor path from woods to gate
  addMapPath(mapPaths, 0, half + outdoorExtent / 2, 4, outdoorExtent - 2)

  // Inner courtyard
  addMapPath(mapPaths, 0, 0, innerHalf * 2 - 1.5, innerHalf * 2 - 1.5)

  // Four main corridors through inner walls (N / S / E / W)
  addMapPath(mapPaths, 0, -(innerHalf + ring / 2), cw, ring)
  addMapPath(mapPaths, 0, innerHalf + ring / 2, cw, ring)
  addMapPath(mapPaths, innerHalf + ring / 2, 0, ring, cw)
  addMapPath(mapPaths, -(innerHalf + ring / 2), 0, ring, cw)

  // Outer ring walkways (along each side)
  addMapPath(mapPaths, 0, -(half - ring / 2), half * 2 - 14, ring)
  addMapPath(mapPaths, 0, half - ring / 2, half * 2 - 14, ring)
  addMapPath(mapPaths, -(half - ring / 2), 0, ring, half * 2 - 14)
  addMapPath(mapPaths, half - ring / 2, 0, ring, half * 2 - 14)

  // Great hall (north)
  addMapPath(mapPaths, 0, -half + 9, 34, 14)

  // Dungeon wing (south, before gate)
  addMapPath(mapPaths, 0, half - 11, 22, 10)

  // Side chambers
  addMapPath(mapPaths, -(half - 10), 10, 10, 14)
  addMapPath(mapPaths, half - 10, -10, 10, 14)

  // Upper walkways
  for (const fz of floorZones) {
    addMapPath(
      mapPaths,
      (fz.minX + fz.maxX) / 2,
      (fz.minZ + fz.maxZ) / 2,
      fz.maxX - fz.minX,
      fz.maxZ - fz.minZ,
      'upper',
    )
  }

  const mapWallLines = walls
    .map(wallToMapLine)
    .filter((l): l is MapWallLine => {
      if (!l) return false
      const len = Math.hypot(l.x2 - l.x1, l.z2 - l.z1)
      return len > 3.5
    })

  return { mapPaths, mapWallLines }
}

function buildStairSteps(
  x: number,
  zStart: number,
  zEnd: number,
  width: number,
  steps: number,
  bottomFloorY: number,
  topFloorY: number,
): StairStep[] {
  const result: StairStep[] = []
  const totalLen = Math.abs(zEnd - zStart)
  const stepLen = totalLen / steps
  const rise = topFloorY - bottomFloorY
  const stepH = rise / steps
  const dir = zEnd > zStart ? 1 : -1

  for (let i = 0; i < steps; i++) {
    const cz = zStart + dir * (i * stepLen + stepLen / 2)
    const cy = bottomFloorY + i * stepH + stepH / 2
    result.push({
      position: [x, cy, cz],
      size: [width, stepH, stepLen],
    })
  }
  return result
}

function buildStairStepsX(
  z: number,
  xStart: number,
  xEnd: number,
  depth: number,
  steps: number,
  bottomFloorY: number,
  topFloorY: number,
): StairStep[] {
  const result: StairStep[] = []
  const totalLen = Math.abs(xEnd - xStart)
  const stepLen = totalLen / steps
  const rise = topFloorY - bottomFloorY
  const stepH = rise / steps
  const dir = xEnd > xStart ? 1 : -1

  for (let i = 0; i < steps; i++) {
    const cx = xStart + dir * (i * stepLen + stepLen / 2)
    const cy = bottomFloorY + i * stepH + stepH / 2
    result.push({
      position: [cx, cy, z],
      size: [stepLen, stepH, depth],
    })
  }
  return result
}

function addStairStringersZ(
  walls: WallSegment[],
  x: number,
  zStart: number,
  zEnd: number,
  width: number,
  height: number,
  yBase: number,
) {
  const t = CASTLE.wallThickness * 0.5
  const zMid = (zStart + zEnd) / 2
  const zLen = Math.abs(zEnd - zStart)
  addWall(walls, x - width / 2 - t / 2, zMid, t, zLen, height, yBase)
  addWall(walls, x + width / 2 + t / 2, zMid, t, zLen, height, yBase)
}

function addStairStringersX(
  walls: WallSegment[],
  z: number,
  xStart: number,
  xEnd: number,
  depth: number,
  height: number,
  yBase: number,
) {
  const t = CASTLE.wallThickness * 0.5
  const xMid = (xStart + xEnd) / 2
  const xLen = Math.abs(xEnd - xStart)
  addWall(walls, xMid, z - depth / 2 - t / 2, xLen, t, height, yBase)
  addWall(walls, xMid, z + depth / 2 + t / 2, xLen, t, height, yBase)
}

let layoutCache: CastleLayout | null = null

export function getCastleLayout(): CastleLayout {
  if (!layoutCache) layoutCache = buildCastleLayout()
  return layoutCache
}

export function resetCastleLayoutCache() {
  layoutCache = null
}

export function getCastleHalf(): number {
  return CASTLE.outerSize / 2
}

export function buildCastleLayout(): CastleLayout {
  const walls: WallSegment[] = []
  const pillars: Pillar[] = []
  const torches: Torch[] = []
  const stairs: StairStep[] = []
  const upperFloors: WallSegment[] = []
  const stairZones: StairZone[] = []
  const floorZones: FloorZone[] = []

  const { outerSize, innerSize, wallThickness, corridorWidth, towerRadius, upperRise } = CASTLE
  const half = outerSize / 2
  const innerHalf = innerSize / 2
  const t = wallThickness
  const upperY = upperRise
  const upperEye = CASTLE.upperEyeY

  // ── Ground floor outer walls ──
  addWall(walls, 0, -half, outerSize + t, t)
  addWall(walls, 0, half, outerSize + t, t)
  addWall(walls, -half, 0, t, outerSize + t)
  addWall(walls, half, 0, t, outerSize + t)

  walls.pop()
  const gateHalf = CASTLE.gateWidth / 2
  addWall(walls, -(half - gateHalf) / 2 - gateHalf / 2, half, half - gateHalf, t)
  addWall(walls, (half - gateHalf) / 2 + gateHalf / 2, half, half - gateHalf, t)

  // Inner courtyard — walls with corridor openings (N / S / E / W)
  const cw = corridorWidth
  const sideW = innerHalf - cw / 2
  const sideCenter = innerHalf - sideW / 2
  addWall(walls, -sideCenter, -innerHalf, sideW, t)
  addWall(walls, sideCenter, -innerHalf, sideW, t)
  addWall(walls, -sideCenter, innerHalf, sideW, t)
  addWall(walls, sideCenter, innerHalf, sideW, t)
  addWall(walls, -innerHalf, -sideCenter, t, sideW)
  addWall(walls, -innerHalf, sideCenter, t, sideW)
  addWall(walls, innerHalf, -sideCenter, t, sideW)
  addWall(walls, innerHalf, sideCenter, t, sideW)

  const corridorLen = (half - innerHalf) / 2

  // North corridor (wider)
  addWall(walls, -corridorWidth / 2 - t / 2, -half + corridorLen / 2 + innerHalf, t, corridorLen)
  addWall(walls, corridorWidth / 2 + t / 2, -half + corridorLen / 2 + innerHalf, t, corridorLen)

  // East / West wings (wider)
  addWall(walls, half - corridorLen / 2 - innerHalf, -corridorWidth / 2 - t / 2, corridorLen, t)
  addWall(walls, half - corridorLen / 2 - innerHalf, corridorWidth / 2 + t / 2, corridorLen, t)
  addWall(walls, -half + corridorLen / 2 + innerHalf, -corridorWidth / 2 - t / 2, corridorLen, t)
  addWall(walls, -half + corridorLen / 2 + innerHalf, corridorWidth / 2 + t / 2, corridorLen, t)

  // Great hall partitions (low wall with center opening for north corridor)
  addWall(walls, -14, -half + 10, 10, t)
  addWall(walls, 14, -half + 10, 10, t)
  addWall(walls, -11, -half + 5, 6, t, 3)
  addWall(walls, 11, -half + 5, 6, t, 3)

  // South dungeon wing
  addWall(walls, 0, half - 12, 22, t)
  addWall(walls, -12, half - 18, t, 12)
  addWall(walls, 12, half - 18, t, 12)

  // East & west side chambers
  addWall(walls, -half + 8, 10, t, 16)
  addWall(walls, half - 8, -10, t, 16)

  // ── Corner towers ──
  const towerPositions: [number, number][] = [
    [-half + 3, -half + 3],
    [half - 3, -half + 3],
    [-half + 3, half - 3],
    [half - 3, half - 3],
  ]

  towerPositions.forEach(([tx, tz], ti) => {
    const segments = 10
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const px = tx + Math.cos(angle) * towerRadius
      const pz = tz + Math.sin(angle) * towerRadius
      addWall(walls, px, pz, t, t, CASTLE.towerHeight)
    }
    pillars.push({ position: [tx, CASTLE.towerHeight / 2, tz], radius: 0.55, height: CASTLE.towerHeight })
    torches.push({ position: [tx, 3, tz + towerRadius - 0.3], flickerOffset: ti * 2.1 })
    torches.push({ position: [tx, upperEye - 1, tz + towerRadius - 0.3], flickerOffset: ti * 2.1 + 1 })
  })

  // Great hall pillars (spread wider)
  const hallPillars: [number, number][] = [
    [-8, -20], [8, -20], [-8, -28], [8, -28],
    [-5, -4], [5, -4], [-5, 6], [5, 6],
    [-16, 8], [16, 8], [0, 16], [0, -10],
    [-14, -14], [14, -14],
  ]
  hallPillars.forEach(([px, pz], i) => {
    pillars.push({ position: [px, 2.5, pz], radius: 0.5, height: 5 })
    if (i % 2 === 0) {
      torches.push({ position: [px + 0.7, 2.8, pz], flickerOffset: i * 1.5 })
    }
  })

  // ── STAIRS ──

  // 1) Grand north staircase — great hall to upper gallery
  const grandStairZ0 = -innerHalf - 2
  const grandStairZ1 = -innerHalf - corridorLen + 2
  stairs.push(...buildStairSteps(0, grandStairZ0, grandStairZ1, 4, 10, 0, upperY))
  addStairStringersZ(walls, 0, grandStairZ0, grandStairZ1, 4, upperY, 0)
  addFloor(upperFloors, 0, grandStairZ1 - 0.5, 4.5, 2, upperY)
  stairZones.push({
    minX: -3.5, maxX: 3.5,
    minZ: grandStairZ1 - 1, maxZ: grandStairZ0 + 1,
    bottomY: CASTLE.groundEyeY, topY: upperEye,
    axis: 'z', ascending: false,
  })
  torches.push({ position: [-2.2, 3.5, grandStairZ0 - 2], flickerOffset: 3 })
  torches.push({ position: [2.2, 7.5, grandStairZ1 + 2], flickerOffset: 4 })

  // 2) West wing stairs — courtyard to west upper walkway
  const westStairX0 = -innerHalf + 1
  const westStairX1 = -innerHalf - corridorLen + 3
  stairs.push(...buildStairStepsX(-6, westStairX1, westStairX0, 3.5, 10, 0, upperY))
  addStairStringersX(walls, -6, westStairX1, westStairX0, 3.5, upperY, 0)
  addFloor(upperFloors, westStairX1 - 0.5, -6, 2, 4, upperY)
  stairZones.push({
    minX: westStairX1 - 1, maxX: westStairX0 + 1,
    minZ: -8.5, maxZ: -3.5,
    bottomY: CASTLE.groundEyeY, topY: upperEye,
    axis: 'x', ascending: false,
  })

  // 3) East wing stairs — courtyard to east upper walkway
  const eastStairX0 = innerHalf - 1
  const eastStairX1 = innerHalf + corridorLen - 3
  stairs.push(...buildStairStepsX(6, eastStairX0, eastStairX1, 3.5, 10, 0, upperY))
  addStairStringersX(walls, 6, eastStairX0, eastStairX1, 3.5, upperY, 0)
  addFloor(upperFloors, eastStairX1 + 0.5, 6, 2, 4, upperY)
  stairZones.push({
    minX: eastStairX0 - 1, maxX: eastStairX1 + 1,
    minZ: 3.5, maxZ: 8.5,
    bottomY: CASTLE.groundEyeY, topY: upperEye,
    axis: 'x', ascending: true,
  })

  // 4) South dungeon stairs — ground to upper south balcony
  const dungeonStairZ0 = half - 14
  const dungeonStairZ1 = half - 20
  stairs.push(...buildStairSteps(-10, dungeonStairZ0, dungeonStairZ1, 3.5, 8, 0, upperY))
  addStairStringersZ(walls, -10, dungeonStairZ0, dungeonStairZ1, 3.5, upperY, 0)
  addFloor(upperFloors, -10, dungeonStairZ1 - 0.5, 4, 2, upperY)
  stairZones.push({
    minX: -13, maxX: -7,
    minZ: dungeonStairZ1 - 1, maxZ: dungeonStairZ0 + 1,
    bottomY: CASTLE.groundEyeY, topY: upperEye,
    axis: 'z', ascending: false,
  })
  torches.push({ position: [-10, 7, dungeonStairZ1], flickerOffset: 8 })

  // ── Upper floor walkways ──
  const uw = 5
  // North gallery
  addFloor(upperFloors, 0, -half + 4, outerSize - 8, uw, upperY)
  floorZones.push({ minX: -half + 5, maxX: half - 5, minZ: -half + 1, maxZ: -half + 7, eyeY: upperEye })

  // South balcony (does not overlap entrance gate)
  addFloor(upperFloors, 0, half - 8, outerSize - 14, uw, upperY)
  floorZones.push({ minX: -half + 8, maxX: half - 8, minZ: half - 11, maxZ: half - 5, eyeY: upperEye })

  // West upper walkway
  addFloor(upperFloors, -half + 4, 0, uw, innerSize, upperY)
  floorZones.push({ minX: -half + 1, maxX: -half + 7, minZ: -innerHalf, maxZ: innerHalf, eyeY: upperEye })

  // East upper walkway
  addFloor(upperFloors, half - 4, 0, uw, innerSize, upperY)
  floorZones.push({ minX: half - 7, maxX: half - 1, minZ: -innerHalf, maxZ: innerHalf, eyeY: upperEye })

  // Upper railings (low walls)
  addWall(walls, 0, -half + 7.5, outerSize - 8, t, 1.2, upperY)
  addWall(walls, 0, half - 7.5, outerSize - 12, t, 1.2, upperY)
  addWall(walls, -half + 7.5, 0, t, innerSize, 1.2, upperY)
  addWall(walls, half - 7.5, 0, t, innerSize, 1.2, upperY)

  // Upper walkway support columns (ground to upper floor)
  const supportCols: [number, number][] = [
    [-half + 6, -innerHalf + 4], [half - 6, -innerHalf + 4],
    [-half + 6, innerHalf - 4], [half - 6, innerHalf - 4],
    [-4, -half + 6], [4, -half + 6],
    [-half + 10, half - 9], [half - 10, half - 9],
  ]
  supportCols.forEach(([px, pz]) => {
    pillars.push({ position: [px, upperY / 2, pz], radius: 0.35, height: upperY })
  })

  // Corridor torches (wider map)
  const corridorTorches: [number, number, number][] = [
    [0, 2.5, innerHalf + 4],
    [0, 2.5, -innerHalf - 4],
    [innerHalf + 4, 2.5, 0],
    [-innerHalf - 4, 2.5, 0],
    [0, 2.5, -22],
    [-10, 2.5, 12],
    [10, 2.5, 12],
    [0, 2.5, 22],
    [-20, 2.5, -12],
    [20, 2.5, -12],
    [-20, upperEye - 1, -12],
    [20, upperEye - 1, 12],
    [0, upperEye - 1, -30],
  ]
  corridorTorches.forEach(([x, y, z], i) => {
    torches.push({ position: [x, y, z], flickerOffset: i * 2.1 })
  })

  // Dungeon bars
  for (let i = -5; i <= 5; i++) {
    pillars.push({ position: [i * 1.4, 1.5, half - 14], radius: 0.08, height: 3 })
  }

  // Entrance torches — right at spawn
  torches.push(
    { position: [-4, 2.8, half - 1.5], flickerOffset: 0 },
    { position: [4, 2.8, half - 1.5], flickerOffset: 1.2 },
    { position: [0, 3, half - 3], flickerOffset: 2.4 },
    { position: [-4, 2.8, half - 4], flickerOffset: 3.6 },
    { position: [4, 2.8, half - 4], flickerOffset: 4.8 },
  )

  const spawnZ = half + 18
  const spawnY = getEyeHeight(0, spawnZ, stairZones, floorZones)

  const { mapPaths, mapWallLines } = buildMapData(
    walls,
    floorZones,
    half,
    innerHalf,
    corridorWidth,
    CASTLE.outdoorExtent,
  )

  return {
    walls,
    pillars,
    torches,
    stairs,
    upperFloors,
    stairZones,
    floorZones,
    mapPaths,
    mapWallLines,
    spawn: [0, spawnY, spawnZ] as [number, number, number],
    half,
    bounds: {
      minX: -half - 8,
      maxX: half + 8,
      minZ: -half + 1.5,
      maxZ: half + CASTLE.outdoorExtent,
    },
  }
}

export type FloorLevel = 'ground' | 'stairs' | 'upper'

export function getPlayerFloor(
  x: number,
  z: number,
  stairZones: StairZone[],
  floorZones: FloorZone[],
): FloorLevel {
  for (const stair of stairZones) {
    if (x >= stair.minX && x <= stair.maxX && z >= stair.minZ && z <= stair.maxZ) {
      return 'stairs'
    }
  }
  for (const floor of floorZones) {
    if (x >= floor.minX && x <= floor.maxX && z >= floor.minZ && z <= floor.maxZ) {
      return 'upper'
    }
  }
  return 'ground'
}

export function isInStairZone(x: number, z: number, stairZones: StairZone[]): boolean {
  return stairZones.some(
    (s) => x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ,
  )
}

export function getEyeHeight(
  x: number,
  z: number,
  stairZones: StairZone[],
  floorZones: FloorZone[],
): number {
  for (const stair of stairZones) {
    if (x >= stair.minX && x <= stair.maxX && z >= stair.minZ && z <= stair.maxZ) {
      let t = 0
      if (stair.axis === 'z') {
        t = (z - stair.minZ) / (stair.maxZ - stair.minZ)
      } else {
        t = (x - stair.minX) / (stair.maxX - stair.minX)
      }
      if (!stair.ascending) t = 1 - t
      t = THREE.MathUtils.clamp(t, 0, 1)
      return THREE.MathUtils.lerp(stair.bottomY, stair.topY, t)
    }
  }

  for (const floor of floorZones) {
    if (x >= floor.minX && x <= floor.maxX && z >= floor.minZ && z <= floor.maxZ) {
      return floor.eyeY
    }
  }

  return CASTLE.groundEyeY
}

export function checkCollision(
  pos: THREE.Vector3,
  walls: WallSegment[],
  pillars: Pillar[],
): boolean {
  const r = CASTLE.playerRadius
  const py = pos.y

  for (const wall of walls) {
    const [wx, wy, wz] = wall.position
    const [sw, sh, sd] = wall.size
    if (py < wy - sh / 2 - 0.5 || py > wy + sh / 2 + 1.5) continue

    const minX = wx - sw / 2 - r
    const maxX = wx + sw / 2 + r
    const minZ = wz - sd / 2 - r
    const maxZ = wz + sd / 2 + r

    if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
      return true
    }
  }

  for (const pillar of pillars) {
    const [px, , pz] = pillar.position
    const dx = pos.x - px
    const dz = pos.z - pz
    if (Math.sqrt(dx * dx + dz * dz) < pillar.radius + r) return true
  }

  return false
}

export function resolveMovement(
  current: THREE.Vector3,
  target: THREE.Vector3,
  layout: Pick<CastleLayout, 'walls' | 'pillars' | 'stairs' | 'stairZones' | 'floorZones' | 'bounds'>,
): THREE.Vector3 {
  const result = current.clone()
  const tryMove = (axis: 'x' | 'z', value: number) => {
    const test = result.clone()
    test[axis] = value
    test.x = THREE.MathUtils.clamp(test.x, layout.bounds.minX, layout.bounds.maxX)
    test.z = THREE.MathUtils.clamp(test.z, layout.bounds.minZ, layout.bounds.maxZ)
    test.y = getEyeHeight(test.x, test.z, layout.stairZones, layout.floorZones)
    if (!checkCollision(test, layout.walls, layout.pillars)) {
      result[axis] = test[axis]
      result.y = test.y
    }
  }

  tryMove('x', target.x)
  tryMove('z', target.z)
  result.y = getEyeHeight(result.x, result.z, layout.stairZones, layout.floorZones)
  return result
}
