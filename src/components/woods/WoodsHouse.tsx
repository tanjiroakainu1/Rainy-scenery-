import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, type HouseDef } from '../../world/woods'

export const HOUSE_DIMS = { w: 7.2, d: 8.0, h: 3.5, t: 0.16 } as const

const { w: W, d: D, h: H, t: T } = HOUSE_DIMS

function useHouseMaterials() {
  return {
    wall: useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.houseLogDark }), []),
    plank: useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.houseLog }), []),
    trim: useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.houseTrim }), []),
    roof: useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.houseRoof }), []),
    stone: useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.stone }), []),
    brick: useMemo(() => new THREE.MeshLambertMaterial({ color: '#4a3830' }), []),
    glass: useMemo(
      () => new THREE.MeshLambertMaterial({ color: '#3a4858', emissive: '#152028', emissiveIntensity: 0.25 }),
      [],
    ),
    glow: useMemo(
      () => new THREE.MeshBasicMaterial({ color: '#ffc080', transparent: true, opacity: 0.2, depthWrite: false }),
      [],
    ),
    fireGlow: useMemo(
      () => new THREE.MeshBasicMaterial({ color: '#ff8833', transparent: true, opacity: 0.75 }),
      [],
    ),
    floor: useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2824' }), []),
    plankFloor: useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3428' }), []),
    paper: useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.paper, side: THREE.DoubleSide }), []),
    rug: useMemo(() => new THREE.MeshLambertMaterial({ color: '#4a3028' }), []),
    rugDark: useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a2820' }), []),
    cushion: useMemo(() => new THREE.MeshLambertMaterial({ color: '#5a3830' }), []),
    blanket: useMemo(() => new THREE.MeshLambertMaterial({ color: '#4a4a58' }), []),
    inner: useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3228' }), []),
    metal: useMemo(() => new THREE.MeshLambertMaterial({ color: '#5a5a60' }), []),
    fabric: useMemo(() => new THREE.MeshLambertMaterial({ color: '#6a5040' }), []),
    book: useMemo(() => new THREE.MeshLambertMaterial({ color: '#4a3828' }), []),
    bookRed: useMemo(() => new THREE.MeshLambertMaterial({ color: '#6a3028' }), []),
    bookGreen: useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a4030' }), []),
    jar: useMemo(() => new THREE.MeshLambertMaterial({ color: '#6a7068' }), []),
    pot: useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3632' }), []),
    iron: useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a2a30' }), []),
  }
}

type Mats = ReturnType<typeof useHouseMaterials>

function SolidWall({
  position,
  size,
  mat,
}: {
  position: [number, number, number]
  size: [number, number, number]
  mat: THREE.MeshLambertMaterial
}) {
  const [sw, sh] = size
  const bands = Math.floor(sh / 0.22)

  return (
    <group position={position}>
      <mesh material={mat}>
        <boxGeometry args={size} />
      </mesh>
      {Array.from({ length: bands }, (_, i) => (
        <mesh key={i} position={[0, -sh / 2 + 0.11 + i * 0.22, 0]} material={mat}>
          <boxGeometry args={[sw * 0.996, 0.018, size[2] * 0.996]} />
        </mesh>
      ))}
    </group>
  )
}

function WallNote({ position, rotation, m }: { position: [number, number, number]; rotation: [number, number, number]; m: Mats }) {
  const noteGlow = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#d8c4a0', transparent: true, opacity: 0.95 }),
    [],
  )
  const bloodMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#5a1818', transparent: true, opacity: 0.55, depthWrite: false }),
    [],
  )
  const bloodSmearMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#3a1010', transparent: true, opacity: 0.4, depthWrite: false }),
    [],
  )
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m.trim}>
        <boxGeometry args={[0.48, 0.36, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.012]} material={noteGlow}>
        <planeGeometry args={[0.38, 0.28]} />
      </mesh>
      <mesh position={[0.08, -0.06, 0.014]} material={bloodMat}>
        <planeGeometry args={[0.14, 0.16]} />
      </mesh>
      <mesh position={[-0.1, 0.08, 0.014]} rotation={[0, 0, 0.15]} material={bloodSmearMat}>
        <planeGeometry args={[0.1, 0.08]} />
      </mesh>
      <pointLight position={[0, 0, 0.3]} color="#c8a080" intensity={0.6} distance={2.5} decay={2} />
    </group>
  )
}

