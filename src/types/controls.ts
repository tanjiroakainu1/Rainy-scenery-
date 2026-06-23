export type MoveInput = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export type LookInput = {
  deltaX: number
  deltaY: number
}

export const EMPTY_MOVE: MoveInput = {
  forward: false,
  backward: false,
  left: false,
  right: false,
}
