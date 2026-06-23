import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { CastleScene } from './components/CastleScene'
import { HUD } from './components/HUD'
import { MobileControls } from './components/MobileControls'
import { NoteReader } from './components/NoteReader'
import { StartScreen } from './components/StartScreen'
import { useIsMobile } from './hooks/useIsMobile'
import { useInteractKey } from './hooks/useInteractKey'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import { useTouchControls } from './hooks/useTouchControls'
import { requestPointerLock } from './components/PlayerController'
import type { PlayerState } from './components/PlayerController'
import { NOTES, NOTE_PICKUP_DISTANCE, TOTAL_NOTES } from './data/notes'
import type { CastleNote } from './data/notes'

function findNearbyNote(pos: PlayerState, collectedIds: Set<number>): number | null {
  let closest: number | null = null
  let closestDist = NOTE_PICKUP_DISTANCE

  for (const note of NOTES) {
    if (collectedIds.has(note.id)) continue
    const dx = pos.x - note.position[0]
    const dy = pos.y - note.position[1]
    const dz = pos.z - note.position[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < closestDist) {
      closestDist = dist
      closest = note.id
    }
  }
  return closest
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [collectedIds, setCollectedIds] = useState<Set<number>>(() => new Set())
  const [readingNote, setReadingNote] = useState<CastleNote | null>(null)
  const [hudTick, setHudTick] = useState(0)

  const playerRef = useRef<PlayerState>({ x: 0, y: 0, z: 0, yaw: 0 })
  const playerVec = useMemo(() => new THREE.Vector3(), [])

  const isMobile = useIsMobile()
  const isReading = readingNote !== null
  const keyboardMove = useKeyboardControls(started && !isMobile && !isReading)
  const touch = useTouchControls(started && isMobile && !isReading)
  const lookInput = useRef({ deltaX: 0, deltaY: 0 })

  const moveInput = isMobile ? touch.moveRef : keyboardMove

  const handlePositionUpdate = useCallback((state: PlayerState) => {
    playerRef.current = state
    setHudTick((t) => t + 1)
  }, [])

  useEffect(() => {
    window.__castleOnPosUpdate = handlePositionUpdate
    return () => { window.__castleOnPosUpdate = undefined }
  }, [handlePositionUpdate])

  const nearbyNoteId = useMemo(() => {
    void hudTick
    if (isReading) return null
    return findNearbyNote(playerRef.current, collectedIds)
  }, [hudTick, collectedIds, isReading])

  const nearbyNote = useMemo(
    () => (nearbyNoteId ? NOTES.find((n) => n.id === nearbyNoteId) ?? null : null),
    [nearbyNoteId],
  )

  const collectNearbyNote = useCallback(() => {
    if (!nearbyNote || collectedIds.has(nearbyNote.id)) return
    setCollectedIds((prev) => new Set([...prev, nearbyNote.id]))
    setReadingNote(nearbyNote)
  }, [nearbyNote, collectedIds])

  const handleStart = useCallback(() => setStarted(true), [])

  const handleCanvasClick = useCallback(() => {
    if (started && !isMobile && !isReading) requestPointerLock()
  }, [started, isMobile, isReading])

  const closeNote = useCallback(() => {
    setReadingNote(null)
    if (!isMobile) window.setTimeout(() => requestPointerLock(), 360)
  }, [isMobile])

  useInteractKey(started && !isMobile && !isReading && nearbyNoteId !== null, collectNearbyNote)

  playerVec.set(playerRef.current.x, playerRef.current.y, playerRef.current.z)

  return (
    <div
      className="relative w-full h-full bg-abyss overflow-hidden"
      onClick={isMobile ? undefined : handleCanvasClick}
      style={isMobile ? { touchAction: 'none' } : undefined}
    >
      <div className={isMobile ? 'absolute inset-0 pointer-events-none' : 'absolute inset-0'}>
        <CastleScene
          started={started}
          paused={isReading}
          isMobile={isMobile}
          moveInput={moveInput}
          lookInput={isMobile ? touch.lookRef : lookInput}
          collectedIds={collectedIds}
          nearbyNoteId={nearbyNoteId}
        />
      </div>

      {!started && <StartScreen isMobile={isMobile} onStart={handleStart} />}

      <HUD
        visible={started && !isReading}
        isMobile={isMobile}
        notesFound={collectedIds.size}
        totalNotes={TOTAL_NOTES}
        nearbyNoteId={nearbyNoteId}
        playerPos={started ? playerVec : null}
        playerYaw={playerRef.current.yaw}
        collectedIds={collectedIds}
      />

      {isMobile && (
        <MobileControls
          enabled={started && !isReading}
          pressKey={touch.pressKey}
          releaseKey={touch.releaseKey}
          lookHandlers={touch.lookHandlers}
          nearbyNoteId={nearbyNoteId}
          onReadNote={collectNearbyNote}
        />
      )}

      <NoteReader
        note={readingNote}
        onClose={closeNote}
        collectedCount={collectedIds.size}
        totalCount={TOTAL_NOTES}
      />
    </div>
  )
}
