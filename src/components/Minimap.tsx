import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getWoodsWorld, MINIMAP, worldToMap, type CampfireDef, type MapPoint } from '../world/woods'
import { NOTES } from '../data/notes'

type MinimapProps = {
  playerPos: THREE.Vector3 | null
  playerYaw: number
  collectedIds: Set<number>
  notesFound: number
  totalNotes: number
}

function CampfireMarker({ cf, p }: { cf: CampfireDef; p: MapPoint }) {
  const r = cf.hasBackpack ? 5.5 : 4.5

  return (
    <g>
      <circle cx={p.sx} cy={p.sy} r={r + 2.5} fill="#e86820" opacity={0.22} />
      <circle cx={p.sx} cy={p.sy} r={r} fill="#e86820" stroke="#ffcc55" strokeWidth={0.8} opacity={0.95} />
      <circle cx={p.sx} cy={p.sy} r={r * 0.42} fill="#ffcc55" opacity={0.95} />
      <path
        d={`M ${p.sx} ${p.sy - r - 1.5} L ${p.sx - 2.2} ${p.sy - r + 2.5} L ${p.sx + 2.2} ${p.sy - r + 2.5} Z`}
        fill="#ffcc55"
        opacity={0.9}
      />
      <text x={p.sx} y={p.sy + 2.2} textAnchor="middle" fill="#1a1008" fontSize={6} fontWeight="bold">
        {cf.label}
      </text>
      {cf.hasBackpack && (
        <>
          <rect x={p.sx + r * 0.55} y={p.sy - 2.5} width={4} height={4.5} fill="#2a3428" stroke="#4a5448" strokeWidth={0.4} rx={0.5} />
          <text x={p.sx + r * 0.55 + 2} y={p.sy + 0.8} textAnchor="middle" fill="#8a9888" fontSize={4.5} fontWeight="bold">
            P
          </text>
        </>
      )}
    </g>
  )
}

