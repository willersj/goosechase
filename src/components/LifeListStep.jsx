import { useState, useRef } from 'react'
import { parseLifeListCSV } from '../utils/parseLifeList'

const STALE_DAYS = 30

function daysSince(date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const HOW_IT_WORKS = [
  { title: 'Upload your eBird life list', desc: 'Export your observation history as a CSV from ebird.org' },
  { title: 'Set your location and radius', desc: 'Use GPS or search any city, up to 30 miles out' },
  { title: 'See your ranked hotspots', desc: 'Spots sorted by new species for you, with rare sightings flagged' },
]

export default function LifeListStep({ storedLifeList, onNext, onUseSaved, onSkip, onBack }) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [newParsed, setNewParsed] = useState(null)
  const [showUpload, setShowUpload] = useState(!storedLifeList)
  const fileRef = useRef()

  const age = storedLifeList ? daysSince(storedLifeList.savedAt) : null
  const isStale = age !== null && age >= STALE_DAYS

  function handleFile(file) {
    if (!file) return
    setError(null)
    setNewParsed(null)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        setNewParsed(parseLifeListCSV(e.target.result))
      } catch (err) {
        setError(err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 lg:min-h-[calc(100vh-9rem)] lg:items-center">

      {/* Left — landing content */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-5">
          Find your<br />next lifer.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
          GooseChase pulls real-time eBird observations and ranks nearby hotspots by the species
          you haven't seen yet, so every trip out counts.
        </p>
        <div className="space-y-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{step.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — upload form */}
      <div>
        {onBack && (
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-4 flex items-center gap-1">
            ← Back
          </button>
        )}

        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Your Life List</h2>

        {/* Stored list summary */}
        {storedLifeList && (
          <div className={`rounded-xl p-3.5 mb-3 border ${
            isStale
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`font-semibold text-sm ${isStale ? 'text-amber-800 dark:text-amber-300' : 'text-green-800 dark:text-green-300'}`}>
                  {storedLifeList.count.toLocaleString()} species saved
                </p>
                <p className={`text-xs mt-0.5 ${isStale ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  Updated {formatDate(storedLifeList.savedAt)}
                  {age === 0 ? ' (today)' : age === 1 ? ' (yesterday)' : ` · ${age} days ago`}
                </p>
              </div>
              <span className="text-lg shrink-0">{isStale ? '⚠️' : '✅'}</span>
            </div>
            {isStale && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 leading-relaxed">
                List is {age} days old. Re-export from eBird if you've seen new species recently.
              </p>
            )}
            {!showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className={`text-xs underline mt-1.5 ${isStale ? 'text-amber-700 dark:text-amber-400 hover:text-amber-900' : 'text-green-700 dark:text-green-400 hover:text-green-900'}`}
              >
                Upload a newer export
              </button>
            )}
          </div>
        )}

        {/* Upload zone */}
        {showUpload && (
          <>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                handleFile(e.dataTransfer.files[0])
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
              {newParsed ? (
                <div>
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-semibold text-green-700 dark:text-green-400">{newParsed.count.toLocaleString()} species ready</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">Drop your eBird CSV here</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">or click to browse</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">How to export from eBird:</p>
              <p>1. Go to{' '}
                <a href="https://ebird.org/downloadMyData" target="_blank" rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300">
                  ebird.org/downloadMyData
                </a>
              </p>
              <p>2. Click "Download" to get your full observation history as a CSV</p>
              <p>3. Upload the file here. Read locally, nothing is sent anywhere.</p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2.5">
          <button
            onClick={onSkip}
            className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            Skip
          </button>

          {newParsed ? (
            <button
              onClick={() => onNext(newParsed)}
              className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              Use new list
            </button>
          ) : storedLifeList ? (
            <button
              onClick={onUseSaved}
              className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              {isStale ? 'Use anyway' : 'Continue'}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg opacity-40 cursor-not-allowed text-sm"
            >
              Continue
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
