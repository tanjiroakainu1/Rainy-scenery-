import { CASTLE } from '../castle/layout'

const half = CASTLE.outerSize / 2

export type TreeDef = {
  position: [number, number, number]
  scale: number
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function generateWoods(half: number): TreeDef[] {
  const trees: TreeDef[] = []
  const minZ = half + 4
  const maxZ = half + CASTLE.outdoorExtent - 2
  let seed = 0

  for (let z = minZ; z <= maxZ; z += 5) {
    for (const side of [-1, 1]) {
      const xBase = side * (6 + seededRandom(seed++) * 14)
      if (Math.abs(xBase) < 3 && z < half + 14) continue
      trees.push({
        position: [xBase + (seededRandom(seed++) - 0.5) * 3, 0, z + (seededRandom(seed++) - 0.5) * 2],
        scale: 0.85 + seededRandom(seed++) * 0.55,
      })
    }
  }

  // Dense tree line flanking the path
  for (let i = 0; i < 12; i++) {
    const z = minZ + i * 3.2
    trees.push({ position: [-7 - seededRandom(seed++) * 2, 0, z], scale: 1 + seededRandom(seed++) * 0.4 })
    trees.push({ position: [7 + seededRandom(seed++) * 2, 0, z], scale: 1 + seededRandom(seed++) * 0.4 })
  }

  return trees
}

export const OUTDOOR_POSTS: { position: [number, number, number]; rotationY: number }[] = [
  { position: [3.5, 0, half + 12], rotationY: -Math.PI / 2 },
  { position: [-4, 0, half + 24], rotationY: Math.PI / 4 },
]
