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

export async function getDeviceChannelCount(deviceId: string): Promise<number> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: deviceId },
                channelCount: { ideal: 32 },
            },
        });
        const track = stream.getAudioTracks()[0];
        const count = track.getSettings().channelCount ?? 1;
        track.stop();
        return count;
    } catch {
        return 1;
    }
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
    if (config.selectedChannel !== null) {
        audio.channelCount = { ideal: 32 };
    }
    return { audio };
}
