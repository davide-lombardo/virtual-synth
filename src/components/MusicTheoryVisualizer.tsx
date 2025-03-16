import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Chord,
  ChordType,
  NoteName,
  Scale,
  ScaleType,
} from "../types/theory.model";
import { NoteMapping } from "../types/audio.model";

// Styled Components with improved hierarchy
const VisualizerContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
  padding-bottom: 0.5rem;
`;

const NotesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const NoteTag = styled.div<{ $isActive: boolean; $isRoot: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.$isRoot ? "bold" : "normal")};
  background-color: ${(props) => {
    if (props.$isRoot) return "#1a2a6c";
    if (props.$isActive) return "#4682B4";
    return "#e9e9e9";
  }};
  color: ${(props) => (props.$isActive || props.$isRoot ? "white" : "#333")};
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const ChordScaleItem = styled.div`
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: #f8f8f8;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ResultName = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  font-weight: bold;
  margin-right: 0.5rem;
  color: #555;
`;

const MatchPercentage = styled.span`
  font-size: 0.9rem;
  color: #777;
  margin-left: 0.5rem;
  background-color: #eee;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background: #ddd;
  margin: 1.5rem 0;
`;

const HelperText = styled.p`
  font-size: 0.9rem;
  color: #777;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;

// Music Theory Helper Functions
const noteNames: NoteName[] = [
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

const scalePatterns: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

const chordPatterns: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  "7": [0, 4, 7, 10],
  dim7: [0, 3, 6, 9],
  "half-dim7": [0, 3, 6, 10],
  maj9: [0, 4, 7, 11, 14],
  min9: [0, 3, 7, 10, 14],
  "9": [0, 4, 7, 10, 14],
};

