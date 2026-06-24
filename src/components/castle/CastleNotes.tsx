import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { CastleNote } from '../../data/notes'

type NoteMeshProps = {
  note: CastleNote
  nearby: boolean
}

const NoteMesh = memo(function NoteMesh({ note, nearby }: NoteMeshProps) {
  const bloodLevel = note.id / 8

  const paperMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: nearby ? '#e0d0b8' : '#c8b498',
        side: THREE.FrontSide,
      }),
    [nearby],
  )
  const bloodMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#5a1818',
        transparent: true,
        opacity: 0.45 + bloodLevel * 0.35,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    [bloodLevel],
  )
  const bloodSmearMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#3a1010',
        transparent: true,
        opacity: 0.35 + bloodLevel * 0.25,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    [bloodLevel],
  )
  const nailMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2a1810' }), [])
  const backingMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1a100c', side: THREE.DoubleSide }), [])

  const tiltZ = useMemo(() => (note.id % 3) * 0.04 - 0.04, [note.id])

  return (
    <group position={note.position} rotation={[note.rotation[0], note.rotation[1], note.rotation[2] + tiltZ]}>
      {/* Rust nail */}
      <mesh position={[0, 0.13, -0.01]} material={nailMat}>
        <cylinderGeometry args={[0.022, 0.028, 0.04, 5]} />
      </mesh>
      <mesh position={[0, 0.11, -0.01]}>
        <sphereGeometry args={[0.028, 5, 5]} />
        <meshBasicMaterial color="#1a1008" />
      </mesh>

      <mesh position={[0, 0, -0.006]} material={backingMat}>
        <planeGeometry args={[0.44, 0.58]} />
      </mesh>

      {/* Paper */}
      <mesh position={[0, 0, 0.002]} material={paperMat}>
        <planeGeometry args={[0.4, 0.54]} />
      </mesh>

      {/* Blood stains — more on later notes */}
      <mesh position={[0.1, -0.08, 0.004]} material={bloodMat}>
        <planeGeometry args={[0.18, 0.22]} />
      </mesh>
      <mesh position={[-0.12, 0.1, 0.004]} rotation={[0, 0, 0.2]} material={bloodSmearMat}>
        <planeGeometry args={[0.14, 0.1]} />
      </mesh>
      {bloodLevel > 0.35 && (
        <mesh position={[0.05, -0.18, 0.005]} material={bloodSmearMat}>
          <planeGeometry args={[0.08, 0.14]} />
        </mesh>
      )}
      {bloodLevel > 0.55 && (
        <>
          <mesh position={[-0.08, -0.12, 0.005]} material={bloodMat}>
            <planeGeometry args={[0.12, 0.08]} />
          </mesh>
          <mesh position={[0.14, 0.14, 0.005]} rotation={[0, 0, -0.15]} material={bloodSmearMat}>
            <planeGeometry args={[0.1, 0.12]} />
          </mesh>
        </>
      )}
      {bloodLevel > 0.75 && (
        <mesh position={[0, 0.2, 0.005]} material={bloodMat}>
          <planeGeometry args={[0.16, 0.06]} />
        </mesh>
      )}

      {nearby && (
        <pointLight position={[0, 0, 0.1]} color="#c8a080" intensity={1.4} distance={3.5} decay={2} />
      )}
    </group>
  )
})

type CastleNotesProps = {
  notes: CastleNote[]
  collectedIds: Set<number>
  nearbyId: number | null
}

export const CastleNotes = memo(function CastleNotes({ notes, collectedIds, nearbyId }: CastleNotesProps) {
  return (
    <group>
      {notes.map((note) => {
        if (collectedIds.has(note.id)) return null
        return <NoteMesh key={note.id} note={note} nearby={nearbyId === note.id} />
      })}
    </group>
  )
})
