import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, getWoodsWorld, WOODS, type TreeDef } from '../../world/woods'
import { BloodStain, Cobweb } from '../castle/Atmosphere'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const _matrix = new THREE.Matrix4()
const _pos = new THREE.Vector3()

function placeGeo(geo: THREE.BufferGeometry, x: number, y: number, z: number, rotY: number, sy = 1) {
  _matrix.identity()
  _matrix.makeRotationY(rotY)
  _matrix.scale(new THREE.Vector3(1, sy, 1))
  _pos.set(x, y, z)
  _matrix.setPosition(_pos)
  geo.applyMatrix4(_matrix)
}

function addTreeGeometries(
  tree: TreeDef,
  trunks: THREE.BufferGeometry[],
  canopies: THREE.BufferGeometry[],
  deadCanopies: THREE.BufferGeometry[],
) {
  const [x, , z] = tree.position
  const s = tree.scale
  const rot = tree.rotationY ?? 0
  const variant = tree.variant ?? 'pine'

  if (tree.dead) {
    const trunkH = 2.4 * s
    const trunk = new THREE.CylinderGeometry(0.14 * s, 0.22 * s, trunkH, 5)
    placeGeo(trunk, x, trunkH / 2, z, rot)
    trunks.push(trunk)
    const snag = new THREE.ConeGeometry(0.35 * s, 0.9 * s, 4)
    placeGeo(snag, x, trunkH + 0.35 * s, z, rot + 0.4, 1)
    deadCanopies.push(snag)
    if (seededHash(tree.id) > 0.4) {
      const branch = new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.7 * s, 4)
      placeGeo(branch, x + 0.2 * s, trunkH * 0.7, z, rot + 1.2)
      trunks.push(branch)
    }
    return
  }

  const trunkH =
    variant === 'sapling' ? 1.4 * s : variant === 'tall' ? 3.2 * s : variant === 'wide' ? 2.0 * s : 2.6 * s
  const trunk = new THREE.CylinderGeometry(
    (variant === 'sapling' ? 0.08 : 0.14) * s,
    (variant === 'sapling' ? 0.12 : 0.24) * s,
    trunkH,
    variant === 'sapling' ? 4 : 6,
  )
  placeGeo(trunk, x, trunkH / 2, z, rot)
  trunks.push(trunk)

  if (variant === 'pine' || variant === 'tall') {
    const layers = variant === 'tall' ? 3 : 2
    for (let i = 0; i < layers; i++) {
      const t = i / layers
      const r = (1.1 - t * 0.35) * s
      const h = (variant === 'tall' ? 2.2 : 1.8) * s * (1 - t * 0.2)
      const cone = new THREE.ConeGeometry(r, h, 6)
      placeGeo(cone, x, trunkH + h * 0.42 + i * h * 0.55, z, rot + i * 0.15)
      canopies.push(cone)
    }
  } else if (variant === 'wide') {
    const cone = new THREE.ConeGeometry(1.5 * s, 2.4 * s, 7)
    placeGeo(cone, x, trunkH + 1.1 * s, z, rot)
    canopies.push(cone)
    const under = new THREE.ConeGeometry(1.0 * s, 1.4 * s, 6)
    placeGeo(under, x, trunkH + 0.5 * s, z, rot + 0.3)
    canopies.push(under)
  } else {
    const cone = new THREE.ConeGeometry(0.45 * s, 1.1 * s, 5)
    placeGeo(cone, x, trunkH + 0.45 * s, z, rot)
    canopies.push(cone)
  }
}

function seededHash(n: number) {
  return Math.abs(Math.sin(n * 127.1) * 43758.5453) % 1
}

function buildForestMeshes(trees: TreeDef[]) {
  const trunks: THREE.BufferGeometry[] = []
  const canopies: THREE.BufferGeometry[] = []
  const deadCanopies: THREE.BufferGeometry[] = []

  for (const tree of trees) {
    addTreeGeometries(tree, trunks, canopies, deadCanopies)
  }

  const merge = (geos: THREE.BufferGeometry[]) => (geos.length ? mergeGeometries(geos, false) : null)
  const trunkMerged = merge(trunks)
  const canopyMerged = merge(canopies)
  const deadMerged = merge(deadCanopies)
  trunks.forEach((g) => g.dispose())
  canopies.forEach((g) => g.dispose())
  deadCanopies.forEach((g) => g.dispose())
  return { trunkMerged, canopyMerged, deadMerged }
}

const MIST_LIGHTS: [number, number, number, number][] = [
  [0, 5, 105, 1.0], [0, 4, 60, 0.9], [-30, 4, 20, 0.7], [35, 4, -10, 0.7],
  [-50, 4, -40, 0.6], [55, 4, -80, 0.6], [0, 6, -100, 0.6], [0, 4, 0, 0.8],
  [-10, 3.5, 93, 0.55],
]

