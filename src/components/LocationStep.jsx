import { useState } from 'react'
import { geocodeCity } from '../utils/ebirdApi'

const DISTANCES = [
  { label: '10 mi', value: 10 },
  { label: '20 mi', value: 20 },
  { label: '30 mi', value: 30 }
]

const BACK_OPTIONS = [
  { label: '3 days', value: 3 },
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 }
]

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function LocationStep({ onSearch, loading, error, onBack }) {
  const [distance, setDistance] = useState(20)
  const [back, setBack] = useState(7)
  const [mode, setMode] = useState('location')
  const [cityQuery, setCityQuery] = useState('')
  const [foundPlace, setFoundPlace] = useState(null)
  const [locating, setLocating] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [geoError, setGeoError] = useState(null)

  const busy = locating || geocoding || loading

  function locateGPS() {
    setGeoError(null)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false)
        onSearch({ lat: pos.coords.latitude, lng: pos.coords.longitude }, distance, back)
      },
      () => {
        setLocating(false)
        setGeoError('Could not get your location. Please allow location access and try again.')
      },
      { timeout: 10000 }
    )
  }

  async function handleCitySearch(e) {
    e.preventDefault()
    if (!cityQuery.trim()) return
    setGeoError(null)
    setFoundPlace(null)
    setGeocoding(true)
    try {
      const place = await geocodeCity(cityQuery)
      setFoundPlace(place)
      onSearch({ lat: place.lat, lng: place.lng }, distance, back)
    } catch (err) {
      setGeoError(err.message)
    } finally {
      setGeocoding(false)
    }
  }

  const optBtn = (active) =>
    `flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600'
        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
    }`

  return (
    <div>
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-4 flex items-center gap-1">
        ← Back
      </button>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5">Find Nearby Hotspots</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Settings panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-5">Search Settings</p>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Radius</label>
              <div className="flex gap-2">
                {DISTANCES.map(d => (
                  <button key={d.value} onClick={() => setDistance(d.value)} disabled={busy} className={optBtn(distance === d.value)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Lookback window</label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">How many days of recent sightings to include. Shorter = only the freshest reports; longer = catches rarer or less-frequently visited spots.</p>
              <div className="flex gap-2">
                {BACK_OPTIONS.map(b => (
                  <button key={b.value} onClick={() => setBack(b.value)} disabled={busy} className={optBtn(back === b.value)}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-5">Your Location</p>

          <div className="flex bg-slate-100 dark:bg-slate-700/60 rounded-lg p-0.5 gap-0.5 mb-4">
            <button
              onClick={() => { setMode('location'); setGeoError(null) }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'location'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              My Location
            </button>
            <button
              onClick={() => { setMode('city'); setGeoError(null) }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                mode === 'city'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Search Place
            </button>
          </div>

          {mode === 'location' && (
            <button
              onClick={locateGPS}
              disabled={busy}
              className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {locating || loading ? (
                <><Spinner />{loading ? 'Searching eBird…' : 'Getting your location…'}</>
              ) : 'Use My Location'}
            </button>
          )}

          {mode === 'city' && (
            <form onSubmit={handleCitySearch} className="space-y-3">
              <input
                type="text"
                value={cityQuery}
                onChange={e => setCityQuery(e.target.value)}
                placeholder="City, state or country…"
                autoFocus
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {foundPlace && !loading && (
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{foundPlace.displayName}</p>
              )}
              <button
                type="submit"
                disabled={!cityQuery.trim() || busy}
                className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {geocoding || loading ? (
                  <><Spinner />{loading ? 'Searching eBird…' : 'Finding location…'}</>
                ) : 'Search'}
              </button>
            </form>
          )}
        </div>
      </div>

      {(geoError || error) && (
        <p className="text-red-500 dark:text-red-400 text-sm mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
          {geoError || error}
        </p>
      )}
    </div>
  )
}
