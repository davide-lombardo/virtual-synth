import React, { useEffect, useRef } from "react";
import { NoteMapping } from "../types/audio.model";
import { generateKeyboardMapping } from "../utils/keyboard";
import { Key, KeyboardContainer } from "../styles/KeyboardStyles";

interface KeyboardProps {
  onNoteOn: (note: NoteMapping) => void;
  onNoteOff: (note: NoteMapping) => void;
  activeNotes: Map<string, any>;
  octave: number;
}

const Keyboard: React.FC<KeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  activeNotes,
  octave,
}) => {
  const pressedKeys = useRef<Set<string>>(new Set());

  const isBlackKey = (note: string): boolean => {
    return note.includes("#") || note.includes("b");
  };

  const handleMouseDown = (note: NoteMapping) => onNoteOn(note);
  const handleMouseUp = (note: NoteMapping) => onNoteOff(note);
  const handleMouseLeave = (note: NoteMapping) => onNoteOff(note);

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Prevent default to stop key repeat
    event.preventDefault();

    // If key is already pressed, do nothing
    if (pressedKeys.current.has(key)) {
      return;
    }

    // Add key to pressed keys
    pressedKeys.current.add(key);

    const note = generateKeyboardMapping(octave).find(
      (mapping: NoteMapping) => mapping.key === key
    );

    if (note) {
      onNoteOn(note);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // Remove key from pressed keys
    pressedKeys.current.delete(key);

    const note = generateKeyboardMapping(octave).find(
      (mapping: NoteMapping) => mapping.key === key
    );

    if (note) {
      onNoteOff(note);
    }
  };

  const renderKeys = () => {
    const mappings = generateKeyboardMapping(octave);

    return mappings.map((mapping: NoteMapping) => {
      const isBlack = isBlackKey(mapping.note);
      const isActive = activeNotes.has(mapping.note);

      return (
        <Key
          key={mapping.note}
          $isBlack={isBlack}
          $isActive={isActive}
          onMouseDown={() => handleMouseDown(mapping)}
          onMouseUp={() => handleMouseUp(mapping)}
          onMouseLeave={() => handleMouseLeave(mapping)}
          aria-label={`Key ${mapping.note}`}
        />
      );
    });
  };

  // Clean up pressed keys when component unmounts
  useEffect(() => {
    return () => {
      pressedKeys.current.clear();
    };
  }, []);

  useEffect(() => {
    window.focus();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onNoteOn, onNoteOff, octave]);

  return <KeyboardContainer>{renderKeys()}</KeyboardContainer>;
};

export default Keyboard;
