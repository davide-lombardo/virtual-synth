import React, { createContext, ReactNode, useMemo, useState } from "react";
import {
  ADSREnvelope,
  EffectSettings,
  FilterSettings,
  InstrumentPreset,
} from "../types/audio.model";
import { instrumentPresets } from "../utils/preset";

type SynthContextType = {
  currentPreset: InstrumentPreset;
  setCurrentPreset: (preset: InstrumentPreset) => void;
  octave: number;
  setOctave: (octave: number) => void;
  adsr: ADSREnvelope;
  setAdsrValues: (adsr: ADSREnvelope) => void;
  filter: FilterSettings;
  setFilter: (filter: FilterSettings) => void;
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
  echoSettings: EffectSettings;
  setEchoSettings: (settings: EffectSettings) => void;
  isEchoEnabled: boolean;
  setIsEchoEnabled: (enabled: boolean) => void;
};

const defaultPreset = instrumentPresets[0];

const defaultContext: SynthContextType = {
  currentPreset: defaultPreset,
  setCurrentPreset: () => {},
  octave: 4,
  setOctave: () => {},
  adsr: defaultPreset.envelope,
  setAdsrValues: () => {},
  filter: defaultPreset.filter,
  setFilter: () => {},
  masterVolume: 0.5,
  setMasterVolume: () => {},
  echoSettings: { mix: 0.2, time: 0.3, feedback: 0.4 },
  setEchoSettings: () => {},
  isEchoEnabled: false,
  setIsEchoEnabled: () => {},
};

export const SynthContext = createContext<SynthContextType>(defaultContext);

type SynthProviderProps = {
  children: ReactNode;
};

export const SynthProvider: React.FC<SynthProviderProps> = ({ children }) => {
  const [currentPreset, setCurrentPreset] = useState(instrumentPresets[0]);
  const [filter, setFilter] = useState(currentPreset.filter);
  const [octave, setOctave] = useState(4);
  const [adsr, setAdsrValues] = useState(currentPreset.envelope);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [echoSettings, setEchoSettings] = useState({ mix: 0.2, time: 0.3, feedback: 0.4 });
  const [isEchoEnabled, setIsEchoEnabled] = useState(false);

  const value = useMemo(() => ({
    currentPreset,
    setCurrentPreset,
    octave,
    setOctave,
    filter,
    setFilter,
    adsr,
    setAdsrValues,
    masterVolume,
    setMasterVolume,
    echoSettings,
    setEchoSettings,
    isEchoEnabled,
    setIsEchoEnabled,
  }), [currentPreset, octave, filter, adsr, masterVolume, echoSettings, isEchoEnabled]);

  return <SynthContext.Provider value={value}>{children}</SynthContext.Provider>;
};
