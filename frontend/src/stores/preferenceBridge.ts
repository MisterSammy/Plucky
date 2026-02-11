import { useScaleStore } from '@/stores/scaleStore';
import { useAudioStore } from '@/stores/audioStore';
import type { Mode, NoteName, NoteRangeMode, PracticeDirection, Instrument } from '@/types';

interface Preferences {
    mode: Mode;
    selectedRoot: NoteName;
    selectedScaleId: string;
    selectedChordId: string;
    selectedTuningId: string;
    selectedGenreId: string | null;
    showAllNotes: boolean;
    highlightRoot: boolean;
    showFingers: boolean;
    noteRangeMode: NoteRangeMode;
    practiceDirection: PracticeDirection;
    selectedPosition: number | null;
    instrument: Instrument | null;
    theme: 'light' | 'dark' | 'system';
    pianoStartOctave: number;
    pianoEndOctave: number;
    playbackBpm: number;
}

const PREFERENCE_KEYS: readonly string[] = [
    'mode', 'selectedRoot', 'selectedScaleId', 'selectedChordId',
    'selectedTuningId', 'selectedGenreId', 'showAllNotes', 'highlightRoot',
    'showFingers', 'noteRangeMode', 'practiceDirection', 'selectedPosition',
    'instrument', 'theme', 'pianoStartOctave', 'pianoEndOctave',
];

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function getPreferences(): Preferences {
    const s = useScaleStore.getState();
    return {
        mode: s.mode,
        selectedRoot: s.selectedRoot,
        selectedScaleId: s.selectedScaleId,
        selectedChordId: s.selectedChordId,
        selectedTuningId: s.selectedTuningId,
        selectedGenreId: s.selectedGenreId,
        showAllNotes: s.showAllNotes,
        highlightRoot: s.highlightRoot,
        showFingers: s.showFingers,
        noteRangeMode: s.noteRangeMode,
        practiceDirection: s.practiceDirection,
        selectedPosition: s.selectedPosition,
        instrument: s.instrument,
        theme: s.theme,
        pianoStartOctave: s.pianoStartOctave,
        pianoEndOctave: s.pianoEndOctave,
        playbackBpm: useAudioStore.getState().playbackBpm,
    };
}

function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        const preferences = getPreferences();
        const csrfToken = decodeURIComponent(
            document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
        );
        fetch('/preferences', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
            },
            body: JSON.stringify({ preferences }),
        }).catch((err) => console.warn('Preference save failed:', err));
    }, 1000);
}

// Hydration guard — set by scaleStore during hydration
let hydrating = false;

export function setHydrating(value: boolean): void {
    hydrating = value;
}

export function initPreferenceBridge(): void {
    // Subscribe to scaleStore changes (skip non-preference keys like sidebarOpen, customTuning)
    const prefKeySet = new Set(PREFERENCE_KEYS);
    let prevSnapshot: Record<string, unknown> = {};

    useScaleStore.subscribe((state) => {
        const current: Record<string, unknown> = {};
        for (const key of prefKeySet) {
            current[key] = state[key as keyof typeof state];
        }

        const changed = Object.keys(current).some(k => current[k] !== prevSnapshot[k]);
        if (changed && Object.keys(prevSnapshot).length > 0 && !hydrating) {
            debouncedSave();
        }
        prevSnapshot = current;
    });

    // Subscribe to audioStore BPM changes
    let prevBpm = useAudioStore.getState().playbackBpm;
    useAudioStore.subscribe((state) => {
        if (state.playbackBpm !== prevBpm) {
            prevBpm = state.playbackBpm;
            if (!hydrating) {
                debouncedSave();
            }
        }
    });
}
