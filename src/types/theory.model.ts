export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Note {
  name: NoteName;
  octave: Octave;
  frequency: number;
}

export type ScaleType = 'major' | 'minor' | 'harmonicMinor' | 'melodicMinor' | 'pentatonicMajor' | 'pentatonicMinor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';

export interface Scale {
  root: NoteName;
  type: ScaleType;
  notes: NoteName[];
}

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | 'sus2' | 'sus4' | 'maj7' | 'min7' | '7' | 'dim7' | 'half-dim7' | 'maj9' | 'min9' | '9';

export interface Chord {
  root: NoteName;
  type: ChordType;
  notes: NoteName[];
  inversion: number;
}

export interface ProgressionStep {
  chord: Chord;
  duration: number; // In beats
}

export interface Progression {
  chords: ProgressionStep[];
  key: NoteName;
  scaleType: ScaleType;
}