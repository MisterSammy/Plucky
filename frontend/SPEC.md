# ScalePro - Technical Project Specification

## 1. Overview & Goals

**ScalePro** is a browser-based interactive guitar scale teaching application. It renders a realistic guitar fretboard as SVG, highlights scale patterns in real time, and connects to the user's microphone for live pitch detection so players can see which notes they're hitting on the fretboard as they play.

### Target Users
- Beginner to intermediate guitarists learning scales
- Players exploring scales associated with specific genres (midwest emo, metal, blues, jazz, country/folk)
- Guitar teachers looking for a visual aid
- Players using alternate tunings who need to see how scale shapes change

### Goals
- Visually teach scale patterns across the entire fretboard
- Support 20+ scales organized by genre
- Support 8+ tuning presets plus custom tunings
- Provide real-time pitch detection with fretboard highlighting
- Play notes and full scales via audio synthesis
- Work entirely in the browser with no backend

---

## 2. Core Features

| Feature | Description |
|---|---|
| **Interactive SVG Fretboard** | 6-string, 22-fret fretboard with accurate proportional spacing, fret markers, and nut |
| **Scale Library** | 20+ scales with interval formulas, degree names, and genre categorization |
| **Genre Collections** | 5 genre groupings (Midwest Emo, Metal, Blues, Jazz, Country/Folk) with curated scale sets and playing tips |
| **Tuning Presets** | Standard, Drop D, Drop C#, DADGAD, Open G, Open D, Eb Standard, plus custom tuning editor |
| **Root Note Selector** | Select any of 12 chromatic root notes; fretboard highlights update instantly |
| **Pitch Detection** | Real-time microphone input via Web Audio API + pitchy; detected notes highlight on the fretboard |
| **Audio Playback** | Click any highlighted note to hear it; play the full scale ascending/descending via Tone.js |
| **Dark Mode** | System-preference-aware dark/light theme toggle |
| **Responsive Layout** | Fully usable on desktop and mobile viewports; fretboard scrolls horizontally on small screens |
| **URL Hash Sync** | Current root + scale + tuning encoded in URL hash for sharing |

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component model, hooks, strong typing |
| **Build Tool** | Vite 6 | Fast HMR, native ESM, minimal config |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode support, zero runtime |
| **Music Theory** | tonal (^6) | Scales, notes, intervals, MIDI conversions — well-maintained, tree-shakeable |
| **Pitch Detection** | pitchy (^4) | McLeod Pitch Method, ~10KB, accurate for guitar range |
| **Audio Synthesis** | Tone.js (^15) | Web Audio abstraction, synths, scheduling |
| **State Management** | Zustand (^5) | Lightweight, no boilerplate, no re-render storms on 60fps updates |
| **Testing** | Vitest + React Testing Library | Vite-native, fast, familiar API |
| **Linting** | ESLint + Prettier | Code consistency |

### Why NOT these alternatives:
- **fretboard.js** — Doesn't integrate well with React's virtual DOM; custom SVG gives us full control over real-time pitch highlighting animations
- **React Context** — Re-renders entire subtree on every state change; pitch detection updates at 60fps would cause render storms
- **React Router** — Single-page app with no navigation; URL hash sync is trivial without a router

---

## 4. Data Models

