# Add DI Guitar / Audio Interface Support

## Context

Pitch detection currently uses `getUserMedia({ audio: true })` with no device selection and no audio constraints. This works for acoustic guitar via the built-in mic, but electric guitar players using an audio interface (DI) get suboptimal results because:

1. The browser applies echoCancellation, noiseSuppression, and autoGainControl by default — these mangle a clean DI signal
2. There's no way to select a specific input device
3. Pitch detection parameters (clarity 0.9, smoothing 0.8) are tuned for noisy mic input

## What We're Building

1. **New `/settings` page** — full Inertia page in the nav rail with a gear icon
2. **Audio Input section** on that page — device selector dropdown + toggleable audio processing options (echoCancellation, noiseSuppression, autoGainControl, clarity threshold, smoothing)
3. **Input monitoring** — route audio input to speakers via a GainNode so DI players can hear themselves. Mute toggle button next to "Enable Input" in the toolbar
4. **Dynamic button label** — "Enable Mic" becomes "Enable Input" (or shows the selected device name)
5. **All settings persisted** via the existing preference bridge

---

## Pre-Implementation Refactoring

These refactors address existing architectural issues and make the feature implementation cleaner. Do these first.

### 1. Extract shared `Preferences` interface (SIGNIFICANT — maintenance hazard)
The `Preferences` interface is defined identically in **two places**: `stores/scaleStore.ts:5-23` and `stores/preferenceBridge.ts:5-24`. If a field is added to one and not the other, hydration breaks silently. This directly impacts our plan since we're adding `audioInput` to Preferences.
- **Fix**: Extract `Preferences` to `types/index.ts`, import in both files.

### 2. Auto-generate `PREFERENCE_KEYS` from `DEFAULTS`
`preferenceBridge.ts:26-31` has a manually-maintained string array of 16 keys that must stay in sync with `DEFAULTS` in scaleStore. Easy to drift.
- **Fix**: Export `DEFAULTS` from scaleStore (or a shared constants file) and derive keys with `Object.keys(DEFAULTS)`.

### 3. Deduplicate `PitchData` type
`PitchData` is defined identically in both `lib/pitch.ts:11-18` and `stores/pitchStore.ts:5-12`. Move it to `types/index.ts` and import from there in both files.

### 4. Promote `source` to a class field in `PitchDetectorEngine`
In `lib/pitch.ts:29`, the `MediaStreamSourceNode` is a local variable inside `start()`. We need it as a class field to wire the monitor path (`source → monitorGain → destination`). Store all audio graph nodes as class fields so the graph is extensible:
```typescript
private source: MediaStreamAudioSourceNode | null = null;
private monitorGain: GainNode | null = null;
```

### 5. Extract `minClarity` from the RAF closure into a mutable class field
Currently `MIN_CLARITY` is captured as a constant in the `loop` closure at start time (`pitch.ts:43`). Same for `smoothingTimeConstant` (`pitch.ts:32`). To support live adjustment from the Settings page without restarting the engine mid-practice, store these as class fields with setter methods:
```typescript
private minClarity: number;
setMinClarity(value: number): void { this.minClarity = value; }
setSmoothing(value: number): void {
    if (this.analyser) this.analyser.smoothingTimeConstant = value;
}
```
The RAF loop reads `this.minClarity` each frame instead of the captured constant. `smoothingTimeConstant` is a property on the live `AnalyserNode` so it can be changed directly.

### 6. Clean up `stop()` to disconnect nodes
Currently `stop()` closes the AudioContext and nulls the analyser, but doesn't explicitly disconnect nodes. Add `this.source?.disconnect()` and `this.monitorGain?.disconnect()` before closing — good hygiene and prevents edge cases where nodes hold references after context closure.

### 7. Add toast on preference save failure (MODERATE — silent failure)
`preferenceBridge.ts:75` catches errors with `console.warn()` only. User has no idea their settings didn't persist. Since we're adding audio input config to preferences, this becomes more impactful.
- **Fix**: Show a toast notification on save failure using the existing `ToastContainer` component.

### 8. Add toast on session save failure (MODERATE — silent failure)
`useScalePractice.ts` has `onError: () => {}`. User completes a practice, hears the success chime, but the POST fails silently.
- **Fix**: Show a toast notification on session save failure.

---

## Files to Create

### `frontend/src/lib/audioDevices.ts` — Device enumeration utility

- `getAudioInputDevices(): Promise<AudioDevice[]>` — wraps `enumerateDevices()`, filters `audioinput`, fallback labels pre-permission
- `onDeviceChange(cb): () => void` — subscribes to `devicechange` event for hot-plug
- `buildAudioConstraints(config): MediaStreamConstraints` — builds constraints from the toggleable settings

### `frontend/src/components/AudioInputSettings.tsx` — Settings UI component

Section on the Settings page containing:
- **Device selector** — `<select>` dropdown listing available audio inputs, with "Default" option
- **Processing toggles** — individual checkboxes for:
  - Echo Cancellation (default: on for mic compat, off for DI)
  - Noise Suppression (same)
  - Auto Gain Control (same)
- **Detection tuning** — sliders/inputs for:
  - Min Clarity threshold (0.5–1.0, default 0.9)
  - Smoothing (0.0–1.0, default 0.8)
- Brief helper text explaining what each toggle does for guitar input

### `frontend/src/pages/Settings/Index.tsx` — New Inertia page