function WoodWall({
  position,
  size,
  mat,
  plankMat,
  face = 'z',
}: {
  position: [number, number, number]
  size: [number, number, number]
  mat: THREE.MeshLambertMaterial
  plankMat: THREE.MeshLambertMaterial
  face?: 'x' | 'z'
}) {
  const [sw, sh, sd] = size
  const count = face === 'z' ? Math.floor(sh / 0.19) : Math.floor(sw / 0.19)
  const offset = face === 'z' ? sd / 2 + 0.008 : sw / 2 + 0.008

  return (
    <group position={position}>
      <mesh material={mat}>
        <boxGeometry args={size} />
      </mesh>
      {face === 'z' &&
        Array.from({ length: count }, (_, i) => (
          <mesh
            key={i}
            position={[0, -sh / 2 + 0.095 + i * 0.19, offset]}
            material={i % 2 === 0 ? plankMat : mat}
          >
            <boxGeometry args={[sw * 0.98, 0.085, 0.015]} />
          </mesh>
        ))}
      {face === 'x' &&
        Array.from({ length: count }, (_, i) => (
          <mesh
            key={i}
            position={[-sw / 2 + 0.095 + i * 0.19, 0, offset]}
            material={i % 2 === 0 ? plankMat : mat}
          >
            <boxGeometry args={[0.085, sh * 0.98, 0.015]} />
          </mesh>
        ))}
    </group>
  )
}