```typescript
// ── Notes & Intervals ──

type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

type NoteWithOctave = `${NoteName}${number}`; // e.g. "E2", "A4"

interface FretPosition {
  string: number;       // 0-5 (high E = 0, low E = 5)
  fret: number;         // 0-22 (0 = open string)
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  frequency: number;
  interval: string;     // e.g. "1P", "3M", "5P"
  degree: number;       // 1-7 scale degree
  isRoot: boolean;
}

// ── Scales ──

interface ScaleDefinition {
  id: string;                    // e.g. "natural-minor"
  name: string;                  // e.g. "Natural Minor (Aeolian)"
  intervals: string[];           // e.g. ["1P", "2M", "3m", "4P", "5P", "6m", "7m"]
  degrees: string[];             // e.g. ["Root", "2nd", "♭3rd", "4th", "5th", "♭6th", "♭7th"]
  category: ScaleCategory;
  description: string;
  tonalName: string;             // Name used by tonal library, e.g. "aeolian"
}

type ScaleCategory =
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'blues'
  | 'modal'
  | 'exotic'
  | 'jazz';

// ── Genres ──

interface GenreCollection {
  id: string;                    // e.g. "midwest-emo"
  name: string;                  // e.g. "Midwest Emo"
  description: string;
  scaleIds: string[];            // References to ScaleDefinition.id
  suggestedTunings: string[];    // References to TuningPreset.id
  tips: string[];                // Playing tips specific to genre
  color: string;                 // Tailwind color class for UI chips
}

// ── Tunings ──

interface TuningPreset {
  id: string;                    // e.g. "drop-d"
  name: string;                  // e.g. "Drop D"
  notes: [NoteWithOctave, NoteWithOctave, NoteWithOctave,
          NoteWithOctave, NoteWithOctave, NoteWithOctave];
  // [string1(high E), string2, string3, string4, string5, string6(low)]
  description: string;
  isCustom: boolean;
}

// ── Audio State ──

interface PitchDetectionState {
  isListening: boolean;
  currentFrequency: number | null;
  currentNote: NoteName | null;
  currentNoteWithOctave: NoteWithOctave | null;
  clarity: number;               // 0-1 confidence from pitchy
  currentMidi: number | null;
  centOffset: number;            // Cents sharp/flat from nearest note
}

interface AudioPlaybackState {
  isPlaying: boolean;
  currentNoteIndex: number | null;  // Index in scale being played
  synth: any;                       // Tone.js synth instance (opaque)
}

// ── App State ──

interface AppState {
  // Scale selection
  selectedRoot: NoteName;
  selectedScaleId: string;
  selectedTuningId: string;
  selectedGenreId: string | null;

  // Computed (derived in selectors, not stored)
  // fretPositions: FretPosition[]
  // filteredScales: ScaleDefinition[]

  // Audio
  pitchDetection: PitchDetectionState;
  playback: AudioPlaybackState;

  // UI
  theme: 'light' | 'dark' | 'system';
  showAllNotes: boolean;          // Show every note on fretboard, not just scale
  highlightRoot: boolean;         // Distinct color for root notes
}
```

---

## 5. Scale Library

### Major / Minor Foundations
| ID | Name | Intervals | Tonal Name |
|---|---|---|---|
| `major` | Major (Ionian) | 1P 2M 3M 4P 5P 6M 7M | `ionian` |
| `natural-minor` | Natural Minor (Aeolian) | 1P 2M 3m 4P 5P 6m 7m | `aeolian` |
| `harmonic-minor` | Harmonic Minor | 1P 2M 3m 4P 5P 6m 7M | `harmonic minor` |
| `melodic-minor` | Melodic Minor | 1P 2M 3m 4P 5P 6M 7M | `melodic minor` |

### Pentatonic & Blues
| ID | Name | Intervals | Tonal Name |
|---|---|---|---|
| `major-pentatonic` | Major Pentatonic | 1P 2M 3M 5P 6M | `major pentatonic` |
| `minor-pentatonic` | Minor Pentatonic | 1P 3m 4P 5P 7m | `minor pentatonic` |
| `blues` | Blues | 1P 3m 4P 4A 5P 7m | `blues` |
| `major-blues` | Major Blues | 1P 2M 3m 3M 5P 6M | `major blues` |

