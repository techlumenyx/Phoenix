const path = require('path');

module.exports = {
  content: [
    path.resolve(__dirname, './src/**/*.{tsx,ts,html}'),
  ],
  theme: {
    extend: {
      // ── Typography ───────────────────────────────────────────────────
      fontFamily: {
        // font-serif  → already used throughout for headings
        serif:   ["'Playfair Display'", 'Georgia', 'serif'],
        // font-sans   → body text, form inputs, general UI
        sans:    ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        // font-display → nav labels, uppercase caps, sidebar items
        display: ["'Montserrat'", 'system-ui', 'sans-serif'],
      },

      // ── Colour Palette ───────────────────────────────────────────────
      colors: {
        // Primary brand (50+ uses each)
        dark: '#1B1B1B',
        gold: {
          DEFAULT: '#C9A96E',
          hover:   '#b8965e',
        },

        // Background creams (20+ uses each)
        cream: {
          DEFAULT: '#FDF8EE',
          soft:    '#FAF6ED',
          warm:    '#FEF7E9',
          beige:   '#ede9e4',
        },

        // Hero / warm brown tones
        hero: {
          bg:   '#2B2416',
          text: '#1B1208',
        },

        // Semantic status colours + their background tints
        success: {
          DEFAULT: '#0F6D1A',
          dark:    '#065F46',
          bg:      '#F0FDF4',
        },
        warning: {
          DEFAULT: '#854D0E',
          dark:    '#92400E',
          bg:      '#FEF9C3',
        },
        error: {
          DEFAULT: '#C62828',
          dark:    '#D32F2F',
          bg:      '#FFF3F2',
        },
        info: {
          DEFAULT: '#0369A1',
          dark:    '#1E40AF',
          bg:      '#DBEAFE',
        },
      },

      // ── Text Sizes ───────────────────────────────────────────────────
      // Replaces scattered text-[Npx] arbitrary values
      fontSize: {
        '2xs':    ['10px', { lineHeight: '14px' }], // badge / metadata
        'label':  ['11px', { lineHeight: '16px' }], // table col headers, uppercase caps
        'body':   ['13px', { lineHeight: '20px' }], // form labels, row text, inputs
        'body-md':['14px', { lineHeight: '20px' }], // list items, card body
        'body-lg':['15px', { lineHeight: '22px' }], // slightly larger body
      },

      // ── Structural Spacing ───────────────────────────────────────────
      // Named tokens for layout measurements used across many files
      spacing: {
        'navbar':     '72px',   // top nav height — used in min-h-[calc(100vh-72px)]
        'sidebar':    '224px',  // expanded sidebar (= w-56)
        'sidebar-sm': '60px',   // collapsed sidebar
      },

      // ── Max Widths ───────────────────────────────────────────────────
      maxWidth: {
        'modal': '440px',
        'panel': '400px',
        'page':  '1200px',
      },

      // ── Backdrop Blur ────────────────────────────────────────────────
      backdropBlur: {
        'navbar': '10px',
        'modal':  '8px',
      },
    },
  },
  plugins: [],
};
