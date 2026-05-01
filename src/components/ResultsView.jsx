import { useState } from 'react'
import { motion } from 'framer-motion'
import HotspotCard from './HotspotCard'
import MapView from './MapView'

const listVariants = {
  visible: { transition: { staggerChildren: 0.055 } }
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function ResultsView({ results, lifeList, back, onReset }) {
  const [focusedHotspot, setFocusedHotspot] = useState(null)
  const hasLifeList = lifeList !== null

  const hotspots = [...results].sort((a, b) =>
    hasLifeList
      ? b.newSpecies.length - a.newSpecies.length
      : b.species.length - a.species.length
  )

  const visibleHotspots = hasLifeList
    ? hotspots.filter(h => h.newSpecies.length > 0)
    : hotspots

  const totalNewUnique = hasLifeList
    ? new Set(results.flatMap(h => h.newSpecies.map(s => s.speciesCode))).size
    : 0

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Nearby Hotspots</h2>
          {hasLifeList ? (
            <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
              {totalNewUnique} potentially new species across {visibleHotspots.length} spots
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {results.length} hotspots found. Upload a life list to see what's new.
            </p>
          )}
        </div>
        <button
          onClick={onReset}
          className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline shrink-0 mt-1"
        >
          New search
        </button>
      </div>

      {visibleHotspots.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-600">
          <div className="text-5xl mb-3">🔭</div>
          <p className="font-medium text-slate-500 dark:text-slate-400">
            {hasLifeList ? 'No new species found at nearby hotspots.' : 'No hotspots found in this area.'}
          </p>
          <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Try expanding the search radius.</p>
          <button onClick={onReset} className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300">
            Search again
          </button>
        </div>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Hotspot card list */}
          <motion.div className="flex-1 min-w-0 space-y-3" initial="hidden" animate="visible" variants={listVariants}>
            {visibleHotspots.map((h, i) => (
              <motion.div key={h.locId} variants={cardVariants}>
                <HotspotCard
                  hotspot={h}
                  hasLifeList={hasLifeList}
                  rank={i + 1}
                  back={back}
                  onExpand={() => setFocusedHotspot(h)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Sticky map panel */}
          <div className="hidden lg:block w-96 xl:w-[440px] shrink-0 sticky top-12 h-[calc(100vh-3rem)] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <MapView hotspots={visibleHotspots} focused={focusedHotspot} />
          </div>
        </div>
      )}
    </div>
  )
}
