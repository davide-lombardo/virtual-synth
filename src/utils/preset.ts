import { InstrumentPreset } from "../types/audio.model";

export const instrumentPresets: InstrumentPreset[] = [
  {
    name: 'Grand Piano',
    oscillator: 'sine',
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.7,
      release: 0.3,
    },
    filter: {
      type: 'lowpass',
      frequency: 5000,
      Q: 1,
    },
  },
  {
    name: 'Electric Piano',
    oscillator: 'triangle',
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.6,
      release: 0.4, 
    },
    filter: {
      type: 'lowpass',
      frequency: 3000,
      Q: 2,
    }
  },
  {
    name: 'Synth Lead',
    oscillator: 'sawtooth',
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.6,
      release: 0.5,
    },
    filter: {
      type: 'lowpass',
      frequency: 1500,
      Q: 8,
    }
  },
  {
    name: 'Bass',
    oscillator: 'sawtooth',
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.8,
      release: 0.3,
    },
    filter: {
      type: 'lowpass',
      frequency: 800,
      Q: 4,
    }
  },
  {
    name: 'Pluck',
    oscillator: 'square',
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.5,
      release: 0.2,
    },
    filter: {
      type: 'bandpass',
      frequency: 1200,
      Q: 6,
    }
  },
  {
    name: 'Strings',
    oscillator: 'sine',
    envelope: {
      attack: 0.07,
      decay: 0.2,
      sustain: 0.8,
      release: 0.4,
    },
    filter: {
      type: 'lowpass',
      frequency: 2500,
      Q: 2,
    }
  },
  {
    name: 'Brass',
    oscillator: 'sawtooth',
    envelope: {
      attack: 0.05,
      decay: 0.15,
      sustain: 0.7,
      release: 0.3,
    },
    filter: {
      type: 'lowpass',
      frequency: 1800,
      Q: 5,
    }
  },
];