function WindowFrame({
  position,
  mat,
  trim,
  glass,
  glow,
  wide = false,
}: {
  position: [number, number, number]
  mat: THREE.MeshLambertMaterial
  trim: THREE.MeshLambertMaterial
  glass: THREE.MeshLambertMaterial
  glow: THREE.MeshBasicMaterial
  wide?: boolean
}) {
  const fw = wide ? 0.12 : 0.1
  const gw = wide ? 0.72 : 0.58
  const gh = wide ? 0.68 : 0.58

  return (
    <group position={position}>
      <mesh material={trim}>
        <boxGeometry args={[fw, 0.82, gw + 0.1]} />
      </mesh>
      <mesh position={[0.02, 0, 0]} material={glass}>
        <boxGeometry args={[0.04, gh, gw]} />
      </mesh>
      <mesh position={[-0.01, 0, 0]} material={glow}>
        <planeGeometry args={[gw * 0.75, gh * 0.75]} />
      </mesh>
      <mesh position={[0.03, 0, 0]} material={mat}>
        <boxGeometry args={[0.02, gh, 0.04]} />
      </mesh>
      <mesh position={[0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mat}>
        <boxGeometry args={[0.02, gh * 0.85, 0.04]} />
      </mesh>
    </group>
  )
}

function GableRoof({ mat, trim }: { mat: THREE.MeshLambertMaterial; trim: THREE.MeshLambertMaterial }) {
  const rise = 1.35
  const halfD = D / 2 + 0.35
  const slopeLen = Math.hypot(halfD, rise)
  const angle = Math.atan2(rise, halfD)

  return (
    <group position={[0, H + 0.02, 0]}>
      {/* Solid roof slopes — thicker, no see-through gap */}
      <mesh position={[0, rise / 2, -halfD / 2]} rotation={[angle, 0, 0]} material={mat}>
        <boxGeometry args={[W + 0.75, 0.22, slopeLen]} />
      </mesh>
      <mesh position={[0, rise / 2, halfD / 2]} rotation={[-angle, 0, 0]} material={mat}>
        <boxGeometry args={[W + 0.75, 0.22, slopeLen]} />
      </mesh>
      {/* Shingle rows */}
      {[0.25, 0.5, 0.75].map((t) => (
        <group key={t}>
          <mesh
            position={[0, rise * t, -halfD * (1 - t * 0.5)]}
            rotation={[angle * (1 - t * 0.3), 0, 0]}
            material={trim}
          >
            <boxGeometry args={[W + 0.6 - t * 0.2, 0.04, slopeLen * 0.28]} />
          </mesh>
          <mesh
            position={[0, rise * t, halfD * (1 - t * 0.5)]}
            rotation={[-angle * (1 - t * 0.3), 0, 0]}
            material={trim}
          >
            <boxGeometry args={[W + 0.6 - t * 0.2, 0.04, slopeLen * 0.28]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, rise + 0.06, 0]} material={mat}>
        <boxGeometry args={[0.24, 0.16, D + 0.75]} />
      </mesh>
      {/* Solid gable fills */}
      <mesh position={[0, rise * 0.52, -D / 2 - 0.1]} material={mat}>
        <boxGeometry args={[W + 0.18, rise * 1.14, 0.18]} />
      </mesh>
      <mesh position={[0, rise * 0.52, D / 2 + 0.1]} material={mat}>
        <boxGeometry args={[W + 0.18, rise * 1.14, 0.18]} />
      </mesh>
      {/* Wall-top plate — closes the V gap at eaves */}
      <mesh position={[0, 0.12, -D / 2 - 0.02]} material={trim}>
        <boxGeometry args={[W + 0.5, 0.14, 0.16]} />
      </mesh>
      <mesh position={[0, 0.12, D / 2 + 0.02]} material={trim}>
        <boxGeometry args={[W + 0.5, 0.14, 0.16]} />
      </mesh>
      <mesh position={[-W / 2 - 0.12, 0.12, 0]} material={trim}>
        <boxGeometry args={[0.16, 0.14, D + 0.5]} />
      </mesh>
      <mesh position={[W / 2 + 0.12, 0.12, 0]} material={trim}>
        <boxGeometry args={[0.16, 0.14, D + 0.5]} />
      </mesh>
    </group>
  )
}

function Fireplace({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} material={m.stone}>
        <boxGeometry args={[1.6, 1.1, 0.55]} />
      </mesh>
      <mesh position={[0, 0.2, 0.12]} material={m.brick}>
        <boxGeometry args={[1.1, 0.4, 0.35]} />
      </mesh>
      <mesh position={[0, 0.42, 0.18]} material={m.fireGlow}>
        <boxGeometry args={[0.7, 0.35, 0.12]} />
      </mesh>
      <mesh position={[0, 0.55, 0.22]} material={m.fireGlow}>
        <coneGeometry args={[0.22, 0.45, 6]} />
      </mesh>
      <mesh position={[-0.55, 1.15, 0]} material={m.trim}>
        <boxGeometry args={[0.45, 0.12, 0.55]} />
      </mesh>
      <mesh position={[0.55, 1.15, 0]} material={m.trim}>
        <boxGeometry args={[0.45, 0.12, 0.55]} />
      </mesh>
      <mesh position={[0, 1.35, 0]} material={m.trim}>
        <boxGeometry args={[1.55, 0.1, 0.55]} />
      </mesh>
      <mesh position={[0.75, 0.35, 0.35]} rotation={[0.2, -0.3, 0.8]} material={m.iron}>
        <boxGeometry args={[0.06, 0.5, 0.08]} />
      </mesh>
      <pointLight position={[0, 0.6, 0.3]} color="#ff8844" intensity={4} distance={8} decay={1.6} />
    </group>
  )
}

function KitchenCorner({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} material={m.trim}>
        <boxGeometry args={[2.2, 0.9, 0.55]} />
      </mesh>
      <mesh position={[-0.85, 0.92, 0]} material={m.trim}>
        <boxGeometry args={[0.45, 0.06, 0.5]} />
      </mesh>
      <mesh position={[0.55, 0.55, -0.05]} material={m.iron}>
        <boxGeometry args={[0.55, 0.7, 0.45]} />
      </mesh>
      <mesh position={[0.55, 0.95, -0.05]} material={m.iron}>
        <boxGeometry args={[0.5, 0.06, 0.4]} />
      </mesh>
      {[-0.35, 0.1, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.75, -0.12]} material={m.jar}>
          <cylinderGeometry args={[0.06, 0.07, 0.14, 6]} />
        </mesh>
      ))}
      <mesh position={[-0.7, 0.58, 0.1]} material={m.pot}>
        <cylinderGeometry args={[0.12, 0.1, 0.1, 8]} />
      </mesh>
      <mesh position={[-0.45, 0.95, -0.1]} material={m.metal}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 6]} />
      </mesh>
      <mesh position={[0.2, 0.95, -0.08]} material={m.paper} rotation={[-0.3, 0.2, 0]}>
        <planeGeometry args={[0.22, 0.16]} />
      </mesh>
    </group>
  )
}

