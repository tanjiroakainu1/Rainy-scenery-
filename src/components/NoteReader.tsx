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

function BloodStains({ intensity }: { intensity: number }) {
  const o = 0.35 + intensity * 0.12
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div
        className="absolute -top-2 -right-1 w-24 h-28 rounded-full blur-[1px]"
        style={{ background: `radial-gradient(ellipse, rgba(90,18,18,${o}) 0%, rgba(60,10,10,${o * 0.5}) 45%, transparent 70%)` }}
      />
      <div
        className="absolute top-12 -left-3 w-20 h-16 rounded-full blur-[2px] rotate-12"
        style={{ background: `radial-gradient(ellipse, rgba(70,14,14,${o * 0.85}) 0%, transparent 65%)` }}
      />
      <div
        className="absolute bottom-16 right-6 w-14 h-20 rounded-full blur-[1px] -rotate-6"
        style={{ background: `radial-gradient(ellipse, rgba(80,16,16,${o * 0.7}) 0%, transparent 60%)` }}
      />
      <div
        className="absolute bottom-0 left-8 w-1 h-16 rounded-full opacity-60"
        style={{ background: `linear-gradient(to bottom, transparent, rgba(70,12,12,${o * 0.9}), rgba(50,8,8,${o}))` }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-10 h-8 rounded-full blur-sm opacity-50"
        style={{ background: `rgba(60,10,10,${o * 0.55})` }}
      />
      {intensity > 0.4 && (
        <div
          className="absolute top-20 right-12 w-8 h-12 rounded-full blur-[1px]"
          style={{ background: `rgba(55,10,10,${o * 0.65})` }}
        />
      )}
      {intensity > 0.6 && (
        <>
          <div className="absolute bottom-8 left-1/3 w-16 h-3 rotate-[-8deg] rounded-full opacity-40" style={{ background: `rgba(65,12,12,${o})` }} />
          <div className="absolute top-8 left-12 w-6 h-6 rounded-full opacity-50" style={{ background: `rgba(75,14,14,${o * 0.8})` }} />
        </>
      )}
    </div>
  )
}

function FingerSmudges() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-30" aria-hidden>
      <div className="absolute bottom-24 right-10 w-12 h-5 rotate-[-25deg] rounded-full bg-[#3a2018]/40 blur-[1px]" />
      <div className="absolute top-1/2 left-3 w-8 h-4 rotate-[15deg] rounded-full bg-[#2a1814]/35 blur-[1px]" />
    </div>
  )
}

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

  useEffect(() => {
    if (!note) return
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    closingRef.current = false
    setDisplayNote(note)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
  }, [note])

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

  const bloodIntensity = displayNote.id / 8
  const tilt = -0.8 + (displayNote.id % 3) * 0.6

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center p-4
        safe-top safe-bottom safe-left safe-right pointer-events-auto
        transition-opacity duration-300 ease-out
        ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: visible ? 'rgba(4,6,8,0.9)' : 'rgba(0,0,0,0)' }}
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
        className={`relative max-w-md w-full max-h-[82vh] overflow-y-auto
          text-[#1a100c] p-6 sm:p-8 shadow-2xl pointer-events-auto
          border border-[#4a3028]/60
          transition-all duration-300 ease-out
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          transform: visible ? `rotate(${tilt}deg)` : `rotate(${tilt - 0.5}deg) scale(0.95)`,
          backgroundColor: '#d4c4a8',
          backgroundImage: `
            repeating-linear-gradient(transparent, transparent 27px, rgba(40,20,16,0.05) 28px),
            radial-gradient(ellipse at 20% 80%, rgba(80,20,20,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 85% 15%, rgba(70,16,16,0.15) 0%, transparent 45%)
          `,
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), inset 0 0 40px rgba(60,20,20,0.08)',
        }}
        onPointerDown={stop}
        onClick={stop}
      >
        <BloodStains intensity={bloodIntensity} />
        <FingerSmudges />

        {/* Torn edge hints */}
        <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-[#2a1814]/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-[#3a2018]/15 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 text-[10px] font-horror text-[#5a2820] tracking-widest uppercase z-10">
          {collectedCount}/{totalCount} found
        </div>

        <p className="relative z-10 font-horror text-xs text-[#4a2820] tracking-[0.3em] uppercase mb-1 pr-16">
          {displayNote.title}
        </p>
        {displayNote.id > 1 && (
          <p className="relative z-10 font-body text-[10px] text-[#6a3028]/80 italic mb-4 tracking-wide">
            — stained · nailed · bleeding through
          </p>
        )}

        <p className="relative z-10 font-body text-base sm:text-lg leading-relaxed whitespace-pre-wrap text-[#1a100c]/95">
          {displayNote.text}
        </p>

        {displayNote.clue && (
          <p className="relative z-10 mt-5 pt-4 border-t border-[#6a2820]/35 font-horror text-sm text-[#7a1818] tracking-wide leading-snug">
            {displayNote.clue}
          </p>
        )}

        <div className="relative z-10 mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onPointerDown={stop}
            onClick={(e) => {
              stop(e)
              beginClose()
            }}
            className="font-horror px-8 py-3 text-xs tracking-[0.25em] uppercase
              border border-[#4a2820] text-[#2a1410] bg-[#c8b898]/80
              hover:bg-[#b8a888] active:scale-95 transition-transform duration-150"
          >
            Close
          </button>
          <p className="text-[10px] text-[#5a4038] font-body italic">
            Tap outside · Esc · E · Enter
          </p>
        </div>

        <DeveloperCredit variant="footer" />
      </div>
    </div>
  )
}
