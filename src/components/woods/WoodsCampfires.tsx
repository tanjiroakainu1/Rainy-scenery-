import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, type CampfireDef, type PathTorchDef } from '../../world/woods'
import { SeatedPerson } from './SeatedPerson'

type WoodsCampfiresProps = {
  campfires: CampfireDef[]
  pathTorches: PathTorchDef[]
}

function Backpack({ scale = 1 }: { scale?: number }) {
  const bodyMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.backpack }), [])
  const strapMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.backpackStrap }), [])
  const buckleMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#5a5040' }), [])
  const zipMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#6a6050' }), [])

  return (
    <group scale={scale} rotation={[0.12, -0.45, 0.08]} position={[0, 0.12, 0]}>
      <mesh position={[0, 0.14, 0]} material={bodyMat}>
        <boxGeometry args={[0.44, 0.32, 0.24]} />
      </mesh>
      <mesh position={[0, 0.28, -0.04]} material={bodyMat}>
        <boxGeometry args={[0.36, 0.12, 0.2]} />
      </mesh>
      <mesh position={[0, 0.2, 0.13]} material={zipMat}>
        <boxGeometry args={[0.04, 0.2, 0.02]} />
      </mesh>
      <mesh position={[0, 0.08, 0.13]} material={strapMat}>
        <boxGeometry args={[0.38, 0.06, 0.05]} />
      </mesh>
      <mesh position={[-0.15, 0.18, 0.13]} material={strapMat}>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
      </mesh>
      <mesh position={[0.15, 0.18, 0.13]} material={strapMat}>
        <boxGeometry args={[0.05, 0.24, 0.05]} />
      </mesh>
      <mesh position={[0, 0.16, 0.14]} material={buckleMat}>
        <boxGeometry args={[0.09, 0.06, 0.03]} />
      </mesh>
    </group>
  )
}

function Campfire({
  def,
  lightRef,
  fireRef,
}: {
  def: CampfireDef
  lightRef: (light: THREE.PointLight | null) => void
  fireRef: (mesh: THREE.Group | null) => void
}) {
  const s = def.scale
  const stoneMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.stone }), [])
  const logMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2018' }), [])
  const charMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#1a1410', transparent: true, opacity: 0.45 }),
    [],
  )
  const emberMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff6622', transparent: true, opacity: 0.7 }),
    [],
  )
  const fireOuterMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.fire, transparent: true, opacity: 0.85 }),
    [],
  )
  const fireCoreMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.fireCore, transparent: true, opacity: 0.95 }),
    [],
  )
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ff8833', transparent: true, opacity: 0.18 }),
    [],
  )
  const smokeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#2a2a30', transparent: true, opacity: 0.22 }),
    [],
  )
  const benchMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a2818' }), [])

  const stoneCount = 8
  const stones = useMemo(
    () =>
      Array.from({ length: stoneCount }, (_, i) => {
        const a = (i / stoneCount) * Math.PI * 2
        return { x: Math.cos(a) * 0.62 * s, z: Math.sin(a) * 0.62 * s, ry: a }
      }),
    [s],
  )

  return (
    <group position={def.position} rotation={[0, def.rotationY, 0]} scale={s}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={charMat}>
        <circleGeometry args={[1.0, 14]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]} material={emberMat}>
        <circleGeometry args={[0.35, 10]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 0]} material={glowMat}>
        <circleGeometry args={[1.35, 16]} />
      </mesh>

      {def.hasBackpack && (
        <>
          <mesh position={[-0.85, 0.06, 0.35]} rotation={[0, 0.2, Math.PI / 2]} material={benchMat}>
            <cylinderGeometry args={[0.06, 0.07, 0.55, 6]} />
          </mesh>
          <mesh position={[0.75, 0.06, -0.55]} rotation={[0, -0.15, Math.PI / 2]} material={benchMat}>
            <cylinderGeometry args={[0.055, 0.065, 0.5, 6]} />
          </mesh>
        </>
      )}

      {stones.map((stone, i) => (
        <mesh key={i} position={[stone.x, 0.08, stone.z]} rotation={[0, stone.ry, 0]} material={stoneMat}>
          <boxGeometry args={[0.18, 0.12, 0.14]} />
        </mesh>
      ))}

      <mesh position={[0.22, 0.06, 0.08]} rotation={[0, 0.4, Math.PI / 2]} material={logMat}>
        <cylinderGeometry args={[0.05, 0.06, 0.9, 5]} />
      </mesh>
      <mesh position={[-0.2, 0.06, -0.06]} rotation={[0, -0.3, Math.PI / 2]} material={logMat}>
        <cylinderGeometry args={[0.05, 0.06, 0.85, 5]} />
      </mesh>
      <mesh position={[0.04, 0.06, -0.22]} rotation={[Math.PI / 2, 0.6, 0]} material={logMat}>
        <cylinderGeometry args={[0.045, 0.055, 0.75, 5]} />
      </mesh>

      <group ref={fireRef} position={[0, 0.18, 0]}>
        <mesh position={[0, 0.1, 0]} material={emberMat}>
          <cylinderGeometry args={[0.2, 0.24, 0.08, 8]} />
        </mesh>
        <mesh position={[0.08, 0.22, 0.04]} material={fireOuterMat}>
          <coneGeometry args={[0.18, 0.42, 6]} />
        </mesh>
        <mesh position={[-0.06, 0.2, -0.05]} material={fireOuterMat}>
          <coneGeometry args={[0.15, 0.36, 6]} />
        </mesh>
        <mesh position={[0, 0.24, 0]} material={fireOuterMat}>
          <coneGeometry args={[0.26, 0.5, 7]} />
        </mesh>
        <mesh position={[0, 0.18, 0]} material={fireCoreMat}>
          <coneGeometry args={[0.14, 0.34, 7]} />
        </mesh>
        <mesh position={[0, 0.55, 0]} material={smokeMat}>
          <coneGeometry args={[0.12, 0.35, 5]} />
        </mesh>
      </group>

      <pointLight
        ref={lightRef}
        position={[0, 0.45, 0]}
        color="#ffbb66"
        intensity={def.hasBackpack ? 9 : 7}
        distance={def.hasBackpack ? 22 : 18}
        decay={1.4}
      />

      {def.hasBackpack && (
        <group position={[0.75, 0, 0.62]}>
          <Backpack scale={0.95} />
        </group>
      )}

      <SeatedPerson offset={def.seatedOffset} rotation={def.seatedRotation} variant={def.seatedVariant} />
    </group>
  )
}

