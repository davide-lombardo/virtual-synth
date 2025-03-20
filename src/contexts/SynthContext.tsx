import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  InstrumentPreset,
  ADSREnvelope,
  FilterSettings,
  EffectSettings,
} from "../types/audio.model";
import { instrumentPresets } from "../utils/preset";

type SynthContextType = {
  currentPreset: InstrumentPreset;
  setCurrentPreset: React.Dispatch<React.SetStateAction<InstrumentPreset>>;
  octave: number;
  setOctave: React.Dispatch<React.SetStateAction<number>>;
  adsr: ADSREnvelope;
  setAdsrValues: React.Dispatch<React.SetStateAction<ADSREnvelope>>;
  filter: FilterSettings;
  setFilter: React.Dispatch<React.SetStateAction<FilterSettings>>;
  filterType: BiquadFilterType;
  setFilterType: React.Dispatch<React.SetStateAction<BiquadFilterType>>;
  masterVolume: number;
  setMasterVolume: React.Dispatch<React.SetStateAction<number>>;
  echoSettings: EffectSettings & { mixBackup?: number };
  setEchoSettings: React.Dispatch<React.SetStateAction<EffectSettings & { mixBackup?: number }>>;
  isEchoEnabled: boolean;
  setIsEchoEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultPreset = instrumentPresets[0];

// Extract initial filter type from default preset or use "lowpass" as fallback
const initialFilterType = (defaultPreset.filter.type as BiquadFilterType) || "lowpass";

const SynthContext = createContext<SynthContextType | undefined>(undefined);

export const useSynthContext = (): SynthContextType => {
  const context = useContext(SynthContext);
  if (!context) {
    throw new Error("useSynthContext must be used within a SynthProvider");
  }
  return context;
};

type SynthProviderProps = {
  children: ReactNode;
};

export const SynthProvider: React.FC<SynthProviderProps> = ({ children }) => {
  // Initialize all state at once to avoid cascading updates
  const [currentPreset, setCurrentPreset] = useState<InstrumentPreset>(defaultPreset);
  const [octave, setOctave] = useState<number>(4);
  const [adsr, setAdsrValues] = useState<ADSREnvelope>(defaultPreset.envelope);
  const [filterType, setFilterType] = useState<BiquadFilterType>(initialFilterType);
  const [filter, setFilter] = useState<FilterSettings>({
    ...defaultPreset.filter,
    type: initialFilterType
  });
  const [masterVolume, setMasterVolume] = useState<number>(0.5);
  const [echoSettings, setEchoSettings] = useState<EffectSettings & { mixBackup?: number }>({
    mix: 0,
    time: 0.3,
    feedback: 0.4,
  });
  const [isEchoEnabled, setIsEchoEnabled] = useState<boolean>(false);

  return (
    <SynthContext.Provider
      value={{
        currentPreset,
        setCurrentPreset,
        octave,
        setOctave,
        adsr,
        setAdsrValues,
        filterType,
        setFilterType,
        filter,
        setFilter,
        masterVolume,
        setMasterVolume,
        echoSettings,
        setEchoSettings,
        isEchoEnabled,
        setIsEchoEnabled,
      }}
    >
      {children}
    </SynthContext.Provider>
  );
};