import type * as THREE from 'three'
import type { HouseInteraction } from '../world/woods'
import { Minimap } from './Minimap'
import { DeveloperCredit } from './DeveloperCredit'

type HUDProps = {
  visible: boolean
  isMobile: boolean
  notesFound: number
  totalNotes: number
  nearbyNoteId: number | null
  houseInteraction: HouseInteraction
  insideHouse: boolean
  playerPos: THREE.Vector3 | null
  playerYaw: number
  collectedIds: Set<number>
}

export function HUD({
  visible,
  isMobile,
  notesFound,
  totalNotes,
  nearbyNoteId,
  houseInteraction,
  insideHouse,
  playerPos,
  playerYaw,
  collectedIds,
}: HUDProps) {
  if (!visible) return null

  const allFound = notesFound === totalNotes

  return (
    <div className="absolute inset-0 z-10 pointer-events-none safe-left safe-right safe-top">
      {/* Top bar — map + credit left, hint centered */}
      <div className="flex items-start gap-3 px-3 sm:px-4 pt-2 pointer-events-none">
        <div className="flex flex-col gap-2 shrink-0">
          <Minimap
            playerPos={playerPos}
            playerYaw={playerYaw}
            collectedIds={collectedIds}
            notesFound={notesFound}
            totalNotes={totalNotes}
          />
          <DeveloperCredit variant="hud" />
        </div>

        <div className="flex-1 min-w-0 pt-1 text-center px-1 sm:px-4">
          <p className="font-horror text-[10px] sm:text-xs text-ember/70 tracking-[0.25em] uppercase">
            The Hollow Woods
          </p>
          {!allFound && !insideHouse && (
            <p className="font-body text-stone-400/80 text-xs sm:text-sm italic animate-pulse-slow mt-1 leading-snug">
              Rain in the pines · Orange fires = campfires · Cabin &amp; car west of fire #1 · [E] to enter
            </p>
          )}
          {insideHouse && (
            <p className="font-body text-stone-400/80 text-xs sm:text-sm italic animate-pulse-slow mt-1 leading-snug">
              Look around the cabin — table, shelves, wall note · [E] at door to leave
            </p>
          )}
          {allFound && (
            <p className="font-body text-stone-400/80 text-xs sm:text-sm italic animate-pulse-slow mt-1 leading-snug">
              ...you found them all. Now run.
            </p>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 rounded-full bg-stone-500/50" />
        </div>
      )}

      {nearbyNoteId !== null && !isMobile && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 safe-bottom pointer-events-none">
          <p className="font-horror text-xs sm:text-sm text-stone-300 tracking-[0.2em] uppercase animate-pulse">
            Press [E] to read note
          </p>
        </div>
      )}

      {houseInteraction === 'enter' && !isMobile && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 safe-bottom pointer-events-none">
          <p className="font-horror text-xs sm:text-sm text-stone-300 tracking-[0.2em] uppercase animate-pulse">
            Press [E] to enter cabin
          </p>
        </div>
      )}

      {houseInteraction === 'exit' && !isMobile && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 safe-bottom pointer-events-none">
          <p className="font-horror text-xs sm:text-sm text-stone-300 tracking-[0.2em] uppercase animate-pulse">
            Press [E] to leave cabin
          </p>
        </div>
      )}

      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 safe-bottom">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blood/70 animate-pulse" />
          <span className="font-horror text-[10px] sm:text-xs text-stone-400 tracking-[0.3em] uppercase">
            {allFound ? 'Escape' : 'Lost'}
          </span>
        </div>
      </div>
    </div>
  )
}