- Wrapped in `<AppLayout>`
- Contains `<AudioInputSettings />` section
- Styled consistently with existing pages (same heading patterns as Stats/LearningTracks)

### `app/Http/Controllers/SettingsController.php` — Laravel controller

- `index()` method — renders `Settings/Index` via Inertia, passes `player` with settings (same pattern as `PracticeController@index`)

---

## Files to Modify

### `frontend/src/types/index.ts`
Add:
```typescript
export interface AudioInputConfig {
    selectedDeviceId: string | null;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    minClarity: number;
    smoothing: number;
}
```

### `frontend/src/stores/scaleStore.ts`
Add to `Preferences` interface and `DEFAULTS`:
- `audioInput: AudioInputConfig` with defaults: `{ selectedDeviceId: null, echoCancellation: true, noiseSuppression: true, autoGainControl: true, minClarity: 0.9, smoothing: 0.8 }`
- Setter: `setAudioInput: (config: Partial<AudioInputConfig>) => void` — merges partial updates

### `frontend/src/stores/preferenceBridge.ts`
- Add `'audioInput'` to `PREFERENCE_KEYS` array and `Preferences` interface
- Add to `getPreferences()` return

### `frontend/src/lib/pitch.ts`
- `start()` accepts `AudioInputConfig` parameter
- Uses `buildAudioConstraints()` from `audioDevices.ts` for `getUserMedia`
- Uses `config.minClarity` instead of hardcoded `MIN_CLARITY`
- Uses `config.smoothing` instead of hardcoded `SMOOTHING`
- Fallback: if specific device fails with `OverconstrainedError`, retry with default
- **Audio monitoring**: add a `GainNode` between source and `audioContext.destination`
  - Audio graph becomes: `source → analyser` (pitch detection) + `source → monitorGain → destination` (monitoring)
  - Use `latencyHint: 'interactive'` on AudioContext for lowest latency
  - Expose `setMonitorMuted(muted: boolean)` method — sets gain to 0.0 or 1.0
  - Monitor starts **muted by default** (gain 0.0) to prevent feedback with mic input

### `frontend/src/stores/pitchStore.ts`
- In `startListening()`: read `audioInput` from `scaleStore.getState()` and pass to `engine.start()`
- Add `isMonitorMuted: boolean` state (default: `true`)
- Add `toggleMonitor()` action — flips mute state and calls `engine.setMonitorMuted()`

### `frontend/src/components/MicToggle.tsx`
- Change label from "Enable Mic" / "Listening..." to "Enable Input" / "Listening..."
- Better error messages for device-specific failures (`OverconstrainedError` → "Selected device not found")

### `frontend/src/components/MonitorToggle.tsx` — **New file**
- Small mute/unmute button shown next to "Enable Input" when listening is active
- Speaker icon (unmuted) / speaker-off icon (muted)
- Reads `isMonitorMuted` from `pitchStore`, calls `toggleMonitor()`
- Defaults to muted — user opts in to hearing their input

### `frontend/src/layouts/AppLayout.tsx`
- Add Settings gear icon to nav rail (above the player avatar, in the `mt-auto` section)

### `routes/web.php`
- Add `Route::get('/settings', [SettingsController::class, 'index'])->name('settings');`

---

## Implementation Order

1. **Refactoring** — Extract `Preferences` interface, auto-generate `PREFERENCE_KEYS`, deduplicate `PitchData`, promote engine fields, extract mutable clarity/smoothing, clean up `stop()`, add error toasts
2. **Types + utility** — `AudioInputConfig` in `types/index.ts`, `lib/audioDevices.ts`
3. **Store changes** — `scaleStore.ts`, `preferenceBridge.ts`
4. **Engine changes** — `lib/pitch.ts` (config param, monitor gain, constraints), `pitchStore.ts` (pass config, monitor state)
5. **Backend** — `SettingsController.php`, `routes/web.php`
6. **UI** — `AudioInputSettings.tsx`, `Settings/Index.tsx`
7. **Integration** — `AppLayout.tsx` (nav icon), `MicToggle.tsx` (dynamic label), `MonitorToggle.tsx`, `ControlsToolbar.tsx` (add MonitorToggle next to MicToggle)

## What This Does NOT Require

- **No database migration** — preferences JSON column already accepts arbitrary keys
- **No Electron/NativePHP changes** — Chromium handles `getUserMedia` device selection natively
- **No new npm dependencies** — all functionality uses standard Web Audio API

## Verification

1. `cd frontend && npm run lint` — no TypeScript errors
2. `composer dev` — start dev environment
3. Navigate to `/settings` via gear icon — page loads, device dropdown shows available inputs
4. With only built-in mic: dropdown shows one device, toggles default to on
5. Plug in audio interface: dropdown updates (hot-plug), select it
6. Turn off echoCancellation + noiseSuppression + autoGainControl, lower clarity to ~0.75
7. Go to Practice, click "Enable Input" — pitch detection uses selected device with configured constraints
8. Refresh page — settings persist
9. Unplug interface while it's selected, click "Enable Input" — falls back to default with helpful message
10. Test various toggle combinations to compare pitch detection quality
11. Test monitoring: enable input with DI, click unmute — should hear guitar through speakers with low latency
12. Test monitoring mute default: enable input — monitor should be muted, no audio passthrough until explicitly unmuted
13. Test feedback safety: with mic input, unmuting monitor should work but user can quickly re-mute if feedback occurs
