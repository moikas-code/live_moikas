// @ts-expect-error: no types for daisyui
import daisyui from 'daisyui'

export default {
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        moikas: {
          primary: '#a259ff', // purple
          secondary: '#ffd700', // gold
          accent: '#00ff85', // green
          neutral: '#18181b', // black (neutral background)
          'base-100': '#18181b', // black background
          'base-200': '#23232a', // slightly lighter black
          'base-300': '#2d2d36', // even lighter black
          info: '#a259ff', // purple for info
          success: '#00ff85', // green for success
          warning: '#ffd700', // gold for warning
          error: '#ff4d4f', // red for error
          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'uppercase',
          '--navbar-padding': '0.5rem',
          '--border-btn': '1px',
        },
      },
    ],
    darkTheme: 'moikas',
    themesOnly: true,
  },
} 