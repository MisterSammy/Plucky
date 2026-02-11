# ScalePro - Implementation Plan

> Derived from [SPEC.md](./SPEC.md). Every step references a specific file and describes exactly what to build.

---

## Phase 1: Project Scaffold & Foundation

**Goal:** Empty directory → running Vite dev server with a static fretboard rendering C Major in standard tuning.

### Step 1.1: Initialize Vite Project

**Commands:**
```bash
npm create vite@latest . -- --template react-ts
npm install
```

**Produces:** `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, etc.

**Post-scaffold cleanup:**
- Remove `src/App.css`, `src/assets/` (default Vite boilerplate)
- Replace `src/App.tsx` with a minimal shell
- Replace `public/vite.svg` with `public/favicon.svg` (a simple guitar/music icon SVG)

### Step 1.2: Install Dependencies

```bash
npm install tonal pitchy tone zustand
npm install -D tailwindcss @tailwindcss/vite
```

**Configure Tailwind v4:**
- `vite.config.ts` — Add `@tailwindcss/vite` plugin
- `src/index.css` — Add `@import "tailwindcss"` directive plus CSS custom properties for the scale degree colors and dark mode variables

### Step 1.3: Configure Project Settings

**`.gitignore`** — Standard Node/Vite ignores (`node_modules`, `dist`, `.env`, etc.)

**`tsconfig.app.json`** — Ensure `"paths"` alias `@/*` → `src/*` for clean imports.

**`vite.config.ts`** — Add the path alias to `resolve.alias` to match tsconfig.

### Step 1.4: Define TypeScript Types

**File:** `src/types/index.ts`

Define and export every interface/type from SPEC.md §4:

| Export | Kind | Description |
|---|---|---|
| `NoteName` | type | Union of 12 chromatic note names (sharps only) |
| `NoteWithOctave` | type | Template literal `${NoteName}${number}` |
| `FretPosition` | interface | string, fret, note, noteWithOctave, midi, frequency, interval, degree, isRoot |
| `ScaleDefinition` | interface | id, name, intervals[], degrees[], category, description, tonalName |
| `ScaleCategory` | type | `'major' \| 'minor' \| 'pentatonic' \| 'blues' \| 'modal' \| 'exotic' \| 'jazz'` |
| `GenreCollection` | interface | id, name, description, scaleIds[], suggestedTunings[], tips[], color |
| `TuningPreset` | interface | id, name, notes (6-tuple), description, isCustom |
| `PitchDetectionState` | interface | isListening, currentFrequency, currentNote, currentNoteWithOctave, clarity, currentMidi, centOffset |
| `AudioPlaybackState` | interface | isPlaying, currentNoteIndex, synth |

### Step 1.5: Create Scale Data

**File:** `src/data/scales.ts`

Export `const SCALES: ScaleDefinition[]` containing all 24 scale definitions from SPEC.md §5. Each entry must include:

- `id` — kebab-case identifier (e.g. `"natural-minor"`)
- `name` — Human-readable display name (e.g. `"Natural Minor (Aeolian)"`)
- `intervals` — Array of interval strings (e.g. `["1P", "2M", "3m", "4P", "5P", "6m", "7m"]`)
- `degrees` — Array of degree labels (e.g. `["Root", "2nd", "♭3rd", "4th", "5th", "♭6th", "♭7th"]`)
- `category` — One of the `ScaleCategory` values
- `description` — 1-2 sentence description of the scale's character/usage
- `tonalName` — Exact string that `tonal.Scale.get(root + " " + tonalName)` accepts

Also export a lookup helper:
```typescript
export const SCALE_BY_ID: Record<string, ScaleDefinition>
```

### Step 1.6: Create Genre Data

**File:** `src/data/genres.ts`

Export `const GENRES: GenreCollection[]` containing all 5 genre collections from SPEC.md §6:

1. **Midwest Emo** — `amber` color, 7 scales, 3 tunings, 4 tips
2. **Metal** — `red` color, 8 scales, 3 tunings, 4 tips
3. **Blues** — `indigo` color, 6 scales, 4 tunings, 4 tips
4. **Jazz** — `violet` color, 11 scales, 1 tuning, 4 tips
5. **Country/Folk** — `emerald` color, 6 scales, 5 tunings, 4 tips

All `scaleIds` must reference valid IDs from `SCALES`. All `suggestedTunings` must reference valid IDs from `TUNINGS`.

### Step 1.7: Create Tuning Data

**File:** `src/data/tunings.ts`

Export `const TUNINGS: TuningPreset[]` containing all 7 preset tunings from SPEC.md §7 (standard through eb-standard, excluding custom which is runtime-generated).

Notes array is ordered high-to-low: `[string1(high E), string2(B), string3(G), string4(D), string5(A), string6(low E)]`.

| ID | Notes |
|---|---|
| `standard` | `["E4", "B3", "G3", "D3", "A2", "E2"]` |
| `drop-d` | `["E4", "B3", "G3", "D3", "A2", "D2"]` |
| `drop-cs` | `["Eb4", "Bb3", "Gb3", "Db3", "Ab2", "Db2"]` |
| `dadgad` | `["D4", "A3", "G3", "D3", "A2", "D2"]` |
| `open-g` | `["D4", "B3", "G3", "D3", "G2", "D2"]` |
| `open-d` | `["D4", "A3", "F#3", "D3", "A2", "D2"]` |
| `eb-standard` | `["Eb4", "Bb3", "Gb3", "Db3", "Ab2", "Eb2"]` |

Also export:
```typescript
export const TUNING_BY_ID: Record<string, TuningPreset>
export const DEFAULT_TUNING_ID = "standard"
```

### Step 1.8: Implement Fretboard Math Library

**File:** `src/lib/music.ts`

This is the core computation engine. Implement and export:

**`computeFretNote(openStringNote: NoteWithOctave, fret: number): { note: NoteName; noteWithOctave: NoteWithOctave; midi: number; frequency: number }`**
- Takes an open string note (e.g. `"E4"`) and a fret number (0-22)
- Uses `tonal.Note.midi()` to get the open string MIDI number
- Adds fret number to get the fretted MIDI number
- Uses `tonal.Note.fromMidi()` and `tonal.Note.freq()` to derive note name, octave, and frequency
- Normalizes all notes to sharps (no flats) using `tonal.Note.enharmonic()` or simplify

**`getAllFretboardNotes(tuning: TuningPreset): FretPosition[]`** (partial — without scale info)
- Iterates 6 strings × 23 frets (0-22)
- Calls `computeFretNote` for each position
- Returns array of partial FretPosition objects (no interval/degree/isRoot yet)

**`getScalePositions(root: NoteName, scaleTonalName: string, tuning: TuningPreset): FretPosition[]`**
- Uses `tonal.Scale.get(root + " " + scaleTonalName)` to get scale note names
- Normalizes scale notes to sharps
- Calls `getAllFretboardNotes(tuning)`
- For each fret position, checks if its note is in the scale
- If in scale: computes `interval` (using `tonal.Interval.distance`), `degree` (1-based index), `isRoot`
- Returns only positions that are in the scale (filtered)

**`fretX(fret: number, nutX: number, scaleLength: number): number`**
- Implements the 12th-root-of-2 proportional spacing formula from SPEC.md §9
- `nutX + (scaleLength * (1 - 1 / Math.pow(2, fret / 12)))`

**`fretMidX(fret: number, nutX: number, scaleLength: number): number`**
- Returns the midpoint between `fretX(fret - 1)` and `fretX(fret)` for note dot placement
- For fret 0 (open string), returns a position left of the nut

**`stringY(stringIndex: number, topPadding: number, stringSpacing: number): number`**
- `topPadding + (stringIndex * stringSpacing)`

**`DEGREE_COLORS: string[]`**
- Array of 7 hex color values from SPEC.md §9 color scheme
- Index 0 = Root (#EF4444), 1 = 2nd (#F97316), etc.

### Step 1.9: Build Fretboard SVG Components

**File:** `src/components/FretboardBackground.tsx`

Pure presentational SVG component. Receives fretboard dimensions as props. Renders:

- **Nut:** `<rect>` at `x=nutX`, 4px wide, full height, dark fill
- **Frets:** 22 `<line>` elements at proportionally-spaced x positions using `fretX()`, 2px stroke, metallic gray
- **Strings:** 6 `<line>` elements at even vertical spacing using `stringY()`, varying stroke-width (1px → 3px from high E to low E), metallic color
- **Fret markers:** `<circle>` elements at frets 3, 5, 7, 9, 15, 17, 19, 21 (single dot) and fret 12 (double dot), subtle gray fill
- **String labels:** `<text>` elements left of the nut showing the open string note names from the current tuning

Props:
```typescript
interface FretboardBackgroundProps {
  width: number;
  height: number;
  nutX: number;
  scaleLength: number;
  topPadding: number;
  stringSpacing: number;
  tuningNotes: string[];  // Open string note names for labels
  numFrets: number;       // 22
}
```

**File:** `src/components/NoteOverlay.tsx`

Renders scale note dots on the fretboard. Each dot is an SVG `<circle>` (or `<g>` with circle + text) positioned at `(fretMidX, stringY)`.

- Circle radius: 14px for normal notes, 16px for root notes
- Fill color: from `DEGREE_COLORS[position.degree - 1]`
- Text inside circle: note name (e.g. "A", "C#") in white, 10px font
- Opacity: 0.9 for scale notes
- Click handler: calls `onNoteClick(position)` prop

Props:
```typescript
interface NoteOverlayProps {
  positions: FretPosition[];
  nutX: number;
  scaleLength: number;
  topPadding: number;
  stringSpacing: number;
  onNoteClick: (position: FretPosition) => void;
  activeNoteIndex?: number | null;  // For scale playback animation
}
```

**File:** `src/components/FretboardSVG.tsx`

Composes `FretboardBackground` and `NoteOverlay` inside an `<svg>` with `viewBox` and `preserveAspectRatio="xMinYMid meet"`.

- Defines fretboard constants: `width=1200`, `height=200`, `nutX=60`, `scaleLength=1120`, `topPadding=25`, `bottomPadding=25`
- Computes `stringSpacing = (height - topPadding - bottomPadding) / 5`
- Passes all layout props down to children

Props:
```typescript
interface FretboardSVGProps {
  positions: FretPosition[];
  tuningNotes: string[];
  onNoteClick: (position: FretPosition) => void;
  activeNoteIndex?: number | null;
}
```

**File:** `src/components/FretboardContainer.tsx`

Wrapper div with horizontal scroll on small screens:
```
<div className="w-full overflow-x-auto">
  <div className="min-w-[800px]">
    <FretboardSVG ... />
  </div>
</div>
```

### Step 1.10: Wire Up Static Rendering in App.tsx

**File:** `src/App.tsx`

For Phase 1, hardcode a static render:
- Import `getScalePositions` from `lib/music`
- Import `TUNING_BY_ID` from `data/tunings`
- Call `getScalePositions("C", "major", TUNING_BY_ID["standard"])`
- Pass result to `<FretboardContainer>` → `<FretboardSVG>`
- Add a simple header with "ScalePro" title
- Stub `onNoteClick` as a console.log

### Step 1.11: Verify Phase 1

**Checkpoint:**
```bash
npm run dev
```

- Open browser at localhost:5173
- Fretboard SVG renders with nut, frets, strings, markers
- C Major note dots appear at correct positions across all 6 strings and 22 frets
- Root notes (C) are visually distinct (red, slightly larger)
- Other scale degrees show different colors
- Fretboard is horizontally scrollable on narrow viewports
- No console errors

---

## Phase 2: Scale Controls & Reactivity

**Goal:** User can select root note, scale, and tuning; fretboard updates instantly.

### Step 2.1: Create Scale Store

**File:** `src/stores/scaleStore.ts`

Zustand store with:

```typescript
interface ScaleStore {
  selectedRoot: NoteName;
  selectedScaleId: string;
  selectedTuningId: string;
  selectedGenreId: string | null;
  customTuning: TuningPreset | null;
  showAllNotes: boolean;
  highlightRoot: boolean;

  setRoot: (root: NoteName) => void;
  setScale: (scaleId: string) => void;
  setTuning: (tuningId: string) => void;
  setGenre: (genreId: string | null) => void;
  setCustomTuning: (tuning: TuningPreset | null) => void;
  setShowAllNotes: (show: boolean) => void;
  setHighlightRoot: (highlight: boolean) => void;
}
```

Defaults: root=`"C"`, scaleId=`"major"`, tuningId=`"standard"`, genreId=`null`, showAllNotes=`false`, highlightRoot=`true`.

### Step 2.2: Implement useFretboardPositions Hook

**File:** `src/hooks/useFretboardPositions.ts`

```typescript
export function useFretboardPositions(): FretPosition[] {
  const { selectedRoot, selectedScaleId, selectedTuningId, customTuning } = useScaleStore();

  return useMemo(() => {
    const scale = SCALE_BY_ID[selectedScaleId];
    const tuning = selectedTuningId === 'custom' && customTuning
      ? customTuning
      : TUNING_BY_ID[selectedTuningId];
    return getScalePositions(selectedRoot, scale.tonalName, tuning);
  }, [selectedRoot, selectedScaleId, selectedTuningId, customTuning]);
}
```

### Step 2.3: Build RootNoteSelector

**File:** `src/components/RootNoteSelector.tsx`

- 12 buttons in a flex row, one per chromatic note: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Active root gets a filled/highlighted style; others are outlined
- Clicking a button calls `scaleStore.setRoot(note)`
- Compact on mobile: wrap to 2 rows of 6

### Step 2.4: Build ScaleSelector

**File:** `src/components/ScaleSelector.tsx`

- A `<select>` dropdown (or custom combobox) listing all scales
- Grouped by `category` using `<optgroup>` labels: "Major/Minor", "Pentatonic & Blues", "Modes", "Exotic", "Jazz"
- Shows scale name; selected value is the scale ID
- On change: `scaleStore.setScale(id)`
- Below the dropdown: the scale's `description` text in a muted paragraph

### Step 2.5: Build TuningSelector

**File:** `src/components/TuningSelector.tsx`

- A `<select>` dropdown listing all tuning presets
- Each option shows: name + notes summary (e.g. "Drop D — E B G D A D")
- On change: `scaleStore.setTuning(id)`
- If "Custom" is selected, show the `<CustomTuningEditor>` below (Phase 6 — for now, just include the option but disable it)

### Step 2.6: Build ControlPanel

**File:** `src/components/ControlPanel.tsx`

Layout container that arranges:
1. `<RootNoteSelector />`
2. `<ScaleSelector />`
3. `<TuningSelector />`
4. (placeholder for `<GenreFilter />` — Phase 3)
5. (placeholder for `<DisplayOptions />` — Phase 6)

Responsive layout:
- Desktop: horizontal row with labeled sections
- Mobile: stacked vertical sections

### Step 2.7: Build ScaleInfo Panel

**File:** `src/components/ScaleInfo.tsx`

Displays information about the currently selected scale:

- **Scale Formula:** Intervals displayed as pills/badges (e.g. `1P` `2M` `3M` ...)
- **Scale Notes:** The actual note names in the selected key (e.g. for C Major: C D E F G A B), computed via `tonal.Scale.get(root + " " + tonalName).notes`
- **Degrees:** Degree names shown alongside the notes
- **Description:** The scale's description text

### Step 2.8: Build FretboardLegend

**File:** `src/components/FretboardLegend.tsx`

Horizontal row of color swatches + labels showing what each color means:
- Root (red), 2nd (orange), 3rd (yellow), 4th (green), 5th (cyan), 6th (blue), 7th (purple)
- Uses the same `DEGREE_COLORS` array from `lib/music.ts`
- Compact: wraps on mobile

### Step 2.9: Update App.tsx with Reactive Pipeline

**File:** `src/App.tsx`

Replace the hardcoded Phase 1 rendering:
- Use `useFretboardPositions()` hook to get positions reactively
- Read `selectedTuningId` from store to pass tuning notes to fretboard
- Wire up the full component hierarchy:
  ```
  <Header />
  <ControlPanel />
  <FretboardContainer>
    <FretboardSVG positions={positions} ... />
    <FretboardLegend />
  </FretboardContainer>
  <ScaleInfo />
  ```

### Step 2.10: Verify Phase 2

**Checkpoint:**
- Click different root notes → fretboard highlights shift correctly
- Change scale → note pattern changes (e.g. major pentatonic has fewer dots than major)
- Change tuning → note positions recalculate (Drop D shifts the low string)
- Scale info panel shows correct notes for selected root + scale
- Color coding matches legend
- All interactions feel instant (memoized computation)

---

## Phase 3: Genre Collections

**Goal:** Users can filter scales by genre and see genre-specific tips.

### Step 3.1: Build GenreFilter

**File:** `src/components/GenreFilter.tsx`

- Row of 5 chip/pill buttons, one per genre
- Each chip styled with the genre's color from `GENRES` data (amber, red, indigo, violet, emerald)
- Clicking a chip sets `scaleStore.setGenre(genreId)` (toggle behavior: clicking active genre deselects it → `null`)
- Active chip gets a filled style; inactive chips are outlined
- "All Scales" option to clear genre filter

### Step 3.2: Filter ScaleSelector by Genre

**File:** `src/components/ScaleSelector.tsx` (modify)

- When `selectedGenreId` is set, filter the scale list to only show scales in that genre's `scaleIds`
- If the currently selected scale is not in the filtered list, auto-select the first scale in the genre
- When genre is cleared, show all scales again

### Step 3.3: Show Suggested Tunings

**File:** `src/components/TuningSelector.tsx` (modify)

- When a genre is active, show a "Suggested" section at the top of the tuning dropdown containing the genre's `suggestedTunings`
- Other tunings remain available below a separator
- Optional: auto-switch to first suggested tuning when genre changes

### Step 3.4: Build GenreTips Component

**File:** `src/components/GenreTips.tsx`

- Only visible when a genre is selected
- Displays the genre's `tips[]` as a styled list (bulleted or numbered)
- Genre name as heading, description as subheading
- Styled with the genre's color accent

### Step 3.5: Integrate Genre UI into ControlPanel

**File:** `src/components/ControlPanel.tsx` (modify)

- Add `<GenreFilter />` above the scale selector
- Add `<GenreTips />` below the scale info (or in a sidebar on desktop)

### Step 3.6: Verify Phase 3

**Checkpoint:**
- Click "Metal" chip → scale list narrows to 8 metal scales
- Scale selector auto-updates if current scale isn't in genre
- Tuning selector highlights suggested tunings for the genre
- Genre tips display with correct content
- Click active genre chip to deselect → all scales return
- Genre colors render correctly

---

## Phase 4: Audio Playback

**Goal:** Click notes to hear them; play full scale ascending/descending.

### Step 4.1: Implement Audio Library

**File:** `src/lib/audio.ts`

Encapsulate all Tone.js logic:

**`initSynth(): Tone.PolySynth`**
- Creates and returns the synth from SPEC.md §11
- Triangle oscillator, attack 0.02, decay 0.3, sustain 0.2, release 1.0, volume -6
- Connects to `Tone.getDestination()`
- Lazy singleton pattern — only creates on first call

**`playNote(noteWithOctave: string, duration?: string): Promise<void>`**
- Calls `await Tone.start()` (handles autoplay policy)
- `synth.triggerAttackRelease(noteWithOctave, duration || "8n")`

**`playScale(notes: string[], bpm?: number, onNoteStart?: (index: number) => void): Promise<void>`**
- Calls `await Tone.start()`
- Computes ascending + descending sequence (skip duplicate top note on descending)
- Schedules each note with `Tone.now() + i * (60 / bpm)`
- Calls `onNoteStart(i)` at each note's scheduled time for animation sync
- Returns a promise that resolves when the full sequence finishes

**`stopPlayback(): void`**
- Calls `synth.releaseAll()` to immediately stop all notes

### Step 4.2: Create Audio Store

**File:** `src/stores/audioStore.ts`

```typescript
interface AudioStore {
  isPlaying: boolean;
  currentNoteIndex: number | null;

  playNote: (noteWithOctave: string) => Promise<void>;
  playScale: (notes: string[]) => Promise<void>;
  stop: () => void;
}
```

- `playNote` — delegates to `audio.playNote()`, does not set `isPlaying` (single note is instant)
- `playScale` — sets `isPlaying=true`, delegates to `audio.playScale()` with `onNoteStart` callback that updates `currentNoteIndex`, sets `isPlaying=false` on completion
- `stop` — calls `audio.stopPlayback()`, resets `isPlaying` and `currentNoteIndex`

### Step 4.3: Add Click-to-Play on Fretboard Notes

**File:** `src/components/NoteOverlay.tsx` (modify)

- Wire `onNoteClick` to call `audioStore.playNote(position.noteWithOctave)`
- Add `cursor-pointer` styling on note circles
- Add a brief visual feedback on click (scale up animation via CSS transition)

**File:** `src/components/FretboardSVG.tsx` (modify)

- Pass `onNoteClick` through from `FretboardContainer` to `NoteOverlay`

### Step 4.4: Build PlayScaleButton

**File:** `src/components/PlayScaleButton.tsx`

- Button that plays the current scale ascending then descending
- Computes the single-octave scale notes starting from the root in a middle octave (e.g. C3 → C4 for C Major)
- Uses `tonal.Scale.get()` to get ordered notes, appends octave numbers
- On click: `audioStore.playScale(notes)`
- While playing: button shows "Stop" and calls `audioStore.stop()` on click
- Disabled state when already playing

### Step 4.5: Animate Playing Notes on Fretboard

**File:** `src/components/NoteOverlay.tsx` (modify)

- Accept `activeNoteIndex` from `audioStore.currentNoteIndex`
- When a note's scale degree index matches `activeNoteIndex`, apply a pulse/glow CSS animation
- Use a ring or brightness effect to distinguish the currently-playing note

### Step 4.6: Build AudioControls Container

**File:** `src/components/AudioControls.tsx`

Layout container for:
- `<PlayScaleButton />`
- (placeholder for `<MicToggle />` — Phase 5)
- (placeholder for `<PitchDisplay />` — Phase 5)

### Step 4.7: Integrate Audio into App.tsx

**File:** `src/App.tsx` (modify)

- Add `<AudioControls />` between `<FretboardContainer>` and `<ScaleInfo>`
- Pass `audioStore.currentNoteIndex` to the fretboard for animation

### Step 4.8: Verify Phase 4

**Checkpoint:**
- Click any note dot on fretboard → hear the note play (triangle wave)
- First click after page load properly handles autoplay policy (Tone.start())
- Click "Play Scale" → hear ascending + descending scale, notes highlight sequentially
- Click "Stop" during playback → sound stops immediately
- No audio glitches, pops, or overlapping notes

---

## Phase 5: Pitch Detection

**Goal:** Enable microphone, detect played notes in real time, highlight them on the fretboard.

### Step 5.1: Implement Pitch Detection Library

**File:** `src/lib/pitch.ts`

Class-based implementation for clean lifecycle management:

```typescript
export class PitchDetectorEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private detector: PitchDetector<Float32Array> | null = null;

  async start(onPitch: (data: PitchData) => void): Promise<void>
  stop(): void
  isActive(): boolean
}

interface PitchData {
  frequency: number;
  clarity: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  centOffset: number;
}
```

**`start(onPitch)`:**
1. `navigator.mediaDevices.getUserMedia({ audio: true })` → store stream
2. Create `AudioContext` (sample rate 44100)
3. Create `MediaStreamSource` from stream
4. Create `AnalyserNode` with `fftSize: 2048`, `smoothingTimeConstant: 0.8`
5. Connect source → analyser
6. Create `PitchDetector.forFloat32Array(analyser.fftSize)` from pitchy
7. Start `requestAnimationFrame` loop:
   - `analyser.getFloatTimeDomainData(buffer)`
   - `detector.findPitch(buffer, audioContext.sampleRate)` → `[frequency, clarity]`
   - If `clarity > 0.90`: convert frequency to note using `frequencyToNote()` from `lib/music.ts`, call `onPitch(data)`
   - Request next frame

**`stop()`:**
1. Cancel `requestAnimationFrame`
2. Stop all tracks on `stream`
3. Close `AudioContext`
4. Null out all references

### Step 5.2: Create Pitch Store

**File:** `src/stores/pitchStore.ts`

```typescript
interface PitchStore {
  isListening: boolean;
  currentFrequency: number | null;
  currentNote: NoteName | null;
  currentNoteWithOctave: NoteWithOctave | null;
  clarity: number;
  centOffset: number;
  currentMidi: number | null;
  error: string | null;

  startListening: () => Promise<void>;
  stopListening: () => void;
  updatePitch: (data: PitchData) => void;
  clearPitch: () => void;
}
```

- `startListening` — Creates `PitchDetectorEngine` instance, calls `.start()` with `updatePitch` as callback, sets `isListening=true`
- `stopListening` — Calls `.stop()` on engine, sets `isListening=false`, clears pitch data
- `updatePitch` — Called at ~60fps from the rAF loop, sets all pitch fields
- `clearPitch` — Resets all pitch fields to null/0
- `error` — Set if `getUserMedia` throws (no permission, no mic)

### Step 5.3: Build MicToggle

**File:** `src/components/MicToggle.tsx`

- Toggle button: mic icon + "Enable Mic" / "Listening..."
- On click when off: `pitchStore.startListening()` — handles permission prompt
- On click when on: `pitchStore.stopListening()`
- Error state: if mic permission denied, show message
- Visual indicator: pulsing dot or animated mic icon when listening

### Step 5.4: Build PitchDisplay

**File:** `src/components/PitchDisplay.tsx`

Real-time display of detected pitch:
- **Note name:** Large text (e.g. "A4")
- **Cent offset:** Bar or number showing sharp/flat (e.g. "+12¢" or "-5¢")
- **Clarity:** Small confidence indicator
- **Tuner-style visualization:** Horizontal cent offset bar with center = in tune, left = flat, right = sharp
- When no pitch detected: show "—" or "Play a note..."

### Step 5.5: Build PitchIndicator

**File:** `src/components/PitchIndicator.tsx`

SVG overlay on the fretboard that highlights detected notes:
- Receives `detectedNoteWithOctave` from `pitchStore`
- Receives `positions: FretPosition[]` from the fretboard
- Finds all positions matching the detected note (same note name + octave)
- Renders a pulsing ring (`<circle>` with CSS animation) at each matching position
- Ring color: bright green or white with high opacity
- Animation: `@keyframes pulse { 0% { r: 16; opacity: 1 } 100% { r: 24; opacity: 0 } }` on loop
- If detected note is in the scale, ring is green; if not in scale, ring is dim red/gray
- Positioned using the same `fretMidX` / `stringY` coordinate functions

### Step 5.6: Implement usePitchDetection Hook

**File:** `src/hooks/usePitchDetection.ts`

Thin hook wrapping store lifecycle:
```typescript
export function usePitchDetection() {
  const { isListening, startListening, stopListening, ...pitchData } = usePitchStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (isListening) stopListening(); };
  }, []);

  return { isListening, startListening, stopListening, ...pitchData };
}
```

### Step 5.7: Integrate Pitch Detection into Fretboard

**File:** `src/components/FretboardSVG.tsx` (modify)

- Add `<PitchIndicator>` as the topmost SVG layer (renders above NoteOverlay)
- Pass detected note from `pitchStore` and fretboard positions

**File:** `src/components/AudioControls.tsx` (modify)

- Add `<MicToggle />` and `<PitchDisplay />` to the audio controls area

### Step 5.8: Verify Phase 5

**Checkpoint:**
- Click "Enable Mic" → browser permission prompt appears
- Grant permission → mic indicator shows "Listening"
- Play a guitar note → PitchDisplay shows correct note name + cents
- Matching positions on fretboard pulse with green ring
- Notes not in the current scale still show (with dimmer indicator)
- Stop listening → rings disappear, display clears
- Deny permission → error message shown
- No memory leaks: start/stop multiple times, check devtools

---

## Phase 6: Polish & Finishing Touches

**Goal:** Custom tunings, dark mode, responsive design, URL sharing, accessibility.

### Step 6.1: Build CustomTuningEditor

**File:** `src/components/CustomTuningEditor.tsx`

- Visible when "Custom" tuning is selected in `TuningSelector`
- 6 rows, one per string (labeled 1st/high E through 6th/low E)
- Each row: note selector (C through B) + octave selector (1-6)
- Defaults to standard tuning values
- On change: builds a `TuningPreset` and calls `scaleStore.setCustomTuning()`
- Validation: warn if tuning produces unusual ranges

**File:** `src/components/TuningSelector.tsx` (modify)

- Add "Custom" as the last option in the dropdown
- When selected, show `<CustomTuningEditor>` inline below

### Step 6.2: Implement Dark Mode

**File:** `src/stores/scaleStore.ts` (modify)

- Add `theme: 'light' | 'dark' | 'system'` to store
- Add `setTheme` action
- On init, read from `localStorage` or default to `'system'`
- On change, persist to `localStorage`

**File:** `src/index.css` (modify)

- Use Tailwind's `dark:` variants with class strategy
- Define CSS variables for background, text, fretboard wood, string colors in both themes
- Fretboard wood color: light mode → warm brown; dark mode → darker rosewood

**File:** `src/components/ThemeToggle.tsx`

- Three-way toggle or cycle button: System → Light → Dark → System
- Icon changes: sun/moon/auto
- Applies `dark` class to `<html>` element based on resolved theme

**File:** `src/App.tsx` (modify)

- On mount, resolve system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- Listen for changes to system preference
- Apply/remove `dark` class on `<html>`

### Step 6.3: Build Header & Footer

**File:** `src/components/Header.tsx`

- App title "ScalePro" with a simple guitar icon/emoji
- `<ThemeToggle />` on the right side
- Sticky/fixed on desktop, static on mobile

**File:** `src/components/Footer.tsx`

- Minimal footer: "ScalePro — Learn guitar scales visually"
- Link to SPEC.md or GitHub if applicable

### Step 6.4: Build DisplayOptions

**File:** `src/components/DisplayOptions.tsx`

- Toggle: "Show all notes" — when on, shows every chromatic note on the fretboard (non-scale notes dimmed/smaller)
- Toggle: "Highlight root" — when on, root notes get distinct larger red styling (on by default)
- Reads/writes from `scaleStore.showAllNotes` and `scaleStore.highlightRoot`

**File:** `src/components/NoteOverlay.tsx` (modify)

- When `showAllNotes=true`: render all fretboard positions, with scale notes in full color and non-scale notes in subtle gray at smaller size
- When `highlightRoot=false`: render root notes same size/style as other degrees

### Step 6.5: Implement URL Hash Sync

**File:** `src/lib/url.ts`

**`encodeStateToHash(state: { root, scaleId, tuningId, genreId }): string`**
- Returns `#root=C&scale=major&tuning=standard` (omit genre if null)

**`decodeHashToState(hash: string): Partial<{ root, scaleId, tuningId, genreId }>`**
- Parses URL hash params
- Validates each value against known options
- Returns only valid fields

**File:** `src/App.tsx` (modify)

- On mount: read URL hash → apply to store (if valid)
- Subscribe to store changes → update URL hash (debounced to avoid rapid updates)
- Use `window.addEventListener('hashchange', ...)` for back/forward nav

### Step 6.6: Responsive Layout Polish

**File:** `src/App.tsx` + component files (modify)

- **Desktop (>= 1024px):** ControlPanel and ScaleInfo side by side; fretboard full width
- **Tablet (768px-1023px):** ControlPanel stacked but compact; fretboard full width
- **Mobile (< 768px):** Everything stacked vertically; fretboard in a horizontally scrollable container; controls use full-width layout
- Fretboard `min-width: 800px` inside a scrollable container on small screens
- Touch-friendly: larger tap targets on note dots (min 44px), larger control buttons

### Step 6.7: Accessibility

Apply across all components:

- **Fretboard SVG:** `role="img"`, `aria-label="Guitar fretboard showing {scale name} in {key}"`, each note dot has `aria-label="{note name}, fret {n}, string {n}"`
- **Controls:** All buttons have `aria-label` or visible text, all form controls have associated labels
- **Keyboard navigation:** Root note buttons are focusable with arrow key navigation, Enter to select; scale/tuning dropdowns are native `<select>` (already accessible)
- **Pitch detection:** Screen reader announcement when mic starts/stops
- **Color:** Don't rely solely on color; note dots also show the note name text inside
- **Focus indicators:** Visible focus rings on all interactive elements

### Step 6.8: Error Boundaries & Loading States

**File:** `src/App.tsx` (modify)

- Wrap the app in a React error boundary that catches render errors and shows a friendly message
- Show a brief loading state while Tone.js loads (it's lazy)

### Step 6.9: Final App Layout Assembly

**File:** `src/App.tsx` (final)

Complete component assembly:
```tsx
<div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
  <Header />
  <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <ControlPanel />
    <FretboardContainer />
    <AudioControls />
    <ScaleInfo />
  </main>
  <Footer />
</div>
```

### Step 6.10: Verify Phase 6

**Checkpoint:**
- Custom tuning editor: change strings to DADGAD → fretboard updates correctly
- Dark mode: toggle works, no flash on load, system preference respected
- URL hash: select A minor pentatonic → URL shows `#root=A&scale=minor-pentatonic&tuning=standard`
- Copy URL → paste in new tab → same state restored
- Mobile viewport: fretboard scrolls horizontally, controls stack vertically
- Tab through all controls → focus indicators visible
- No console errors or warnings

---

## Verification Checklist (All Phases)

Run through these after all phases are complete:

### Functional
- [ ] Fretboard renders with correct proportional fret spacing
- [ ] All 24 scales produce correct note highlights for all 12 root notes
- [ ] All 7 tuning presets produce correct note mappings
- [ ] Custom tuning editor works with arbitrary note/octave combinations
- [ ] Genre filter narrows scale list correctly
- [ ] Genre filter shows correct suggested tunings
- [ ] Genre tips display for each genre
- [ ] Click fretboard note → audio plays
- [ ] Play scale button → ascending + descending with animation
- [ ] Mic toggle → permission prompt → real-time pitch detection
- [ ] Detected notes highlight on fretboard with pulse animation
- [ ] PitchDisplay shows note name + cent offset
- [ ] "Show all notes" toggle works
- [ ] "Highlight root" toggle works
- [ ] Dark/light mode toggle works

### Technical
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces production bundle without errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors during normal usage
- [ ] Fretboard re-renders are fast (memoized)
- [ ] Pitch detection runs at 60fps without dropped frames
- [ ] Start/stop mic multiple times without memory leaks
- [ ] Audio playback handles autoplay policy on first interaction

### Responsive & Accessibility
- [ ] Desktop (1440px): full layout, everything visible
- [ ] Tablet (768px): controls stack, fretboard full width
- [ ] Mobile (375px): everything stacked, fretboard scrolls horizontally
- [ ] Keyboard: all controls navigable, fretboard notes not required (controls sufficient)
- [ ] Screen reader: meaningful labels on all interactive elements

---

## File Creation Order

For reference, the exact order files should be created/modified:

```
 1. (scaffold)     package.json, vite.config.ts, tsconfig.*, index.html
 2. (scaffold)     src/main.tsx, src/index.css
 3. (config)       .gitignore
 4. (types)        src/types/index.ts
 5. (data)         src/data/scales.ts
 6. (data)         src/data/genres.ts
 7. (data)         src/data/tunings.ts
 8. (lib)          src/lib/music.ts
 9. (component)    src/components/FretboardBackground.tsx
10. (component)    src/components/NoteOverlay.tsx
11. (component)    src/components/FretboardSVG.tsx
12. (component)    src/components/FretboardContainer.tsx
13. (app)          src/App.tsx                          ← Phase 1 complete
14. (store)        src/stores/scaleStore.ts
15. (hook)         src/hooks/useFretboardPositions.ts
16. (component)    src/components/RootNoteSelector.tsx
17. (component)    src/components/ScaleSelector.tsx
18. (component)    src/components/TuningSelector.tsx
19. (component)    src/components/ControlPanel.tsx
20. (component)    src/components/ScaleInfo.tsx
21. (component)    src/components/FretboardLegend.tsx
22. (app)          src/App.tsx (update)                 ← Phase 2 complete
23. (component)    src/components/GenreFilter.tsx
24. (component)    src/components/GenreTips.tsx
25. (component)    src/components/ScaleSelector.tsx (update)
26. (component)    src/components/TuningSelector.tsx (update)
27. (component)    src/components/ControlPanel.tsx (update)  ← Phase 3 complete
28. (lib)          src/lib/audio.ts
29. (store)        src/stores/audioStore.ts
30. (hook)         src/hooks/useAudioPlayback.ts
31. (component)    src/components/PlayScaleButton.tsx
32. (component)    src/components/AudioControls.tsx
33. (component)    src/components/NoteOverlay.tsx (update)
34. (app)          src/App.tsx (update)                 ← Phase 4 complete
35. (lib)          src/lib/pitch.ts
36. (store)        src/stores/pitchStore.ts
37. (hook)         src/hooks/usePitchDetection.ts
38. (component)    src/components/MicToggle.tsx
39. (component)    src/components/PitchDisplay.tsx
40. (component)    src/components/PitchIndicator.tsx
41. (component)    src/components/AudioControls.tsx (update)
42. (component)    src/components/FretboardSVG.tsx (update)  ← Phase 5 complete
43. (component)    src/components/CustomTuningEditor.tsx
44. (component)    src/components/ThemeToggle.tsx
45. (component)    src/components/DisplayOptions.tsx
46. (component)    src/components/Header.tsx
47. (component)    src/components/Footer.tsx
48. (lib)          src/lib/url.ts
49. (app)          src/App.tsx (final)                  ← Phase 6 complete
```

---

*This plan is designed to be executed sequentially. Each phase builds on the previous and has a clear verification checkpoint. The file creation order ensures no forward references or missing dependencies.*