### Modes
| ID | Name | Intervals | Tonal Name |
|---|---|---|---|
| `dorian` | Dorian | 1P 2M 3m 4P 5P 6M 7m | `dorian` |
| `phrygian` | Phrygian | 1P 2m 3m 4P 5P 6m 7m | `phrygian` |
| `lydian` | Lydian | 1P 2M 3M 4A 5P 6M 7M | `lydian` |
| `mixolydian` | Mixolydian | 1P 2M 3M 4P 5P 6M 7m | `mixolydian` |
| `locrian` | Locrian | 1P 2m 3m 4P 5d 6m 7m | `locrian` |

### Exotic / Extended
| ID | Name | Intervals | Tonal Name |
|---|---|---|---|
| `phrygian-dominant` | Phrygian Dominant | 1P 2m 3M 4P 5P 6m 7m | `phrygian dominant` |
| `hungarian-minor` | Hungarian Minor | 1P 2M 3m 4A 5P 6m 7M | `hungarian minor` |
| `whole-tone` | Whole Tone | 1P 2M 3M 4A 5A 7m | `whole tone` |
| `diminished-hw` | Diminished (H-W) | 1P 2m 3m 3M 4A 5P 6M 7m | `diminished` |
| `diminished-wh` | Diminished (W-H) | 1P 2M 3m 4P 4A 5A 6M 7M | `whole-half diminished` |
| `chromatic` | Chromatic | 1P 2m 2M 3m 3M 4P 4A 5P 6m 6M 7m 7M | `chromatic` |

### Jazz
| ID | Name | Intervals | Tonal Name |
|---|---|---|---|
| `bebop-dominant` | Bebop Dominant | 1P 2M 3M 4P 5P 6M 7m 7M | `bebop` |
| `altered` | Altered (Super Locrian) | 1P 2m 3m 3M 5d 6m 7m | `altered` |
| `lydian-dominant` | Lydian Dominant | 1P 2M 3M 4A 5P 6M 7m | `lydian dominant` |
| `half-whole-diminished` | Half-Whole Diminished | 1P 2m 3m 3M 4A 5P 6M 7m | `diminished` |

---

## 6. Genre Collections

### Midwest Emo
```
id: "midwest-emo"
scales: major, natural-minor, major-pentatonic, minor-pentatonic, dorian, lydian, mixolydian
suggestedTunings: standard, dadgad, open-g
tips:
  - "Use open strings and let notes ring together for that twinkly sound"
  - "Tap harmonics at the 5th, 7th, and 12th frets over scale tones"
  - "Mix major and minor pentatonic over the same progression for tension"
  - "Try arpeggiated chord shapes moving up the neck in Lydian positions"
color: "amber"
```

### Metal
```
id: "metal"
scales: natural-minor, harmonic-minor, phrygian, phrygian-dominant, locrian, diminished-hw, chromatic, hungarian-minor
suggestedTunings: drop-d, drop-cs, standard
tips:
  - "Palm-muted chugs on the low string follow the root notes of the scale"
  - "Harmonic minor's raised 7th creates a neoclassical sound for sweeps"
  - "Phrygian dominant (♭2 with major 3rd) gives a Middle Eastern flavor"
  - "Use diminished arpeggios as passing tones between scale positions"
color: "red"
```

### Blues
```
id: "blues"
scales: blues, minor-pentatonic, major-pentatonic, major-blues, mixolydian, dorian
suggestedTunings: standard, open-g, open-d, eb-standard
tips:
  - "Bend the minor 3rd up toward the major 3rd for the classic blues sound"
  - "The 'blue note' (♯4/♭5) resolves best when slid into the 5th"
  - "Mix major and minor pentatonic boxes for a sweet/sour feel"
  - "In open tunings, a slide covers full chord shapes across frets"
color: "indigo"
```

### Jazz
```
id: "jazz"
scales: major, dorian, mixolydian, lydian, melodic-minor, bebop-dominant, altered, lydian-dominant, whole-tone, diminished-hw, half-whole-diminished
suggestedTunings: standard
tips:
  - "Bebop scales add a chromatic passing tone for smooth eighth-note lines"
  - "Play the altered scale over dominant 7th chords resolving to minor"
  - "Lydian dominant works over ♯11 chords and tritone substitutions"
  - "Practice scales in 3rds, 4ths, and enclosures — not just up and down"
color: "violet"
```

