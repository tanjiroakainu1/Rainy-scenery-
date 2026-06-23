import { useEffect, useRef } from 'react'
import type { MoveInput } from '../types/controls'
import { EMPTY_MOVE } from '../types/controls'

const KEY_MAP: Record<string, keyof MoveInput> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

export function useKeyboardControls(enabled: boolean) {
  const moveRef = useRef<MoveInput>({ ...EMPTY_MOVE })

  useEffect(() => {
    if (!enabled) return

    const setKey = (code: string, pressed: boolean) => {
      const action = KEY_MAP[code]
      if (action) moveRef.current[action] = pressed
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      setKey(e.code, true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      setKey(e.code, false)
    }

    const onBlur = () => {
      moveRef.current = { ...EMPTY_MOVE }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      moveRef.current = { ...EMPTY_MOVE }
    }
  }, [enabled])

  return moveRef
}
