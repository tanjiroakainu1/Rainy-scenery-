import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { CASTLE, COLORS, getCastleLayout } from '../../castle/layout'
import { generateWoods, OUTDOOR_POSTS } from '../../data/outdoor'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

function buildTreeInstances(trees: { position: [number, number, number]; scale: number }[]) {
  const trunks: THREE.BufferGeometry[] = []
  const canopies: THREE.BufferGeometry[] = []

  for (const tree of trees) {
    const [x, , z] = tree.position
    const s = tree.scale
    const trunk = new THREE.CylinderGeometry(0.18 * s, 0.28 * s, 2.8 * s, 5)
    trunk.translate(x, 1.4 * s, z)
    trunks.push(trunk)
    const canopy = new THREE.ConeGeometry(1.3 * s, 3.2 * s, 6)
    canopy.translate(x, 3.4 * s, z)
    canopies.push(canopy)
  }

  const trunkMerged = trunks.length ? mergeGeometries(trunks, false) : null
  const canopyMerged = canopies.length ? mergeGeometries(canopies, false) : null
  trunks.forEach((g) => g.dispose())
  canopies.forEach((g) => g.dispose())
  return { trunkMerged, canopyMerged }
}

export const OutdoorWoods = memo(function OutdoorWoods() {
  const layout = useMemo(() => getCastleLayout(), [])
  const half = layout.half
  const trees = useMemo(() => generateWoods(half), [half])
  const treeGeo = useMemo(() => buildTreeInstances(trees), [trees])

  const grassMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grass }), [])
  const grassLightMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grassLight }), [])
  const pathMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.path }), [])
  const barkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.bark }), [])
  const foliageMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliage }), [])
  const postMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3028' }), [])

  const outdoorDepth = CASTLE.outdoorExtent
  const outdoorCenterZ = half + outdoorDepth / 2

  return (
    <group>
      {/* Forest floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, outdoorCenterZ - 2]} material={grassMat}>
        <planeGeometry args={[120, outdoorDepth + 16]} />
      </mesh>

      {/* Lighter grass patches */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, -0.015, half + 28]} material={grassLightMat}>
        <planeGeometry args={[30, 24]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[22, -0.015, half + 16]} material={grassLightMat}>
        <planeGeometry args={[26, 20]} />
      </mesh>

      {/* Path from woods to castle gate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, half + outdoorDepth / 2 - 1]} material={pathMat}>
        <planeGeometry args={[4, outdoorDepth - 4]} />
      </mesh>

      {treeGeo.trunkMerged && <mesh geometry={treeGeo.trunkMerged} material={barkMat} />}
      {treeGeo.canopyMerged && <mesh geometry={treeGeo.canopyMerged} material={foliageMat} />}

      {/* Wooden posts for outdoor notes */}
      {OUTDOOR_POSTS.map((post, i) => (
        <group key={i} position={post.position} rotation={[0, post.rotationY, 0]}>
          <mesh position={[0, 0.75, 0]} material={postMat}>
            <boxGeometry args={[0.18, 1.5, 0.18]} />
          </mesh>
        </group>
      ))}

      {/* Moonlit mist over treeline */}
      <pointLight position={[0, 8, half + 30]} color="#304040" intensity={3} distance={55} decay={1.4} />
    </group>
  )
})