export const HorrorWoods = memo(function HorrorWoods() {
  const world = useMemo(() => getWoodsWorld(), [])
  const mistLights = useRef<THREE.PointLight[]>([])
  const [vx, , vz] = world.vehicle.position

  const treeGeo = useMemo(() => buildForestMeshes(world.trees), [world.trees])

  const grassMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grass }), [])
  const grassPatchMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grassLight }), [])
  const grassDarkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.grassDark }), [])
  const pathMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.path }), [])
  const clearingMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#322c26' }), [])
  const parkingMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2620' }), [])
  const wetSheenMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: '#1a2228',
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
    [],
  )
  const barkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.bark }), [])
  const foliageMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliage }), [])
  const foliageMidMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliageMid }), [])
  const foliageDeadMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliageDead }), [])
  const bushMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.foliageDark }), [])
  const rockMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3834' }), [])
  const logMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a2818' }), [])
  const postMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2218' }), [])
  const mistMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.mist, transparent: true, opacity: 0.055, side: THREE.DoubleSide }),
    [],
  )
  const fogWallMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#141c22', transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    [],
  )

  const grassPatches = useMemo(() => {
    const patches: { x: number; z: number; s: number; dark: boolean }[] = []
    for (let i = 0; i < 120; i++) {
      patches.push({
        x: (Math.sin(i * 17.3) * 0.5 + 0.5) * WOODS.width - WOODS.width / 2,
        z: (Math.cos(i * 13.7) * 0.5 + 0.5) * WOODS.depth - WOODS.depth / 2,
        s: 2 + (i % 5) * 0.8,
        dark: i % 3 === 0,
      })
    }
    return patches
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    mistLights.current.forEach((light, i) => {
      if (!light) return
      const base = MIST_LIGHTS[i]?.[3] ?? 0.6
      light.intensity = 3.2 * base + Math.sin(t * 2 + i * 1.7) * 0.45
    })
  })

  const hd = WOODS.depth / 2
  const hw = WOODS.width / 2

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={grassMat}>
        <planeGeometry args={[WOODS.width + 20, WOODS.depth + 20]} />
      </mesh>

      {grassPatches.map((p, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, p.dark ? 0.2 : -0.1]}
          position={[p.x, 0.001, p.z]}
          material={p.dark ? grassDarkMat : grassPatchMat}
        >
          <circleGeometry args={[p.s, 6]} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 10]} material={pathMat}>
        <planeGeometry args={[5, WOODS.depth - 20]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 10]} material={wetSheenMat}>
        <planeGeometry args={[5, WOODS.depth - 20]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.5, 0.003, 96.5]} material={clearingMat}>
        <circleGeometry args={[12, 22]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8.5, 0.005, 96.5]} material={wetSheenMat}>
        <circleGeometry args={[12, 22]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-19, 0.003, 87]} material={clearingMat}>
        <circleGeometry args={[6.5, 16]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, world.vehicle.rotationY]} position={[vx, 0.004, vz]} material={parkingMat}>
        <planeGeometry args={[2.6, 4.8]} />
      </mesh>

      {treeGeo.trunkMerged && <mesh geometry={treeGeo.trunkMerged} material={barkMat} />}
      {treeGeo.canopyMerged && <mesh geometry={treeGeo.canopyMerged} material={foliageMat} />}
      {treeGeo.deadMerged && <mesh geometry={treeGeo.deadMerged} material={foliageDeadMat} />}

      {/* Second foliage pass — mid-tone layer on subset via offset duplicate isn't feasible; use mid mat on bushes */}

      {world.bushes.map((b, i) => (
        <group key={`b${i}`} position={b.position} rotation={[0, b.rotationY, 0]}>
          <mesh position={[0, 0.25 * b.scale, 0]} material={bushMat}>
            <coneGeometry args={[0.35 * b.scale, 0.5 * b.scale, 5]} />
          </mesh>
          <mesh position={[0, 0.55 * b.scale, 0]} material={foliageMidMat}>
            <coneGeometry args={[0.28 * b.scale, 0.4 * b.scale, 5]} />
          </mesh>
        </group>
      ))}

      {world.rocks.map((r, i) => (
        <mesh key={`r${i}`} position={[r.position[0], 0.12 * r.scale, r.position[2]]} rotation={[0, r.rotationY, 0]} material={rockMat}>
          <dodecahedronGeometry args={[0.22 * r.scale, 0]} />
        </mesh>
      ))}

      {world.logs.map((l, i) => (
        <mesh
          key={`l${i}`}
          position={[l.position[0], 0.08 * l.scale, l.position[2]]}
          rotation={[0, l.rotationY, Math.PI / 2]}
          material={logMat}
        >
          <cylinderGeometry args={[0.07 * l.scale, 0.09 * l.scale, 0.9 * l.scale, 5]} />
        </mesh>
      ))}

      {world.posts.map((post, i) => (
        <group key={i} position={post.position} rotation={[0, post.rotationY, 0]}>
          <mesh position={[0, 0.8, 0]} material={postMat}>
            <boxGeometry args={[0.16, 1.6, 0.16]} />
          </mesh>
        </group>
      ))}

      {[-40, 0, 40].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 2.5, z]} material={mistMat}>
          <planeGeometry args={[WOODS.width, 50]} />
        </mesh>
      ))}

      {/* Forest edge fog walls */}
      {[
        [0, hd - 2],
        [0, -hd + 2],
        [-hw + 2, 0],
        [hw - 2, 0],
      ].map(([x, z], i) => (
        <mesh
          key={`wall${i}`}
          position={[x, 4, z]}
          rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}
          material={fogWallMat}
        >
          <planeGeometry args={[WOODS.width, 12]} />
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
      <BloodStain position={[-8, 0.006, 25]} scale={1} />
      <BloodStain position={[12, 0.006, -35]} scale={0.9} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -hd + 4]} material={grassDarkMat}>
        <planeGeometry args={[WOODS.width, 10]} />
      </mesh>
    </group>
  )
})
