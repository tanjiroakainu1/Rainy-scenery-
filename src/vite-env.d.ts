/// <reference types="vite/client" />

import type { PlayerState } from './components/PlayerController'

declare global {
  interface Window {
    __castleOnPosUpdate?: (state: PlayerState) => void
  }
}

export {}
