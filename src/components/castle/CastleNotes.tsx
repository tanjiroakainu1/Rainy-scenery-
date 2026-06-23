import { memo } from 'react'
import * as THREE from 'three'
import type { CastleNote } from '../../data/notes'

type NoteMeshProps = {
  note: CastleNote
  nearby: boolean
}

const NoteMesh = memo(function NoteMesh({ note, nearby }: NoteMeshProps) {
  return (
    <group position={note.position} rotation={note.rotation}>
      {/* Nail head */}
      <mesh position={[0, 0.12, -0.01]}>
        <sphereGeometry args={[0.025, 4, 4]} />
        <meshBasicMaterial color="#1a140e" />
      </mesh>
      {/* Paper backing on bark */}
      <mesh position={[0, 0, -0.006]}>
        <planeGeometry args={[0.42, 0.56]} />
        <meshBasicMaterial color="#2a2018" side={THREE.DoubleSide} />
      </mesh>
      {/* Paper */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.4, 0.54]} />
        <meshBasicMaterial color={nearby ? '#f0e8d8' : '#d8ccb0'} side={THREE.FrontSide} />
      </mesh>
      {nearby && (
        <pointLight position={[0, 0, 0.08]} color="#d8c8a0" intensity={1.2} distance={3.5} decay={2} />
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
