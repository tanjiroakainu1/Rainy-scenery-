import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { FIGURES } from '../../data/figures'

const VARIANT_COLORS = {
  guard: { body: '#2a2826', skin: '#8a8078' },
  wanderer: { body: '#3a3430', skin: '#9a9088' },
  hollow: { body: '#1a1816', skin: '#6a6560' },
} as const

type FigureProps = {
  position: [number, number, number]
  rotationY: number
  variant: keyof typeof VARIANT_COLORS
  hasNote: boolean
}

const Figure = memo(function Figure({ position, rotationY, variant, hasNote }: FigureProps) {
  const colors = VARIANT_COLORS[variant]
  const bodyMat = useMemo(() => new THREE.MeshLambertMaterial({ color: colors.body }), [colors.body])
  const skinMat = useMemo(() => new THREE.MeshLambertMaterial({ color: colors.skin }), [colors.skin])
  const noteMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#c8b498', side: THREE.DoubleSide }), [])
  const bloodMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#5a1818', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false }),
    [],
  )

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Legs */}
      <mesh position={[-0.12, 0.45, 0]} material={bodyMat}>
        <boxGeometry args={[0.18, 0.9, 0.22]} />
      </mesh>
      <mesh position={[0.12, 0.45, 0]} material={bodyMat}>
        <boxGeometry args={[0.18, 0.9, 0.22]} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.25, 0]} material={bodyMat}>
        <boxGeometry args={[0.48, 0.85, 0.28]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.82, 0]} material={skinMat}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.34, 1.2, 0.05]} rotation={[0.2, 0, 0.15]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
      </mesh>
      <mesh position={[0.34, 1.15, 0.08]} rotation={[0.5, 0, -0.2]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
      </mesh>
      {hasNote && (
        <group position={[0.42, 1.05, 0.22]} rotation={[0.1, -0.3, 0.05]}>
          <mesh material={noteMat}>
            <planeGeometry args={[0.18, 0.24]} />
          </mesh>
          <mesh position={[0.04, -0.06, 0.002]} material={bloodMat}>
            <planeGeometry args={[0.1, 0.12]} />
          </mesh>
        </group>
      )}
    </group>
  )
})

export const CastleFigures = memo(function CastleFigures() {
  return (
    <group>
      {FIGURES.map((fig) => (
        <Figure
          key={fig.id}
          position={fig.position}
          rotationY={fig.rotationY}
          variant={fig.variant}
          hasNote={fig.hasNote}
        />
      ))}
    </group>
  )
})