function DiningSet({ position, m }: { position: [number, number, number]; m: Mats }) {
  const chairs: [number, number, number][] = [
    [-0.75, 0, -0.55],
    [0.75, 0, -0.55],
    [-0.75, 0, 0.55],
    [0.75, 0, 0.55],
  ]

  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} material={m.trim}>
        <boxGeometry args={[1.5, 0.06, 0.95]} />
      </mesh>
      {[[-0.65, -0.35], [0.65, -0.35], [-0.65, 0.35], [0.65, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} material={m.trim}>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
        </mesh>
      ))}
      {chairs.map(([x, , z], i) => (
        <group key={`c${i}`} position={[x, 0, z]} rotation={[0, x < 0 ? 0.15 : -0.15, 0]}>
          <mesh position={[0, 0.22, 0]} material={m.trim}>
            <boxGeometry args={[0.42, 0.06, 0.38]} />
          </mesh>
          <mesh position={[0, 0.48, -0.14]} material={m.trim}>
            <boxGeometry args={[0.42, 0.48, 0.06]} />
          </mesh>
        </group>
      ))}
      <group position={[0.15, 0.48, 0.05]}>
        <mesh material={m.trim}>
          <cylinderGeometry args={[0.05, 0.06, 0.14, 6]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={m.glow}>
          <sphereGeometry args={[0.05, 6, 6]} />
        </mesh>
      </group>
      <mesh position={[-0.2, 0.46, 0.12]} material={m.paper} rotation={[-Math.PI / 2, 0.3, 0]}>
        <planeGeometry args={[0.35, 0.24]} />
      </mesh>
      <mesh position={[0.35, 0.46, -0.1]} material={m.metal}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 6]} />
      </mesh>
    </group>
  )
}

function Bookshelf({ position, m, tall = false }: { position: [number, number, number]; m: Mats; tall?: boolean }) {
  const h = tall ? 1.85 : 1.35
  const books = tall ? 8 : 5

  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} material={m.trim}>
        <boxGeometry args={[0.85, h, 0.28]} />
      </mesh>
      {[0.35, 0.75, 1.15].filter((y) => y < h).map((y) => (
        <mesh key={y} position={[0, y, 0]} material={m.plank}>
          <boxGeometry args={[0.78, 0.04, 0.24]} />
        </mesh>
      ))}
      {Array.from({ length: books }, (_, i) => {
        const row = Math.floor(i / (tall ? 3 : 2))
        const col = i % (tall ? 3 : 2)
        const mats = [m.book, m.bookRed, m.bookGreen]
        return (
          <mesh
            key={i}
            position={[-0.2 + col * 0.22, 0.22 + row * 0.38, 0]}
            material={mats[i % 3]}
          >
            <boxGeometry args={[0.1, 0.28, 0.16]} />
          </mesh>
        )
      })}
    </group>
  )
}

function Couch({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} material={m.fabric}>
        <boxGeometry args={[1.6, 0.22, 0.72]} />
      </mesh>
      <mesh position={[0, 0.52, -0.28]} material={m.fabric}>
        <boxGeometry args={[1.6, 0.48, 0.14]} />
      </mesh>
      <mesh position={[-0.72, 0.42, 0]} material={m.fabric}>
        <boxGeometry args={[0.14, 0.38, 0.65]} />
      </mesh>
      <mesh position={[0.72, 0.42, 0]} material={m.fabric}>
        <boxGeometry args={[0.14, 0.38, 0.65]} />
      </mesh>
      <mesh position={[0, 0.32, 0.05]} material={m.cushion}>
        <boxGeometry args={[0.55, 0.08, 0.45]} />
      </mesh>
      <mesh position={[0.35, 0.38, 0.2]} material={m.paper} rotation={[-0.2, 0.4, 0.1]}>
        <planeGeometry args={[0.2, 0.14]} />
      </mesh>
    </group>
  )
}

