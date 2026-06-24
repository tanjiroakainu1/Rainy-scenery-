import { memo, useMemo } from 'react'
import * as THREE from 'three'
import { COLORS, type VehicleDef } from '../../world/woods'

/** Local +Z = front (hood). Park with rotationY = -π/2 so hood faces the campfire. */
function Wheel({ x, z, mats }: { x: number; z: number; mats: { tire: THREE.Material; hub: THREE.Material } }) {
  return (
    <group position={[x, 0.34, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mats.tire}>
        <cylinderGeometry args={[0.37, 0.37, 0.28, 16]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={mats.hub}>
        <cylinderGeometry args={[0.19, 0.19, 0.29, 12]} />
      </mesh>
    </group>
  )
}

type WoodsCarProps = {
  vehicle: VehicleDef
}

export const WoodsCar = memo(function WoodsCar({ vehicle }: WoodsCarProps) {
  const paint = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.carBody }), [])
  const paintDark = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.carBodyDark }), [])
  const roof = useMemo(() => new THREE.MeshLambertMaterial({ color: '#3a3e42' }), [])
  const mud = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a241c' }), [])
  const glass = useMemo(
    () => new THREE.MeshLambertMaterial({ color: COLORS.carGlass, transparent: true, opacity: 0.8 }),
    [],
  )
  const glassTint = useMemo(
    () => new THREE.MeshLambertMaterial({ color: '#141c22', transparent: true, opacity: 0.9 }),
    [],
  )
  const chrome = useMemo(() => new THREE.MeshLambertMaterial({ color: COLORS.carChrome }), [])
  const rubber = useMemo(() => new THREE.MeshLambertMaterial({ color: '#101010' }), [])
  const headlight = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffe8b0' }), [])
  const tailRed = useMemo(() => new THREE.MeshBasicMaterial({ color: '#aa2828' }), [])
  const fabric = useMemo(() => new THREE.MeshLambertMaterial({ color: '#5a4a38' }), [])
  const tarp = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a3828' }), [])
  const shadow = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#050505', transparent: true, opacity: 0.5 }),
    [],
  )
  const warmPaint = useMemo(
    () => new THREE.MeshLambertMaterial({ color: COLORS.carBody, emissive: '#2a2018', emissiveIntensity: 0.22 }),
    [],
  )

  const wheelMats = useMemo(
    () => ({
      tire: rubber,
      hub: new THREE.MeshLambertMaterial({ color: '#222830' }),
    }),
    [rubber],
  )

  return (
    <group position={vehicle.position} rotation={[0, vehicle.rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} material={shadow}>
        <planeGeometry args={[2.6, 4.9]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={mud}>
        <planeGeometry args={[2.2, 4.4]} />
      </mesh>

      {/* Chassis */}
      <mesh position={[0, 0.26, 0]} material={paintDark}>
        <boxGeometry args={[1.92, 0.14, 4.25]} />
      </mesh>

      {/* Wheel wells — connect body to wheels */}
      {[
        [-0.9, 1.3],
        [0.9, 1.3],
        [-0.9, -1.3],
        [0.9, -1.3],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.38, z]} material={paintDark}>
          <boxGeometry args={[0.28, 0.2, 0.75]} />
        </mesh>
      ))}

      {/* Body panels */}
      <mesh position={[0, 0.5, 0.08]} material={paint}>
        <boxGeometry args={[1.84, 0.44, 3.35]} />
      </mesh>
      <mesh position={[0, 0.48, 1.62]} material={warmPaint}>
        <boxGeometry args={[1.82, 0.4, 1.08]} />
      </mesh>
      <mesh position={[0, 0.52, -1.62]} material={paint}>
        <boxGeometry args={[1.82, 0.46, 1.02]} />
      </mesh>

      {/* Hood slope */}
      <mesh position={[0, 0.62, 1.88]} rotation={[0.2, 0, 0]} material={warmPaint}>
        <boxGeometry args={[1.78, 0.11, 0.82]} />
      </mesh>

      {/* Chrome belt */}
      <mesh position={[0, 0.66, 0]} material={chrome}>
        <boxGeometry args={[1.88, 0.04, 3.65]} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.84, -0.04]} material={roof}>
        <boxGeometry args={[1.66, 0.09, 2.42]} />
      </mesh>
      <mesh position={[0, 1.08, -0.08]} material={roof}>
        <boxGeometry args={[1.62, 0.11, 2.18]} />
      </mesh>

      {/* Side windows */}
      {[-0.92, 0.92].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.86, 0.28]} material={glass}>
            <boxGeometry args={[0.06, 0.42, 1.12]} />
          </mesh>
          <mesh position={[x, 0.86, -0.82]} material={glassTint}>
            <boxGeometry args={[0.06, 0.4, 0.82]} />
          </mesh>
          <mesh position={[x, 0.74, 0.28]} material={chrome}>
            <boxGeometry args={[0.07, 0.05, 1.14]} />
          </mesh>
        </group>
      ))}

      {/* Windshield & rear glass */}
      <mesh position={[0, 0.9, 1.02]} rotation={[0.36, 0, 0]} material={glass}>
        <boxGeometry args={[1.54, 0.45, 0.08]} />
      </mesh>
      <mesh position={[0, 0.92, -1.08]} rotation={[-0.34, 0, 0]} material={glassTint}>
        <boxGeometry args={[1.52, 0.42, 0.08]} />
      </mesh>

      {/* Pillars & doors */}
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x, 0.94, 1.02]} material={paintDark}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
        </mesh>
      ))}
      {[-0.92, 0.92].map((x) => (
        <mesh key={`h${x}`} position={[x > 0 ? x - 0.08 : x + 0.08, 0.62, 0.4]} material={chrome}>
          <boxGeometry args={[0.06, 0.05, 0.14]} />
        </mesh>
      ))}

      {/* Bumpers */}
      <mesh position={[0, 0.38, 2.14]} material={chrome}>
        <boxGeometry args={[1.8, 0.17, 0.16]} />
      </mesh>
      <mesh position={[0, 0.38, -2.14]} material={chrome}>
        <boxGeometry args={[1.8, 0.17, 0.16]} />
      </mesh>
      <mesh position={[0, 0.42, 2.18]} material={rubber}>
        <boxGeometry args={[1.72, 0.1, 0.08]} />
      </mesh>
      <mesh position={[0, 0.42, -2.18]} material={rubber}>
        <boxGeometry args={[1.72, 0.1, 0.08]} />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.54, 2.12]} material={paintDark}>
        <boxGeometry args={[1.28, 0.32, 0.1]} />
      </mesh>
      {[-0.4, -0.14, 0.14, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.54, 2.16]} material={chrome}>
          <boxGeometry args={[0.05, 0.26, 0.03]} />
        </mesh>
      ))}

      {/* Headlights — face +Z (toward campfire when parked) */}
      {[-0.66, 0.66].map((x) => (
        <group key={x} position={[x, 0.56, 2.12]} rotation={[0, 0, 0]}>
          <mesh material={chrome}>
            <cylinderGeometry args={[0.15, 0.15, 0.07, 12]} />
          </mesh>
          <mesh position={[0, 0, 0.04]} material={headlight}>
            <circleGeometry args={[0.12, 12]} />
          </mesh>
        </group>
      ))}

      {/* Taillights */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.58, -2.12]} material={tailRed}>
          <boxGeometry args={[0.34, 0.22, 0.07]} />
        </mesh>
      ))}

      {/* Mirrors */}
      {[-1.04, 1.04].map((x) => (
        <group key={x} position={[x, 0.92, 0.9]}>
          <mesh material={paintDark}>
            <boxGeometry args={[0.08, 0.06, 0.11]} />
          </mesh>
          <mesh position={[x > 0 ? 0.07 : -0.07, 0, 0]} material={glassTint}>
            <boxGeometry args={[0.03, 0.1, 0.13]} />
          </mesh>
        </group>
      ))}

      {/* Roof rack */}
      <group position={[0, 1.18, -0.08]}>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0, 0]} material={chrome}>
            <boxGeometry args={[0.07, 0.07, 2.55]} />
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0.15]} material={chrome}>
          <boxGeometry args={[1.48, 0.05, 0.07]} />
        </mesh>
        <mesh position={[0, 0.08, -1.05]} material={chrome}>
          <boxGeometry args={[1.48, 0.05, 0.07]} />
        </mesh>
        <mesh position={[0.18, 0.22, 0.12]} material={fabric}>
          <boxGeometry args={[0.6, 0.22, 1.5]} />
        </mesh>
        <mesh position={[-0.4, 0.2, -0.62]} rotation={[0, 0, Math.PI / 2]} material={tarp}>
          <cylinderGeometry args={[0.12, 0.12, 0.78, 10]} />
        </mesh>
      </group>

      <mesh position={[0, 0.46, 2.17]} material={chrome}>
        <boxGeometry args={[0.46, 0.12, 0.02]} />
      </mesh>

      <Wheel x={-0.9} z={1.3} mats={wheelMats} />
      <Wheel x={0.9} z={1.3} mats={wheelMats} />
      <Wheel x={-0.9} z={-1.3} mats={wheelMats} />
      <Wheel x={0.9} z={-1.3} mats={wheelMats} />

      <pointLight position={[0, 0.62, 2.4]} color="#ffddaa" intensity={2.2} distance={11} decay={1.7} />
    </group>
  )
})
