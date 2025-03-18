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
  const touchedNotes = useRef<Map<number, NoteMapping>>(new Map());

  const isBlackKey = (note: string): boolean => {
    return note.includes("#") || note.includes("b");
  };

   // Touch event handlers
   const handleTouchStart = (e: React.TouchEvent, note: NoteMapping) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchedNotes.current.set(touch.identifier, note);
    onNoteOn(note);

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const note = touchedNotes.current.get(touch.identifier);
    if (note) {
      onNoteOff(note);
      touchedNotes.current.delete(touch.identifier);
    }
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const note = touchedNotes.current.get(touch.identifier);
    if (note) {
      onNoteOff(note);
      touchedNotes.current.delete(touch.identifier);
    }
  };

    // Mouse event handlers
  const handleMouseDown = (note: NoteMapping) => onNoteOn(note);
  const handleMouseUp = (note: NoteMapping) => onNoteOff(note);
  const handleMouseLeave = (note: NoteMapping) => onNoteOff(note);

    // Keyboard event handlers

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
          onTouchStart={(e) => handleTouchStart(e, mapping)}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          aria-label={`Key ${mapping.note}`}
          role="button"
          tabIndex={0}
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
      pressedKeys.current.clear();
      touchedNotes.current.clear();
    };
  }, [onNoteOn, onNoteOff, octave]);

  return <KeyboardContainer>{renderKeys()}</KeyboardContainer>;
};

export default Keyboard;
