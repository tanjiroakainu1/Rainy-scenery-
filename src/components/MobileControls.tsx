import type { HouseInteraction } from '../world/woods'
import type { MoveInput } from '../types/controls'

type LookHandlers = {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void
  onLostPointerCapture: (e: React.PointerEvent<HTMLDivElement>) => void
}

type MobileControlsProps = {
  enabled: boolean
  pressKey: (key: keyof MoveInput) => void
  releaseKey: (key: keyof MoveInput) => void
  lookHandlers: LookHandlers
  nearbyNoteId: number | null
  houseInteraction: HouseInteraction
  onInteract: () => void
}

function KeyButton({
  label,
  onPress,
  onRelease,
  className = '',
}: {
  label: string
  onPress: () => void
  onRelease: () => void
  className?: string
}) {
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <button
      type="button"
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-md border border-stone-600/50
        bg-abyss/60 backdrop-blur-sm text-stone-300 font-horror text-base sm:text-lg
        active:bg-blood/40 active:border-blood/60 active:scale-95
        select-none touch-none transition-all duration-75 ${className}`}
      onPointerDown={(e) => { stop(e); onPress() }}
      onPointerUp={(e) => { stop(e); onRelease() }}
      onPointerLeave={(e) => { stop(e); onRelease() }}
      onPointerCancel={(e) => { stop(e); onRelease() }}
      onContextMenu={stop}
    >
      {label}
    </button>
  )
}

export function MobileControls({
  enabled,
  pressKey,
  releaseKey,
  lookHandlers,
  nearbyNoteId,
  houseInteraction,
  onInteract,
}: MobileControlsProps) {
  if (!enabled) return null

  const showInteract = nearbyNoteId !== null || houseInteraction !== null

  const interactLabel =
    nearbyNoteId !== null
      ? 'Tap to Read Note'
      : houseInteraction === 'enter'
        ? 'Tap to Enter Cabin'
        : 'Tap to Leave Cabin'

  const handleInteract = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onInteract()
  }

  return (
    <>
      {/* WASD pad — bottom left, aligned with safe area */}
      <div className="absolute bottom-4 left-4 z-40 safe-bottom safe-left touch-none select-none pointer-events-auto">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div />
          <KeyButton label="W" onPress={() => pressKey('forward')} onRelease={() => releaseKey('forward')} />
          <div />
          <KeyButton label="A" onPress={() => pressKey('left')} onRelease={() => releaseKey('left')} />
          <KeyButton label="S" onPress={() => pressKey('backward')} onRelease={() => releaseKey('backward')} />
          <KeyButton label="D" onPress={() => pressKey('right')} onRelease={() => releaseKey('right')} />
        </div>
      </div>

      {/* Read note — above controls, left of center (never under look zone) */}
      {showInteract && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 safe-bottom pointer-events-auto">
          <button
            type="button"
            onPointerDown={handleInteract}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInteract() }}
            className="font-horror px-8 py-3.5 text-xs sm:text-sm tracking-[0.2em] uppercase
              bg-blood/50 border-2 border-blood/70 text-stone-100 shadow-lg shadow-black/50
              active:bg-blood/70 active:scale-95 animate-pulse touch-manipulation select-none"
            style={{ touchAction: 'manipulation' }}
          >
            {interactLabel}
          </button>
        </div>
      )}

      {/* Look zone — right side, above bottom controls */}
      <div
        className="absolute right-0 top-0 w-[50%] bottom-32 z-40 touch-none select-none pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        {...lookHandlers}
      >
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 pointer-events-none safe-bottom safe-right">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-stone-600/40 bg-abyss/30 flex items-center justify-center">
            <span className="font-horror text-[9px] sm:text-[10px] text-stone-500 tracking-widest uppercase text-center leading-tight">
              Drag<br />to look
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
