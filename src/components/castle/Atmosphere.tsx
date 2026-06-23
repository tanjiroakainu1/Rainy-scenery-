import * as THREE from 'three'
import { COLORS } from '../../castle/layout'

type FlickeringTorchProps = {
  position: [number, number, number]
  withLight?: boolean
  lightRef?: (light: THREE.PointLight | null) => void
}

export function FlickeringTorch({ position, withLight = true, lightRef }: FlickeringTorchProps) {
  return (
    <group position={position}>
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 5]} />
        <meshStandardMaterial color="#3a2818" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.1, 0.3, 5]} />
        <meshBasicMaterial color={COLORS.torch} />
      </mesh>
      {withLight && (
        <pointLight
          ref={lightRef}
          color={COLORS.torch}
          intensity={7}
          distance={32}
          decay={1.2}
        />
      )}
    </group>
  )
}

type CobwebProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function Cobweb({ position, rotation = [0, 0, 0], scale = 1 }: CobwebProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial
        color="#888899"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

type BloodStainProps = {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function BloodStain({ position, rotation = [-Math.PI / 2, 0, 0], scale = 1 }: BloodStainProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <circleGeometry args={[0.6, 8]} />
      <meshBasicMaterial color={COLORS.blood} transparent opacity={0.4} depthWrite={false} />
    </mesh>
  )
}
