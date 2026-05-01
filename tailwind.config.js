/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        gc: {
          bg:          'var(--gc-bg)',
          surface:     'var(--gc-surface)',
          surface2:    'var(--gc-surface2)',
          border:      'var(--gc-border)',
          text:        'var(--gc-text)',
          muted:       'var(--gc-muted)',
          accent:      'var(--gc-accent)',
          'accent-h':  'var(--gc-accent-h)',
          'accent-bg': 'var(--gc-accent-bg)',
          'accent-t':  'var(--gc-accent-t)',
          gold:        'var(--gc-gold)',
          'gold-bg':   'var(--gc-gold-bg)',
          rare:        'var(--gc-rare)',
          'rare-bg':   'var(--gc-rare-bg)',
          new:         'var(--gc-new)',
          'new-bg':    'var(--gc-new-bg)',
        },
      },
    },
  },
  plugins: [],
}
