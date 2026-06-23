import { getWoodsWorld, WOODS } from '../world/woods'

export type WoodsNote = {
  id: number
  position: [number, number, number]
  rotation: [number, number, number]
  mapX: number
  mapZ: number
  title: string
  text: string
  clue: string
}

const world = getWoodsWorld()

export const NOTES: WoodsNote[] = world.notes.map((n) => ({
  id: n.id,
  position: n.position,
  rotation: n.rotation,
  mapX: n.mapX,
  mapZ: n.mapZ,
  title: n.title,
  text: n.text,
  clue: n.clue,
}))

export const NOTE_PICKUP_DISTANCE: number = WOODS.notePickupDistance
export const TOTAL_NOTES = NOTES.length

export type CastleNote = WoodsNote