### Country / Folk
```
id: "country-folk"
scales: major, major-pentatonic, minor-pentatonic, mixolydian, blues, dorian
suggestedTunings: standard, drop-d, dadgad, open-g, open-d
tips:
  - "Hybrid picking (pick + fingers) brings out scale runs on non-adjacent strings"
  - "Open string pull-offs in pentatonic runs create the 'chicken pickin' sound"
  - "Use Mixolydian over dominant 7th vamps for that country twang"
  - "DADGAD tuning excels for Celtic/folk fingerstyle patterns"
color: "emerald"
```

---

## 7. Tuning Presets

| ID | Name | Strings (1→6, high to low) | Description |
|---|---|---|---|
| `standard` | Standard | E4 B3 G3 D3 A2 E2 | Standard EADGBE tuning |
| `drop-d` | Drop D | E4 B3 G3 D3 A2 D2 | Low string dropped one whole step |
| `drop-cs` | Drop C# | Eb4 Bb3 Gb3 Db3 Ab2 Db2 | Drop D tuned down a half step |
| `dadgad` | DADGAD | D4 A3 G3 D3 A2 D2 | Open Dsus4; popular for celtic/emo |
| `open-g` | Open G | D4 B3 G3 D3 G2 D2 | Open G major chord; slide guitar staple |
| `open-d` | Open D | D4 A3 F#3 D3 A2 D2 | Open D major chord; fingerstyle/blues |
| `eb-standard` | Eb Standard | Eb4 Bb3 Gb3 Db3 Ab2 Eb2 | Half step down from standard; SRV, Hendrix |
| `custom` | Custom | (user-defined) | User sets each string to any note+octave |

---

## 8. Architecture

### Component Hierarchy

```
<App>
├── <Header>
│   ├── <Logo />
│   └── <ThemeToggle />
├── <ControlPanel>
│   ├── <RootNoteSelector />        // 12 chromatic note buttons
│   ├── <ScaleSelector />           // Dropdown/search of all scales
│   ├── <TuningSelector />          // Dropdown of presets + custom editor
│   ├── <GenreFilter />             // Chip toggles for genre collections
│   └── <DisplayOptions />          // Show all notes, highlight root, etc.
├── <FretboardContainer>
│   ├── <FretboardSVG>
│   │   ├── <FretboardBackground /> // Nut, frets, fret markers, strings
│   │   ├── <NoteOverlay />         // Highlighted scale note circles
│   │   └── <PitchIndicator />      // Real-time detected note highlight
│   └── <FretboardLegend />         // Scale degree color key
├── <ScaleInfo>
│   ├── <ScaleFormula />            // Interval display
│   ├── <ScaleNotes />              // Note names in current key
│   └── <GenreTips />               // Tips for selected genre
├── <AudioControls>
│   ├── <PlayScaleButton />         // Play full scale ascending/descending
│   ├── <MicToggle />               // Enable/disable pitch detection
│   └── <PitchDisplay />            // Current detected note + cents offset
└── <Footer />
```

### State Management (Zustand)

Three separate Zustand stores to isolate update frequencies:

```
scaleStore (low frequency — user interactions)
├── selectedRoot: NoteName
├── selectedScaleId: string
├── selectedTuningId: string
├── selectedGenreId: string | null
├── customTuning: TuningPreset | null
├── showAllNotes: boolean
├── highlightRoot: boolean
├── actions: setRoot, setScale, setTuning, setGenre, setCustomTuning, ...

audioStore (medium frequency — playback state)
├── isPlaying: boolean
├── currentNoteIndex: number | null
├── actions: playScale, playNote, stop

pitchStore (high frequency — 60fps updates)
├── isListening: boolean
├── currentFrequency: number | null
├── currentNote: NoteName | null
├── currentNoteWithOctave: NoteWithOctave | null
├── clarity: number
├── centOffset: number
├── actions: startListening, stopListening, updatePitch
```

