# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plucky is a desktop guitar scale explorer with real-time pitch detection. It's a React SPA wrapped in a Laravel shell, packaged as a native desktop app via NativePHP/Electron. The backend has no API endpoints — Laravel only serves the SPA's `index.html` via a catch-all route.

## Commands

### Development
```bash
composer dev                # Full dev environment (Laravel server + queue + logs + frontend HMR)
composer native:dev         # Desktop app dev mode with hot reload
cd frontend && npm run dev  # Frontend-only dev server
php artisan serve           # Laravel-only server
```

### Building
```bash
cd frontend && npm run build   # Build React SPA → public/spa/
php artisan native:build       # Build native desktop app (runs frontend build as prebuild)
```

### Code Quality
```bash
cd frontend && npm run build   # Full TypeScript check (tsc -b) + production build — run this to catch type errors that lint misses
cd frontend && npm run lint    # ESLint (TypeScript/React) — does NOT catch all TypeScript errors
vendor/bin/pint                # Laravel Pint (PHP formatter)
```

### Database
```bash
php artisan migrate                              # Run pending migrations (default SQLite)
DB_DATABASE=database/nativephp.sqlite php artisan migrate        # Run against the NativePHP desktop database
DB_DATABASE=database/nativephp.sqlite php artisan migrate:status # Check migration status on nativephp
```

The NativePHP desktop app uses `database/nativephp.sqlite` via a runtime-only `nativephp` connection. The `--database=nativephp` flag won't work outside Electron — use the `DB_DATABASE` env override instead. **After creating migrations, always run them against both databases before asking the user to verify in the desktop app.**

### Testing
```bash
composer test                  # PHPUnit (php artisan test)
```

Frontend has no test framework configured yet.

## Verification Checklist

After making changes, run the appropriate checks before handing off to the user:

1. **Frontend TypeScript/build**: `cd frontend && npm run build` (catches type errors that lint misses)
2. **PHP formatting**: `vendor/bin/pint` (if PHP files were touched)
3. **Migrations**: `php artisan migrate && DB_DATABASE=database/nativephp.sqlite php artisan migrate` (if migrations were added/modified)
4. **Tests**: `composer test` (if backend logic was changed)

## Architecture

### How It All Connects

Frontend builds to `/public/spa/`. Laravel's `routes/web.php` has a single catch-all route that serves `public/spa/index.html` for every request. NativePHP wraps this in Electron — configured in `NativeAppServiceProvider.php` (window size, state persistence) and `config/nativephp.php` (app ID, prebuild scripts, queue workers).

### Zustand Stores (Split by Update Frequency)

The stores are deliberately separated to prevent re-render cascading:

- **`scaleStore`** — User selections (root, scale, tuning, genre, theme). Low frequency.
- **`audioStore`** — Playback state, BPM, current note index. Medium frequency.
- **`pitchStore`** — Live pitch detection (frequency, note, clarity, cents). Updates at 60fps in a `requestAnimationFrame` loop — must stay isolated.
- **`practiceStore`** — Expected notes, current step, hit tracking. Medium frequency.

### Key Data Pipelines

**Pitch detection:** Microphone → `getUserMedia` → `AnalyserNode` (fftSize 2048) → `requestAnimationFrame` loop → Pitchy `findPitch()` (McLeod method) → filter by clarity (>0.9) and range (60–1400Hz) → `pitchStore.updatePitch()` → `PitchIndicator` renders on fretboard.

**Scale computation:** Root + scale + tuning selection → `useFretboardPositions` hook (memoized) → `Tonal.Scale.get()` for note names → `getAllFretboardNotes(tuning)` generates all 138 positions (6 strings × 23 frets) → filters to scale notes → computes box positions → returns `FretPosition[]` with degrees, intervals, colors.

**Audio playback:** `Tone.start()` on first interaction (autoplay policy) → `PolySynth.triggerAttackRelease()` for individual notes or scheduled sequences for full scale playback.

### Conventions

- Path alias: `@/` maps to `frontend/src/` (used in all imports)
- Components: PascalCase files, functional components with hooks
- Type imports: `import type { ... }` for type-only imports
- Constants: `SCREAMING_SNAKE_CASE` for static data (`SCALE_BY_ID`, `DEGREE_COLORS`)
- TypeScript strict mode enabled with `noUnusedLocals` and `noUnusedParameters`
- EditorConfig: 4-space indentation, LF line endings (2-space for YAML)
