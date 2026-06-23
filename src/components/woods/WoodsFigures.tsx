import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { FigureDef } from '../../world/woods'

const VARIANT_COLORS = {
  watcher: { body: '#3a3632', skin: '#9a9088' },
  lost: { body: '#4a443e', skin: '#a89890' },
  hollow: { body: '#2a2826', skin: '#7a7570' },
} as const

type FigureProps = FigureDef

const Figure = memo(function Figure({ position, rotationY, variant, hasNote }: FigureProps) {
  const colors = VARIANT_COLORS[variant]
  const bodyMat = useMemo(() => new THREE.MeshLambertMaterial({ color: colors.body }), [colors.body])
  const skinMat = useMemo(() => new THREE.MeshLambertMaterial({ color: colors.skin }), [colors.skin])
  const noteMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#a89880', side: THREE.DoubleSide }), [])

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[-0.12, 0.45, 0]} material={bodyMat}>
        <boxGeometry args={[0.18, 0.9, 0.22]} />
      </mesh>
      <mesh position={[0.12, 0.45, 0]} material={bodyMat}>
        <boxGeometry args={[0.18, 0.9, 0.22]} />
      </mesh>
      <mesh position={[0, 1.25, 0]} material={bodyMat}>
        <boxGeometry args={[0.48, 0.85, 0.28]} />
      </mesh>
      <mesh position={[0, 1.82, 0]} material={skinMat}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
      <mesh position={[-0.34, 1.2, 0.05]} rotation={[0.2, 0, 0.15]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
      </mesh>
      <mesh position={[0.34, 1.15, 0.08]} rotation={[0.5, 0, -0.2]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.65, 0.14]} />
      </mesh>
      {hasNote && (
        <mesh position={[0.42, 1.05, 0.22]} rotation={[0.1, -0.3, 0.05]} material={noteMat}>
          <planeGeometry args={[0.18, 0.24]} />
        </mesh>
      )}
    </group>
  )
})

type WoodsFiguresProps = {
  figures: FigureDef[]
}

export const WoodsFigures = memo(function WoodsFigures({ figures }: WoodsFiguresProps) {
  return (
    <group>
      {figures.map((fig) => (
        <Figure key={fig.id} {...fig} />
      ))}
    </group>
  )
})
