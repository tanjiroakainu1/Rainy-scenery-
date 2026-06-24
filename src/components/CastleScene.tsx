import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { HorrorWoods } from './woods/HorrorWoods'
import { WoodsWeather } from './woods/WoodsWeather'
import { WoodsCampfires } from './woods/WoodsCampfires'
import { WoodsFigures } from './woods/WoodsFigures'
import { WoodsHouse } from './woods/WoodsHouse'
import { WoodsCar } from './woods/WoodsCar'
import { CastleNotes } from './castle/CastleNotes'
import { PlayerController, type TeleportRequest } from './PlayerController'
import { COLORS, getWoodsWorld } from '../world/woods'
import { NOTES } from '../data/notes'
import type { MoveInput } from '../types/controls'

type CastleSceneProps = {
  started: boolean
  paused: boolean
  isMobile: boolean
  insideHouse: boolean
  teleport: TeleportRequest | null
  moveInput: React.MutableRefObject<MoveInput>
  lookInput: React.MutableRefObject<{ deltaX: number; deltaY: number }>
  collectedIds: Set<number>
  nearbyNoteId: number | null
}

function SceneContent({
  started,
  paused,
  isMobile,
  insideHouse,
  teleport,
  moveInput,
  lookInput,
  collectedIds,
  nearbyNoteId,
}: CastleSceneProps) {
  const world = useMemo(() => getWoodsWorld(), [])

  return (
    <>
      <color attach="background" args={[insideHouse ? '#141210' : COLORS.sky]} />
      <fog attach="fog" args={[insideHouse ? '#1a1614' : '#141c22', insideHouse ? 14 : 22, insideHouse ? 42 : 115]} />

      <ambientLight intensity={insideHouse ? 0.68 : 0.58} color={insideHouse ? '#5a5048' : '#2e3840'} />
      <hemisphereLight args={[insideHouse ? '#ffcc99' : '#4a6070', '#0e1410', insideHouse ? 0.75 : 0.95]} />

      {insideHouse ? (
        <WoodsHouse house={world.house} showInterior />
      ) : (
        <>
          <WoodsWeather isMobile={isMobile} />
          <HorrorWoods />
          <WoodsCampfires campfires={world.campfires} pathTorches={world.pathTorches} />
          <WoodsFigures figures={world.figures} />
          <WoodsHouse house={world.house} showInterior={false} />
          <WoodsCar vehicle={world.vehicle} />
          <CastleNotes notes={NOTES} collectedIds={collectedIds} nearbyId={nearbyNoteId} />
        </>
      )}

      <PlayerController
        moveInput={moveInput}
        lookInput={lookInput}
        enabled={started && !paused}
        isMobile={isMobile}
        insideHouse={insideHouse}
        house={world.house}
        teleport={teleport}
        onPositionUpdate={window.__castleOnPosUpdate}
      />
    </>
  )
}

export function CastleScene({
  started,
  paused,
  isMobile,
  insideHouse,
  teleport,
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
        toneMappingExposure: insideHouse ? 1.75 : 1.62,
      }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneContent
          started={started}
          paused={paused}
          isMobile={isMobile}
          insideHouse={insideHouse}
          teleport={teleport}
          moveInput={moveInput}
          lookInput={lookInput}
          collectedIds={collectedIds}
          nearbyNoteId={nearbyNoteId}
        />
      </Suspense>
    </Canvas>
  )
}
