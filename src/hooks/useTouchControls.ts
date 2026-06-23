import { useCallback, useRef } from 'react'
import type { MoveInput } from '../types/controls'
import { EMPTY_MOVE } from '../types/controls'

type LookDragState = {
  active: boolean
  pointerId: number | null
  lastX: number
  lastY: number
}

export function useTouchControls(enabled: boolean) {
  const moveRef = useRef<MoveInput>({ ...EMPTY_MOVE })
  const lookRef = useRef({ deltaX: 0, deltaY: 0 })
  const lookDrag = useRef<LookDragState>({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  })

  const pressKey = useCallback(
    (key: keyof MoveInput) => {
      if (!enabled) return
      moveRef.current[key] = true
    },
    [enabled],
  )

  const releaseKey = useCallback((key: keyof MoveInput) => {
    moveRef.current[key] = false
  }, [])

  const releaseAll = useCallback(() => {
    moveRef.current = { ...EMPTY_MOVE }
  }, [])

  const onLookPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      // Don't start look drag when tapping buttons/links
      const tag = (e.target as HTMLElement).closest('button, a, [data-no-look]')
      if (tag) return
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      lookDrag.current = {
        active: true,
        pointerId: e.pointerId,
        lastX: e.clientX,
        lastY: e.clientY,
      }
    },
    [enabled],
  )

  const onLookPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enabled) return
      const state = lookDrag.current
      if (!state.active || state.pointerId !== e.pointerId) return
      e.preventDefault()
      e.stopPropagation()
      lookRef.current.deltaX += e.clientX - state.lastX
      lookRef.current.deltaY += e.clientY - state.lastY
      state.lastX = e.clientX
      state.lastY = e.clientY
    },
    [enabled],
  )

  const endLookPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = lookDrag.current
    if (state.pointerId !== e.pointerId) return
    lookDrag.current = { active: false, pointerId: null, lastX: 0, lastY: 0 }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const onLookPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      endLookPointer(e)
    },
    [endLookPointer],
  )

  return {
    moveRef,
    lookRef,
    pressKey,
    releaseKey,
    releaseAll,
    lookHandlers: {
      onPointerDown: onLookPointerDown,
      onPointerMove: onLookPointerMove,
      onPointerUp: onLookPointerUp,
      onPointerCancel: onLookPointerUp,
      onLostPointerCapture: onLookPointerUp,
    },
  }
}
