## KeySprint Migration Plan: Next.js (App Router) + Tailwind

### Goal
Deliver a Next.js (App Router) + Tailwind version of “KeySprint — Neon Typing Arena” with 1:1 feature parity, identical visuals/effects, and no behavior regressions.

### 1) Scaffold the project
- Create the app:
  ```
  npx create-next-app@latest key-sprint --ts --eslint --src-dir --app --tailwind
  ```
- Move your current files into `key-sprint/` and initialize Git if needed.

### 2) Dependencies
- Install:
  ```
  cd key-sprint
  npm i canvas-confetti clsx
  ```
- Keep only client-side libraries (no Node-only deps).

### 3) Project structure (target)
```
key-sprint/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    BackgroundCanvas.tsx
    Controls.tsx
    InputArea.tsx
    Popup.tsx
    Quote.tsx
    Scoreboard.tsx
    Stats.tsx
    TimerBar.tsx
    TypingArena.tsx
  hooks/
    useTypingTest.ts
    useLocalScores.ts
    useConfetti.ts
  lib/
    quotes.ts
    format.ts
  public/
    (optional favicon/svgs)
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
```

### 4) Fonts and metadata
- Replace the Google Fonts `<link>` with `next/font/google` in `app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Outfit, Chakra_Petch } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const chakra = Chakra_Petch({ subsets: ['latin'], variable: '--font-chakra' })

export const metadata: Metadata = {
  title: 'KeySprint — Neon Typing Arena',
  themeColor: '#0b1221',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${chakra.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
```

