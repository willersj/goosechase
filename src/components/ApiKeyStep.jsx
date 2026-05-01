import { useState } from 'react'

export default function ApiKeyStep({ initialKey, onNext }) {
  const [key, setKey] = useState(initialKey)
  const [remember, setRemember] = useState(!!localStorage.getItem('ebirdApiKey'))

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) return
    if (remember) {
      localStorage.setItem('ebirdApiKey', trimmed)
    } else {
      localStorage.removeItem('ebirdApiKey')
    }
    onNext(trimmed)
  }

  return (
    <div className="max-w-md mx-auto pt-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 px-8 pt-10 pb-8 mb-5 text-white">
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-4 w-24 h-24 rounded-full bg-emerald-500/10" />

        <div className="relative">
          <div className="text-5xl mb-5 drop-shadow">🪿</div>
          <h1 className="text-4xl font-bold tracking-tight">GooseChase</h1>
          <p className="text-green-200 mt-2.5 text-base leading-relaxed max-w-xs">
            Find the best nearby hotspots to add new birds to your life list.
          </p>

        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            eBird API Key
          </label>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="Paste your eBird API key"
            autoFocus
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            Don't have one?{' '}
            <a
              href="https://ebird.org/api/keygen"
              target="_blank"
              rel="noreferrer"
              className="text-green-600 dark:text-green-400 underline hover:text-green-800 dark:hover:text-green-300"
            >
              Request a free key from eBird
            </a>
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500"
          />
          Remember my API key in this browser
        </label>

        <button
          type="submit"
          disabled={!key.trim()}
          className="w-full bg-green-700 dark:bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-600 dark:hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Get Started →
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-4">
        Powered by eBird · Cornell Lab of Ornithology
      </p>
    </div>
  )
}
