export type OscillatorType =
  | "sine"
  | "square"
  | "sawtooth"
  | "triangle"
  | "custom";

export interface ADSREnvelope {
  attack: number; // Time in seconds
  decay: number; // Time in seconds
  sustain: number; // Level (0-1)
  release: number; // Time in seconds
}

export interface FilterSettings {
  type: BiquadFilterType;
  frequency: number;
  Q: number;
  gain?: number;
}

export interface EffectSettings {
  mix: number;
  time: number;
  feedback: number;
}

export interface SynthSettings {
  oscillator: {
    type: OscillatorType;
    detune: number;
    mix: number[];
  };
  envelope: ADSREnvelope;
  filter: FilterSettings;
  effects: EffectSettings;
  masterVolume: number;
}

export interface ActiveNote {
  note: string;
  frequency: number;
  oscillator: OscillatorNode;
  gainNode: GainNode;
  startTime: number;
}

export interface NoteMapping {
  key: string;
  note: string;
  frequency: number;
  keyCode: number;
}

export interface InstrumentPreset {
  name: string;
  oscillator: OscillatorType;
  envelope: ADSREnvelope;
  filter: FilterSettings;
}