// Convert note strings (e.g., "C4") to { name, octave } format
const parseNote = (
  noteString: string
): { name: NoteName; octave: number } | null => {
  const match = noteString.match(/([A-G][#b]?)(\d)/);
  if (!match) return null;

  const name = match[1] as NoteName;
  const octave = parseInt(match[2]);

  return { name, octave };
};

// Get note index (0-11) for a note name
const getNoteIndex = (noteName: NoteName): number => {
  return noteNames.indexOf(noteName);
};

// Detect possible scales from a set of played notes
const detectScales = (
  activeNoteNames: NoteName[]
): { scale: Scale; matchPercentage: number }[] => {
  if (activeNoteNames.length < 3) return [];

  const results: { scale: Scale; matchPercentage: number }[] = [];

  // Try each note as potential root
  for (const root of noteNames) {
    // Try each scale type
    for (const [scaleType, pattern] of Object.entries(scalePatterns)) {
      const rootIndex = getNoteIndex(root);
      const scaleNotes = pattern.map(
        (interval) => noteNames[(rootIndex + interval) % 12]
      );

      // Count matching notes
      const matchingNotes = activeNoteNames.filter((note) =>
        scaleNotes.includes(note)
      );
      const uniqueActiveNotes = [...new Set(activeNoteNames)];

      // Calculate match percentage
      const playedNotesInScalePercentage =
        matchingNotes.length / uniqueActiveNotes.length;
      const scaleNotesBeingPlayedPercentage =
        matchingNotes.length / scaleNotes.length;

      // Weighted average
      const matchPercentage =
        (playedNotesInScalePercentage * 0.7 +
          scaleNotesBeingPlayedPercentage * 0.3) *
        100;

      if (matchPercentage > 50) {
        results.push({
          scale: {
            root,
            type: scaleType as ScaleType,
            notes: scaleNotes,
          },
          matchPercentage,
        });
      }
    }
  }

  // Sort by match percentage
  return results
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
};

// Detect possible chords from a set of played notes
const detectChords = (
  activeNoteNames: NoteName[]
): { chord: Chord; matchPercentage: number }[] => {
  if (activeNoteNames.length < 2) return [];

  const results: { chord: Chord; matchPercentage: number }[] = [];

  // Try each note as potential root
  for (const root of noteNames) {
    // Try each chord type
    for (const [chordType, pattern] of Object.entries(chordPatterns)) {
      const rootIndex = getNoteIndex(root);
      const chordNotes = pattern.map(
        (interval) => noteNames[(rootIndex + interval) % 12]
      );

      // Count matching notes
      const matchingNotes = activeNoteNames.filter((note) =>
        chordNotes.includes(note)
      );
      const uniqueActiveNotes = [...new Set(activeNoteNames)];

      // Calculate match percentage
      const playedNotesInChordPercentage =
        matchingNotes.length / uniqueActiveNotes.length;
      const chordNotesBeingPlayedPercentage =
        matchingNotes.length / chordNotes.length;

      // Weighted average
      const matchPercentage =
        (playedNotesInChordPercentage * 0.6 +
          chordNotesBeingPlayedPercentage * 0.4) *
        100;

      // For triads, require at least 2 notes; for 7th chords, require at least 3 notes
      const minRequiredNotes = chordNotes.length >= 4 ? 3 : 2;

      if (matchingNotes.length >= minRequiredNotes && matchPercentage > 60) {
        // Detect inversion by finding the lowest note
        let inversion = 0;
        if (activeNoteNames.length >= 2) {
          const lowestNote = activeNoteNames[0];
          if (lowestNote !== root) {
            inversion = chordNotes.indexOf(lowestNote);
          }
        }

        results.push({
          chord: {
            root,
            type: chordType as ChordType,
            notes: chordNotes,
            inversion: inversion,
          },
          matchPercentage,
        });
      }
    }
  }

  // Sort by match percentage
  return results
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);
};

// Format chord name with proper notation
const formatChordName = (chord: Chord): string => {
  const inversionText =
    chord.inversion > 0
      ? ` (${chord.inversion}${getInversionSuffix(chord.inversion)})`
      : "";
  return `${chord.root}${formatChordType(chord.type)}${inversionText}`;
};

const getInversionSuffix = (inversion: number): string => {
  if (inversion === 1) return "st";
  if (inversion === 2) return "nd";
  if (inversion === 3) return "rd";
  return "th";
};

const formatChordType = (type: ChordType): string => {
  switch (type) {
    case "major":
      return "";
    case "minor":
      return "m";
    case "diminished":
      return "°";
    case "augmented":
      return "+";
    case "sus2":
      return "sus2";
    case "sus4":
      return "sus4";
    case "maj7":
      return "maj7";
    case "min7":
      return "m7";
    case "7":
      return "7";
    case "dim7":
      return "°7";
    case "half-dim7":
      return "ø7";
    case "maj9":
      return "maj9";
    case "min9":
      return "m9";
    case "9":
      return "9";
    default:
      return type;
  }
};

// Main Component
interface MusicTheoryVisualizerProps {
  activeNotes: Map<string, NoteMapping>;
}

const MusicTheoryVisualizer: React.FC<MusicTheoryVisualizerProps> = ({
  activeNotes,
}) => {
  const [activeNoteNames, setActiveNoteNames] = useState<NoteName[]>([]);
  const [possibleScales, setPossibleScales] = useState<
    { scale: Scale; matchPercentage: number }[]
  >([]);
  const [possibleChords, setPossibleChords] = useState<
    { chord: Chord; matchPercentage: number }[]
  >([]);

  // Extract note names from active notes
  useEffect(() => {
    if (activeNotes.size === 0) {
      setActiveNoteNames([]);
      setPossibleScales([]);
      setPossibleChords([]);
      return;
    }

    const extractedNoteNames: NoteName[] = [];

    activeNotes.forEach((noteMapping) => {
      const parsedNote = parseNote(noteMapping.note);
      if (parsedNote) {
        extractedNoteNames.push(parsedNote.name);
      }
    });

    setActiveNoteNames(extractedNoteNames);
  }, [activeNotes]);

  // Update possible scales and chords when active notes change
  useEffect(() => {
    if (activeNoteNames.length === 0) {
      setPossibleScales([]);
      setPossibleChords([]);
      return;
    }

    setPossibleScales(detectScales(activeNoteNames));
    setPossibleChords(detectChords(activeNoteNames));
  }, [activeNoteNames]);

  // Check if we have content to display
  const hasActiveNotes = activeNoteNames.length > 0;
  const hasChords = possibleChords.length > 0;
  const hasScales = possibleScales.length > 0;

  return (
    <VisualizerContainer>
      <SectionTitle>Music Theory Analysis</SectionTitle>

      <InfoSection>
        <InfoItem>
          <Label>Active Notes:</Label>
          <HelperText>These are the notes you're currently playing.</HelperText>
          <NotesGrid>
            {noteNames.map((noteName) => (
              <NoteTag
                key={noteName}
                $isActive={activeNoteNames.includes(noteName)}
                $isRoot={false}
              >
                {noteName}
              </NoteTag>
            ))}
          </NotesGrid>
        </InfoItem>
      </InfoSection>

      {/* Only show divider if we have chords or scales to display */}
      {(hasChords || hasScales) && <Divider />}

      {hasChords && (
        <InfoSection>
          <InfoItem>
            <Label>Detected Chords:</Label>
            <HelperText>
              These are the chords that best match the notes you're playing.
            </HelperText>
            {possibleChords.map((item, index) => (
              <ChordScaleItem key={index}>
                <ResultName>
                  {formatChordName(item.chord)}
                  <MatchPercentage>
                    {Math.round(item.matchPercentage)}% match
                  </MatchPercentage>
                </ResultName>
                <NotesGrid>
                  {noteNames.map((noteName) => (
                    <NoteTag
                      key={noteName}
                      $isActive={item.chord.notes.includes(noteName)}
                      $isRoot={noteName === item.chord.root}
                    >
                      {noteName}
                    </NoteTag>
                  ))}
                </NotesGrid>
              </ChordScaleItem>
            ))}
          </InfoItem>
        </InfoSection>
      )}

      {/* Only show divider between chords and scales if both exist */}
      {hasChords && hasScales && <Divider />}

      {hasScales && (
        <InfoSection>
          <InfoItem>
            <Label>Detected Scales:</Label>
            <HelperText>
              These are the scales that best match the notes you're playing.
            </HelperText>
            {possibleScales.map((item, index) => (
              <ChordScaleItem key={index}>
                <ResultName>
                  {item.scale.root} {item.scale.type}
                  <MatchPercentage>
                    {Math.round(item.matchPercentage)}% match
                  </MatchPercentage>
                </ResultName>
                <NotesGrid>
                  {noteNames.map((noteName) => (
                    <NoteTag
                      key={noteName}
                      $isActive={item.scale.notes.includes(noteName)}
                      $isRoot={noteName === item.scale.root}
                    >
                      {noteName}
                    </NoteTag>
                  ))}
                </NotesGrid>
              </ChordScaleItem>
            ))}
          </InfoItem>
        </InfoSection>
      )}

      {/* Show a message when no notes are being played */}
      {!hasActiveNotes && (
        <InfoItem>
          <HelperText>
            Play some notes to see chord and scale suggestions.
          </HelperText>
        </InfoItem>
      )}
    </VisualizerContainer>
  );
};

export default MusicTheoryVisualizer;