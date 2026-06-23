import { CASTLE } from '../castle/layout'

const half = CASTLE.outerSize / 2

export type FigureDef = {
  id: string
  position: [number, number, number]
  rotationY: number
  variant: 'guard' | 'wanderer' | 'hollow'
  hasNote: boolean
}

export const FIGURES: FigureDef[] = [
  // Woods — silent watchers on the path
  { id: 'woods-left', position: [-6, 0, half + 20], rotationY: Math.PI / 6, variant: 'hollow', hasNote: false },
  { id: 'woods-right', position: [7, 0, half + 30], rotationY: -Math.PI / 3, variant: 'wanderer', hasNote: true },
  { id: 'gate', position: [-4.5, 0, half + 2], rotationY: Math.PI / 2, variant: 'guard', hasNote: false },
  // Courtyard
  { id: 'court-n', position: [0, 0, -8], rotationY: Math.PI, variant: 'guard', hasNote: true },
  { id: 'court-w', position: [-14, 0, 6], rotationY: Math.PI / 2, variant: 'wanderer', hasNote: false },
  { id: 'court-e', position: [15, 0, -4], rotationY: -Math.PI / 2, variant: 'hollow', hasNote: true },
  // Great hall
  { id: 'hall', position: [-6, 0, -22], rotationY: 0.4, variant: 'guard', hasNote: false },
  // Upper gallery (eye height offset applied in component)
  { id: 'upper-n', position: [8, 5, -32], rotationY: -Math.PI / 4, variant: 'hollow', hasNote: true },
]
