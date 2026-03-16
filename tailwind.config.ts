import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'term-green':      '#00FF41',
        'term-green-mid':  '#00CC33',
        'term-green-dim':  '#005500',
        'term-green-dark': '#001a00',
        'term-red':        '#FF3333',
        'term-amber':      '#FFAA00',
        'term-cyan':       '#00FFFF',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