### Data Flow

```
User selects root + scale + tuning
        │
        ▼
scaleStore updates ──► useFretboardPositions(root, scale, tuning)
        │                    │
        │                    ├── tonal.Scale.get(root + scale)  → note names
        │                    ├── compute all fret positions for tuning
        │                    └── filter/mark positions that are in scale
        │                    │
        │                    ▼
        │              FretPosition[] (memoized)
        │                    │
        ▼                    ▼
  <ControlPanel>      <FretboardSVG> renders highlighted notes
                             ▲
                             │
  pitchStore ────────► <PitchIndicator> overlays detected note
  (60fps updates)            │
        ▲                    │
        │              audioStore ──► Tone.js synth plays on click
  pitchy detector
        ▲
        │
  getUserMedia (mic)
```

---

## 9. Fretboard Rendering

### SVG Coordinate System

The fretboard is rendered as an SVG element with the following coordinate math:

```
Total width:  ~1200px (scales with container)
Total height: ~200px

Nut position: x = 40px (left padding for string labels)
Last fret:    x = width - 20px

Fret spacing: Proportional using the 12th-root-of-2 rule
  fretX(n) = nutX + (scaleLength * (1 - 1 / 2^(n/12)))
  where scaleLength = totalFretboardWidth

String spacing: Even vertical distribution
  stringY(s) = topPadding + (s * stringSpacing)
  where stringSpacing = (height - topPadding - bottomPadding) / 5
```

### Visual Elements

| Element | Rendering |
|---|---|
| **Nut** | 4px wide dark rectangle at x=nutX |
| **Frets** | 2px wide lines at each fretX(n), metallic gray |
| **Strings** | Horizontal lines, thickness varies (1px high E → 3px low E) |
| **Fret markers** | Circles at frets 3, 5, 7, 9, 12 (double), 15, 17, 19, 21 |
| **Note dots** | 28px circles centered at (fretMidX, stringY) |
| **Root notes** | Distinct color (red/orange) + slightly larger (32px) |
| **Scale degrees** | Color coded: 1=red, 2=orange, 3=yellow, 4=green, 5=cyan, 6=blue, 7=purple |
| **Detected note** | Pulsing ring animation around matched fret position(s) |
| **Open strings** | Notes at fret 0 shown as circles left of the nut |

### Color Scheme (Scale Degrees)

```
Root (1)  → #EF4444 (red-500)
2nd       → #F97316 (orange-500)
♭3/3      → #EAB308 (yellow-500)
4th       → #22C55E (green-500)
♭5/5      → #06B6D4 (cyan-500)
♭6/6      → #3B82F6 (blue-500)
♭7/7      → #8B5CF6 (violet-500)
```

### Performance

- `useMemo` for fretboard position computation, keyed on `[root, scaleId, tuningId]`
- Note circles use React keys based on `string-fret` for minimal DOM diffing
- Pitch indicator uses CSS transforms (GPU-accelerated) for pulse animation
- SVG `viewBox` with `preserveAspectRatio` for responsive scaling

---

## 10. Pitch Detection Pipeline

### Architecture

```
getUserMedia({ audio: true })
    │
    ▼
MediaStreamSource ──► AnalyserNode (fftSize: 2048)
                           │
                           ▼
                    requestAnimationFrame loop
                           │
                           ├── analyser.getFloatTimeDomainData(buffer)
                           ├── PitchDetector.forFloat32Array(buffer.length)
                           │       └── detector.findPitch(buffer, sampleRate)
                           │              └── [frequency, clarity]
                           │
                           ├── if clarity > 0.90:
                           │       ├── noteFromFreq(frequency) → NoteName + octave
                           │       ├── centOffset = 1200 * log2(freq / nearestFreq)
                           │       └── pitchStore.updatePitch(note, freq, clarity, cents)
                           │
                           └── requestAnimationFrame(loop)  // next frame
```

