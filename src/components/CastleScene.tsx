import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { HorrorWoods } from './woods/HorrorWoods'
import { WoodsWeather } from './woods/WoodsWeather'
import { WoodsCampfires } from './woods/WoodsCampfires'
import { WoodsFigures } from './woods/WoodsFigures'
import { CastleNotes } from './castle/CastleNotes'
import { PlayerController } from './PlayerController'
import { COLORS, getWoodsWorld } from '../world/woods'
import { NOTES } from '../data/notes'
import type { MoveInput } from '../types/controls'

type CastleSceneProps = {
  started: boolean
  paused: boolean
  isMobile: boolean
  moveInput: React.MutableRefObject<MoveInput>
  lookInput: React.MutableRefObject<{ deltaX: number; deltaY: number }>
  collectedIds: Set<number>
  nearbyNoteId: number | null
}

function SceneContent({
  started,
  paused,
  isMobile,
  moveInput,
  lookInput,
  collectedIds,
  nearbyNoteId,
}: CastleSceneProps) {
  const world = useMemo(() => getWoodsWorld(), [])

  return (
    <>
      <color attach="background" args={[COLORS.sky]} />
      <fog attach="fog" args={[COLORS.fog, 32, 125]} />

      <ambientLight intensity={0.62} color="#3c4854" />
      <hemisphereLight args={[COLORS.moonLight, '#141820', 0.88]} />

      <WoodsWeather isMobile={isMobile} />
      <HorrorWoods />
      <WoodsCampfires campfires={world.campfires} pathTorches={world.pathTorches} />
      <WoodsFigures figures={world.figures} />
      <CastleNotes notes={NOTES} collectedIds={collectedIds} nearbyId={nearbyNoteId} />

      <PlayerController
        moveInput={moveInput}
        lookInput={lookInput}
        enabled={started && !paused}
        isMobile={isMobile}
        onPositionUpdate={window.__castleOnPosUpdate}
      />
    </>
  )
}

export function CastleScene({
  started,
  paused,
  isMobile,
  moveInput,
  lookInput,
  collectedIds,
  nearbyNoteId,
}: CastleSceneProps) {
  const dpr = useMemo(() => Math.min(window.devicePixelRatio, 1), [])

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: isMobile ? 70 : 68, near: 0.1, far: 260 }}
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.78,
      }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneContent
          started={started}
          paused={paused}
          isMobile={isMobile}
          moveInput={moveInput}
          lookInput={lookInput}
          collectedIds={collectedIds}
          nearbyNoteId={nearbyNoteId}
        />
      </Suspense>
    </Canvas>
  )
}
