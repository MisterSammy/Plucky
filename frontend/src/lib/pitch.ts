import { PitchDetector } from 'pitchy';
import { frequencyToNote } from '@/lib/music';
import { buildAudioConstraints } from '@/lib/audioDevices';
import type { AudioInputConfig, PitchData } from '@/types';

export type { PitchData };

const DEFAULT_MIN_CLARITY = 0.9;
const MIN_FREQUENCY = 60;
const MAX_FREQUENCY = 1400;
const FFT_SIZE = 2048;
const DEFAULT_SMOOTHING = 0.8;

export class PitchDetectorEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private monitorGain: GainNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private minClarity: number = DEFAULT_MIN_CLARITY;
  fellBackToDefault = false;

  async start(onPitch: (data: PitchData) => void, config?: AudioInputConfig): Promise<void> {
    const smoothing = config?.smoothing ?? DEFAULT_SMOOTHING;
    this.minClarity = config?.minClarity ?? DEFAULT_MIN_CLARITY;

    const constraints = config ? buildAudioConstraints(config) : { audio: true };

    this.fellBackToDefault = false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      // Fallback to default device on OverconstrainedError
      if (err instanceof OverconstrainedError && config?.selectedDeviceId) {
        this.stream = await navigator.mediaDevices.getUserMedia(
          buildAudioConstraints({ ...config, selectedDeviceId: null })
        );
        this.fellBackToDefault = true;
      } else {
        throw err;
      }
    }

    this.audioContext = new AudioContext({ sampleRate: 44100, latencyHint: 'interactive' });
    this.source = this.audioContext.createMediaStreamSource(this.stream);

    // Pitch detection path: source → analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = FFT_SIZE;
    this.analyser.smoothingTimeConstant = smoothing;
    this.source.connect(this.analyser);

    // Monitor path: source → monitorGain → destination (muted by default)
    this.monitorGain = this.audioContext.createGain();
    this.monitorGain.gain.value = 0.0;
    this.source.connect(this.monitorGain);
    this.monitorGain.connect(this.audioContext.destination);

    const buffer = new Float32Array(FFT_SIZE);
    const detector = PitchDetector.forFloat32Array(FFT_SIZE);

    const loop = () => {
      if (!this.analyser || !this.audioContext) return;
      this.analyser.getFloatTimeDomainData(buffer);
      const [frequency, clarity] = detector.findPitch(buffer, this.audioContext.sampleRate);

      if (clarity > this.minClarity && frequency > MIN_FREQUENCY && frequency < MAX_FREQUENCY) {
        const noteInfo = frequencyToNote(frequency);
        onPitch({
          frequency,
          clarity,
          note: noteInfo.note,
          noteWithOctave: noteInfo.noteWithOctave,
          midi: noteInfo.midi,
          centOffset: noteInfo.centOffset,
        });
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.source?.disconnect();
    this.monitorGain?.disconnect();
    this.source = null;
    this.monitorGain = null;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  setMonitorMuted(muted: boolean): void {
    if (this.monitorGain) {
      this.monitorGain.gain.value = muted ? 0.0 : 1.0;
    }
  }

  setMinClarity(value: number): void {
    this.minClarity = value;
  }

  setSmoothing(value: number): void {
    if (this.analyser) {
      this.analyser.smoothingTimeConstant = value;
    }
  }

  isActive(): boolean {
    return this.rafId !== null;
  }
}