### Key Parameters

| Parameter | Value | Rationale |
|---|---|---|
| `fftSize` | 2048 | Good balance of frequency resolution vs latency at 44.1kHz |
| `clarity threshold` | 0.90 | Filters out noise/harmonics; guitar fundamentals score >0.95 |
| `smoothing` | 0.8 | AnalyserNode smoothingTimeConstant; reduces flicker |
| `sample rate` | 44100 | Browser default; sufficient for guitar range (82Hz–1175Hz) |

### Note Mapping

```typescript
function frequencyToNote(frequency: number): { note: NoteName; octave: number; cents: number } {
  // MIDI note number from frequency
  const midi = 12 * Math.log2(frequency / 440) + 69;
  const roundedMidi = Math.round(midi);
  const cents = Math.round((midi - roundedMidi) * 100);

  // Use tonal to get note name from MIDI
  const noteName = Midi.midiToNoteName(roundedMidi, { sharps: true });

  return { note, octave, cents };
}
```

### Fretboard Matching

When a note is detected, find all matching fret positions:

```typescript
function findMatchingPositions(
  detectedNote: NoteWithOctave,
  fretPositions: FretPosition[]
): FretPosition[] {
  return fretPositions.filter(pos => pos.noteWithOctave === detectedNote);
}
```

Multiple positions may match (same note on different strings). All are highlighted with the pulse animation.

---

## 11. Audio Playback

### Tone.js Setup

```typescript
// Lazy-initialized on first user interaction (browser autoplay policy)
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },   // Guitar-like timbre
  envelope: {
    attack: 0.02,
    decay: 0.3,
    sustain: 0.2,
    release: 1.0,
  },
  volume: -6,
});
synth.toDestination();
```

### Single Note Playback

Click a note on the fretboard → play that specific note:

```typescript
function playNote(noteWithOctave: NoteWithOctave, duration: string = "8n") {
  await Tone.start(); // Resume AudioContext if suspended
  synth.triggerAttackRelease(noteWithOctave, duration);
}
```

### Scale Playback

Play the full scale ascending then descending:

```typescript
async function playScale(notes: NoteWithOctave[], bpm: number = 120) {
  await Tone.start();
  const interval = 60 / bpm;
  const ascending = [...notes];
  const descending = [...notes].reverse().slice(1); // Skip duplicate top note
  const sequence = [...ascending, ...descending];

  sequence.forEach((note, i) => {
    synth.triggerAttackRelease(note, "8n", Tone.now() + i * interval);
  });
}
```

---

## 12. Project Structure

