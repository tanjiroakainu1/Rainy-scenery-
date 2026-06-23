import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, getWoodsWorld, WOODS } from '../../world/woods'
import { BloodStain, Cobweb } from '../castle/Atmosphere'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

function buildTreeMeshes(trees: ReturnType<typeof getWoodsWorld>['trees']) {
  const trunks: THREE.BufferGeometry[] = []
  const canopies: THREE.BufferGeometry[] = []

  for (const tree of trees) {
    const [x, , z] = tree.position
    const s = tree.scale
    const trunk = new THREE.CylinderGeometry(0.16 * s, 0.26 * s, 2.6 * s, 5)
    trunk.translate(x, 1.3 * s, z)
    trunks.push(trunk)
    const canopy = tree.dead
      ? new THREE.ConeGeometry(0.5 * s, 1.8 * s, 4)
      : new THREE.ConeGeometry(1.2 * s, 3 * s, 6)
    canopy.translate(x, (tree.dead ? 2.6 : 3.2) * s, z)
    canopies.push(canopy)
  }

  const trunkMerged = trunks.length ? mergeGeometries(trunks, false) : null
  const canopyMerged = canopies.length ? mergeGeometries(canopies, false) : null
  trunks.forEach((g) => g.dispose())
  canopies.forEach((g) => g.dispose())
  return { trunkMerged, canopyMerged }
}

const MIST_LIGHTS: [number, number, number, number][] = [
  [0, 5, 105, 1.0], [0, 4, 60, 0.9], [-30, 4, 20, 0.7], [35, 4, -10, 0.7],
  [-50, 4, -40, 0.6], [55, 4, -80, 0.6], [0, 6, -100, 0.6], [0, 4, 0, 0.8],
]

export const HorrorWoods = memo(function HorrorWoods() {
  const world = useMemo(() => getWoodsWorld(), [])
  const mistLights = useRef<THREE.PointLight[]>([])

  const treeGeo = useMemo(() => buildTreeMeshes(world.trees), [world.trees])

  const grassMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grass }), [])
  const pathMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.path }), [])
  const barkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.bark }), [])
  const foliageMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliage }), [])
  const postMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2218' }), [])
  const mistMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.mist, transparent: true, opacity: 0.032, side: THREE.DoubleSide }),
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    mistLights.current.forEach((light, i) => {
      if (!light) return
      const base = MIST_LIGHTS[i]?.[3] ?? 0.6
      light.intensity = 3.2 * base + Math.sin(t * 2 + i * 1.7) * 0.45
    })
  })

  const hd = WOODS.depth / 2

  return (
    <group>
      {/* Forest floor — super wide */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={grassMat}>
        <planeGeometry args={[WOODS.width + 20, WOODS.depth + 20]} />
      </mesh>

      {/* Worn path strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 10]} material={pathMat}>
        <planeGeometry args={[5, WOODS.depth - 20]} />
      </mesh>

      {treeGeo.trunkMerged && <mesh geometry={treeGeo.trunkMerged} material={barkMat} />}
      {treeGeo.canopyMerged && <mesh geometry={treeGeo.canopyMerged} material={foliageMat} />}

      {/* Wooden posts for notes */}
      {world.posts.map((post, i) => (
        <group key={i} position={post.position} rotation={[0, post.rotationY, 0]}>
          <mesh position={[0, 0.8, 0]} material={postMat}>
            <boxGeometry args={[0.16, 1.6, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Low mist layers */}
      {[-30, 0, 30].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.5, z]} material={mistMat}>
          <planeGeometry args={[WOODS.width, 40]} />
        </mesh>
      ))}

      {MIST_LIGHTS.map(([x, y, z], i) => (
        <pointLight
          key={i}
          ref={(l) => { if (l) mistLights.current[i] = l }}
          position={[x, y, z]}
          color="#90a0a8"
          intensity={3.2}
          distance={62}
          decay={1.25}
        />
      ))}

      <Cobweb position={[-50, 3, 40]} rotation={[0, 0.5, 0]} scale={1.2} />
      <Cobweb position={[55, 2.5, -30]} rotation={[0, -0.8, 0.1]} scale={1} />
      <BloodStain position={[-8, 0.02, 25]} scale={1} />
      <BloodStain position={[12, 0.02, -35]} scale={0.9} />

      {/* Distant tree line markers at edges for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -hd + 4]} material={grassMat}>
        <planeGeometry args={[WOODS.width, 8]} />
      </mesh>
    </group>
  )
})
