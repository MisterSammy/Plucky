import type { NoteName } from '@/types';
import { SCALE_BY_ID } from '@/data/scales';
import { TUNING_BY_ID } from '@/data/tunings';

const CHROMATIC_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface HashState {
  root?: NoteName;
  scaleId?: string;
  tuningId?: string;
  genreId?: string;
  pos?: number;
}

export function encodeStateToHash(state: { root: NoteName; scaleId: string; tuningId: string; genreId: string | null; pos?: number | null }): string {
  const params = new URLSearchParams();
  params.set('root', state.root);
  params.set('scale', state.scaleId);
  params.set('tuning', state.tuningId);
  if (state.genreId) params.set('genre', state.genreId);
  if (state.pos != null) params.set('pos', String(state.pos));
  return '#' + params.toString();
}

export function decodeHashToState(hash: string): HashState {
  const result: HashState = {};
  if (!hash || hash.length < 2) return result;

  const params = new URLSearchParams(hash.slice(1));

  const root = params.get('root');
  if (root && CHROMATIC_NOTES.includes(root as NoteName)) {
    result.root = root as NoteName;
  }

  const scaleId = params.get('scale');
  if (scaleId && SCALE_BY_ID[scaleId]) {
    result.scaleId = scaleId;
  }

  const tuningId = params.get('tuning');
  if (tuningId && TUNING_BY_ID[tuningId]) {
    result.tuningId = tuningId;
  }

  const genreId = params.get('genre');
  if (genreId) {
    result.genreId = genreId;
  }

  const pos = params.get('pos');
  if (pos != null) {
    const parsed = parseInt(pos, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      result.pos = parsed;
    }
  }

  return result;
}