```
scalepro/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts            # Tailwind v4 config (if needed beyond CSS)
├── eslint.config.js
├── SPEC.md
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                   # React root mount
│   ├── App.tsx                    # Root component, layout
│   ├── index.css                  # Tailwind directives, CSS variables, global styles
│   │
│   ├── types/
│   │   └── index.ts               # All TypeScript interfaces & type aliases
│   │
│   ├── data/
│   │   ├── scales.ts              # ScaleDefinition[] — all 20+ scale definitions
│   │   ├── genres.ts              # GenreCollection[] — 5 genre collections
│   │   └── tunings.ts             # TuningPreset[] — 8 tuning presets
│   │
│   ├── lib/
│   │   ├── music.ts               # Fretboard math, note computation, scale mapping
│   │   ├── pitch.ts               # Pitch detection class (getUserMedia + pitchy)
│   │   ├── audio.ts               # Tone.js playback helpers
│   │   └── url.ts                 # URL hash encoding/decoding
│   │
│   ├── stores/
│   │   ├── scaleStore.ts          # Zustand store for scale/root/tuning/genre selection
│   │   ├── audioStore.ts          # Zustand store for playback state
│   │   └── pitchStore.ts          # Zustand store for pitch detection state
│   │
│   ├── hooks/
│   │   ├── useFretboardPositions.ts   # Memoized fretboard position computation
│   │   ├── usePitchDetection.ts       # Hook wrapping pitch detection lifecycle
│   │   └── useAudioPlayback.ts        # Hook wrapping Tone.js playback
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── RootNoteSelector.tsx
│   │   ├── ScaleSelector.tsx
│   │   ├── TuningSelector.tsx
│   │   ├── GenreFilter.tsx
│   │   ├── DisplayOptions.tsx
│   │   ├── FretboardContainer.tsx
│   │   ├── FretboardSVG.tsx
│   │   ├── FretboardBackground.tsx
│   │   ├── NoteOverlay.tsx
│   │   ├── PitchIndicator.tsx
│   │   ├── FretboardLegend.tsx
│   │   ├── ScaleInfo.tsx
│   │   ├── AudioControls.tsx
│   │   ├── PlayScaleButton.tsx
│   │   ├── MicToggle.tsx
│   │   ├── PitchDisplay.tsx
│   │   ├── CustomTuningEditor.tsx
│   │   └── Footer.tsx
│   │
│   └── __tests__/
│       ├── music.test.ts           # Fretboard math, note mapping
│       ├── scales.test.ts          # Scale data integrity
│       ├── tunings.test.ts         # Tuning note correctness
│       ├── FretboardSVG.test.tsx   # Fretboard rendering
│       └── ControlPanel.test.tsx   # User interaction flows
│
└── .gitignore
```

---

## 13. Implementation Phases

### Phase 1: Foundation
**Goal:** Scaffold project, define types and data, render a static fretboard

- Initialize Vite + React + TypeScript project
- Install dependencies: `tonal`, `pitchy`, `tone`, `zustand`, `tailwindcss`
- Define all TypeScript types in `src/types/index.ts`
- Create scale definitions in `src/data/scales.ts`
- Create genre collections in `src/data/genres.ts`
- Create tuning presets in `src/data/tunings.ts`
- Implement fretboard math in `src/lib/music.ts`
- Build `<FretboardSVG>` with background elements (nut, frets, strings, markers)
- Render note dots for a hardcoded scale (C Major, Standard tuning)
- Verify fretboard renders correctly in browser

### Phase 2: Scale Controls & Reactivity
**Goal:** Wire up controls so fretboard responds to user input

- Create `scaleStore` with Zustand
- Build `<RootNoteSelector>` — 12 chromatic note buttons
- Build `<ScaleSelector>` — searchable dropdown of all scales
- Build `<TuningSelector>` — dropdown with preset tunings
- Implement `useFretboardPositions` hook with `useMemo`
- Connect controls → store → fretboard rendering pipeline
- Add scale degree color coding
- Add `<FretboardLegend>` with color key
- Build `<ScaleInfo>` showing formula, notes, description

### Phase 3: Genre Collections
**Goal:** Add genre filtering and contextual tips

- Build `<GenreFilter>` with chip-style toggle buttons
- Filter scale selector based on active genre
- Show suggested tunings for active genre
- Build `<GenreTips>` component
- Style genre chips with distinct colors

### Phase 4: Audio Playback
**Goal:** Click notes to hear them, play full scales

- Implement `src/lib/audio.ts` with Tone.js
- Create `audioStore` with Zustand
- Add click handlers to note dots on fretboard
- Build `<PlayScaleButton>` — ascending + descending playback
- Animate currently-playing note during scale playback
- Implement `useAudioPlayback` hook

### Phase 5: Pitch Detection
**Goal:** Real-time microphone input with fretboard highlighting

