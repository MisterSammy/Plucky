import { PitchDetector } from 'pitchy';
import { frequencyToNote } from '@/lib/music';
import type { NoteName, NoteWithOctave } from '@/types';

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
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    source.connect(this.analyser);

    const buffer = new Float32Array(this.analyser.fftSize);
    const detector = PitchDetector.forFloat32Array(this.analyser.fftSize);

    const loop = () => {
      if (!this.analyser || !this.audioContext) return;
      this.analyser.getFloatTimeDomainData(buffer);
      const [frequency, clarity] = detector.findPitch(buffer, this.audioContext.sampleRate);

      if (clarity > 0.9 && frequency > 60 && frequency < 1400) {
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
