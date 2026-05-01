import { useState, useEffect } from 'react'
import { hotspotUrl, speciesEbirdUrl, speciesAllAboutBirdsUrl } from '../utils/ebirdApi'

function formatObsDt(obsDt) {
  if (!obsDt) return 'Recently'
  const dateStr = obsDt.split(' ')[0]
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function BirdPhoto({ comName }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(comName)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled) setSrc(data?.thumbnail?.source ?? '') })
      .catch(() => { if (!cancelled) setSrc('') })
    return () => { cancelled = true }
  }, [comName])

  const baseClass = 'w-16 h-16 rounded-xl shrink-0 object-cover'

  if (src === null) return <div className={`${baseClass} bg-slate-100 dark:bg-slate-700 animate-pulse`} />
  if (!src) return <div className={`${baseClass} bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl`}>🐦</div>
  return <img src={src} alt={comName} className={baseClass} onError={() => setSrc('')} />
}

function SpeciesRow({ species }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <BirdPhoto comName={species.comName} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">{species.comName}</p>
          {species.isNotable && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold leading-none">
              Rare
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-snug">{species.sciName}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400">Last seen:</span>
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">{formatObsDt(species.lastReported)}</span>
          {species.reportCount > 1 && (
            <>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{species.reportCount}× this week</span>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <a href={speciesEbirdUrl(species.speciesCode)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-900/60 font-medium transition-colors">
            eBird ↗
          </a>
          <a href={speciesAllAboutBirdsUrl(species.comName)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 px-2.5 py-0.5 rounded-full hover:bg-sky-200 dark:hover:bg-sky-900/60 font-medium transition-colors">
            All About Birds ↗
          </a>
        </div>
      </div>
    </div>
  )
}

export default function HotspotCard({ hotspot, hasLifeList, rank, back, onExpand }) {
  const [expanded, setExpanded] = useState(false)

  const newCount = hotspot.newSpecies.length
  const totalCount = hotspot.species.length
  const alreadySeen = hasLifeList
    ? hotspot.species.filter(s => !hotspot.newSpecies.find(n => n.speciesCode === s.speciesCode))
    : []

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next) onExpand?.()
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div
        className="p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors select-none"
        onClick={handleToggle}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-start gap-3">
          <div className="text-slate-300 dark:text-slate-600 font-bold text-sm w-5 shrink-0 pt-0.5">#{rank}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">{hotspot.locName}</h3>
            {hotspot.location && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hotspot.location}</p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {totalCount} species reported · last {back} days
            </p>
            {hasLifeList && newCount > 0 && !expanded && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">
                {hotspot.newSpecies.slice(0, 3).map(s => s.comName).join(', ')}
                {newCount > 3 && <span className="text-green-400 dark:text-green-600"> +{newCount - 3} more</span>}
              </p>
            )}
          </div>
          <div className="text-right shrink-0 ml-2">
            {hasLifeList ? (
              <div>
                <span className="text-2xl font-bold text-green-700 dark:text-green-400 leading-none">{newCount}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">new</span>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-none">{totalCount}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">species</span>
              </div>
            )}
          </div>
          <div className="text-slate-300 dark:text-slate-600 text-xs pt-1">{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-3.5 pt-1 pb-3.5">
          {hasLifeList && newCount > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider pt-3 pb-1">
                New for you ({newCount})
              </p>
              {hotspot.newSpecies.map(s => <SpeciesRow key={s.speciesCode} species={s} />)}
            </div>
          )}

          {!hasLifeList && (
            <div className="mb-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-3 pb-1">
                All species ({totalCount})
              </p>
              {hotspot.species.map(s => <SpeciesRow key={s.speciesCode} species={s} />)}
            </div>
          )}

          {hasLifeList && alreadySeen.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Already seen ({alreadySeen.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {alreadySeen.map(s => (
                  <a key={s.speciesCode} href={speciesEbirdUrl(s.speciesCode)} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    {s.comName}
                  </a>
                ))}
              </div>
            </div>
          )}

          <a href={hotspotUrl(hotspot.locId)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline mt-4">
            View hotspot on eBird →
          </a>
        </div>
      )}
    </div>
  )
}
