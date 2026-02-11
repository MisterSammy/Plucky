# Plucky

A desktop guitar scale explorer with real-time pitch detection. Learn scales visually on an interactive fretboard, hear them played back, and practice with live mic input.

## Features

- **Interactive fretboard** — SVG-rendered 22-fret guitar with accurate spacing and color-coded scale degrees
- **20+ scales** — Major, minor, pentatonic, blues, modes, and exotic scales with interval formulas
- **Real-time pitch detection** — Plug in or play acoustically and see detected notes light up on the fretboard
- **Genre collections** — Curated scale/tuning combos for Midwest Emo, Metal, Blues, Jazz, and Country/Folk
- **Multiple tunings** — Standard, Drop D, DADGAD, Open G, and more, plus a custom tuning editor
- **Audio playback** — Click notes or play full scales with adjustable speed
- **Practice mode** — Track which scale degrees you've played with visual progress

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Zustand, Tonal, Tone.js, Pitchy
- **Backend:** Laravel 12 (lightweight SPA host)
- **Desktop:** NativePHP / Electron

## Development

```bash
# Frontend dev server
cd frontend && npm run dev

# Laravel web server
php artisan serve

# Native desktop app
composer native:dev
```

## Building

```bash
# Build frontend
cd frontend && npm run build

# Build native app
php artisan native:build
```
