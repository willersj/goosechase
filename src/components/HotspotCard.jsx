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

function BirdPhoto({ speciesCode }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!speciesCode) { setSrc(''); return }
    let cancelled = false
    fetch(`https://search.macaulaylibrary.org/api/v1/search?taxonCode=${speciesCode}&mediaType=Photo&count=1&sort=rating_rank_desc`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return
        const id = data?.results?.content?.[0]?.catalogId
        setSrc(id ? `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${id}/320` : '')
      })
      .catch(() => { if (!cancelled) setSrc('') })
    return () => { cancelled = true }
  }, [speciesCode])

  const baseClass = 'w-14 h-14 rounded-lg shrink-0 object-cover'
  if (src === null) return <div className={`${baseClass} bg-gc-surface2 animate-pulse`} />
  if (!src) return <div className={`${baseClass} bg-gc-surface2`} />
  return <img src={src} alt="" className={baseClass} onError={() => setSrc('')} />
}

function SpeciesRow({ species }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gc-border last:border-0">
      <BirdPhoto speciesCode={species.speciesCode} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-sm text-gc-text leading-snug">{species.comName}</p>
          {species.isNotable && (
            <span className="text-xs bg-gc-rare-bg text-gc-rare px-2 py-0.5 rounded-full font-semibold leading-none border border-gc-rare/20">
              Rare
            </span>
          )}
        </div>
        <p className="text-xs text-gc-muted italic leading-snug">{species.sciName}</p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-xs text-gc-muted">Last seen:</span>
          <span className="text-xs font-semibold text-gc-new">{formatObsDt(species.lastReported)}</span>
          {species.reportCount > 1 && (
            <>
              <span className="text-gc-border">·</span>
              <span className="text-xs text-gc-muted">{species.reportCount}× this week</span>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <a href={speciesEbirdUrl(species.speciesCode)} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs bg-gc-new-bg text-gc-new px-2.5 py-0.5 rounded-full hover:opacity-80 font-medium transition-opacity border border-gc-new/20">
            eBird ↗
          </a>
          <a href={speciesAllAboutBirdsUrl(species.comName)} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs bg-gc-surface2 text-gc-muted px-2.5 py-0.5 rounded-full hover:text-gc-text font-medium transition-colors border border-gc-border">
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
    <div className="bg-gc-surface border border-gc-border rounded-xl overflow-hidden">
      <div
        className="p-3.5 cursor-pointer hover:bg-gc-surface2 transition-colors select-none"
        onClick={handleToggle}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-start gap-3">
          <div className="font-display text-sm font-semibold text-gc-border w-5 shrink-0 pt-0.5">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gc-text leading-tight">{hotspot.locName}</h3>
            {hotspot.location && (
              <p className="text-xs text-gc-muted mt-0.5">{hotspot.location}</p>
            )}
            <p className="text-xs text-gc-muted mt-0.5">
              {totalCount} species · last {back} days
            </p>
            {hasLifeList && newCount > 0 && !expanded && (
              <p className="text-xs text-gc-new mt-1.5 font-medium">
                {hotspot.newSpecies.slice(0, 3).map(s => s.comName).join(', ')}
                {newCount > 3 && <span className="opacity-60"> +{newCount - 3} more</span>}
              </p>
            )}
          </div>
          <div className="text-right shrink-0 ml-2 min-w-[4rem]">
            {hasLifeList ? (
              <div>
                <span className="font-display text-2xl font-semibold text-gc-new leading-none">{newCount}</span>
                <span className="text-xs text-gc-muted block mt-0.5 whitespace-nowrap">new species</span>
              </div>
            ) : (
              <div>
                <span className="font-display text-2xl font-semibold text-gc-accent leading-none">{totalCount}</span>
                <span className="text-xs text-gc-muted block mt-0.5 whitespace-nowrap">species</span>
              </div>
            )}
          </div>
          <div className="text-gc-muted text-xs pt-1 opacity-50">{expanded ? '▲' : '▼'}</div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gc-border px-3.5 pt-1 pb-3.5">
          {hasLifeList && newCount > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gc-new uppercase tracking-wider pt-3 pb-1">
                New for you ({newCount})
              </p>
              {hotspot.newSpecies.map(s => <SpeciesRow key={s.speciesCode} species={s} />)}
            </div>
          )}

          {!hasLifeList && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gc-muted uppercase tracking-wider pt-3 pb-1">
                All species ({totalCount})
              </p>
              {hotspot.species.map(s => <SpeciesRow key={s.speciesCode} species={s} />)}
            </div>
          )}

          {hasLifeList && alreadySeen.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gc-muted uppercase tracking-wider mb-2">
                Already seen ({alreadySeen.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {alreadySeen.map(s => (
                  <a key={s.speciesCode} href={speciesEbirdUrl(s.speciesCode)} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="bg-gc-surface2 text-gc-muted text-xs px-2 py-0.5 rounded-full hover:text-gc-text border border-gc-border transition-colors">
                    {s.comName}
                  </a>
                ))}
              </div>
            </div>
          )}

          <a href={hotspotUrl(hotspot.locId)} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-gc-accent-t hover:opacity-70 underline mt-4 transition-opacity">
            View hotspot on eBird →
          </a>
        </div>
      )}
    </div>
  )
}
