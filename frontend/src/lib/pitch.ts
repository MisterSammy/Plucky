import { PitchDetector } from 'pitchy';
import { frequencyToNote } from '@/lib/music';
import type { NoteName, NoteWithOctave } from '@/types';

const MIN_CLARITY = 0.9;
const MIN_FREQUENCY = 60;
const MAX_FREQUENCY = 1400;
const FFT_SIZE = 2048;
const SMOOTHING = 0.8;

export interface PitchData {
  frequency: number;
  clarity: number;
  note: NoteName;
  noteWithOctave: NoteWithOctave;
  midi: number;
  centOffset: number;
}

export class PitchDetectorEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;

  async start(onPitch: (data: PitchData) => void): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext({ sampleRate: 44100 });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = FFT_SIZE;
    this.analyser.smoothingTimeConstant = SMOOTHING;
    source.connect(this.analyser);

    const buffer = new Float32Array(FFT_SIZE);
    const detector = PitchDetector.forFloat32Array(FFT_SIZE);

    const loop = () => {
      if (!this.analyser || !this.audioContext) return;
      this.analyser.getFloatTimeDomainData(buffer);
      const [frequency, clarity] = detector.findPitch(buffer, this.audioContext.sampleRate);

      if (clarity > MIN_CLARITY && frequency > MIN_FREQUENCY && frequency < MAX_FREQUENCY) {
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

  isActive(): boolean {
    return this.rafId !== null;
  }
}
