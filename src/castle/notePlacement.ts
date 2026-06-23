import { CASTLE } from './layout'

const T = CASTLE.wallThickness
const INSET = 0.025

/** Mount a note on a wall that runs along X (fixed Z). Walkable side is +Z or −Z from the wall. */
export function mountWallZ(
  wallZ: number,
  alongX: number,
  height: number,
  face: '+z' | '-z',
  tilt: [number, number, number] = [0, 0, 0],
): { position: [number, number, number]; rotation: [number, number, number] } {
  const z = face === '+z' ? wallZ + T / 2 + INSET : wallZ - T / 2 - INSET
  const rotY = face === '+z' ? 0 : Math.PI
  return {
    position: [alongX, height, z],
    rotation: [tilt[0], rotY + tilt[1], tilt[2]],
  }
}

/** Mount a note on a wall that runs along Z (fixed X). Walkable side is +X or −X from the wall. */
export function mountWallX(
  wallX: number,
  alongZ: number,
  height: number,
  face: '+x' | '-x',
  tilt: [number, number, number] = [0, 0, 0],
): { position: [number, number, number]; rotation: [number, number, number] } {
  const x = face === '+x' ? wallX + T / 2 + INSET : wallX - T / 2 - INSET
  const rotY = face === '+x' ? Math.PI / 2 : -Math.PI / 2
  return {
    position: [x, height, alongZ],
    rotation: [tilt[0], rotY + tilt[1], tilt[2]],
  }
}

/** Mount a note on a wooden post (outdoor). */
export function mountPost(
  postX: number,
  postZ: number,
  postRotY: number,
  height: number,
  tilt: [number, number, number] = [0, 0, 0.08],
): { position: [number, number, number]; rotation: [number, number, number] } {
  const offset = 0.12
  const x = postX + Math.sin(postRotY) * offset
  const z = postZ + Math.cos(postRotY) * offset
  return {
    position: [x, height, z],
    rotation: [tilt[0], postRotY + tilt[1], tilt[2]],
  }
}

export function castleWallCoords() {
  const half = CASTLE.outerSize / 2
  const innerHalf = CASTLE.innerSize / 2
  const cw = CASTLE.corridorWidth
  const corridorWallX = cw / 2 + T / 2
  return { half, innerHalf, corridorWallX }
}
