import * as THREE from 'three'

export const WOODS = {
  width: 320,
  depth: 240,
  eyeY: 1.7,
  playerRadius: 0.38,
  moveSpeed: 5.5,
  lookSensitivity: 0.002,
  mobileLookSensitivity: 0.006,
  treeRadius: 0.42,
  notePickupDistance: 2.8,
  houseInteractDistance: 2.4,
} as const

export const COLORS = {
  grass: '#1a241c',
  grassLight: '#243028',
  grassDark: '#141c14',
  path: '#2a2620',
  bark: '#3a3024',
  barkDead: '#4a3830',
  foliage: '#1a2a1e',
  foliageMid: '#243428',
  foliageDark: '#141e18',
  foliageDead: '#2a3028',
  fog: '#141c24',
  mist: '#1a242c',
  sky: '#0e141c',
  moon: '#e2dac8',
  moonHalo: '#6a7890',
  moonShadow: '#b8b0a0',
  moonLight: '#8aa0b8',
  rain: '#7a8a98',
  torch: '#cc8833',
  fire: '#e86820',
  fireCore: '#ffcc55',
  ember: '#ff6622',
  stone: '#3a3632',
  backpack: '#3a4230',
  backpackStrap: '#2a3024',
  shirt: '#4a6070',
  jeans: '#2a3440',
  skin: '#c4a882',
  hair: '#3a2c24',
  houseWall: '#4a3c30',
  houseLog: '#6a5444',
  houseLogDark: '#4a382c',
  houseRoof: '#2e2824',
  houseTrim: '#7a6450',
  carBody: '#2a3830',
  carBodyDark: '#1a221c',
  carGlass: '#3a4a52',
  carChrome: '#6a7078',
  blood: '#5a1818',
  paper: '#c8b498',
} as const

/** Fixed moon in the north-west sky — visible above the tree line from spawn */
export const MOON = {
  position: [-32, 78, 8] as [number, number, number],
  radius: 5.2,
  lightIntensity: 0.58,
} as const

export type TreeDef = {
  id: number
  position: [number, number, number]
  scale: number
  dead: boolean
  isNoteTree?: boolean
  rotationY?: number
  variant?: 'pine' | 'tall' | 'wide' | 'sapling'
}

export type BushDef = {
  position: [number, number, number]
  scale: number
  rotationY: number
}

export type RockDef = {
  position: [number, number, number]
  scale: number
  rotationY: number
}

export type LogDef = {
  position: [number, number, number]
  scale: number
  rotationY: number
}

export type PostDef = {
  position: [number, number, number]
  rotationY: number
}

export type FigureDef = {
  id: string
  position: [number, number, number]
  rotationY: number
  variant: 'watcher' | 'lost' | 'hollow'
  hasNote: boolean
}

export type CampfireDef = {
  id: string
  position: [number, number, number]
  mapX: number
  mapZ: number
  label: string
  rotationY: number
  hasBackpack: boolean
  scale: number
  seatedOffset: [number, number, number]
  seatedRotation: number
  seatedVariant: number
}

export type HouseDef = {
  id: string
  position: [number, number, number]
  rotationY: number
  mapX: number
  mapZ: number
  doorPosition: [number, number, number]
  interiorSpawn: [number, number, number]
  exitSpawn: [number, number, number]
  interiorBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
}

export type VehicleDef = {
  id: string
  position: [number, number, number]
  rotationY: number
  mapX: number
  mapZ: number
}

export type HouseInteraction = 'enter' | 'exit' | null

export type PathTorchDef = {
  position: [number, number, number]
  rotationY: number
  mapX: number
  mapZ: number
}

/** Minimap pixel space — shared by HUD and world markers */
export const MINIMAP = {
  width: 280,
  height: 130,
  pad: 6,
} as const

export type MapPoint = { sx: number; sy: number }

export function worldToMap(
  x: number,
  z: number,
  bounds: WoodsWorld['bounds'],
  mapW = MINIMAP.width,
  mapH = MINIMAP.height,
  pad = MINIMAP.pad,
): MapPoint {
  const drawW = mapW - pad * 2
  const drawH = mapH - pad * 2
  const spanX = bounds.maxX - bounds.minX
  const spanZ = bounds.maxZ - bounds.minZ
  return {
    sx: ((x - bounds.minX) / spanX) * drawW + pad,
    sy: ((z - bounds.minZ) / spanZ) * drawH + pad,
  }
}

