import { useCallback, useEffect, useRef, useState } from 'react'
import type { CastleNote } from '../data/notes'
import { DeveloperCredit } from './DeveloperCredit'

type NoteReaderProps = {
  note: CastleNote | null
  onClose: () => void
  collectedCount: number
  totalCount: number
}

const CLOSE_MS = 320

export function NoteReader({ note, onClose, collectedCount, totalCount }: NoteReaderProps) {
  const [displayNote, setDisplayNote] = useState<CastleNote | null>(null)
  const [visible, setVisible] = useState(false)
  const closingRef = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const beginClose = useCallback(() => {
    if (closingRef.current || !displayNote) return
    closingRef.current = true
    setVisible(false)
    closeTimer.current = setTimeout(() => {
      closingRef.current = false
      setDisplayNote(null)
      onClose()
    }, CLOSE_MS)
  }, [displayNote, onClose])

  // Open when a new note arrives
  useEffect(() => {
    if (!note) return
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    closingRef.current = false
    setDisplayNote(note)
    // Double rAF so the browser paints the hidden state before transitioning in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [note])

  // Escape / Enter to close while reading
  useEffect(() => {
    if (!displayNote) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault()
        e.stopPropagation()
        beginClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [displayNote, beginClose])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  if (!displayNote) return null

  const stop = (e: React.SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center p-4
        safe-top safe-bottom safe-left safe-right pointer-events-auto
        transition-opacity duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: visible ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0)' }}
      onPointerDown={stop}
      onClick={(e) => {
        stop(e)
        beginClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={displayNote.title}
        className={`relative max-w-md w-full max-h-[80vh] overflow-y-auto
          bg-[#e8dcc8] text-[#1a1410] p-6 sm:p-8 shadow-2xl
          border border-[#c8bca8] pointer-events-auto
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 scale-100 -rotate-[0.5deg]' : 'opacity-0 scale-95 -rotate-[1deg]'}`}
        style={{
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.03) 28px)',
        }}
        onPointerDown={stop}
        onClick={stop}
      >
        <div className="absolute top-3 right-3 text-[10px] font-horror text-[#5a4a3a] tracking-widest uppercase">
          {collectedCount}/{totalCount} found
        </div>

        <p className="font-horror text-xs text-[#6a5a4a] tracking-[0.3em] uppercase mb-4 pr-16">
          {displayNote.title}
        </p>

        <p className="font-body text-base sm:text-lg leading-relaxed italic whitespace-pre-wrap">
          {displayNote.text}
        </p>

        {'clue' in displayNote && displayNote.clue && (
          <p className="mt-5 pt-4 border-t border-[#b8a890]/50 font-horror text-sm text-[#8a3020] tracking-wide">
            {displayNote.clue}
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => {
              stop(e)
              beginClose()
            }}
            className="font-horror px-8 py-3 text-xs tracking-[0.25em] uppercase
              border border-[#5a4a3a] text-[#3a2a1a]
              hover:bg-[#d8ccb8] active:scale-95 transition-transform duration-150"
          >
            Close
          </button>
          <p className="text-[10px] text-[#8a7a6a] font-body italic">
            Tap outside · Esc · E · Enter
          </p>
        </div>

        <DeveloperCredit variant="footer" />
      </div>
    </div>
  )
}
