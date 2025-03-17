import { useRef, useEffect, useCallback } from "react";
import { SynthEngine } from "../soundEngine";

export function useSynth() {
  const synthRef = useRef<SynthEngine | null>(null);

  useEffect(() => {
    synthRef.current = new SynthEngine();

    return () => {
      if (synthRef.current?.dispose) {
        synthRef.current.dispose();
      }
      synthRef.current = null;
    };
  }, []);

  const playSound = useCallback(
    (
      frequency: number,
      note: string,
      oscillatorType: OscillatorType = "sine"
    ) => {
      synthRef.current?.playSound(frequency, note, oscillatorType);
    },
    []
  );

  const stopSound = useCallback((note: string) => {
    synthRef.current?.stopSound(note);
  }, []);

  const setADSR = useCallback(
    (adsr: {
      attack: number;
      decay: number;
      sustain: number;
      release: number;
    }) => {
      synthRef.current?.setADSR(adsr);
    },
    []
  );

  const setVolume = useCallback((volume: number) => {
    synthRef.current?.setVolume(volume);
  }, []);

  const setFilter = useCallback((params: { frequency: number; Q: number; type: BiquadFilterType }) => {
    synthRef.current?.setFilter(params);
  }, []);

  const setEcho = useCallback(
    (params: { mix: number; time: number; feedback: number }) => {
      synthRef.current?.setEcho(params);
    },
    []
  );

  const getAnalyserNode = useCallback(() => {
    return synthRef.current?.getAnalyserNode() || null;
  }, []);

  const getAudioData = useCallback(() => {
    return synthRef.current?.getAudioData() || null;
  }, []);

  return {
    playSound,
    stopSound,
    setADSR,
    setVolume,
    setFilter,
    setEcho,
    getAnalyserNode,
    getAudioData,
    synthRef
  };
}
