import React, { createContext, ReactNode } from "react";
import {
  ADSREnvelope,
  EffectSettings,
  FilterSettings,
  InstrumentPreset,
} from "../types/audio.model";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { instrumentPresets } from "../utils/preset";

type SynthContextType = {
  currentPreset: InstrumentPreset;
  setCurrentPreset: (preset: InstrumentPreset) => void;
  showVisualizer: boolean;
  setShowVisualizer: (show: boolean) => void;
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
  showVisualizer: false,
  setShowVisualizer: () => {},
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
  const [currentPreset, setCurrentPreset] = useLocalStorage<InstrumentPreset>(
    "currentPreset",
    defaultPreset
  );
  const [showVisualizer, setShowVisualizer] = useLocalStorage<boolean>(
    "showVisualizer",
    false
  );
  const [filter, setFilter] = useLocalStorage<FilterSettings>(
    "filter",
    defaultPreset.filter
  );
  const [octave, setOctave] = useLocalStorage<number>("octave", 4);
  const [adsr, setAdsrValues] = useLocalStorage<ADSREnvelope>(
    "adsr",
    defaultContext.adsr
  );
  const [masterVolume, setMasterVolume] = useLocalStorage<number>(
    "masterVolume",
    0.5
  );
  const [echoSettings, setEchoSettings] = useLocalStorage<EffectSettings>(
    "echoSettings",
    defaultContext.echoSettings
  );
  const [isEchoEnabled, setIsEchoEnabled] = useLocalStorage<boolean>(
    "isEchoEnabled",
    false
  );

  const value = {
    currentPreset,
    setCurrentPreset,
    showVisualizer,
    setShowVisualizer,
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
  };

  return (
    <SynthContext.Provider value={value}>{children}</SynthContext.Provider>
  );
};
