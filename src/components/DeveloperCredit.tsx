import { DEVELOPER } from '../data/credits'

type DeveloperCreditProps = {
  variant?: 'hero' | 'hud' | 'footer'
}

export function DeveloperCredit({ variant = 'hud' }: DeveloperCreditProps) {
  if (variant === 'hero') {
    return (
      <div className="mt-10 pt-6 border-t border-stone-700/30">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 w-full max-w-[200px]">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
            <span className="font-horror text-[8px] sm:text-[9px] text-stone-500 tracking-[0.35em] uppercase">
              Crafted by
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-ember/40 to-transparent" />
          </div>
          <p className="font-horror text-lg sm:text-xl text-stone-200 tracking-wide">
            {DEVELOPER.name}
          </p>
          <p className="font-body text-[11px] sm:text-xs text-ember/70 tracking-[0.2em] uppercase">
            {DEVELOPER.role}
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <p className="mt-6 pt-4 border-t border-[#b8a890]/30 text-center font-body text-[10px] text-[#8a7a6a] tracking-wide">
        {DEVELOPER.title}
        <span className="mx-1.5 text-[#b8a890]/50">·</span>
        <span className="text-[#6a5a4a]">{DEVELOPER.name}</span>
      </p>
    )
  }

  // HUD — sits below minimap in the left column
  return (
    <div className="w-[200px] sm:w-[240px] px-2.5 py-1.5 rounded-sm border border-stone-700/25 bg-abyss/50 backdrop-blur-[2px]">
      <span className="block font-horror text-[7px] sm:text-[8px] text-stone-600 tracking-[0.28em] uppercase leading-none">
        {DEVELOPER.role}
      </span>
      <span className="block font-horror text-[9px] sm:text-[10px] text-stone-400/90 tracking-wider leading-tight mt-0.5">
        {DEVELOPER.name}
      </span>
    </div>
  )
}
