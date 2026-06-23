import { memo, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, MOON } from '../../world/woods'

const SKY_RADIUS = 135
const RAIN_SPREAD = 52
const RAIN_HEIGHT = 28
const RAIN_FALL_SPEED = 28
const STAR_COUNT = 280

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
  const moonMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: COLORS.moon, fog: false }),
    [],
  )
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

function Rain({ count, isMobile }: { count: number; isMobile: boolean }) {
  const { camera } = useThree()
  const pointsRef = useRef<THREE.Points>(null)
  const dropSize = isMobile ? 0.14 : 0.18

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * RAIN_SPREAD
      positions[i * 3 + 1] = Math.random() * RAIN_HEIGHT + 4
      positions[i * 3 + 2] = (Math.random() - 0.5) * RAIN_SPREAD
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [count])

  useFrame((_, delta) => {
    const points = pointsRef.current
    if (!points) return

    points.position.set(camera.position.x, camera.position.y, camera.position.z)

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const fall = delta * RAIN_FALL_SPEED
    const wind = delta * 2.5

    for (let i = 0; i < count; i++) {
      const xIndex = i * 3
      const yIndex = xIndex + 1
      const zIndex = xIndex + 2

      arr[yIndex] -= fall
      arr[xIndex] -= wind * 0.35
      arr[zIndex] -= wind * 0.15

      if (arr[yIndex] < -2) {
        arr[xIndex] = (Math.random() - 0.5) * RAIN_SPREAD
        arr[yIndex] = RAIN_HEIGHT + Math.random() * 12
        arr[zIndex] = (Math.random() - 0.5) * RAIN_SPREAD
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false} renderOrder={5}>
      <pointsMaterial
        size={dropSize}
        color={COLORS.rain}
        transparent
        opacity={0.72}
        sizeAttenuation
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

export const WoodsWeather = memo(function WoodsWeather({ isMobile }: WoodsWeatherProps) {
  const rainCount = isMobile ? 900 : 1800

  return (
    <group>
      <NightSky />
      <Stars />
      <Moon />
      <Rain count={rainCount} isMobile={isMobile} />
    </group>
  )
})