function BedAlcove({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]} material={m.trim}>
        <boxGeometry args={[1.35, 0.12, 2.1]} />
      </mesh>
      <mesh position={[0, 0.38, -0.15]} material={m.blanket}>
        <boxGeometry args={[1.2, 0.08, 1.6]} />
      </mesh>
      <mesh position={[0, 0.45, 0.55]} material={m.cushion}>
        <boxGeometry args={[0.55, 0.12, 0.35]} />
      </mesh>
      <mesh position={[0.55, 0.35, -0.75]} material={m.trim}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
      </mesh>
      <mesh position={[0.55, 0.55, -0.75]} material={m.glow}>
        <sphereGeometry args={[0.035, 6, 6]} />
      </mesh>
      <mesh position={[-0.55, 0.95, -0.55]} material={m.trim}>
        <boxGeometry args={[0.55, 1.75, 0.35]} />
      </mesh>
      <mesh position={[-0.55, 1.15, -0.38]} material={m.glass}>
        <planeGeometry args={[0.35, 0.55]} />
      </mesh>
      <mesh position={[0.1, 0.95, 0.85]} material={m.paper} rotation={[0, 0.5, 0]}>
        <planeGeometry args={[0.22, 0.16]} />
      </mesh>
    </group>
  )
}

function StudyDesk({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} material={m.trim}>
        <boxGeometry args={[1.1, 0.06, 0.62]} />
      </mesh>
      {[[-0.48, -0.24], [0.48, -0.24], [-0.48, 0.24], [0.48, 0.24]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} material={m.trim}>
          <boxGeometry args={[0.07, 0.4, 0.07]} />
        </mesh>
      ))}
      <mesh position={[-0.15, 0.44, 0.05]} material={m.paper} rotation={[-Math.PI / 2, 0.15, 0]}>
        <planeGeometry args={[0.28, 0.2]} />
      </mesh>
      <mesh position={[0.2, 0.44, -0.08]} material={m.bookRed}>
        <boxGeometry args={[0.14, 0.06, 0.18]} />
      </mesh>
      <group position={[0.35, 0.44, 0.12]}>
        <mesh material={m.trim}>
          <cylinderGeometry args={[0.025, 0.03, 0.1, 6]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={m.glow}>
          <sphereGeometry args={[0.03, 6, 6]} />
        </mesh>
      </group>
      <mesh position={[0, 0.22, 0.42]} rotation={[0, Math.PI, 0]} material={m.trim}>
        <boxGeometry args={[0.38, 0.06, 0.38]} />
      </mesh>
      <mesh position={[0, 0.42, 0.42]} material={m.trim}>
        <boxGeometry args={[0.38, 0.42, 0.06]} />
      </mesh>
    </group>
  )
}

function Loft({ position, m }: { position: [number, number, number]; m: Mats }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.15, 0]} material={m.plank}>
        <boxGeometry args={[2.2, 0.1, 2.0]} />
      </mesh>
      <mesh position={[-0.55, 2.35, 0.35]} material={m.blanket}>
        <boxGeometry args={[0.9, 0.06, 0.7]} />
      </mesh>
      <mesh position={[0.45, 2.28, -0.35]} material={m.trim}>
        <boxGeometry args={[0.65, 0.38, 0.45]} />
      </mesh>
      {/* Ladder tucked in NW corner */}
      <mesh position={[-0.95, 1.05, -0.75]} rotation={[0, 0, -0.12]} material={m.trim}>
        <boxGeometry args={[0.1, 2.1, 0.1]} />
      </mesh>
      {[-0.7, -0.35, 0].map((y, i) => (
        <mesh key={i} position={[-0.82, 0.55 + y, -0.68 + i * 0.12]} rotation={[0.35, 0, 0]} material={m.plank}>
          <boxGeometry args={[0.38, 0.05, 0.1]} />
        </mesh>
      ))}
    </group>
  )
}

