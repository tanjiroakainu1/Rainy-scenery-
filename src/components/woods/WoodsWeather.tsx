import { memo, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, MOON, WOODS } from '../../world/woods'

const SKY_RADIUS = 135
const STAR_COUNT = 280
const GROUND_Y = 0.12

type WoodsWeatherProps = {
  isMobile: boolean
}

function NightSky() {
  const skyMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.sky,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    [],
  )

  return (
    <mesh position={[0, 20, 0]} material={skyMat} renderOrder={-10}>
      <sphereGeometry args={[SKY_RADIUS, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
    </mesh>
  )
}

function Stars() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI * 0.42
      const r = SKY_RADIUS - 2
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi) + 20
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={-9}>
      <pointsMaterial color="#9aa8b8" size={0.35} sizeAttenuation fog={false} transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

function Moon() {
  const moonMat = useMemo(() => new THREE.MeshBasicMaterial({ color: COLORS.moon, fog: false }), [])
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.moonHalo,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        fog: false,
      }),
    [],
  )
  const craterMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: COLORS.moonShadow,
        transparent: true,
        opacity: 0.28,
        fog: false,
      }),
    [],
  )

  return (
    <group position={MOON.position}>
      <mesh material={haloMat} renderOrder={-8}>
        <sphereGeometry args={[MOON.radius * 2.4, 14, 14]} />
      </mesh>
      <mesh material={moonMat} renderOrder={-7}>
        <sphereGeometry args={[MOON.radius, 24, 24]} />
      </mesh>
      <mesh position={[-1.1, 0.5, 1]} material={craterMat}>
        <sphereGeometry args={[0.65, 8, 8]} />
      </mesh>
      <mesh position={[0.85, -0.45, 0.75]} material={craterMat}>
        <sphereGeometry args={[0.42, 8, 8]} />
      </mesh>
      <mesh position={[0.25, 0.9, -0.85]} material={craterMat}>
        <sphereGeometry args={[0.32, 8, 8]} />
      </mesh>
      <directionalLight position={[0, 0, 0]} intensity={MOON.lightIntensity} color={COLORS.moonLight} />
      <pointLight color={COLORS.moonLight} intensity={1.8} distance={200} decay={1.3} />
    </group>
  )
}

/** Follow camera on XZ only — rain Y is world height above ground */
function RainNear({ count, isMobile }: { count: number; isMobile: boolean }) {
  const { camera } = useThree()
  const pointsRef = useRef<THREE.Points>(null)
  const spread = isMobile ? 18 : 24
  const maxHeight = 22

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = GROUND_Y + 2 + Math.random() * maxHeight
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count, spread, maxHeight])

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return
    points.position.set(camera.position.x, 0, camera.position.z)

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const fall = delta * 30
    const wind = delta * 3.2

    for (let i = 0; i < count; i++) {
      const xi = i * 3
      arr[xi + 1] -= fall
      arr[xi] -= wind * 0.32
      arr[xi + 2] -= wind * 0.14

      if (arr[xi + 1] < GROUND_Y + 0.4) {
        arr[xi] = (Math.random() - 0.5) * spread
        arr[xi + 1] = GROUND_Y + 4 + Math.random() * maxHeight
        arr[xi + 2] = (Math.random() - 0.5) * spread
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false} renderOrder={12}>
      <pointsMaterial
        size={isMobile ? 0.07 : 0.085}
        color="#b8c8d8"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

function RainFar({ count }: { count: number }) {
  const { camera } = useThree()
  const pointsRef = useRef<THREE.Points>(null)
  const spread = 58
  const maxHeight = 28

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = GROUND_Y + 4 + Math.random() * maxHeight
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count, spread, maxHeight])

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return
    points.position.set(camera.position.x, 0, camera.position.z)

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const fall = delta * 24
    const wind = delta * 2.6

    for (let i = 0; i < count; i++) {
      const xi = i * 3
      arr[xi + 1] -= fall
      arr[xi] -= wind * 0.26
      arr[xi + 2] -= wind * 0.1

      if (arr[xi + 1] < GROUND_Y + 0.5) {
        arr[xi] = (Math.random() - 0.5) * spread
        arr[xi + 1] = GROUND_Y + 6 + Math.random() * maxHeight
        arr[xi + 2] = (Math.random() - 0.5) * spread
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false} renderOrder={11}>
      <pointsMaterial
        size={0.055}
        color="#7a90a0"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

function RainStreaks({ count, isMobile }: { count: number; isMobile: boolean }) {
  const { camera } = useThree()
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const spread = isMobile ? 20 : 28
  const streakH = isMobile ? 0.65 : 0.85

  const drops = useMemo(() => {
    const items = []
    for (let i = 0; i < count; i++) {
      items.push({
        x: (Math.random() - 0.5) * spread,
        y: GROUND_Y + 3 + Math.random() * 18,
        z: (Math.random() - 0.5) * spread,
        h: streakH * (0.75 + Math.random() * 0.4),
      })
    }
    return items
  }, [count, spread, streakH])

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#9ab0c0',
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        fog: false,
      }),
    [],
  )

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const cx = camera.position.x
    const cz = camera.position.z
    const fall = delta * 34
    const wind = delta * 3.0

    for (let i = 0; i < count; i++) {
      const d = drops[i]
      d.y -= fall
      d.x -= wind * 0.3
      d.z -= wind * 0.12

      if (d.y < GROUND_Y + 0.35) {
        d.x = (Math.random() - 0.5) * spread
        d.y = GROUND_Y + 8 + Math.random() * 16
        d.z = (Math.random() - 0.5) * spread
      }

      dummy.position.set(cx + d.x, d.y + d.h * 0.5, cz + d.z)
      dummy.scale.set(1, d.h, 1)
      dummy.rotation.set(0.06, 0, 0.04)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={mat} frustumCulled={false} renderOrder={10}>
      <boxGeometry args={[0.02, 1, 0.02]} />
    </instancedMesh>
  )
}

function RainMist({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree()
  const ref = useRef<THREE.Mesh>(null)

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3a4858',
        transparent: true,
        opacity: isMobile ? 0.04 : 0.055,
        depthWrite: false,
        fog: false,
        side: THREE.DoubleSide,
      }),
    [isMobile],
  )

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(camera.position.x, WOODS.eyeY + 2.5, camera.position.z)
    }
  })

  return (
    <mesh ref={ref} material={mat} renderOrder={6}>
      <sphereGeometry args={[isMobile ? 18 : 24, 10, 10]} />
    </mesh>
  )
}

export const WoodsWeather = memo(function WoodsWeather({ isMobile }: WoodsWeatherProps) {
  const nearCount = isMobile ? 700 : 1400
  const farCount = isMobile ? 500 : 1000
  const streakCount = isMobile ? 280 : 500

  return (
    <group>
      <NightSky />
      <Stars />
      <Moon />
      <RainMist isMobile={isMobile} />
      <RainFar count={farCount} />
      <RainStreaks count={streakCount} isMobile={isMobile} />
      <RainNear count={nearCount} isMobile={isMobile} />
    </group>
  )
})
