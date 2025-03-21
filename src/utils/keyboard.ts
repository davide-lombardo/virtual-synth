import { NoteMapping } from "../types/audio.model";

const NOTES = {
  "A-0": 27.5,
  "A#0": 29.1352,
  "B-0": 30.8677,
  "C-1": 32.7032,
  "C#1": 34.6478,
  "D-1": 36.7081,
  "D#1": 38.8909,
  "E-1": 41.2034,
  "F-1": 43.6535,
  "F#1": 46.2493,
  "G-1": 48.9994,
  "G#1": 51.9131,
  "A-1": 55,
  "A#1": 58.2705,
  "B-1": 61.7354,
  "C-2": 65.4064,
  "C#2": 69.2957,
  "D-2": 73.4162,
  "D#2": 77.7817,
  "E-2": 82.4069,
  "F-2": 87.3071,
  "F#2": 92.4986,
  "G-2": 97.9989,
  "G#2": 103.826,
  "A-2": 110,
  "A#2": 116.541,
  "B-2": 123.471,
  "C-3": 130.813,
  "C#3": 138.591,
  "D-3": 146.832,
  "D#3": 155.563,
  "E-3": 164.814,
  "F-3": 174.614,
  "F#3": 184.997,
  "G-3": 195.998,
  "G#3": 207.652,
  "A-3": 220,
  "A#3": 233.082,
  "B-3": 246.942,
  "C-4": 261.626,
  "C#4": 277.183,
  "D-4": 293.665,
  "D#4": 311.127,
  "E-4": 329.628,
  "F-4": 349.228,
  "F#4": 369.994,
  "G-4": 391.995,
  "G#4": 415.305,
  "A-4": 440,
  "A#4": 466.164,
  "B-4": 493.883,
  "C-5": 523.251,
  "C#5": 554.365,
  "D-5": 587.33,
  "D#5": 622.254,
  "E-5": 659.255,
  "F-5": 698.456,
  "F#5": 739.989,
  "G-5": 783.991,
  "G#5": 830.609,
  "A-5": 880,
  "A#5": 932.328,
  "B-5": 987.767,
  "C-6": 1046.5,
  "C#6": 1108.73,
  "D-6": 1174.66,
  "D#6": 1244.51,
  "E-6": 1318.51,
  "F-6": 1396.91,
  "F#6": 1479.98,
  "G-6": 1567.98,
  "G#6": 1661.22,
  "A-6": 1760,
  "A#6": 1864.66,
  "B-6": 1975.53,
  "C-7": 2093,
  "C#7": 2217.46,
  "D-7": 2349.32,
  "D#7": 2489.02,
  "E-7": 2637.02,
  "F-7": 2793.83,
  "F#7": 2959.96,
  "G-7": 3135.96,
  "G#7": 3322.44,
  "A-7": 3520,
  "A#7": 3729.31,
  "B-7": 3951.07,
  "C-8": 4186.01,
};
export const generateKeyboardMapping = (octave: number): NoteMapping[] => {
  const baseNotes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  // White keys: a,s,d,f,g,h,j
  // Black keys: w,e,t,y,u
  const keys = [
    "a", // C
    "w", // C#
    "s", // D
    "e", // D#
    "d", // E
    "f", // F
    "t", // F#
    "g", // G
    "y", // G#
    "h", // A
    "u", // A#
    "j", // B
  ];

  const mappings = baseNotes
    .map((note, index) => {
      let noteKey = `${note}-${octave}` as keyof typeof NOTES;

      if (note.includes("#")) {
        noteKey = noteKey.replace("-", "") as keyof typeof NOTES;
      }

      if (!(noteKey in NOTES)) {
        console.warn(`Note key ${noteKey} not found in NOTES. Skipping.`);
        return null;
      }

      return {
        key: keys[index % keys.length],
        note: noteKey,
        frequency: NOTES[noteKey],
        keyCode: keys[index % keys.length].charCodeAt(0),
      };
    })
    .filter(Boolean) as NoteMapping[];

  return mappings;
};