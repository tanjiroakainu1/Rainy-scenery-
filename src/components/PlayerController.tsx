import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { MoveInput } from '../types/controls'
import { getWoodsWorld, WOODS, resolveWoodsMovement } from '../world/woods'

export type PlayerState = {
  x: number
  y: number
  z: number
  yaw: number
}

type PlayerControllerProps = {
  moveInput: React.MutableRefObject<MoveInput>
  lookInput: React.MutableRefObject<{ deltaX: number; deltaY: number }>
  enabled: boolean
  isMobile: boolean
  onPositionUpdate?: (state: PlayerState) => void
}

const world = getWoodsWorld()
const spawn = world.spawn

export function PlayerController({
  moveInput,
  lookInput,
  enabled,
  isMobile,
  onPositionUpdate,
}: PlayerControllerProps) {
  const { camera } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0)
  const position = useRef(new THREE.Vector3(spawn[0], spawn[1], spawn[2]))
  const pointerLocked = useRef(false)
  const lanternRig = useRef<THREE.Group>(null)
  const posReport = useRef(0)

  const forwardVec = useRef(new THREE.Vector3())
  const rightVec = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const reportState = useRef<PlayerState>({ x: 0, y: 0, z: 0, yaw: 0 })

  useEffect(() => {
    camera.position.set(spawn[0], spawn[1], spawn[2])
    position.current.set(spawn[0], spawn[1], spawn[2])
    yaw.current = 0
    pitch.current = 0
  }, [camera])

  useEffect(() => {
    if (isMobile) return

    const onMouseMove = (e: MouseEvent) => {
      if (!pointerLocked.current || !enabled) return
      lookInput.current.deltaX += e.movementX
      lookInput.current.deltaY += e.movementY
    }

    const onPointerLockChange = () => {
      pointerLocked.current = document.pointerLockElement === document.body
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('pointerlockchange', onPointerLockChange)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
    }
  }, [enabled, isMobile, lookInput])

  useFrame((state, delta) => {
    const sens = isMobile ? WOODS.mobileLookSensitivity : WOODS.lookSensitivity
    const { deltaX, deltaY } = lookInput.current
    lookInput.current.deltaX = 0
    lookInput.current.deltaY = 0

    yaw.current -= deltaX * sens
    pitch.current -= deltaY * sens
    pitch.current = THREE.MathUtils.clamp(pitch.current, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1)

    if (enabled) {
      const input = moveInput.current
      const forward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0)
      const strafe = (input.right ? 1 : 0) - (input.left ? 1 : 0)

      direction.current.set(0, 0, 0)
      if (forward !== 0 || strafe !== 0) {
        forwardVec.current.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
        rightVec.current.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))
        direction.current
          .addScaledVector(forwardVec.current, forward)
          .addScaledVector(rightVec.current, strafe)
          .normalize()
      }

      const speed = WOODS.moveSpeed * delta
      target.current.copy(position.current)
      target.current.x += direction.current.x * speed
      target.current.z += direction.current.z * speed
      position.current.copy(resolveWoodsMovement(position.current, target.current, world))
    }

    const moving = moveInput.current.forward || moveInput.current.backward ||
      moveInput.current.left || moveInput.current.right
    const bob = enabled && moving ? Math.sin(state.clock.elapsedTime * 10) * 0.02 : 0

    camera.position.set(position.current.x, position.current.y + bob, position.current.z)
    camera.rotation.order = 'YXZ'
    camera.rotation.y = yaw.current
    camera.rotation.x = pitch.current

    if (lanternRig.current) {
      lanternRig.current.position.copy(camera.position)
      lanternRig.current.quaternion.copy(camera.quaternion)
    }

    posReport.current += delta
    if (posReport.current > 0.2 && onPositionUpdate) {
      posReport.current = 0
      const p = position.current
      const s = reportState.current
      s.x = p.x
      s.y = p.y
      s.z = p.z
      s.yaw = yaw.current
      onPositionUpdate(s)
    }
  })

  return (
    <group ref={lanternRig}>
      <pointLight
        position={[0.3, -0.05, -0.45]}
        color="#ffdd99"
        intensity={5}
        distance={32}
        decay={1.1}
      />
      <pointLight
        position={[0, 0.2, 0]}
        color="#809070"
        intensity={1.2}
        distance={8}
        decay={1.5}
      />
    </group>
  )
}

export function requestPointerLock() {
  document.body.requestPointerLock()
}