- Implement `src/lib/pitch.ts` — PitchDetector class
- Create `pitchStore` with Zustand
- Build `<MicToggle>` button with permission handling
- Build `<PitchDisplay>` — current note + cent offset indicator
- Build `<PitchIndicator>` — pulsing overlay on matched fret positions
- Implement `usePitchDetection` hook with requestAnimationFrame
- Handle edge cases: no mic permission, background tab, multiple matches

### Phase 6: Polish
**Goal:** Custom tunings, responsive layout, dark mode, accessibility, URL sharing

- Build `<CustomTuningEditor>` — per-string note/octave selectors
- Implement dark mode with system preference detection + manual toggle
- Add `<ThemeToggle>` component
- Implement URL hash sync (`src/lib/url.ts`)
- Make layout responsive: horizontal scroll for fretboard on mobile
- Add keyboard navigation for controls
- Add ARIA labels to fretboard SVG elements
- Add loading states and error boundaries
- Performance audit: verify 60fps pitch detection loop

---

## 14. Testing Strategy

### Unit Tests (`src/__tests__/music.test.ts`)
- `computeFretNote(string, fret, tuning)` returns correct note + octave + MIDI
- `getScalePositions(root, scale, tuning)` returns correct FretPosition arrays
- `frequencyToNote(440)` → `{ note: "A", octave: 4, cents: 0 }`
- Fret coordinate math produces proportional spacing
- All 12 root notes × all scales produce valid outputs

### Data Integrity Tests (`src/__tests__/scales.test.ts`)
- Every scale has a valid `tonalName` that tonal.js recognizes
- Every scale's interval count matches its degree count
- Every genre references only existing scale IDs
- Every genre references only existing tuning IDs
- No duplicate scale IDs, genre IDs, or tuning IDs

### Component Tests (`src/__tests__/FretboardSVG.test.tsx`)
- Fretboard renders correct number of strings (6) and frets (22)
- Note dots appear at correct positions for a known scale
- Root notes receive distinct styling
- Changing root/scale/tuning re-renders with correct notes
- Click on note dot triggers playback callback

### Integration Tests (`src/__tests__/ControlPanel.test.tsx`)
- Selecting a root note updates the store and fretboard
- Selecting a genre filters the scale list
- Selecting a genre's suggested tuning updates the fretboard
- URL hash updates when selection changes
- Loading a URL with hash restores correct state

### Manual Testing Checklist
- [ ] Fretboard renders on desktop Chrome, Firefox, Safari
- [ ] All 8 tuning presets show correct open string notes
- [ ] Custom tuning editor produces valid fretboard
- [ ] Note playback works on first click (autoplay policy handled)
- [ ] Scale playback animates notes in sequence
- [ ] Microphone permission prompt appears on mic toggle
- [ ] Played guitar notes highlight correct fret positions in real time
- [ ] Dark mode toggles without flash
- [ ] URL hash sharing restores full state
- [ ] Mobile layout scrolls fretboard horizontally
- [ ] No console errors during normal usage

---

## Appendix: Key tonal.js APIs Used

```typescript
import { Scale, Note, Midi, Interval } from "tonal";

// Get scale notes
Scale.get("C major").notes          // ["C", "D", "E", "F", "G", "A", "B"]
Scale.get("A minor pentatonic").notes // ["A", "C", "D", "E", "G"]

// Note operations
Note.midi("E4")                     // 64
Note.freq("A4")                     // 440
Note.fromMidi(60)                   // "C4"
Note.enharmonic("Db")              // "C#"
Note.simplify("B##")               // "C#"

// MIDI conversions
Midi.midiToNoteName(64, { sharps: true })  // "E4"
Midi.midiToFreq(69)                        // 440

// Intervals
Interval.distance("C", "E")        // "3M"
Interval.add("C4", "3M")           // "E4"
```

---

*This spec is the single source of truth for ScalePro's implementation. All code should reference these data models, component names, and architectural decisions.*
