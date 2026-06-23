import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getCastleLayout, CASTLE, COLORS } from '../../castle/layout'
import { BloodStain, Cobweb } from './Atmosphere'
import { OutdoorWoods } from './OutdoorWoods'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

function buildMergedBoxes(segments: { position: [number, number, number]; size: [number, number, number] }[]) {
  if (segments.length === 0) return null
  const geos = segments.map(({ position, size }) => {
    const geo = new THREE.BoxGeometry(size[0], size[1], size[2])
    geo.translate(position[0], position[1], position[2])
    return geo
  })
  const merged = mergeGeometries(geos, false)
  geos.forEach((g) => g.dispose())
  return merged
}

function buildTorchGeometry(torches: { position: [number, number, number] }[]) {
  const sticks: THREE.BufferGeometry[] = []
  const flames: THREE.BufferGeometry[] = []
  for (const torch of torches) {
    const [x, y, z] = torch.position
    const stick = new THREE.CylinderGeometry(0.04, 0.06, 0.6, 4)
    stick.translate(x, y - 0.3, z)
    sticks.push(stick)
    const flame = new THREE.ConeGeometry(0.1, 0.3, 4)
    flame.translate(x, y + 0.15, z)
    flames.push(flame)
  }
  const stickMerged = mergeGeometries(sticks, false)
  const flameMerged = mergeGeometries(flames, false)
  sticks.forEach((g) => g.dispose())
  flames.forEach((g) => g.dispose())
  return { stickMerged, flameMerged }
}

const HERO_LIGHTS: [number, number, number][] = [
  [0, 3, 34],
  [0, 3, 0],
  [0, 3, -26],
  [0, 7, -32],
  [24, 3, 0],
  [-24, 3, 0],
  [0, 3, 22],
  [-10, 7, 25],
  [0, 4, 50],
]

export const HorrorCastle = memo(function HorrorCastle() {
  const layout = useMemo(() => getCastleLayout(), [])
  const heroLights = useRef<THREE.PointLight[]>([])

  const wallGeometry = useMemo(() => buildMergedBoxes(layout.walls), [layout.walls])
  const pillarGeometry = useMemo(() => buildMergedBoxes(
    layout.pillars.map((p) => ({
      position: p.position,
      size: [p.radius * 2, p.height, p.radius * 2] as [number, number, number],
    })),
  ), [layout.pillars])
  const stairGeometry = useMemo(() => buildMergedBoxes(layout.stairs), [layout.stairs])
  const upperFloorGeometry = useMemo(() => buildMergedBoxes(layout.upperFloors), [layout.upperFloors])
  const torchGeometries = useMemo(() => buildTorchGeometry(layout.torches), [layout.torches])

  const stoneMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.stoneMid }), [])
  const darkMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.stoneDark }), [])
  const stairMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.stoneLight }), [])
  const floorMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.floor }), [])
  const upperMat = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.upperFloor }), [])
  const torchStickMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a2818' }), [])
  const torchFlameMat = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.torch }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    heroLights.current.forEach((light, i) => {
      if (!light) return
      light.intensity = 5 + Math.sin(t * 4 + i * 1.3) * 0.8
    })
  })

  const half = layout.half

  return (
    <group>
      <OutdoorWoods />

      {/* Castle interior floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floorMat}>
        <planeGeometry args={[CASTLE.outerSize + 6, CASTLE.outerSize + 6]} />
      </mesh>

      {wallGeometry && <mesh geometry={wallGeometry} material={stoneMat} />}
      {pillarGeometry && <mesh geometry={pillarGeometry} material={darkMat} />}
      {stairGeometry && <mesh geometry={stairGeometry} material={stairMat} />}
      {upperFloorGeometry && <mesh geometry={upperFloorGeometry} material={upperMat} />}

      {torchGeometries.stickMerged && (
        <mesh geometry={torchGeometries.stickMerged} material={torchStickMat} />
      )}
      {torchGeometries.flameMerged && (
        <mesh geometry={torchGeometries.flameMerged} material={torchFlameMat} />
      )}

      {HERO_LIGHTS.map((pos, i) => (
        <pointLight
          key={i}
          ref={(l) => { if (l) heroLights.current[i] = l }}
          position={pos}
          color={COLORS.torch}
          intensity={5}
          distance={38}
          decay={1.1}
        />
      ))}

      <Cobweb position={[-30, 4, -30]} rotation={[0, 0.5, 0]} scale={1.4} />
      <Cobweb position={[30, 3.5, 28]} rotation={[0, -1, 0.2]} scale={1.1} />
      <BloodStain position={[-6, 0.02, 14]} scale={1.2} />
      <BloodStain position={[0, 0.02, -24]} scale={1.5} />

      {/* Gate arch + portcullis frame */}
      <group position={[0, 0, half]}>
        {[-3, 3].map((x) => (
          <mesh key={x} position={[x, 2.5, 0]} material={darkMat}>
            <boxGeometry args={[0.5, 5, 0.5]} />
          </mesh>
        ))}
        <mesh position={[0, 4.8, 0]} material={stoneMat}>
          <boxGeometry args={[6.8, 0.5, 0.6]} />
        </mesh>
        <mesh position={[0, 2.2, -0.2]} material={darkMat}>
          <boxGeometry args={[5.5, 0.12, 0.12]} />
        </mesh>
      </group>

      <group position={[0, 0, -24]}>
        <mesh position={[0, 0.8, 0]} material={darkMat}>
          <boxGeometry args={[3, 1.6, 1.2]} />
        </mesh>
      </group>
    </group>
  )
})