function PathTorch({
  def,
  lightRef,
}: {
  def: PathTorchDef
  lightRef: (light: THREE.PointLight | null) => void
}) {
  const postMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2218' }), [])
  const flameMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.torch, transparent: true, opacity: 0.9 }),
    [],
  )

  return (
    <group position={def.position} rotation={[0, def.rotationY, 0]}>
      <mesh position={[0, 0.65, 0]} material={postMat}>
        <boxGeometry args={[0.12, 1.3, 0.12]} />
      </mesh>
      <mesh position={[0, 1.35, 0]} material={flameMat}>
        <coneGeometry args={[0.08, 0.22, 5]} />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0, 1.4, 0]}
        color={COLORS.torch}
        intensity={6.5}
        distance={18}
        decay={1.3}
      />
    </group>
  )
}

export const WoodsCampfires = memo(function WoodsCampfires({ campfires, pathTorches }: WoodsCampfiresProps) {
  const campfireLights = useRef<(THREE.PointLight | null)[]>([])
  const campfireFires = useRef<(THREE.Group | null)[]>([])
  const torchLights = useRef<(THREE.PointLight | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    campfireLights.current.forEach((light, i) => {
      if (!light) return
      const base = campfires[i]?.hasBackpack ? 9 : 7
      light.intensity = base + Math.sin(t * 9 + i * 2.1) * 1.2 + Math.sin(t * 14 + i) * 0.6
    })

    campfireFires.current.forEach((fire, i) => {
      if (!fire) return
      const flicker = 1 + Math.sin(t * 11 + i * 1.5) * 0.08 + Math.sin(t * 17 + i * 0.7) * 0.05
      fire.scale.set(flicker, flicker * (1 + Math.sin(t * 13 + i) * 0.06), flicker)
    })

    torchLights.current.forEach((light, i) => {
      if (!light) return
      light.intensity = 6.5 + Math.sin(t * 10 + i * 1.8) * 1.2 + Math.sin(t * 16 + i * 0.5) * 0.6
    })
  })

  return (
    <group>
      {campfires.map((cf, i) => (
        <Campfire
          key={cf.id}
          def={cf}
          lightRef={(l) => { campfireLights.current[i] = l }}
          fireRef={(g) => { campfireFires.current[i] = g }}
        />
      ))}
      {pathTorches.map((torch, i) => (
        <PathTorch
          key={`torch-${i}`}
          def={torch}
          lightRef={(l) => { torchLights.current[i] = l }}
        />
      ))}
    </group>
  )
})
