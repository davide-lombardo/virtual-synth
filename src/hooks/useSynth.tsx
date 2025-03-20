import { useEffect, useRef, useCallback } from "react";
import { useSynthContext } from "../contexts/SynthContext";
import { SynthEngine } from "../soundEngine";

export function useSynth() {
  // Create a ref to store the SynthEngine instance
  const engineRef = useRef<SynthEngine | null>(null);

  // Get all settings from context
  const {
    adsr,
    filter,
    filterType,
    masterVolume,
    echoSettings,
    isEchoEnabled,
  } = useSynthContext();

  // Initialize SynthEngine on component mount
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new SynthEngine();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setADSR(adsr);
    }
  }, [adsr]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setVolume(masterVolume);
    }
  }, [masterVolume]);

  useEffect(() => {
    if (engineRef.current) {
      // If echo is enabled, use the actual settings, otherwise set mix to 0
      const mix = isEchoEnabled ? echoSettings.mix : 0;

      engineRef.current.setEcho({
        mix,
        time: echoSettings.time,
        feedback: echoSettings.feedback,
      });
    }
  }, [echoSettings, isEchoEnabled]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFilter({
        frequency: filter.frequency,
        Q: filter.Q,
      });

      engineRef.current.setFilterType(filterType);
    }
  }, [filter, filterType]);

  const playSound = useCallback(
    (frequency: number, note: string, oscillatorType: OscillatorType) => {
      if (engineRef.current) {
        engineRef.current.playSound(frequency, note, oscillatorType);
      }
    },
    []
  );

  const stopSound = useCallback((note: string) => {
    if (engineRef.current) {
      engineRef.current.stopSound(note);
    }
  }, []);

  const getAnalyserNode = useCallback(() => {
    return engineRef.current ? engineRef.current.getAnalyserNode() : null;
  }, []);

  return {
    playSound,
    stopSound,
    getAnalyserNode,
  };
}
