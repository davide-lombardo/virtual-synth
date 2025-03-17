import { useState, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import Keyboard from "./components/Keyboard";
import { InstrumentPreset, NoteMapping } from "./types/audio.model";
import { instrumentPresets } from "./utils/preset";
import ControlGroup, { Slider } from "./components/ControlGroup";
import { useSynth } from "./hooks/useSynth";
import { SynthProvider } from "./contexts/SynthContext";
import { ChangeEvent } from "react";
import CurrentNoteDisplay from "./components/NoteVisualizer";
import WaveVisualizer from "./components/WaveVisualizer";

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

const ActionButton = styled.button`
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

const ActionContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RotateBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ffcc00;
  color: black;
  text-align: center;
  padding: 1rem;
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 1000;
`;

// Filter type options
type FilterType = "lowpass" | "highpass" | "bandpass" | "notch";

function App() {
  const [activeNotes, setActiveNotes] = useState<Map<string, NoteMapping>>(
    new Map()
  );
  const [currentPreset, setCurrentPreset] = useState<InstrumentPreset>(
    instrumentPresets[0]
  );

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
  const [filterType, setFilterType] = useState<FilterType>("lowpass");

  const [isMobile, setIsMobile] = useState(false);
  const [showRotateBanner, setShowRotateBanner] = useState(false);

  // Use our custom synth hook
  const {
    playSound,
    stopSound,
    setADSR,
    setVolume,
    setEcho,
    setFilter,
    getAnalyserNode,
  } = useSynth();

  // Load settings from localStorage
  useEffect(() => {
    const savedOctave = localStorage.getItem("octave");
    const savedAdsr = localStorage.getItem("adsr");
    const savedMasterVolume = localStorage.getItem("masterVolume");
    const savedEchoSettings = localStorage.getItem("echoSettings");
    const savedIsEchoEnabled = localStorage.getItem("isEchoEnabled");
    const savedFilterType = localStorage.getItem("filterType");

    if (savedOctave) setOctave(parseInt(savedOctave, 10));
    if (savedAdsr) setAdsrValues(JSON.parse(savedAdsr));
    if (savedMasterVolume) setMasterVolume(parseFloat(savedMasterVolume));
    if (savedEchoSettings) setEchoSettings(JSON.parse(savedEchoSettings));
    if (savedIsEchoEnabled) setIsEchoEnabled(savedIsEchoEnabled === "true");
    if (savedFilterType) setFilterType(savedFilterType as FilterType);
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

  useEffect(() => {
    localStorage.setItem("filterType", filterType);
  }, [filterType]);

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

  // Set filter when currentPreset or filterType changes
  useEffect(() => {
    setFilter({
      frequency: currentPreset.filter.frequency,
      Q: currentPreset.filter.Q,
      type: filterType,
    });
  }, [
    currentPreset.filter.frequency,
    currentPreset.filter.Q,
    filterType,
    setFilter,
  ]);

  // Detect if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth <= 768
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Show the banner for 5 seconds if the user is on a mobile device
  useEffect(() => {
    if (isMobile) {
      setShowRotateBanner(true);
      const timer = setTimeout(() => {
        setShowRotateBanner(false);
      }, 5000); // Hide banner after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isMobile]);

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

        // Only update filter type if present in the preset
        if (selected.filter.type) {
          setFilterType(selected.filter.type as FilterType);
        }
      }
    },
    []
  );

  // Handle filter type change
  const handleFilterTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilterType(e.target.value as FilterType);
    },
    []
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: "frequency" | "Q") => {
      const value = parseFloat(e.target.value);
      setCurrentPreset((prevPreset) => {
        const updatedPreset = { ...prevPreset };
        updatedPreset.filter = {
          ...updatedPreset.filter,
          [type]: value,
        };
        return updatedPreset;
      });
    },
    []
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
    []
  );

  // Handle volume changes
  const handleVolumeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMasterVolume(parseFloat(e.target.value));
  }, []);

  // Handle echo changes
  const handleEchoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, param: "mix" | "time" | "feedback") => {
      const value = parseFloat(e.target.value);
      setEchoSettings((prev) => ({ ...prev, [param]: value }));
    },
    []
  );

  // Toggle echo
  const toggleEcho = useCallback(() => {
    setIsEchoEnabled((prev) => !prev);
  }, []);

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
    [octave]
  );

  const filterControls = useMemo(
    () => (
      <ControlGroup
        title="Filter"
        controls={
          <>
            <div style={{ marginBottom: "0.8rem" }}>
              <StyledSelect
                value={filterType}
                onChange={handleFilterTypeChange}
                aria-label="Filter Type"
              >
                <option value="lowpass">Low Pass</option>
                <option value="highpass">High Pass</option>
                <option value="bandpass">Band Pass</option>
                <option value="notch">Notch</option>
              </StyledSelect>
            </div>

            <Slider
              label="FRQ"
              min={100}
              max={5000}
              value={currentPreset.filter.frequency}
              onChange={(e) => handleFilterChange(e, "frequency")}
            />
            <Slider
              label="Q"
              min={0.1}
              max={10}
              step={0.1}
              value={currentPreset.filter.Q}
              onChange={(e) => handleFilterChange(e, "Q")}
            />
          </>
        }
      />
    ),
    [
      currentPreset.filter.frequency,
      currentPreset.filter.Q,
      filterType,
      handleFilterChange,
      handleFilterTypeChange,
    ]
  );

  const masterControls = useMemo(
    () => (
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
    ),
    [masterVolume, handleVolumeChange]
  );

  const envelopeControls = useMemo(
    () => (
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
    ),
    [adsr, handleADSRChange]
  );

  const echoControls = useMemo(
    () => (
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
    ),
    [echoSettings, handleEchoChange]
  );

  const presetControls = useMemo(
    () => (
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
    ),
    [currentPreset.name, handlePresetChange]
  );

  return (
    <SynthProvider>
      <AppContainer>
        <Header>
          <Title>Virtual Piano</Title>
          <Subtitle>Play with your mouse or keyboard</Subtitle>
        </Header>

        <PianoContainer>
          {/* Show the rotate device banner if on mobile */}
          {showRotateBanner && (
            <RotateBanner>
              Please rotate your device for a better experience.
            </RotateBanner>
          )}
          <ControlPanel>
            {octaveControls}
            {filterControls}
            {masterControls}
            {envelopeControls}
            {echoControls}
            {presetControls}
          </ControlPanel>

          <ActionContainer>
            <ActionButton onClick={toggleEcho}>
              {isEchoEnabled ? "Disable Echo" : "Enable Echo"}
            </ActionButton>
          </ActionContainer>
          <WaveVisualizer analyserNode={getAnalyserNode()}></WaveVisualizer>

          <CurrentNoteDisplay
            note={
              activeNotes.size > 0 ? Array.from(activeNotes.keys())[0] : null
            }
          />

          <Keyboard
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            activeNotes={activeNotes}
            octave={octave}
          />
        </PianoContainer>
      </AppContainer>
    </SynthProvider>
  );
}

export default App;
