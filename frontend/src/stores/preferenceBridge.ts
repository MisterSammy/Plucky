import { useScaleStore, DEFAULTS } from '@/stores/scaleStore';
import { useAudioStore } from '@/stores/audioStore';
import { useToastStore } from '@/stores/toastStore';
import type { Preferences } from '@/types';

type PreferencesWithBpm = Preferences & { playbackBpm: number };

// Lazy — computed on first use to avoid circular-init TDZ with scaleStore
let _preferenceKeys: string[] | null = null;
function preferenceKeys(): readonly string[] {
    if (!_preferenceKeys) _preferenceKeys = Object.keys(DEFAULTS);
    return _preferenceKeys;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function getPreferences(): PreferencesWithBpm {
    const s = useScaleStore.getState();
    const prefs: Record<string, unknown> = {};
    for (const key of preferenceKeys()) {
        prefs[key] = s[key as keyof typeof s];
    }
    return {
        ...prefs,
        playbackBpm: useAudioStore.getState().playbackBpm,
    } as PreferencesWithBpm;
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
        }).catch((err) => {
            console.warn('Preference save failed:', err);
            useToastStore.getState().addToast({
                type: 'error',
                title: 'Settings not saved',
                message: 'Your preferences could not be saved. They will reset on next launch.',
                dismissAfterMs: 5000,
            });
        });
    }, 1000);
}

// Hydration guard — set by scaleStore during hydration
let hydrating = false;

export function setHydrating(value: boolean): void {
    hydrating = value;
}

export function initPreferenceBridge(): void {
    // Subscribe to scaleStore changes (skip non-preference keys like sidebarOpen, customTuning)
    const prefKeySet = new Set(preferenceKeys());
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
