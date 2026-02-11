import type { TuningPreset } from '@/types';

export const TUNINGS: TuningPreset[] = [
  {
    id: 'standard',
    name: 'Standard',
    notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
    description: 'Standard EADGBE tuning',
    isCustom: false,
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    notes: ['E4', 'B3', 'G3', 'D3', 'A2', 'D2'],
    description: 'Low string dropped one whole step',
    isCustom: false,
  },
  {
    id: 'drop-cs',
    name: 'Drop C#',
    notes: ['D#4', 'A#3', 'F#3', 'C#3', 'G#2', 'C#2'],
    description: 'Drop D tuned down a half step',
    isCustom: false,
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    notes: ['D4', 'A3', 'G3', 'D3', 'A2', 'D2'],
    description: 'Open Dsus4; popular for celtic/emo',
    isCustom: false,
  },
  {
    id: 'open-g',
    name: 'Open G',
    notes: ['D4', 'B3', 'G3', 'D3', 'G2', 'D2'],
    description: 'Open G major chord; slide guitar staple',
    isCustom: false,
  },
  {
    id: 'open-d',
    name: 'Open D',
    notes: ['D4', 'A3', 'F#3', 'D3', 'A2', 'D2'],
    description: 'Open D major chord; fingerstyle/blues',
    isCustom: false,
  },
  {
    id: 'eb-standard',
    name: 'Eb Standard',
    notes: ['D#4', 'A#3', 'F#3', 'C#3', 'G#2', 'D#2'],
    description: 'Half step down from standard; SRV, Hendrix',
    isCustom: false,
  },
];

export const TUNING_BY_ID: Record<string, TuningPreset> = Object.fromEntries(
  TUNINGS.map((t) => [t.id, t])
);

export const DEFAULT_TUNING_ID = 'standard';
