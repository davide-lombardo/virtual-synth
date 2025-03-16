import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import Keyboard from "./components/Keyboard";
import { InstrumentPreset, NoteMapping } from "./types/audio.model";
import { instrumentPresets } from "./utils/preset";
import MusicTheoryVisualizer from "./components/MusicTheoryVisualizer";
import { EyeCloseIcon, EyeOpenIcon } from "./utils/icons";
import ControlGroup from "./components/ControlGroup";
import { useSynth } from "./hooks/useSynth";
import WaveVisualizer from "./components/WaveVisualizer";
import { SynthProvider } from "./contexts/SynthContext";
import { ChangeEvent } from 'react';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: var(--gradient-app-background);
  background-size: 400% 400%;
  animation: gradientAnimation var(--animation-duration) ease infinite;

  @keyframes gradientAnimation {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
`;

const Title = styled.h1`
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  text-shadow: var(--text-shadow);
`;

const PianoContainer = styled.div`
  background-color: var(--color-background);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xl);
  width: var(--container-width);
  max-width: var(--container-max-width);
  color: var(--color-text);
  border: 2px solid var(--color-border);

  /* light shade to black */
  background: linear-gradient(135deg, #1a1a1a 0%, #303030 50%, #1a1a1a 100%);
  position: relative;
`;

const VisualizerToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-black);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-base);

  &:hover {
    background-color: var(--color-primary-dark);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const OctaveButton = styled.button<{ $active: boolean }>`
  width: var(--control-width);
  height: var(--control-height);
  margin: var(--spacing-xs);
  background-color: ${(props) =>
    props.$active ? "var(--color-active)" : "var(--color-inactive)"};
  color: ${(props) => (props.$active ? "black" : "var(--color-text)")};
  border: 2px solid
    ${(props) =>
      props.$active ? "var(--color-active)" : "var(--color-inactive)"};
  border-radius: var(--border-radius-md);
  font-weight: bold;
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: background-color var(--transition-duration) ease,
    border-color var(--transition-duration) ease;

  &:hover {
    background-color: ${(props) =>
      props.$active ? "var(--color-active)" : "var(--color-inactive-hover)"};
    border-color: ${(props) =>
      props.$active ? "var(--color-active)" : "var(--color-inactive-hover)"};
  }

  &:focus {
    outline: none;
    box-shadow: var(--shadow-md);
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
`;

const ControlPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const StyledSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  color: #333;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4682b4;
    outline: none;
  }
`;

const EchoToggle = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  color: var(--color-black);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-base);

  &:hover {
    background-color: var(--color-primary-dark);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

function App() {
  const [activeNotes, setActiveNotes] = useState<Map<string, NoteMapping>>(
    new Map()
  );
  const [currentPreset, setCurrentPreset] = useState<InstrumentPreset>(
    instrumentPresets[0]
  );
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [octave, setOctave] = useState(4);
  const [adsr, setAdsrValues] = useState({
    attack: instrumentPresets[0].envelope.attack,
    decay: instrumentPresets[0].envelope.decay,
    sustain: instrumentPresets[0].envelope.sustain,
    release: instrumentPresets[0].envelope.release,
  });
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [echoSettings, setEchoSettings] = useState({
    mix: 0.3,
    time: 0.3,
    feedback: 0.4,
  });
  const [isEchoEnabled, setIsEchoEnabled] = useState(true);

  // Use our custom synth hook
  const { playSound, stopSound, setADSR, setVolume, setEcho, setFilter } =
    useSynth();

  // Load settings from localStorage
  useEffect(() => {
    const savedOctave = localStorage.getItem("octave");
    const savedAdsr = localStorage.getItem("adsr");
    const savedMasterVolume = localStorage.getItem("masterVolume");
    const savedEchoSettings = localStorage.getItem("echoSettings");
    const savedIsEchoEnabled = localStorage.getItem("isEchoEnabled");

    if (savedOctave) setOctave(parseInt(savedOctave, 10));
    if (savedAdsr) setAdsrValues(JSON.parse(savedAdsr));
    if (savedMasterVolume) setMasterVolume(parseFloat(savedMasterVolume));
    if (savedEchoSettings) setEchoSettings(JSON.parse(savedEchoSettings));
    if (savedIsEchoEnabled) setIsEchoEnabled(savedIsEchoEnabled === "true");
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("octave", octave.toString());
  }, [octave]);

  useEffect(() => {
    localStorage.setItem("adsr", JSON.stringify(adsr));
  }, [adsr]);

  useEffect(() => {
    localStorage.setItem("masterVolume", masterVolume.toString());
  }, [masterVolume]);

  useEffect(() => {
    localStorage.setItem("echoSettings", JSON.stringify(echoSettings));
  }, [echoSettings]);

  useEffect(() => {
    localStorage.setItem("isEchoEnabled", isEchoEnabled.toString());
  }, [isEchoEnabled]);

  // Apply ADSR and volume changes
  useEffect(() => {
    setADSR(adsr);
  }, [adsr, setADSR]);

  useEffect(() => {
    setVolume(masterVolume);
  }, [masterVolume, setVolume]);

  useEffect(() => {
    if (isEchoEnabled) {
      setEcho(echoSettings);
    } else {
      setEcho({ mix: 0, time: 0, feedback: 0 });
    }
  }, [echoSettings, setEcho, isEchoEnabled]);

  // Set filter when currentPreset changes
  useEffect(() => {
    setFilter({
      frequency: currentPreset.filter.frequency,
      Q: currentPreset.filter.Q,
    });
  }, [currentPreset.filter.frequency, currentPreset.filter.Q, setFilter]);

  // Handle preset change
  const handlePresetChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const selected = instrumentPresets.find((p) => p.name === e.target.value);
      if (selected) {
        setCurrentPreset(selected);
        setAdsrValues({
          attack: selected.envelope.attack,
          decay: selected.envelope.decay,
          sustain: selected.envelope.sustain,
          release: selected.envelope.release,
        });
      }
    },
    [setCurrentPreset, setAdsrValues]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: "frequency" | "Q") => {
      const value = parseFloat(e.target.value);
      setCurrentPreset((prevPreset) => {
        const updatedPreset = { ...prevPreset };
        const updatedFilter = { ...updatedPreset.filter };

        if (type === "frequency") {
          updatedFilter.frequency = value;
        } else {
          updatedFilter.Q = value;
        }

        updatedPreset.filter = updatedFilter;
        return updatedPreset;
      });
    },
    [setCurrentPreset]
  );

  // Handle ADSR changes
  const handleADSRChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      param: "attack" | "decay" | "sustain" | "release"
    ) => {
      const value = parseFloat(e.target.value);
      setAdsrValues((prev) => ({ ...prev, [param]: value }));
    },
    [setAdsrValues]
  );

  // Handle volume changes
  const handleVolumeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      setMasterVolume(value);
    },
    [setMasterVolume]
  );

  // Handle echo changes
  const handleEchoChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      param: "mix" | "time" | "feedback"
    ) => {
      const value = parseFloat(e.target.value);
      setEchoSettings((prev) => ({ ...prev, [param]: value }));
    },
    [setEchoSettings]
  );

  // Toggle echo
  const toggleEcho = useCallback(() => {
    setIsEchoEnabled((prev) => !prev);
  }, [setIsEchoEnabled]);

  // Note handling
  const handleNoteOn = useCallback(
    (note: NoteMapping) => {
      setActiveNotes((prev) => new Map(prev).set(note.note, note));
      const adjustedFrequency = note.frequency * Math.pow(2, octave - 4);
      playSound(adjustedFrequency, note.note, currentPreset.oscillator);
    },
    [octave, currentPreset.oscillator, playSound]
  );

  const handleNoteOff = useCallback(
    (note: NoteMapping) => {
      setActiveNotes((prev) => {
        const newActiveNotes = new Map(prev);
        newActiveNotes.delete(note.note);
        return newActiveNotes;
      });
      stopSound(note.note);
    },
    [stopSound]
  );

  // Toggle visualizer
  const toggleVisualizer = useCallback(() => {
    setShowVisualizer((prev) => !prev);
  }, [setShowVisualizer]);

  // Memoized control groups to prevent unnecessary re-renders
  const octaveControls = useMemo(
    () => (
      <ControlGroup
        title="Octave"
        controls={
          <div>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <OctaveButton
                key={num}
                $active={octave === num}
                onClick={() => setOctave(num)}
              >
                {num}
              </OctaveButton>
            ))}
          </div>
        }
      />
    ),
    [octave, setOctave]
  );

  const filterControls = useMemo(() => (
    <ControlGroup
        title="Filter"
        controls={[
          {
            label: "FRQ",
            min: 100,
            max: 5000,
            value: currentPreset.filter.frequency,
            onChange: (e) => handleFilterChange(e, "frequency"),
          },
          {
            label: "Q",
            min: 0.1,
            max: 10,
            step: 0.1,
            value: currentPreset.filter.Q,
            onChange: (e) => handleFilterChange(e, "Q"),
          },
        ]}
      />
  ), [currentPreset, handleFilterChange]);

  const masterControls = useMemo(() => (
    <ControlGroup
      title="Master"
      controls={[
        {
          label: "VOL",
          min: 0,
          max: 1,
          step: 0.01,
          value: masterVolume,
          onChange: handleVolumeChange,
        },
      ]}
    />
  ), [masterVolume, handleVolumeChange]);

  const envelopeControls = useMemo(() => (
    <ControlGroup
      title="Envelope"
      controls={[
        {
          label: "ATK",
          min: 0.01,
          max: 2,
          step: 0.01,
          value: adsr.attack,
          onChange: (e) => handleADSRChange(e, "attack"),
        },
        {
          label: "DEC",
          min: 0.01,
          max: 2,
          step: 0.01,
          value: adsr.decay,
          onChange: (e) => handleADSRChange(e, "decay"),
        },
        {
          label: "SUS",
          min: 0,
          max: 1,
          step: 0.01,
          value: adsr.sustain,
          onChange: (e) => handleADSRChange(e, "sustain"),
        },
        {
          label: "REL",
          min: 0.01,
          max: 3,
          step: 0.01,
          value: adsr.release,
          onChange: (e) => handleADSRChange(e, "release"),
        },
      ]}
    />
  ), [adsr, handleADSRChange]);

  const echoControls = useMemo(() => (
    <ControlGroup
      title="Echo"
      controls={[
        {
          label: "MIX",
          min: 0,
          max: 1,
          step: 0.01,
          value: echoSettings.mix,
          onChange: (e) => handleEchoChange(e, "mix"),
        },
        {
          label: "TIM",
          min: 0.05,
          max: 1,
          step: 0.01,
          value: echoSettings.time,
          onChange: (e) => handleEchoChange(e, "time"),
        },
        {
          label: "FBK",
          min: 0,
          max: 0.9,
          step: 0.01,
          value: echoSettings.feedback,
          onChange: (e) => handleEchoChange(e, "feedback"),
        },
      ]}
    />
  ), [echoSettings, handleEchoChange]);

  const presetControls = useMemo(() => (
    <ControlGroup
    title="Preset"
    controls={
      <StyledSelect
        value={currentPreset.name}
        onChange={handlePresetChange}
        aria-label="Instrument Preset"
      >
        {instrumentPresets.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.name}
          </option>
        ))}
      </StyledSelect>
    }
  />
  ), [currentPreset, handlePresetChange]);

  return (
    <SynthProvider>
      <AppContainer>
        <Header>
          <Title>Virtual Piano</Title>
          <Subtitle>Play with your mouse or keyboard</Subtitle>
        </Header>

        <PianoContainer>
          <ControlPanel>
            {octaveControls}
            {filterControls}
            {masterControls}
            {envelopeControls}
            {echoControls}
            {presetControls}
          </ControlPanel>

          <div style={{ display: "flex", gap: "1rem" }}>
            <VisualizerToggle onClick={toggleVisualizer}>
              {showVisualizer ? <>{EyeCloseIcon}</> : <>{EyeOpenIcon}</>}
              <span>Theory</span>
            </VisualizerToggle>

            <EchoToggle onClick={toggleEcho}>
              {isEchoEnabled ? "Disable Echo" : "Enable Echo"}
            </EchoToggle>
          </div>

          <WaveVisualizer activeNotes={activeNotes} />

          <Keyboard
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            activeNotes={activeNotes}
          />

          {showVisualizer && (
            <MusicTheoryVisualizer activeNotes={activeNotes} />
          )}
        </PianoContainer>
      </AppContainer>
    </SynthProvider>
  );
}

export default App;
