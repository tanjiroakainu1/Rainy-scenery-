import { requestPointerLock } from './PlayerController'
import { DeveloperCredit } from './DeveloperCredit'

type StartScreenProps = {
  isMobile: boolean
  onStart: () => void
}

export function StartScreen({ isMobile, onStart }: StartScreenProps) {
  const handleStart = () => {
    onStart()
    if (!isMobile) {
      requestPointerLock()
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-abyss/95 backdrop-blur-sm safe-top safe-bottom safe-left safe-right">
      <div className="mx-4 max-w-md text-center px-6 py-8 sm:px-10 sm:py-12 border border-blood/30 bg-fog/40 rounded-sm shadow-2xl shadow-black/80">
        <p className="font-horror text-ember/60 text-xs sm:text-sm tracking-[0.4em] uppercase mb-3 animate-flicker">
          You are not alone
        </p>
        <h1 className="font-horror text-3xl sm:text-5xl text-stone-200 tracking-wider mb-2">
          Hollow Woods
        </h1>
        <p className="font-body text-stone-400 text-base sm:text-lg italic mb-8 leading-relaxed">
          Rain in the pines. A pale moon. Blood-stained papers nailed to bark. Seven walkers before you — their names carved into the posts.
        </p>

        <button
          onClick={handleStart}
          className="font-horror w-full sm:w-auto px-10 py-4 text-sm sm:text-base tracking-[0.25em] uppercase
            bg-blood/20 border border-blood/50 text-stone-200
            hover:bg-blood/40 hover:border-blood active:scale-95
            transition-all duration-300 rounded-sm"
        >
          Enter the Woods
        </button>

        <div className="mt-8 space-y-2 text-stone-500 text-sm font-body">
          {isMobile ? (
            <>
              <p>Use <strong>W A S D</strong> to walk the forest</p>
              <p>Drag right side to look · Find all 8 blood-stained notes on trees &amp; posts</p>
              <p>Follow walker &ldquo;M&rdquo;&rsquo;s trail · Cabin &amp; car west of campfire #1 · [E] to enter the house</p>
            </>
          ) : (
            <>
              <p>
                <kbd className="px-1.5 py-0.5 border border-stone-600 rounded text-stone-400 text-xs">W</kbd>
                {' '}
                <kbd className="px-1.5 py-0.5 border border-stone-600 rounded text-stone-400 text-xs">A</kbd>
                {' '}
                <kbd className="px-1.5 py-0.5 border border-stone-600 rounded text-stone-400 text-xs">S</kbd>
                {' '}
                <kbd className="px-1.5 py-0.5 border border-stone-600 rounded text-stone-400 text-xs">D</kbd>
                {' '}walk · <kbd className="px-1.5 py-0.5 border border-stone-600 rounded text-stone-400 text-xs">E</kbd> read notes
              </p>
              <p>Find all 8 bloody notes · Follow the trail of walker &ldquo;M&rdquo; · Cabin &amp; car west of campfire #1</p>
            </>
          )}
        </div>

        <DeveloperCredit variant="hero" />
      </div>
    </div>
  )
}
