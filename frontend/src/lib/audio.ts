import * as Tone from 'tone';

const STRUM_INTERVAL = 0.02;
const ARPEGGIO_INTERVAL = 0.15;
const CHORD_SUSTAIN = 1.0;
const CHORD_PAUSE = 0.5;

let synth: Tone.PolySynth | null = null;
let chimeSynth: Tone.Synth | null = null;

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

async function ensureAudioContext(): Promise<void> {
  try {
    await Tone.start();
  } catch (err) {
    throw new Error(`Audio context failed to start: ${err instanceof Error ? err.message : err}`);
  }
}

export async function playNote(noteWithOctave: string, duration: string = '8n'): Promise<void> {
  await ensureAudioContext();
  const s = initSynth();
  s.triggerAttackRelease(noteWithOctave, duration);
}

export async function playScale(
  notes: string[],
  bpm: number = 120,
  onNoteStart?: (index: number) => void,
  isCancelled?: () => boolean
): Promise<void> {
  await ensureAudioContext();
  const s = initSynth();
  const interval = 60 / bpm;

  // Use Tone.Transport for timing — stays in sync even when browser throttles background tabs
  const transport = Tone.getTransport();
  transport.cancel();
  transport.stop();
  transport.position = 0;

  const eventIds: number[] = [];

  notes.forEach((note, i) => {
    const time = i * interval;
    eventIds.push(
      transport.schedule((t) => {
        s.triggerAttackRelease(note, '8n', t);
        if (onNoteStart && (!isCancelled || !isCancelled())) {
          onNoteStart(i);
        }
      }, time)
    );
  });

  return new Promise((resolve) => {
    const endTime = notes.length * interval;
    eventIds.push(
      transport.schedule(() => {
        transport.stop();
        resolve();
      }, endTime)
    );

    transport.start();
  });
}

export async function playChord(notes: string[]): Promise<void> {
  await ensureAudioContext();
  const s = initSynth();
  const now = Tone.now();

  // Phase 1: Strum — all notes with stagger
  const strumDuration = notes.length * STRUM_INTERVAL;
  notes.forEach((note, i) => {
    s.triggerAttackRelease(note, '2n', now + i * STRUM_INTERVAL);
  });

  // Phase 2: Pause, then arpeggiate ascending
  const arpStart = now + strumDuration + CHORD_SUSTAIN + CHORD_PAUSE;
  const sorted = [...notes].sort();
  sorted.forEach((note, i) => {
    s.triggerAttackRelease(note, '8n', arpStart + i * ARPEGGIO_INTERVAL);
  });
}

export function chordPlaybackDuration(noteCount: number): number {
  const strumDuration = noteCount * STRUM_INTERVAL;
  const arpDuration = noteCount * ARPEGGIO_INTERVAL;
  return (strumDuration + CHORD_SUSTAIN + CHORD_PAUSE + arpDuration + CHORD_PAUSE) * 1000;
}

export function stopPlayback(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  if (synth) {
    synth.releaseAll();
  }
}

export function disposeSynths(): void {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();

  if (synth) {
    synth.releaseAll();
    synth.dispose();
    synth = null;
  }
  if (chimeSynth) {
    chimeSynth.dispose();
    chimeSynth = null;
  }
}

export async function playSuccessChime(): Promise<void> {
  await ensureAudioContext();
  const s = initChimeSynth();
  s.triggerAttackRelease('E5', '32n');
}