### 5) Tailwind configuration
- `tailwind.config.ts`: map CSS variables to Tailwind for utility use while keeping existing class styles.
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-0': 'var(--bg-0)',
        'bg-1': 'var(--bg-1)',
        primary: 'var(--primary)',
        'primary-2': 'var(--primary-2)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        glass: 'var(--glass)',
        'glass-2': 'var(--glass-2)',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)'],
        chakra: ['var(--font-chakra)'],
      },
      boxShadow: {
        glass: '0 10px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
export default config
```

### 6) Global styles migration
- Copy `style.css` into `app/globals.css`; prepend Tailwind directives; keep all existing class-based styling to ensure visual parity:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-0: #0b1221;
    --bg-1: #0f1b33;
    --primary: #7c5cff;
    --primary-2: #00ffd5;
    --accent: #ffb703;
    --danger: #ff4d6d;
    --success: #00ff88;
    --text: #e5e9f7;
    --muted: #92a1bd;
    --glass: rgba(255, 255, 255, 0.06);
    --glass-2: rgba(255, 255, 255, 0.1);
  }

  body {
    @apply min-h-screen overflow-x-hidden text-text;
    background:
      radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.25), transparent 60%),
      radial-gradient(1200px 800px at 80% 90%, rgba(0, 255, 213, 0.12), transparent 60%),
      linear-gradient(180deg, #0a0f1f 0%, #0b1221 60%, #0a0f1f 100%);
    font-family: var(--font-outfit), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
}

/* Paste the rest of your existing CSS here unchanged (progress, popup, canvas, etc.) */
```
- Preserve media queries and animations including `prefers-reduced-motion`.

### 7) Move data/constants
- `lib/quotes.ts`: export `QUOTES_BY_DIFFICULTY` exactly as in `script.js`.
- `lib/format.ts`: export `formatDate(ts: number): string` using `new Date(ts).toLocaleString()`.

### 8) Hooks (client)
- `hooks/useTypingTest.ts` (game loop and state)
  - **State**:
    - `timeLeft: number`, `totalTime: number`
    - `isRunning: boolean`
    - `currentQuote: string`
    - `currentPool: string[]`
    - `inputValue: string`
    - `wordsTyped: number`
  - **Derived**:
    - `elapsed = totalTime - timeLeft`
    - `ratio = Math.max(0, timeLeft / totalTime)` (guard totalTime)
    - `wpm = elapsed > 0 ? Math.floor((wordsTyped / elapsed) * 60) : 0`
    - `barState: 'ok' | 'warn' | 'danger'` thresholds: `>0.5`, `>0.2`, else danger
  - **Controls**:
    - `difficulty: 'easy'|'medium'|'hard'|'warrior'` (default medium)
    - `timeLimit: 30|60|120|180|300` (default 120)
  - **Actions**:
    - `start()`: set `totalTime = timeLimit`; reset `timeLeft`, `wordsTyped`, `inputValue`; load first quote; enable running
    - `tick()`: decrement `timeLeft`; update WPM/progress; when `timeLeft <= 0`, finalize
    - `onInput(value: string)`: update `inputValue`; compute per-char correctness; when fully correct, increment `wordsTyped` by `currentQuote.split(/\s+/).length` and load next quote
    - `loadNextQuote()`: remove random quote from `currentPool`; if empty, repopulate from difficulty pool
    - `finalize()`: stop; open popup; record score
    - `setDifficulty(d)`: update difficulty and reset pool (do not interrupt running test)
    - `setTimeLimit(t)`
  - **Effects**:
    - Interval while `isRunning` via `useEffect`
    - Reinitialize `currentPool` when difficulty changes

- `hooks/useLocalScores.ts` (persistence; key `typing_scores_v2`)
  - `loadScores(): Score[]` with try/catch; fallback `[]`
  - `saveScores(scores: Score[])` with try/catch
  - `recordResult(s: Omit<Score, 'timestamp'>)`: push timestamp, cap to last 100 sorted desc
  - Selectors: `bestOverall`, `bestByDifficulty`, `recentTop10`

- `hooks/useConfetti.ts`
  - On `open === true`, dynamic import `canvas-confetti`; run 3 bursts for ~1200ms with same options and z-index.

### 9) Components (client)
- `components/TypingArena.tsx`
  - Composes all parts; handles global keydown:
    - Enter: if popup open → restart; else if not running → start
    - Escape: close popup if open
  - Layout using Tailwind utilities; keep class hooks like `.container` where effects are complex

- `components/BackgroundCanvas.tsx`
  - `<canvas ref>` with class `bg-canvas`; effect wires resize and mousemove; replicate particle logic (max 120, gravity, life decay, hue range)

- `components/Controls.tsx`
  - Props: `{ timeLimit, setTimeLimit, difficulty, setDifficulty }`
  - Renders selects with same labels; values controlled

- `components/TimerBar.tsx`
  - Props: `{ ratio: number, timeLeft: number, state: 'ok'|'warn'|'danger' }`
  - Markup:
    - Outer `.progress` with state class
    - Inner `.progress-fill` with `style={{ transform: \`scaleX(${ratio})\` }}`
    - Label with `timeLeft`

- `components/Quote.tsx`
  - Props: `{ quote: string, input: string }`
  - Renders per-char `<span>`; normalize spaces both sides; add `correct`/`incorrect` classes

- `components/InputArea.tsx`
  - Props: `{ value, onChange, disabled }`
  - Controlled `<textarea>`; disabled until start; request focus on start

- `components/Stats.tsx`
  - Props: `{ wpm: number, words: number }`
  - Two badges with labels “WPM” and “Words”

- `components/Popup.tsx`
  - Props: `{ open: boolean, onClose: () => void, onRestart: () => void, words: number, wpm: number }`
  - Uses `useConfetti(open)`; close on ✕, backdrop click, or Escape; “Play Again” calls `onRestart`

- `components/Scoreboard.tsx`
  - Uses `useLocalScores` to read scores
  - Displays:
    - Best overall (WPM, words, time)
    - Best per difficulty
    - Recent 10: “WPM • words • time • difficulty • timeLimit” + `formatDate(timestamp)`

- `app/page.tsx`
  - Renders `BackgroundCanvas` and `TypingArena`

### 10) Feature parity mapping
- **Time limits**: same values, default 120s
- **Difficulty**: same four; pool resets on change
- **Quote selection**: no duplicates until pool exhausted; then repopulate
- **Per-character correctness**: same logic and classes; `&nbsp;` handling
- **Word counting**: `currentQuote.split(/\s+/).length`
- **WPM**: `floor((wordsTyped / elapsed) * 60)`; only when `elapsed > 0`
- **Timer/progress**: same thresholds and danger shake; clear state classes on finish
- **Popup**: open on finish; shows words/WPM; restart button; close via ✕/backdrop/Escape
- **Keyboard**: Enter to start (idle) or restart (popup open); Escape closes popup
- **Scoreboard**:
  - Storage key: `typing_scores_v2`
  - Schema: `{ wpm, words, time, difficulty, timeLimit, timestamp }`
  - Cap: store last 100; show recent 10
  - Best overall and per difficulty by max WPM
  - Dates via `toLocaleString()`
- **Background canvas**: same visual behavior and performance
- **Reduced motion**: progress transitions and shake disabled

### 11) SSR/hydration safety
- Mark interactive components and all hooks with `'use client'`.
- Access `window`, `document`, `localStorage`, canvas context inside `useEffect`.
- Dynamic import `canvas-confetti` in `useConfetti`.

### 12) Implementation order (recommended)
1. Scaffold app + Tailwind, fonts, metadata.
2. Move global CSS (variables, animations, classes) into `app/globals.css`.
3. Create `lib/quotes.ts`, `lib/format.ts`.
4. Build `useLocalScores` with same storage key/schema and verify scoreboard rendering with mock data.
5. Build `useTypingTest` with timer, quotes, input, WPM, popup state.
6. Compose UI in `TypingArena` with `Controls`, `TimerBar`, `Quote`, `InputArea`, `Stats`, `Popup`, `Scoreboard`.
7. Add `BackgroundCanvas` and verify resize/mouse performance.
8. Wire keyboard shortcuts and popup behaviors.
9. Replace any remaining inline DOM operations with React refs/props.
10. Validate all acceptance checks below.

### 13) Acceptance checklist
- **Controls**
  - Selects reflect controlled values; start disabled while running
- **Timer/WPM**
  - `timeLeft` decrements per second; progress fill scales smoothly; state classes switch at 0.5/0.2
  - WPM stays 0 until elapsed > 0; updates at each tick
- **Typing**
  - Per-char correctness styling matches; exact quote completion triggers next quote
  - Words increase by quote word count
- **Finish**
  - Input disabled; popup opens; final words/WPM correct; restart resets state and focuses input
- **Scoreboard**
  - Saves with key `typing_scores_v2`; recent 10 sorted desc; stored capped at 100
  - Best overall and per difficulty correct
- **Keyboard**
  - Enter starts when idle; Enter restarts if popup open; Escape closes popup
- **Visuals**
  - Glassmorphism, gradients, shadows, shake, popIn animation, reduced-motion behavior intact
  - Background canvas trail works and resizes
- **Fonts/metadata**
  - `Outfit` and `Chakra Petch` applied; theme color set

### 14) Performance and a11y
- Run Lighthouse; ensure no major regressions.
- Canvas: throttle particles to `maxParticles=120`; use `requestAnimationFrame` loop; remove listeners on unmount.
- Focus management: focus textarea on start; trap focus in popup; restore focus on close.
- Ensure labels and `aria-label` preserved.

### 15) Run and deploy
- Dev: `npm run dev` → check all features with the checklist.
- Build: `npm run build && npm start`.
- Deploy: Vercel or Node server; no server APIs required.

### Data model reference
```ts
type Difficulty = 'easy' | 'medium' | 'hard' | 'warrior'

type Score = {
  wpm: number
  words: number
  time: number
  difficulty: Difficulty
  timeLimit: number
  timestamp: number
}
```


