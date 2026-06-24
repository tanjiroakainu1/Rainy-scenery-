import { memo, useMemo } from 'react'
import * as THREE from 'three'

const VARIANTS = [
  { shirt: '#4a6070', jacket: '#3a4a58', jeans: '#2a3440', hair: '#3a2c24', skin: '#c4a882', boots: '#2a2420', hat: '#3a3830' },
  { shirt: '#3a5040', jacket: '#4a5848', jeans: '#2a3038', hair: '#6a5a40', skin: '#d4b892', boots: '#3a3028', hat: null },
  { shirt: '#6a4040', jacket: null, jeans: '#282830', hair: '#1a1818', skin: '#b89878', boots: '#1a1818', hat: '#2a2828' },
  { shirt: '#5a5048', jacket: '#6a5a48', jeans: '#3a3840', hair: '#5a5858', skin: '#c0a080', boots: '#3a3428', hat: null },
] as const

type SeatedPersonProps = {
  offset: [number, number, number]
  rotation: number
  variant?: number
}

export const SeatedPerson = memo(function SeatedPerson({ offset, rotation, variant = 0 }: SeatedPersonProps) {
  const v = VARIANTS[variant % VARIANTS.length]

  const shirtMat = useMemo(() => new THREE.MeshLambertMaterial({ color: v.shirt }), [v.shirt])
  const jacketMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: v.jacket ?? v.shirt }),
    [v.jacket, v.shirt],
  )
  const jeansMat = useMemo(() => new THREE.MeshLambertMaterial({ color: v.jeans }), [v.jeans])
  const skinMat = useMemo(() => new THREE.MeshLambertMaterial({ color: v.skin }), [v.skin])
  const hairMat = useMemo(() => new THREE.MeshLambertMaterial({ color: v.hair }), [v.hair])
  const bootMat = useMemo(() => new THREE.MeshLambertMaterial({ color: v.boots }), [v.boots])
  const logMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a2818' }), [])
  const hatMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: v.hat ?? v.hair }),
    [v.hat, v.hair],
  )
  const mugMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#5a5048' }), [])

  const topMat = v.jacket ? jacketMat : shirtMat

  return (
    <group position={offset} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.1, 0.18]} rotation={[0, 0, Math.PI / 2]} material={logMat}>
        <cylinderGeometry args={[0.085, 0.095, 0.65, 8]} />
      </mesh>

      <mesh position={[-0.12, 0.08, 0.5]} material={bootMat}>
        <boxGeometry args={[0.14, 0.11, 0.24]} />
      </mesh>
      <mesh position={[0.12, 0.08, 0.5]} material={bootMat}>
        <boxGeometry args={[0.14, 0.11, 0.24]} />
      </mesh>

      <mesh position={[-0.12, 0.22, 0.34]} material={jeansMat}>
        <boxGeometry args={[0.14, 0.3, 0.14]} />
      </mesh>
      <mesh position={[0.12, 0.22, 0.34]} material={jeansMat}>
        <boxGeometry args={[0.14, 0.3, 0.14]} />
      </mesh>

      <mesh position={[-0.12, 0.32, 0.14]} rotation={[0.4, 0, 0]} material={jeansMat}>
        <boxGeometry args={[0.15, 0.15, 0.38]} />
      </mesh>
      <mesh position={[0.12, 0.32, 0.14]} rotation={[0.4, 0, 0]} material={jeansMat}>
        <boxGeometry args={[0.15, 0.15, 0.38]} />
      </mesh>

      <mesh position={[0, 0.58, 0]} rotation={[-0.15, 0, 0]} material={topMat}>
        <boxGeometry args={[0.42, 0.46, 0.26]} />
      </mesh>
      {v.jacket && (
        <mesh position={[0, 0.58, 0.12]} rotation={[-0.15, 0, 0]} material={shirtMat}>
          <boxGeometry args={[0.38, 0.42, 0.06]} />
        </mesh>
      )}

      <mesh position={[-0.24, 0.38, 0.24]} rotation={[0.7, 0, 0.2]} material={topMat}>
        <boxGeometry args={[0.12, 0.34, 0.12]} />
      </mesh>
      <mesh position={[0.24, 0.38, 0.24]} rotation={[0.7, 0, -0.2]} material={topMat}>
        <boxGeometry args={[0.12, 0.34, 0.12]} />
      </mesh>

      <mesh position={[-0.3, 0.26, 0.32]} material={skinMat}>
        <boxGeometry args={[0.09, 0.09, 0.09]} />
      </mesh>
      <mesh position={[0.3, 0.26, 0.32]} material={mugMat}>
        <cylinderGeometry args={[0.04, 0.045, 0.1, 6]} />
      </mesh>

      <mesh position={[0, 0.8, -0.01]} material={skinMat}>
        <boxGeometry args={[0.11, 0.1, 0.11]} />
      </mesh>
      <mesh position={[0, 0.94, -0.03]} material={skinMat}>
        <sphereGeometry args={[0.17, 12, 12]} />
      </mesh>
      {v.hat ? (
        <mesh position={[0, 1.02, -0.03]} material={hatMat}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 10]} />
        </mesh>
      ) : (
        <mesh position={[0, 1.0, -0.04]} material={hairMat}>
          <sphereGeometry args={[0.17, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        </mesh>
      )}
    </group>
  )
})
