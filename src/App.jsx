import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LifeListStep from './components/LifeListStep'
import LocationStep from './components/LocationStep'
import ResultsView from './components/ResultsView'
import { getNearbyObservations, getNearbyNotable, getHotspotInfo, parseHotspotLocation } from './utils/ebirdApi'

function loadStoredLifeList() {
  try {
    const raw = localStorage.getItem('ebirdLifeList')
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      common: new Set(data.common),
      sci: new Set(data.sci),
      count: data.count,
      savedAt: new Date(data.savedAt)
    }
  } catch {
    return null
  }
}

function persistLifeList(lifeList) {
  localStorage.setItem('ebirdLifeList', JSON.stringify({
    common: [...lifeList.common],
    sci: [...lifeList.sci],
    count: lifeList.count,
    savedAt: lifeList.savedAt.toISOString()
  }))
}

const STEP_KEYS = ['lifelist', 'location', 'results']
const STEP_LABELS = ['Life List', 'Location', 'Results']

const pageVariants = {
  enter: (dir) => ({ x: dir * 48, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { x: { type: 'spring', stiffness: 340, damping: 30 }, opacity: { duration: 0.18 } }
  },
  exit: (dir) => ({
    x: dir * -32,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' }
  })
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('darkMode', String(dark))
  }, [dark])
  return [dark, setDark]
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}

function StepBar({ current }) {
  const idx = STEP_KEYS.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                i < idx
                  ? 'bg-indigo-500 text-white'
                  : i === idx
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900 ring-offset-1'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }`}
            >
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === idx ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className={`w-6 h-0.5 transition-colors duration-300 ${i < idx ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function processObservations(observations, lifeList, notableSet) {
  const locMap = {}
  for (const obs of observations) {
    if (!locMap[obs.locId]) {
      locMap[obs.locId] = { locId: obs.locId, locName: obs.locName, lat: obs.lat, lng: obs.lng, speciesMap: {} }
    }
    const loc = locMap[obs.locId]
    const existing = loc.speciesMap[obs.speciesCode]
    if (existing) {
      existing.reportCount++
      if (obs.obsDt > existing.lastReported) existing.lastReported = obs.obsDt
    } else {
      const isNew = !lifeList || (
        !lifeList.common.has(obs.comName.toLowerCase()) &&
        !lifeList.sci.has(obs.sciName.toLowerCase())
      )
      loc.speciesMap[obs.speciesCode] = {
        speciesCode: obs.speciesCode,
        comName: obs.comName,
        sciName: obs.sciName,
        lastReported: obs.obsDt,
        reportCount: 1,
        isNew,
        isNotable: notableSet.has(obs.speciesCode)
      }
    }
  }
  return Object.values(locMap).map(loc => {
    const species = Object.values(loc.speciesMap)
    return { locId: loc.locId, locName: loc.locName, lat: loc.lat, lng: loc.lng, species, newSpecies: species.filter(s => s.isNew) }
  })
}

export default function App() {
  const [dark, setDark] = useDarkMode()
  const [step, setStep] = useState('lifelist')
  const [direction, setDirection] = useState(1)
  const apiKey = import.meta.env.VITE_EBIRD_API_KEY
  const [lifeList, setLifeList] = useState(() => loadStoredLifeList())
  const [results, setResults] = useState(null)
  const [back, setBack] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function navigate(newStep) {
    setDirection(STEP_KEYS.indexOf(newStep) >= STEP_KEYS.indexOf(step) ? 1 : -1)
    setStep(newStep)
  }

  async function handleSearch(location, distanceMi, backDays) {
    setLoading(true)
    setError(null)
    try {
      const distKm = distanceMi * 1.60934
      const [obsResult, notableResult] = await Promise.allSettled([
        getNearbyObservations(apiKey, location.lat, location.lng, distKm, backDays),
        getNearbyNotable(apiKey, location.lat, location.lng, distKm, backDays)
      ])
      if (obsResult.status === 'rejected') throw obsResult.reason
      const notable = notableResult.status === 'fulfilled' ? notableResult.value : []
      const notableSet = new Set(notable.map(o => o.speciesCode))
      const processed = processObservations(obsResult.value, lifeList, notableSet)
      const infoResults = await Promise.allSettled(processed.map(h => getHotspotInfo(apiKey, h.locId)))
      const enriched = processed.map((h, i) => {
        const info = infoResults[i].status === 'fulfilled' ? infoResults[i].value : null
        return { ...h, location: parseHotspotLocation(info?.hierarchicalName) }
      })
      setBack(backDays)
      setResults(enriched)
      navigate('results')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function resetToLocation() {
    setResults(null)
    setError(null)
    navigate('location')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">🪿</span>
            <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">GooseChase</span>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-5">
        <StepBar current={step} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 'lifelist' && (
              <LifeListStep
                storedLifeList={lifeList}
                onNext={parsed => {
                  const withDate = { ...parsed, savedAt: new Date() }
                  setLifeList(withDate)
                  persistLifeList(withDate)
                  navigate('location')
                }}
                onUseSaved={() => navigate('location')}
                onSkip={() => { setLifeList(null); navigate('location') }}
              />
            )}

            {step === 'location' && (
              <LocationStep
                onBack={() => navigate('lifelist')}
                onSearch={handleSearch}
                loading={loading}
                error={error}
              />
            )}

            {step === 'results' && results && (
              <ResultsView
                results={results}
                lifeList={lifeList}
                back={back}
                onReset={resetToLocation}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