function InteriorScene({ m }: { m: Mats }) {
  const hw = W / 2
  const hd = D / 2
  const shadowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#0a0808', transparent: true, opacity: 0.25 }),
    [],
  )

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={m.floor}>
        <planeGeometry args={[W, D]} />
      </mesh>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-hw + 0.4 + (i % 5) * 1.35, 0.015, -hd + 0.45 + Math.floor(i / 5) * 1.55]}
          material={m.plankFloor}
        >
          <planeGeometry args={[1.2, 0.06]} />
        </mesh>
      ))}

      {/* Baseboards */}
      {[
        [0, 0.08, hd - 0.06, W - 0.2, 0.08, 0.06],
        [0, 0.08, -hd + 0.06, W - 0.2, 0.08, 0.06],
        [-hw + 0.06, 0.08, 0, 0.06, 0.08, D - 0.2],
        [hw - 0.06, 0.08, 0, 0.06, 0.08, D - 0.2],
      ].map((args, i) => (
        <mesh key={i} position={[args[0], args[1], args[2]]} material={m.trim}>
          <boxGeometry args={[args[3], args[4], args[5]]} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.016, 0.35]} material={m.rug}>
        <planeGeometry args={[2.6, 2.0]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.55, 0.017, -0.5]} material={m.rugDark}>
        <planeGeometry args={[1.5, 2.2]} />
      </mesh>

      {/* Solid interior walls — no gap planks */}
      <SolidWall position={[-hw + T / 2, H / 2, 0]} size={[T, H, D]} mat={m.inner} />
      <SolidWall position={[0, H / 2, -hd + T / 2]} size={[W, H, T]} mat={m.inner} />
      <SolidWall position={[0, H / 2, hd - T / 2]} size={[W, H, T]} mat={m.inner} />

      {/* Bedroom partition with doorway */}
      <SolidWall position={[-2.05, H / 2, -1.55]} size={[T, H, 2.5]} mat={m.inner} />
      <SolidWall position={[-2.05, H / 2, 2.35]} size={[T, H, 1.8]} mat={m.inner} />
      <mesh position={[-2.05, 1.05, 0.85]} material={m.trim}>
        <boxGeometry args={[T + 0.06, 2.1, 0.9]} />
      </mesh>

      <SolidWall position={[hw - T / 2, H / 2, -2.2]} size={[T, H, 3.4]} mat={m.inner} />
      <SolidWall position={[hw - T / 2, H / 2, 2.2]} size={[T, H, 3.4]} mat={m.inner} />
      <SolidWall position={[hw - T / 2, H - 0.22, 0]} size={[T, 0.42, 1.05]} mat={m.inner} />

      {/* Door frame */}
      <mesh position={[hw - T / 2 - 0.02, 1.15, 0]} material={m.trim}>
        <boxGeometry args={[0.08, 2.3, 0.78]} />
      </mesh>
      <mesh position={[hw - T / 2 - 0.02, 1.15, 0.35]} material={m.trim}>
        <boxGeometry args={[0.08, 2.3, 0.08]} />
      </mesh>
      <mesh position={[hw - T / 2, 1.0, 0.38]} material={m.trim}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      {/* Window frames with trim */}
      {[
        [-hw + T / 2 + 0.02, 1.55, -1.5, 0, Math.PI / 2, 0],
        [-hw + T / 2 + 0.02, 1.55, 1.5, 0, Math.PI / 2, 0],
        [0, 1.55, -hd + T / 2 + 0.02, 0, 0, 0],
      ].map(([x, y, z, rx, ry, rz], i) => (
        <group key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
          <mesh material={m.trim}>
            <boxGeometry args={[1.0, 0.82, 0.04]} />
          </mesh>
          <mesh position={[0, 0, 0.02]} material={m.glass}>
            <planeGeometry args={[0.82, 0.65]} />
          </mesh>
        </group>
      ))}

      {/* Ceiling beams */}
      {[-2.2, 0, 2.2].map((z) => (
        <mesh key={z} position={[0, H + 0.12, z]} material={m.trim}>
          <boxGeometry args={[W - 0.4, 0.1, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, H + 0.5, 0]} material={m.roof}>
        <boxGeometry args={[W + 0.1, 0.14, D + 0.1]} />
      </mesh>

      {/* Warm interior lighting */}
      <pointLight position={[0, 2.6, 0]} color="#ffcc99" intensity={4.5} distance={16} decay={1.3} />
      <pointLight position={[0, 0.8, -2.2]} color="#ff8844" intensity={3.5} distance={10} decay={1.5} />
      <pointLight position={[-2.5, 1.8, 0]} color="#ffaa66" intensity={2} distance={7} decay={1.8} />
      <pointLight position={[1.8, 1.5, 1.5]} color="#c8d0d8" intensity={1.4} distance={7} decay={2} />

      <Fireplace position={[0, 0, -2.55]} m={m} />
      <KitchenCorner position={[-2.35, 0, -2.45]} m={m} />
      <DiningSet position={[0.2, 0, 0.35]} m={m} />
      <Couch position={[0.35, 0, 2.55]} m={m} />
      <Bookshelf position={[-2.55, 0, 2.0]} m={m} tall />
      <Bookshelf position={[2.45, 0, -0.35]} m={m} />
      <BedAlcove position={[-2.85, 0, -0.35]} m={m} />
      <StudyDesk position={[-2.35, 0, 2.35]} m={m} />
      <Loft position={[-0.8, 0, -1.4]} m={m} />

      {/* Furniture ground shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.012, 0.35]} material={shadowMat}>
        <planeGeometry args={[2.0, 1.6]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.35, 0.012, 2.55]} material={shadowMat}>
        <planeGeometry args={[1.8, 0.9]} />
      </mesh>

      <group position={[1.75, 0, 0.2]}>
        <mesh position={[0, 0.9, 0]} material={m.trim}>
          <cylinderGeometry args={[0.03, 0.04, 1.8, 5]} />
        </mesh>
        {[-0.35, 0, 0.35].map((x, i) => (
          <mesh key={i} position={[x, 1.55, 0]} rotation={[0, 0, Math.PI / 2]} material={m.trim}>
            <cylinderGeometry args={[0.02, 0.02, 0.35, 4]} />
          </mesh>
        ))}
        <mesh position={[0.15, 0.08, 0.1]} material={m.fabric}>
          <boxGeometry args={[0.35, 0.12, 0.08]} />
        </mesh>
      </group>

      <group position={[2.35, 0, 2.45]}>
        <mesh position={[0, 0.28, 0]} material={m.trim}>
          <boxGeometry args={[0.75, 0.45, 0.48]} />
        </mesh>
        <mesh position={[0, 0.54, 0]} material={m.plank}>
          <boxGeometry args={[0.78, 0.06, 0.5]} />
        </mesh>
        <mesh position={[0, 0.32, 0.2]} material={m.metal}>
          <boxGeometry args={[0.12, 0.06, 0.04]} />
        </mesh>
      </group>

      <mesh position={[-hw + T / 2 + 0.03, 2.2, 0.5]} rotation={[0, Math.PI / 2, 0]} material={m.trim}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 10]} />
      </mesh>

      <WallNote position={[0, 1.75, -hd + T / 2 + 0.04]} rotation={[0, 0, 0]} m={m} />
      <mesh position={[-hw + T / 2 + 0.02, 1.85, 0]} rotation={[0, Math.PI / 2, 0]} material={m.paper}>
        <planeGeometry args={[0.42, 0.32]} />
      </mesh>

      <group position={[2.55, 0, -2.35]}>
        <mesh position={[0, 0.55, 0]} material={m.trim}>
          <boxGeometry args={[0.55, 0.06, 0.38]} />
        </mesh>
        <mesh position={[0, 0.48, 0]} material={m.metal}>
          <cylinderGeometry args={[0.14, 0.12, 0.08, 8]} />
        </mesh>
      </group>

      <group position={[0, 2.4, 1.6]}>
        <mesh material={m.iron}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
        </mesh>
        <mesh position={[0, -0.2, 0]} material={m.glow}>
          <sphereGeometry args={[0.05, 8, 8]} />
        </mesh>
        <pointLight position={[0, -0.15, 0]} color="#ffcc88" intensity={1.5} distance={5} decay={2} />
      </group>
    </>
  )
}

type WoodsHouseProps = {
  house: HouseDef
  showInterior: boolean
}

export const WoodsHouse = memo(function WoodsHouse({ house, showInterior }: WoodsHouseProps) {
  const m = useHouseMaterials()
  const [hx, , hz] = house.position
  const hw = W / 2
  const hd = D / 2

  if (showInterior) {
    return (
      <group position={[hx, 0, hz]}>
        <InteriorScene m={m} />
      </group>
    )
  }

  return (
    <group position={[hx, 0, hz]} rotation={[0, house.rotationY, 0]}>
      <mesh position={[0, 0.06, 0]} material={m.stone}>
        <boxGeometry args={[W + 0.45, 0.14, D + 0.45]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={m.trim}>
        <boxGeometry args={[W + 0.08, 0.07, D + 0.08]} />
      </mesh>

      <WoodWall position={[-hw + T / 2, H / 2, 0]} size={[T, H, D]} mat={m.wall} plankMat={m.plank} face="z" />
      <WoodWall position={[0, H / 2, -hd + T / 2]} size={[W, H, T]} mat={m.wall} plankMat={m.plank} face="x" />
      <WoodWall position={[0, H / 2, hd - T / 2]} size={[W, H, T]} mat={m.wall} plankMat={m.plank} face="x" />

      {/* Corner posts */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (hw - 0.08), H / 2, sz * (hd - 0.08)]} material={m.plank}>
          <boxGeometry args={[0.18, H, 0.18]} />
        </mesh>
      ))}

      <WoodWall position={[hw - T / 2, H / 2, -2.2]} size={[T, H, 3.4]} mat={m.wall} plankMat={m.plank} face="z" />
      <WoodWall position={[hw - T / 2, H / 2, 2.2]} size={[T, H, 3.4]} mat={m.wall} plankMat={m.plank} face="z" />
      <WoodWall position={[hw - T / 2, H - 0.22, 0]} size={[T, 0.42, 1.05]} mat={m.wall} plankMat={m.plank} face="z" />

      <GableRoof mat={m.roof} trim={m.trim} />

      <mesh position={[-1.5, H + 0.95, -1.5]} material={m.brick}>
        <boxGeometry args={[0.5, 1.45, 0.5]} />
      </mesh>
      <mesh position={[-1.5, H + 1.75, -1.5]} material={m.stone}>
        <boxGeometry args={[0.58, 0.12, 0.58]} />
      </mesh>

      {/* Porch */}
      <mesh position={[hw + 0.75, 0.16, 0]} material={m.trim}>
        <boxGeometry args={[1.1, 0.1, 3.2]} />
      </mesh>
      <mesh position={[hw + 0.5, 0.08, 0]} material={m.stone}>
        <boxGeometry args={[0.75, 0.16, 2.8]} />
      </mesh>
      {[-1.4, 0, 1.4].map((z) => (
        <mesh key={z} position={[hw + 0.75, 0.85, z]} material={m.trim}>
          <boxGeometry args={[0.1, 1.45, 0.1]} />
        </mesh>
      ))}
      <mesh position={[hw + 0.75, 1.85, 0]} material={m.roof}>
        <boxGeometry args={[1.35, 0.08, 3.5]} />
      </mesh>
      {[-1.55, -0.75, 0, 0.75, 1.55].map((z, i) => (
        <mesh key={i} position={[hw + 0.75, 0.24, z]} material={m.stone}>
          <boxGeometry args={[0.85, 0.1, 0.22]} />
        </mesh>
      ))}

      <mesh position={[hw - T / 2 - 0.02, H / 2, 0]} material={m.trim}>
        <boxGeometry args={[0.12, H * 0.96, 1.05]} />
      </mesh>
      <mesh position={[hw + 0.03, 1.15, 0]} material={m.plank}>
        <boxGeometry args={[0.1, 2.2, 0.88]} />
      </mesh>
      <mesh position={[hw + 0.08, 1.05, 0.4]} material={m.trim}>
        <sphereGeometry args={[0.04, 6, 6]} />
      </mesh>

      <WindowFrame position={[hw + 0.02, 1.55, -1.35]} mat={m.trim} trim={m.trim} glass={m.glass} glow={m.glow} wide />
      <WindowFrame position={[hw + 0.02, 1.55, 1.35]} mat={m.trim} trim={m.trim} glass={m.glass} glow={m.glow} wide />
      <WindowFrame position={[-hw + 0.02, 1.55, -1.5]} mat={m.trim} trim={m.trim} glass={m.glass} glow={m.glow} />
      <WindowFrame position={[-hw + 0.02, 1.55, 1.5]} mat={m.trim} trim={m.trim} glass={m.glass} glow={m.glow} />
      <WindowFrame position={[0, 1.55, -hd + 0.02]} mat={m.trim} trim={m.trim} glass={m.glass} glow={m.glow} wide />

      <group position={[hw + 0.6, 1.55, 1.2]}>
        <mesh material={m.trim}>
          <boxGeometry args={[0.12, 0.16, 0.12]} />
        </mesh>
        <mesh position={[0, -0.14, 0]} material={m.trim}>
          <cylinderGeometry args={[0.018, 0.018, 0.24, 4]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={m.glow}>
          <sphereGeometry args={[0.055, 6, 6]} />
        </mesh>
        <pointLight color="#ffaa55" intensity={1.2} distance={6} decay={2} />
      </group>

      <pointLight position={[0, 1.6, 0]} color="#ffcc99" intensity={0.85} distance={8} decay={2} />
      <pointLight position={[hw + 0.3, 1.2, 0]} color="#ffaa55" intensity={0.5} distance={5} decay={2} />
    </group>
  )
})
