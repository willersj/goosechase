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
  { title: 'See your ranked hotspots', desc: 'Sorted by new species for you, with rare sightings flagged' },
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
        <h1 className="font-display italic font-semibold text-gc-text leading-[1.1] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)' }}>
          Find your<br />next lifer.
        </h1>
        <p className="text-gc-muted text-lg leading-relaxed mb-10">
          GooseChase pulls real-time eBird observations and ranks nearby hotspots by the species
          you haven't seen yet.
        </p>
        <div className="space-y-5">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-gc-accent-bg border border-gc-accent flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-display text-sm font-semibold text-gc-accent">{i + 1}</span>
              </div>
              <div>
                <p className="font-semibold text-gc-text">{step.title}</p>
                <p className="text-sm text-gc-muted mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — upload form */}
      <div>
        {onBack && (
          <button onClick={onBack} className="text-sm text-gc-muted hover:text-gc-text mb-4 flex items-center gap-1 transition-colors">
            ← Back
          </button>
        )}

        <h2 className="font-display font-semibold text-lg text-gc-text mb-4">Your Life List</h2>

        {storedLifeList && (
          <div className={`rounded-xl p-3.5 mb-3 border ${
            isStale
              ? 'bg-gc-gold-bg border-gc-gold/40 text-gc-gold'
              : 'bg-gc-new-bg border-gc-new/30 text-gc-new'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">
                  {storedLifeList.count.toLocaleString()} species saved
                </p>
                <p className="text-xs mt-0.5 opacity-80">
                  Updated {formatDate(storedLifeList.savedAt)}
                  {age === 0 ? ' (today)' : age === 1 ? ' (yesterday)' : ` · ${age} days ago`}
                </p>
              </div>
            </div>
            {isStale && (
              <p className="text-xs mt-2 leading-relaxed opacity-80">
                List is {age} days old. Re-export from eBird if you've seen new species recently.
              </p>
            )}
            {!showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="text-xs underline mt-1.5 opacity-70 hover:opacity-100 transition-opacity"
              >
                Upload a newer export
              </button>
            )}
          </div>
        )}

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
                  ? 'border-gc-accent bg-gc-accent-bg'
                  : 'border-gc-border bg-gc-surface hover:border-gc-accent hover:bg-gc-surface2'
              }`}
            >
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {newParsed ? (
                <div>
                  <p className="font-semibold text-gc-new">{newParsed.count.toLocaleString()} species ready</p>
                  <p className="text-xs text-gc-muted mt-1">Click to change file</p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-gc-text font-medium">Drop your eBird CSV here</p>
                  <p className="text-gc-muted text-sm mt-1">or click to browse</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="mt-3 bg-gc-surface border border-gc-border rounded-xl p-3.5 text-xs text-gc-muted space-y-1">
              <p className="font-semibold text-gc-text mb-1">How to export from eBird:</p>
              <p>1. Go to{' '}
                <a href="https://ebird.org/downloadMyData" target="_blank" rel="noreferrer"
                  className="text-gc-accent-t underline hover:opacity-80 transition-opacity">
                  ebird.org/downloadMyData
                </a>
              </p>
              <p>2. Click "Download" to get your full observation history as a CSV</p>
              <p>3. Upload the file here. Read locally, nothing is sent anywhere.</p>
            </div>
          </>
        )}

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={onSkip}
            className="flex-1 border border-gc-border text-gc-muted font-medium py-2.5 rounded-lg hover:bg-gc-surface2 hover:text-gc-text transition-colors text-sm"
          >
            Skip
          </button>

          {newParsed ? (
            <button
              onClick={() => onNext(newParsed)}
              className="flex-1 bg-gc-accent text-white font-semibold py-2.5 rounded-lg hover:bg-gc-accent-h transition-colors text-sm"
            >
              Use new list
            </button>
          ) : storedLifeList ? (
            <button
              onClick={onUseSaved}
              className="flex-1 bg-gc-accent text-white font-semibold py-2.5 rounded-lg hover:bg-gc-accent-h transition-colors text-sm"
            >
              {isStale ? 'Use anyway' : 'Continue'}
            </button>
          ) : (
            <button disabled className="flex-1 bg-gc-accent text-white font-semibold py-2.5 rounded-lg opacity-40 cursor-not-allowed text-sm">
              Continue
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
