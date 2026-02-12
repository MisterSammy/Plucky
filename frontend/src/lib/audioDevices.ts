import type { AudioInputConfig } from '@/types';

export interface AudioDevice {
    deviceId: string;
    label: string;
    isDefault: boolean;
}

export async function getAudioInputDevices(): Promise<AudioDevice[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${i + 1}`,
            isDefault: d.deviceId === 'default',
        }));
}

export function onDeviceChange(cb: () => void): () => void {
    navigator.mediaDevices.addEventListener('devicechange', cb);
    return () => navigator.mediaDevices.removeEventListener('devicechange', cb);
}

export function buildAudioConstraints(config: AudioInputConfig): MediaStreamConstraints {
    const audio: MediaTrackConstraints = {
        echoCancellation: config.echoCancellation,
        noiseSuppression: config.noiseSuppression,
        autoGainControl: config.autoGainControl,
    };
    if (config.selectedDeviceId) {
        audio.deviceId = { exact: config.selectedDeviceId };
    }
    return { audio };
}