export type NoteAnchor = {
  id: number
  position: [number, number, number]
  rotation: [number, number, number]
  mapX: number
  mapZ: number
  title: string
  text: string
  clue: string
}

export type WoodsWorld = {
  trees: TreeDef[]
  bushes: BushDef[]
  rocks: RockDef[]
  logs: LogDef[]
  posts: PostDef[]
  figures: FigureDef[]
  campfires: CampfireDef[]
  pathTorches: PathTorchDef[]
  house: HouseDef
  vehicle: VehicleDef
  notes: NoteAnchor[]
  spawn: [number, number, number]
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  mapClearings: { x: number; z: number; r: number }[]
  pathPoints: [number, number][]
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function dist2d(ax: number, az: number, bx: number, bz: number) {
  return Math.hypot(ax - bx, az - bz)
}

/** Nail a paper flush on a tree trunk, facing toward a path point. */
export function buildNoteOnTree(
  tree: TreeDef,
  towardX: number,
  towardZ: number,
): { position: [number, number, number]; rotation: [number, number, number] } {
  const [tx, , tz] = tree.position
  const s = tree.scale
  const nailY = 0.85 * s + 0.45
  const trunkR = ((0.16 + 0.26) / 2) * s + 0.04

  let dx = towardX - tx
  let dz = towardZ - tz
  const len = Math.hypot(dx, dz) || 1
  dx /= len
  dz /= len

  return {
    position: [tx + dx * trunkR, nailY, tz + dz * trunkR],
    rotation: [0, Math.atan2(dx, dz), 0],
  }
}

export function buildNoteOnPost(
  post: PostDef,
  height = 1.45,
): { position: [number, number, number]; rotation: [number, number, number] } {
  const [x, , z] = post.position
  const offset = 0.1
  return {
    position: [x + Math.sin(post.rotationY) * offset, height, z + Math.cos(post.rotationY) * offset],
    rotation: [0, post.rotationY, 0],
  }
}

let worldCache: WoodsWorld | null = null

export function getWoodsWorld(): WoodsWorld {
  if (!worldCache) worldCache = buildWoodsWorld()
  return worldCache
}

export function resetWoodsWorldCache() {
  worldCache = null
}

export function buildWoodsWorld(): WoodsWorld {
  const hw = WOODS.width / 2
  const hd = WOODS.depth / 2
  const trees: TreeDef[] = []
  let seed = 1
  let id = 0

  const pathPoints: [number, number][] = [
    [0, hd - 8],
    [3, hd - 35],
    [-5, hd - 65],
    [8, hd - 95],
    [2, 40],
    [-10, 0],
    [6, -50],
    [-4, -hd + 15],
  ]

  const campfires: CampfireDef[] = [
    {
      id: 'cf-main',
      position: [-6.5, 0, 96],
      mapX: -6.5,
      mapZ: 96,
      label: '1',
      rotationY: 0,
      hasBackpack: true,
      scale: 1.15,
      seatedOffset: [-1.05, 0, -0.72],
      seatedRotation: 0.85,
      seatedVariant: 0,
    },
    { id: 'cf-mid', position: [5.5, 0, 22], mapX: 5.5, mapZ: 22, label: '2', rotationY: -0.5, hasBackpack: false, scale: 1, seatedOffset: [-1.1, 0, 0.3], seatedRotation: 0.5, seatedVariant: 1 },
    { id: 'cf-center', position: [-7, 0, -4], mapX: -7, mapZ: -4, label: '3', rotationY: 0.8, hasBackpack: false, scale: 1, seatedOffset: [1.1, 0, -0.35], seatedRotation: -2.35, seatedVariant: 2 },
    { id: 'cf-north', position: [6, 0, -88], mapX: 6, mapZ: -88, label: '4', rotationY: -0.25, hasBackpack: false, scale: 0.95, seatedOffset: [-1.05, 0, 0.35], seatedRotation: 0.55, seatedVariant: 3 },
  ]

  const house: HouseDef = {
    id: 'cabin',
    position: [-19.0, 0, 87],
    rotationY: 0,
    mapX: -19.0,
    mapZ: 87,
    doorPosition: [-15.2, 0, 87],
    interiorSpawn: [-16.8, WOODS.eyeY, 87],
    exitSpawn: [-14.8, WOODS.eyeY, 87],
    interiorBounds: { minX: -22.4, maxX: -15.6, minZ: 83.2, maxZ: 90.8 },
  }

  const vehicle: VehicleDef = {
    id: 'car',
    position: [-9.4, 0, 98.0],
    rotationY: -Math.PI / 2,
    mapX: -9.4,
    mapZ: 98.0,
  }

  const pathTorches: PathTorchDef[] = [
    { position: [3.6, 0, 108], mapX: 3.6, mapZ: 108, rotationY: -Math.PI / 2 },
    { position: [-3.6, 0, 72], mapX: -3.6, mapZ: 72, rotationY: Math.PI / 2 },
    { position: [3.6, 0, 38], mapX: 3.6, mapZ: 38, rotationY: -Math.PI / 2 },
    { position: [-3.6, 0, 0], mapX: -3.6, mapZ: 0, rotationY: Math.PI / 2 },
    { position: [3.6, 0, -38], mapX: 3.6, mapZ: -38, rotationY: -Math.PI / 2 },
    { position: [-3.6, 0, -72], mapX: -3.6, mapZ: -72, rotationY: Math.PI / 2 },
    { position: [3.6, 0, -105], mapX: 3.6, mapZ: -105, rotationY: -Math.PI / 2 },
  ]

  const isNearCampfire = (x: number, z: number, clearance = 5.5) =>
    campfires.some((cf) => dist2d(x, z, cf.position[0], cf.position[2]) < clearance)

  const isNearHouse = (x: number, z: number, clearance = 12) =>
    dist2d(x, z, house.position[0], house.position[2]) < clearance

  const isNearVehicle = (x: number, z: number, clearance = 6) =>
    dist2d(x, z, vehicle.position[0], vehicle.position[2]) < clearance

  const isNearPath = (x: number, z: number, clearance: number) => {
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const [x1, z1] = pathPoints[i]
      const [x2, z2] = pathPoints[i + 1]
      const dx = x2 - x1
      const dz = z2 - z1
      const len2 = dx * dx + dz * dz
      if (len2 < 0.01) continue
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (z - z1) * dz) / len2))
      const px = x1 + t * dx
      const pz = z1 + t * dz
      if (dist2d(x, z, px, pz) < clearance) return true
    }
    return false
  }

  for (let gx = -hw + 6; gx <= hw - 6; gx += 6) {
    for (let gz = -hd + 6; gz <= hd - 6; gz += 5.5) {
      const jitterX = (seededRandom(seed++) - 0.5) * 5
      const jitterZ = (seededRandom(seed++) - 0.5) * 4.5
      const x = gx + jitterX
      const z = gz + jitterZ
      if (isNearPath(x, z, 5.5)) continue
      if (isNearCampfire(x, z)) continue
      if (isNearHouse(x, z)) continue
      if (isNearVehicle(x, z)) continue
      if (dist2d(x, z, 0, hd - 6) < 4) continue
      const dead = seededRandom(seed++) > 0.88
      const vr = seededRandom(seed++)
      const variant: TreeDef['variant'] = dead
        ? undefined
        : vr < 0.5
          ? 'pine'
          : vr < 0.72
            ? 'tall'
            : vr < 0.9
              ? 'wide'
              : 'sapling'
      trees.push({
        id: id++,
        position: [x, 0, z],
        scale: 0.75 + seededRandom(seed++) * 0.7,
        dead,
        rotationY: seededRandom(seed++) * Math.PI * 2,
        variant,
      })
    }
  }

  for (let i = 0; i < 140; i++) {
    const edge = seededRandom(seed++) > 0.5
    const x = edge
      ? (seededRandom(seed++) > 0.5 ? -1 : 1) * (hw - 4 - seededRandom(seed++) * 12)
      : (seededRandom(seed++) - 0.5) * (hw * 2 - 16)
    const z = edge
      ? (seededRandom(seed++) - 0.5) * (hd * 2 - 16)
      : (seededRandom(seed++) > 0.5 ? -1 : 1) * (hd - 4 - seededRandom(seed++) * 12)
    trees.push({
      id: id++,
      position: [x, 0, z],
      scale: 0.85 + seededRandom(seed++) * 0.65,
      dead: seededRandom(seed++) > 0.72,
      rotationY: seededRandom(seed++) * Math.PI * 2,
      variant: seededRandom(seed++) > 0.5 ? 'tall' : 'pine',
    })
  }

  const bushes: BushDef[] = []
  const rocks: RockDef[] = []
  const logs: LogDef[] = []

  for (let i = 0; i < 220; i++) {
    const x = (seededRandom(seed++) - 0.5) * (hw * 2 - 20)
    const z = (seededRandom(seed++) - 0.5) * (hd * 2 - 20)
    if (isNearPath(x, z, 4)) continue
    if (isNearCampfire(x, z, 4)) continue
    if (isNearHouse(x, z, 8)) continue
    if (isNearVehicle(x, z, 4)) continue
    bushes.push({
      position: [x, 0, z],
      scale: 0.35 + seededRandom(seed++) * 0.55,
      rotationY: seededRandom(seed++) * Math.PI * 2,
    })
  }

  for (let i = 0; i < 70; i++) {
    const x = (seededRandom(seed++) - 0.5) * (hw * 2 - 16)
    const z = (seededRandom(seed++) - 0.5) * (hd * 2 - 16)
    if (isNearPath(x, z, 3.5)) continue
    if (isNearCampfire(x, z, 4)) continue
    rocks.push({
      position: [x, 0, z],
      scale: 0.2 + seededRandom(seed++) * 0.45,
      rotationY: seededRandom(seed++) * Math.PI * 2,
    })
  }

  for (let i = 0; i < 55; i++) {
    const x = (seededRandom(seed++) - 0.5) * (hw * 2 - 16)
    const z = (seededRandom(seed++) - 0.5) * (hd * 2 - 16)
    if (isNearPath(x, z, 3)) continue
    if (isNearCampfire(x, z, 5)) continue
    logs.push({
      position: [x, 0, z],
      scale: 0.5 + seededRandom(seed++) * 0.8,
      rotationY: seededRandom(seed++) * Math.PI * 2,
    })
  }

  // Posts & note trees — always beside the path, never floating in open air
  const posts: PostDef[] = [
    { position: [4.8, 0, hd - 22], rotationY: -Math.PI / 2 },
    { position: [-5.2, 0, 15], rotationY: Math.PI / 2 },
    { position: [5.5, 0, hd - 14], rotationY: -Math.PI / 2 },
  ]

  type NoteDef = {
    id: number
    kind: 'post' | 'tree'
    postIdx?: number
    treePos?: [number, number]
    pathLook: [number, number]
    title: string
    text: string
    clue: string
  }

  const noteDefs: NoteDef[] = [
    {
      id: 1,
      kind: 'post',
      postIdx: 0,
      pathLook: [0, hd - 22],
      title: 'Note 1 of 8',
      text: 'They found my pack at the south edge. Empty.\n\nIf you can read this, you already walked too far from the road. I pinned these in order — each page stains a little darker than the last.\n\nWalk NORTH along the dirt. Do not leave the path. The pines lean in when you stray.\n\n— M.',
      clue: '→ Follow the path NORTH from the start marker on your map.',
    },
    {
      id: 2,
      kind: 'tree',
      treePos: [-6.5, hd - 42],
      pathLook: [0, hd - 42],
      title: 'Note 2 of 8',
      text: 'M again. Sorry about the stain — not all of it is mine.\n\nSomeone sits by the first campfire every night. Don\'t trust the warmth. The rain washes footprints away. Not the blood.\n\nI heard singing from the cabin west of that fire. No one answers when you knock.',
      clue: '→ Next paper: EAST side of path, far north (right side on map).',
    },
    {
      id: 3,
      kind: 'tree',
      treePos: [7, 55],
      pathLook: [3, 55],
      title: 'Note 3 of 8',
      text: 'The grey figures on your map aren\'t lost hikers. I counted seven. They don\'t blink in the moonlight.\n\nOne held a paper just like this — blank on both sides. When I looked again, my name was on it. In my handwriting.\n\nDo NOT walk up to the ones holding pages. Read the nails instead.',
      clue: '→ Note 4 is WEST, deep center-left of the forest.',
    },
    {
      id: 4,
      kind: 'tree',
      treePos: [-46, 8],
      pathLook: [-10, 0],
      title: 'Note 4 of 8',
      text: 'ELIAS\n(he carved it deep)\nHE NEVER FOUND NOTE FIVE\n\nFresh sap covers old blood. I think Elias is still here — just not in one piece.\n\nFive is east of the path, south in the woods. A dead pine. The paper is nailed LOW. Kneel. You\'ll see why.',
      clue: '→ Note 5: EAST of path, mid-forest south — dead tree.',
    },
    {
      id: 5,
      kind: 'tree',
      treePos: [52, -18],
      pathLook: [6, -50],
      title: 'Note 5 of 8',
      text: 'My hands won\'t stop shaking. Whatever took Elias left these smears — three fingers, dragged downward.\n\nThe lantern by the path died when I looked east. Yours will too if you stare too long into the trees.\n\nI can hear the car engine ticking west of the fire. It hasn\'t run in years.',
      clue: '→ Note 6: wooden post WEST of path at map center.',
    },
    {
      id: 6,
      kind: 'post',
      postIdx: 1,
      pathLook: [-5, 15],
      title: 'Note 6 of 8',
      text: 'The cabin west of campfire #1 has papers on the walls. Older than mine. The stove is still warm. Boots by the door. A bed that\'s been slept in.\n\nSeven watchers. Eight notes. Two left.\n\nThe forest drinks the rain. It remembers what sinks into the dirt.',
      clue: '→ Note 7: far NORTH edge. Note 8: the post where you began.',
    },
    {
      id: 7,
      kind: 'tree',
      treePos: [-7, -hd + 28],
      pathLook: [-4, -hd + 15],
      title: 'Note 7 of 8',
      text: 'I am the eighth walker. There were seven before me. Their names are on the posts — carved, not written.\n\nThe rain never stops in the Hollow Woods. Somewhere behind you, the campfire still burns. Someone is always sitting there.\n\nLast page: your starting post. Read it. Then RUN south.',
      clue: '→ Note 8: SOUTH post near spawn — then escape south along the path.',
    },
    {
      id: 8,
      kind: 'post',
      postIdx: 2,
      pathLook: [0, hd - 14],
      title: 'Note 8 of 8 — FINAL',
      text: 'You found them all.\n\nTHE HOLLOW WOODS keeps walkers by making them circle forever. I see my own handwriting on pages I never wrote. The blood on these nails isn\'t all from the same hand.\n\nThe only exit is SOUTH — where you spawned. Run the path. Don\'t look at the watchers. Don\'t sit by the fire.\n\nIt knows you read this.',
      clue: '→ ESCAPE: run SOUTH back to the start circle on the map.',
    },
  ]

  const noteTrees: TreeDef[] = []
  for (const def of noteDefs.filter((d) => d.kind === 'tree' && d.treePos)) {
    const [x, z] = def.treePos!
    noteTrees.push({
      id: id++,
      position: [x, 0, z],
      scale: 1.05,
      dead: def.id === 5,
      isNoteTree: true,
    })
  }
  trees.push(...noteTrees)

  const figures: FigureDef[] = [
    { id: 'w1', position: [-8, 0, hd - 16], rotationY: 0.3, variant: 'hollow', hasNote: false },
    { id: 'w2', position: [10, 0, hd - 45], rotationY: -0.6, variant: 'watcher', hasNote: true },
    { id: 'w3', position: [-14, 0, 50], rotationY: Math.PI / 2, variant: 'lost', hasNote: false },
    { id: 'w4', position: [48, 0, -8], rotationY: -Math.PI / 2, variant: 'hollow', hasNote: true },
    { id: 'w5', position: [-50, 0, 5], rotationY: 0.9, variant: 'watcher', hasNote: false },
    { id: 'w6', position: [8, 0, -48], rotationY: Math.PI, variant: 'lost', hasNote: true },
    { id: 'w7', position: [-6, 0, -hd + 22], rotationY: -0.4, variant: 'hollow', hasNote: false },
  ]

  const notes: NoteAnchor[] = noteDefs.map((def) => {
    let placement: { position: [number, number, number]; rotation: [number, number, number] }
    let mapX: number
    let mapZ: number

    if (def.kind === 'post' && def.postIdx !== undefined) {
      const post = posts[def.postIdx]
      placement = buildNoteOnPost(post)
      mapX = post.position[0]
      mapZ = post.position[2]
    } else {
      const tree = noteTrees.find((t) => t.position[0] === def.treePos![0] && t.position[2] === def.treePos![1])!
      placement = buildNoteOnTree(tree, def.pathLook[0], def.pathLook[1])
      mapX = tree.position[0]
      mapZ = tree.position[2]
    }

    return {
      id: def.id,
      ...placement,
      mapX,
      mapZ,
      title: def.title,
      text: def.text,
      clue: def.clue,
    }
  })

  const mapClearings = [
    { x: -8.5, z: 96.5, r: 16 },
    ...campfires.filter((cf) => !cf.hasBackpack).map((cf) => ({
      x: cf.mapX,
      z: cf.mapZ,
      r: 8,
    })),
    { x: -55, z: 60, r: 16 },
    { x: 60, z: -30, r: 18 },
    { x: -70, z: -40, r: 14 },
    { x: 80, z: 50, r: 12 },
  ]

  return {
    trees,
    bushes,
    rocks,
    logs,
    posts,
    figures,
    campfires,
    pathTorches,
    house,
    vehicle,
    notes,
    spawn: [0, WOODS.eyeY, hd - 8] as [number, number, number],
    bounds: { minX: -hw + 2, maxX: hw - 2, minZ: -hd + 2, maxZ: hd - 2 },
    mapClearings,
    pathPoints,
  }
}

