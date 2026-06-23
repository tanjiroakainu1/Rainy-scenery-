export type StairGuide = {
  id: string
  name: string
  enterX: number
  enterZ: number
  direction: string
  mapLabel: string
}

export const STAIR_GUIDES: StairGuide[] = [
  {
    id: 'north',
    name: 'Grand North Stairs',
    enterX: 0,
    enterZ: -22,
    direction: 'Walk NORTH through the courtyard passage',
    mapLabel: 'N',
  },
  {
    id: 'west',
    name: 'West Wing Stairs',
    enterX: -22,
    enterZ: -6,
    direction: 'Walk WEST from the courtyard',
    mapLabel: 'W',
  },
  {
    id: 'east',
    name: 'East Wing Stairs',
    enterX: 22,
    enterZ: 6,
    direction: 'Walk EAST from the courtyard',
    mapLabel: 'E',
  },
  {
    id: 'south',
    name: 'Dungeon Stairs',
    enterX: -10,
    enterZ: 22,
    direction: 'Walk to the SOUTH dungeon wing',
    mapLabel: 'S',
  },
]

export function getNearestStairGuide(x: number, z: number, radius = 10): StairGuide | null {
  let best: StairGuide | null = null
  let bestDist = radius
  for (const guide of STAIR_GUIDES) {
    const dx = x - guide.enterX
    const dz = z - guide.enterZ
    const dist = Math.sqrt(dx * dx + dz * dz)
    if (dist < bestDist) {
      bestDist = dist
      best = guide
    }
  }
  return best
}
