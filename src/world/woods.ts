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
} as const

export const COLORS = {
  grass: '#243028',
  grassLight: '#2c382c',
  path: '#2e2a24',
  bark: '#3a3024',
  barkDead: '#4a3830',
  foliage: '#1e2c22',
  foliageDead: '#242c24',
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
  backpack: '#2a3428',
  backpackStrap: '#1a2018',
  blood: '#5a1818',
  paper: '#d8ccb0',
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
}

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
  posts: PostDef[]
  figures: FigureDef[]
  campfires: CampfireDef[]
  pathTorches: PathTorchDef[]
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
    { id: 'cf-main', position: [-6.5, 0, 96], mapX: -6.5, mapZ: 96, label: '1', rotationY: 0.35, hasBackpack: true, scale: 1.15 },
    { id: 'cf-mid', position: [5.5, 0, 22], mapX: 5.5, mapZ: 22, label: '2', rotationY: -0.5, hasBackpack: false, scale: 1 },
    { id: 'cf-center', position: [-7, 0, -4], mapX: -7, mapZ: -4, label: '3', rotationY: 0.8, hasBackpack: false, scale: 1 },
    { id: 'cf-north', position: [6, 0, -88], mapX: 6, mapZ: -88, label: '4', rotationY: -0.25, hasBackpack: false, scale: 0.95 },
  ]

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

  for (let gx = -hw + 8; gx <= hw - 8; gx += 8) {
    for (let gz = -hd + 8; gz <= hd - 8; gz += 7) {
      const jitterX = (seededRandom(seed++) - 0.5) * 6
      const jitterZ = (seededRandom(seed++) - 0.5) * 5
      const x = gx + jitterX
      const z = gz + jitterZ
      if (isNearPath(x, z, 6)) continue
      if (isNearCampfire(x, z)) continue
      if (dist2d(x, z, 0, hd - 6) < 4) continue
      trees.push({
        id: id++,
        position: [x, 0, z],
        scale: 0.8 + seededRandom(seed++) * 0.6,
        dead: seededRandom(seed++) > 0.85,
      })
    }
  }

  for (let i = 0; i < 80; i++) {
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
      scale: 0.9 + seededRandom(seed++) * 0.55,
      dead: seededRandom(seed++) > 0.75,
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
      text: 'If you can read this, you are already on the path.\n\nThe forest is wide — wider than you think. Walk NORTH along the dirt trail. Do not leave it. The trees are closer together in the dark.',
      clue: '→ Follow the path NORTH from the green start marker on your map.',
    },
    {
      id: 2,
      kind: 'tree',
      treePos: [-6.5, hd - 42],
      pathLook: [0, hd - 42],
      title: 'Note 2 of 8',
      text: 'I left these pages in order. Each one tells you where the next is hiding.\n\nNote 2 is west of the path — you found it. Note 3 is nailed EAST of the trail, far north near the wide bend at z ≈ 55 on the map.',
      clue: '→ Next paper: EAST side of path, far north (right side on map).',
    },
    {
      id: 3,
      kind: 'tree',
      treePos: [7, 55],
      pathLook: [3, 55],
      title: 'Note 3 of 8',
      text: 'The figures in the fog are not people. Count them on the map — grey squares. Seven watchers. They stand where the path turns.\n\nDo NOT walk up to the ones holding papers. Read the notes instead.',
      clue: '→ Avoid watchers with papers. Note 4 is WEST at map center-left (x ≈ -45).',
    },
    {
      id: 4,
      kind: 'tree',
      treePos: [-46, 8],
      pathLook: [-10, 0],
      title: 'Note 4 of 8',
      text: 'ELIAS carved his name here. Under it: HE NEVER FOUND NOTE FIVE.\n\nFive is on the opposite side — EAST of the path at z ≈ -20. Look for a dead tree. The paper is nailed low.',
      clue: '→ Note 5: EAST of path, mid-forest south (x ≈ +50, z ≈ -20).',
    },
    {
      id: 5,
      kind: 'tree',
      treePos: [52, -18],
      pathLook: [6, -50],
      title: 'Note 5 of 8',
      text: 'My lantern died facing east. Yours will too if you stare into the trees too long.\n\nSix is on a post at the CENTER of the forest — west of the path where the trail bends (z ≈ 15 on the map).',
      clue: '→ Note 6: wooden post WEST of path at map center (z ≈ 15).',
    },
    {
      id: 6,
      kind: 'post',
      postIdx: 1,
      pathLook: [-5, 15],
      title: 'Note 6 of 8',
      text: 'Seven notes before the last. Seven watchers before the truth.\n\nThe final two are at the far NORTH edge and back at the START. Seven is west at the north end. Eight is on the post you passed when you entered.',
      clue: '→ Note 7: far NORTH (top of map). Note 8: START post (south, near green circle).',
    },
    {
      id: 7,
      kind: 'tree',
      treePos: [-7, -hd + 28],
      pathLook: [-4, -hd + 15],
      title: 'Note 7 of 8',
      text: 'I am the eighth walker. There were seven before me. Their names are on the posts.\n\nThe last page is on the post you passed at the beginning. Turn back SOUTH if you dare. Or keep walking north — the trees never end.',
      clue: '→ Note 8: SOUTH post near spawn. Then leave the way you came in.',
    },
    {
      id: 8,
      kind: 'post',
      postIdx: 2,
      pathLook: [0, hd - 14],
      title: 'Note 8 of 8 — FINAL',
      text: 'You found them all.\n\nTHE TRUTH: The forest keeps you by making you walk forever. The only exit is the SOUTH edge where you spawned. Run south along the path. Do not look at the watchers. Do not stop.\n\nIt knows you read this.',
      clue: '→ ESCAPE: run SOUTH back to the green start circle on the map.',
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
    ...campfires.map((cf) => ({
      x: cf.mapX,
      z: cf.mapZ,
      r: cf.hasBackpack ? 10 : 8,
    })),
    { x: -55, z: 60, r: 16 },
    { x: 60, z: -30, r: 18 },
    { x: -70, z: -40, r: 14 },
    { x: 80, z: 50, r: 12 },
  ]

  return {
    trees,
    posts,
    figures,
    campfires,
    pathTorches,
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
