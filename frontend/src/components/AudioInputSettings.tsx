import { useEffect, useState } from 'react';
import { useScaleStore } from '@/stores/scaleStore';
import { getAudioInputDevices, getDeviceChannelCount, onDeviceChange } from '@/lib/audioDevices';
import type { AudioDevice } from '@/lib/audioDevices';

function useAudioDevices() {
    const [devices, setDevices] = useState<AudioDevice[]>([]);

    useEffect(() => {
        let cancelled = false;
        const refresh = () => {
            getAudioInputDevices().then((list) => {
                if (!cancelled) setDevices(list);
            });
        };
        refresh();
        const unsubscribe = onDeviceChange(refresh);
        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    return devices;
}

export default function AudioInputSettings() {
    const audioInput = useScaleStore((s) => s.audioInput);
    const setAudioInput = useScaleStore((s) => s.setAudioInput);
    const devices = useAudioDevices();
    const [channelCount, setChannelCount] = useState(1);

    useEffect(() => {
        if (!audioInput.selectedDeviceId) {
            setChannelCount(1);
            return;
        }
        let cancelled = false;
        getDeviceChannelCount(audioInput.selectedDeviceId).then((count) => {
            if (!cancelled) setChannelCount(count);
        });
        return () => { cancelled = true; };
    }, [audioInput.selectedDeviceId]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Audio Input</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Configure your audio input device and processing settings.
                    DI / audio interface users should disable the processing toggles below for cleaner pitch detection.
                </p>
            </div>

            {/* Device selector */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Input Device</label>
                <select
                    value={audioInput.selectedDeviceId ?? ''}
                    onChange={(e) => setAudioInput({ selectedDeviceId: e.target.value || null, selectedChannel: null })}
                    className="w-full bg-surface border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                >
                    <option value="">Default</option>
                    {devices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">
                    Select your audio interface or microphone. If labels show as "Microphone 1", grant mic permission first.
                </p>
            </div>

            {/* Channel selector — only for multi-channel devices */}
            {channelCount > 1 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Input Channel</label>
                    <select
                        value={audioInput.selectedChannel === null ? '' : String(audioInput.selectedChannel)}
                        onChange={(e) => setAudioInput({ selectedChannel: e.target.value === '' ? null : Number(e.target.value) })}
                        className="w-full bg-surface border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    >
                        <option value="">All (mixed)</option>
                        {Array.from({ length: channelCount }, (_, i) => (
                            <option key={i} value={String(i)}>Input {i + 1}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500">
                        Your device has {channelCount} input channels. Select a specific channel or mix all together.
                    </p>
                </div>
            )}

            {/* Processing toggles */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Audio Processing</label>
                <p className="text-xs text-gray-500 mb-2">
                    These browser-level processing options help with built-in microphones but can degrade a clean DI signal.
                </p>
                <Toggle
                    label="Echo Cancellation"
                    description="Removes feedback from speakers. Disable for DI input."
                    checked={audioInput.echoCancellation}
                    onChange={(v) => setAudioInput({ echoCancellation: v })}
                />
                <Toggle
                    label="Noise Suppression"
                    description="Filters background noise. Disable for DI input."
                    checked={audioInput.noiseSuppression}
                    onChange={(v) => setAudioInput({ noiseSuppression: v })}
                />
                <Toggle
                    label="Auto Gain Control"
                    description="Normalizes volume levels. Disable for consistent DI levels."
                    checked={audioInput.autoGainControl}
                    onChange={(v) => setAudioInput({ autoGainControl: v })}
                />
            </div>

            {/* Detection tuning */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">Pitch Detection Tuning</label>
                <Slider
                    label="Min Clarity"
                    description="How confident the detector must be before registering a note. Lower for DI (~0.75), higher for noisy mic (~0.9)."
                    value={audioInput.minClarity}
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    onChange={(v) => setAudioInput({ minClarity: v })}
                />
                <Slider
                    label="Smoothing"
                    description="Frequency analysis smoothing. Lower values respond faster but may jitter more."
                    value={audioInput.smoothing}
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    onChange={(v) => setAudioInput({ smoothing: v })}
                />
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-0.5">
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange(!checked)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                        checked ? 'bg-accent' : 'bg-gray-600'
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                            checked ? 'translate-x-4' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
            <div className="min-w-0">
                <div className="text-sm text-white group-hover:text-accent transition-colors">{label}</div>
                <div className="text-xs text-gray-500">{description}</div>
            </div>
        </label>
    );
}

function Slider({ label, description, value, min, max, step, onChange }: {
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white">{label}</span>
                <span className="text-sm text-accent font-mono">{value.toFixed(2)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full accent-accent"
            />
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
}
