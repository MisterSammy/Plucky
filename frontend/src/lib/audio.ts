import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;

function initSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.2,
        release: 1.0,
      },
      volume: -6,
    });
    synth.toDestination();
  }
  return synth;
}

export async function playNote(noteWithOctave: string, duration: string = '8n'): Promise<void> {
  await Tone.start();
  const s = initSynth();
  s.triggerAttackRelease(noteWithOctave, duration);
}

export async function playScale(
  notes: string[],
  bpm: number = 120,
  onNoteStart?: (index: number) => void,
  isCancelled?: () => boolean
): Promise<void> {
  await Tone.start();
  const s = initSynth();
  const interval = 60 / bpm;

  const now = Tone.now();
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '8n', now + i * interval);
  });

  // Fire onNoteStart callbacks at the right times
  if (onNoteStart) {
    notes.forEach((_, i) => {
      setTimeout(() => {
        if (!isCancelled || !isCancelled()) {
          onNoteStart(i);
        }
      }, i * interval * 1000);
    });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, notes.length * interval * 1000);
  });
}

export function stopPlayback(): void {
  if (synth) {
    synth.releaseAll();
  }
}

let chimeSynth: Tone.Synth | null = null;

function initChimeSynth(): Tone.Synth {
  if (!chimeSynth) {
    chimeSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0,
        release: 0.3,
      },
      volume: -10,
    });
    chimeSynth.toDestination();
  }
  return chimeSynth;
}

export async function playSuccessChime(): Promise<void> {
  await Tone.start();
  const s = initChimeSynth();
  s.triggerAttackRelease('E5', '32n');
}