export function getEyeHeight(): number {
  return WOODS.eyeY
}

export function checkTreeCollision(pos: THREE.Vector3, trees: TreeDef[]): boolean {
  const r = WOODS.playerRadius
  for (const tree of trees) {
    const [tx, , tz] = tree.position
    const tr = WOODS.treeRadius * tree.scale
    if (dist2d(pos.x, pos.z, tx, tz) < tr + r) return true
  }
  return false
}

export function resolveWoodsMovement(
  current: THREE.Vector3,
  target: THREE.Vector3,
  world: WoodsWorld,
): THREE.Vector3 {
  const result = current.clone()
  const { bounds, trees } = world

  const tryMove = (axis: 'x' | 'z', value: number) => {
    const test = result.clone()
    test[axis] = value
    test.x = THREE.MathUtils.clamp(test.x, bounds.minX, bounds.maxX)
    test.z = THREE.MathUtils.clamp(test.z, bounds.minZ, bounds.maxZ)
    test.y = WOODS.eyeY
    if (!checkTreeCollision(test, trees)) {
      result[axis] = test[axis]
      result.y = test.y
    }
  }

  tryMove('x', target.x)
  tryMove('z', target.z)
  result.y = WOODS.eyeY
  return result
}

export function resolveHouseMovement(
  current: THREE.Vector3,
  target: THREE.Vector3,
  house: HouseDef,
): THREE.Vector3 {
  const result = current.clone()
  const { interiorBounds: b } = house

  const tryMove = (axis: 'x' | 'z', value: number) => {
    const test = result.clone()
    test[axis] = value
    test.x = THREE.MathUtils.clamp(test.x, b.minX, b.maxX)
    test.z = THREE.MathUtils.clamp(test.z, b.minZ, b.maxZ)
    test.y = WOODS.eyeY
    result.copy(test)
  }

  tryMove('x', target.x)
  tryMove('z', target.z)
  result.y = WOODS.eyeY
  return result
}

export function getHouseInteraction(
  x: number,
  z: number,
  insideHouse: boolean,
  house: HouseDef,
): HouseInteraction {
  const [dx, , dz] = house.doorPosition
  const dist = dist2d(x, z, dx, dz)

  if (!insideHouse && dist < WOODS.houseInteractDistance) return 'enter'

  if (insideHouse) {
    const [ix, , iz] = house.interiorSpawn
    if (dist2d(x, z, ix, iz) < WOODS.houseInteractDistance) return 'exit'
  }

  return null
}