const MinimapStatic = memo(function MinimapStatic({ collectedIds }: { collectedIds: Set<number> }) {
  const world = useMemo(() => getWoodsWorld(), [])
  const { bounds } = world

  const toMap = (x: number, z: number) => worldToMap(x, z, bounds)

  const pathD = useMemo(() => {
    const pts = world.pathPoints.map(([x, z]) => toMap(x, z))
    if (pts.length === 0) return ''
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.sx} ${p.sy}`).join(' ')
  }, [world.pathPoints, bounds])

  return (
    <>
      <rect x={0} y={0} width={MINIMAP.width} height={MINIMAP.height} fill="#0a100a" />

      {world.mapClearings.map((c, i) => {
        const p = toMap(c.x, c.z)
        const drawW = MINIMAP.width - MINIMAP.pad * 2
        const spanX = bounds.maxX - bounds.minX
        const r = (c.r / spanX) * drawW
        return <circle key={i} cx={p.sx} cy={p.sy} r={r} fill="#1a2018" opacity={0.45} />
      })}

      {world.trees.filter((_, i) => i % 5 === 0).map((tree) => {
        const p = toMap(tree.position[0], tree.position[2])
        return (
          <circle
            key={tree.id}
            cx={p.sx}
            cy={p.sy}
            r={tree.isNoteTree ? 2 : tree.dead ? 0.8 : 1}
            fill={tree.isNoteTree ? '#2a3828' : tree.dead ? '#1a1814' : '#141c10'}
            opacity={0.75}
          />
        )
      })}

      <path d={pathD} stroke="#3a3428" strokeWidth={3.5} fill="none" opacity={0.7} strokeLinecap="round" />

      {world.pathTorches.map((torch, i) => {
        const p = toMap(torch.mapX, torch.mapZ)
        return (
          <circle key={`torch-${i}`} cx={p.sx} cy={p.sy} r={1.6} fill="#cc6622" opacity={0.75} />
        )
      })}

      {world.campfires.map((cf) => (
        <CampfireMarker key={cf.id} cf={cf} p={toMap(cf.mapX, cf.mapZ)} />
      ))}

      {world.figures.map((fig) => {
        const p = toMap(fig.position[0], fig.position[2])
        return (
          <rect key={fig.id} x={p.sx - 2} y={p.sy - 2} width={4} height={4} fill="#3a3836" opacity={0.85} rx={0.5} />
        )
      })}

      {NOTES.map((note) => {
        const p = toMap(note.mapX, note.mapZ)
        const collected = collectedIds.has(note.id)
        return (
          <g key={note.id}>
            <circle
              cx={p.sx}
              cy={p.sy}
              r={collected ? 2.5 : 4}
              fill={collected ? '#2a2420' : '#c06030'}
              opacity={collected ? 0.35 : 1}
            />
            {!collected && (
              <text x={p.sx} y={p.sy + 2.5} textAnchor="middle" fill="#1a1008" fontSize={6} fontWeight="bold">
                {note.id}
              </text>
            )}
          </g>
        )
      })}

      {(() => {
        const sp = toMap(world.spawn[0], world.spawn[2])
        return (
          <g>
            <circle cx={sp.sx} cy={sp.sy} r={3.5} fill="none" stroke="#4a7a4a" strokeWidth={1.2} />
            <text x={sp.sx} y={sp.sy - 6} textAnchor="middle" fill="#4a7a4a" fontSize={5.5}>START</text>
          </g>
        )
      })()}
    </>
  )
})

export const Minimap = memo(function Minimap({
  playerPos,
  playerYaw,
  collectedIds,
  notesFound,
  totalNotes,
}: MinimapProps) {
  const world = useMemo(() => getWoodsWorld(), [])
  const { bounds } = world

  const notesKey = useMemo(() => [...collectedIds].join(','), [collectedIds])
  const staticKey = useRef(notesKey)
  if (staticKey.current !== notesKey) staticKey.current = notesKey

  const player = playerPos ? worldToMap(playerPos.x, playerPos.z, bounds) : null
  const arrowLen = 7
  const arrowX = player ? player.sx + Math.sin(playerYaw) * arrowLen : 0
  const arrowY = player ? player.sy + Math.cos(playerYaw) * arrowLen : 0

  return (
    <div className="w-[200px] sm:w-[240px] border border-stone-700/40 bg-abyss/85 rounded-sm shadow-md shadow-black/50 overflow-hidden">
      <div className="flex items-center justify-between px-1.5 py-0.5 border-b border-stone-700/40">
        <p className="font-horror text-[8px] sm:text-[9px] text-stone-400 tracking-[0.15em] uppercase">
          Forest Map
        </p>
        <p className="font-horror text-[8px] sm:text-[9px] text-stone-400 tracking-widest">
          <span className="text-ember">{notesFound}</span>
          <span className="text-stone-600"> / {totalNotes}</span>
        </p>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${MINIMAP.width} ${MINIMAP.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-auto"
        style={{ aspectRatio: `${MINIMAP.width}/${MINIMAP.height}` }}
      >
        <MinimapStatic key={staticKey.current} collectedIds={collectedIds} />
        {player && (
          <g>
            <line x1={player.sx} y1={player.sy} x2={arrowX} y2={arrowY} stroke="#d8d0c0" strokeWidth={1.5} strokeLinecap="round" />
            <circle cx={player.sx} cy={player.sy} r={3} fill="#d8d0c0" stroke="#1a1816" strokeWidth={0.5} />
          </g>
        )}
      </svg>

      <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 px-1.5 py-1 border-t border-stone-700/30">
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c06030]" /> note
        </span>
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 bg-[#3a3836]" /> watcher
        </span>
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full border border-[#4a7a4a]" /> start
        </span>
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e86820] border border-[#ffcc55]" /> campfire
        </span>
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#cc6622]" /> torch
        </span>
        <span className="text-[7px] text-stone-500 font-body flex items-center gap-0.5">
          <span className="inline-block w-1.5 h-1.5 bg-[#2a3428] border border-[#4a5448]" /> pack
        </span>
      </div>
    </div>
  )
})
