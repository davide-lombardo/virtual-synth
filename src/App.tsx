import { useState, useEffect, useMemo, useCallback } from "react";
import Keyboard from "./components/Keyboard";
import { InstrumentPreset, NoteMapping } from "./types/audio.model";
import { instrumentPresets } from "./utils/preset";
import ControlGroup, { Slider } from "./components/ControlGroup";
import { useSynth } from "./hooks/useSynth";
import { SynthProvider } from "./contexts/SynthContext";
import { ChangeEvent } from "react";
import CurrentNoteDisplay from "./components/NoteVisualizer";
import WaveVisualizer from "./components/WaveVisualizer";
import {
  OctaveButton,
  ControlPanel,
  StyledSelect,
  AppContainer,
  Header,
  Title,
  Subtitle,
  PianoContainer,
  RotateBanner,
  ActionContainer,
  ActionButton,
  HelpButton,
} from "./styles/AppStyles";
import { useLocalStorage } from "./hooks/useLocalStorage";
import KeyboardHelp from "./components/KeyboardHelp";

const DEFAULT_PRESET = instrumentPresets[0];
const FILTER_TYPES = ["lowpass", "highpass", "bandpass", "notch"] as const;
type FilterType = (typeof FILTER_TYPES)[number];

function App() {
  // State hooks
  const [activeNotes, setActiveNotes] = useState<Map<string, NoteMapping>>(
    new Map()
  );
  const [currentPreset, setCurrentPreset] =
    useState<InstrumentPreset>(DEFAULT_PRESET);
  const [octave, setOctave] = useState(4);
  const [adsr, setAdsrValues] = useState(DEFAULT_PRESET.envelope);
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
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const {
    playSound,
    stopSound,
    setADSR,
    setVolume,
    setEcho,
    setFilter,
    getAnalyserNode,
  } = useSynth();

  function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : defaultValue;
  }

  useEffect(() => {
    setOctave(loadFromLocalStorage("octave", 4));
    setAdsrValues(loadFromLocalStorage("adsr", DEFAULT_PRESET.envelope));
    setMasterVolume(loadFromLocalStorage("masterVolume", 0.8));
    setEchoSettings(
      loadFromLocalStorage("echoSettings", {
        mix: 0.3,
        time: 0.3,
        feedback: 0.4,
      })
    );
    setIsEchoEnabled(loadFromLocalStorage("isEchoEnabled", true));
    setFilterType(loadFromLocalStorage("filterType", "lowpass"));
  }, []);

  // Save settings to localStorage
  useLocalStorage("octave", octave);
  useLocalStorage("adsr", adsr);
  useLocalStorage("masterVolume", masterVolume);
  useLocalStorage("echoSettings", echoSettings);
  useLocalStorage("isEchoEnabled", isEchoEnabled);
  useLocalStorage("filterType", filterType);

  useEffect(() => {
    setADSR(adsr);
    setVolume(masterVolume);
    setFilter({
      frequency: currentPreset.filter.frequency,
      Q: currentPreset.filter.Q,
      type: filterType,
    });
    setEcho(isEchoEnabled ? echoSettings : { mix: 0, time: 0, feedback: 0 });
  }, [
    adsr,
    masterVolume,
    filterType,
    echoSettings,
    isEchoEnabled,
    setADSR,
    setVolume,
    setFilter,
    setEcho,
  ]);

  // Listener for help toggle and octave settings
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMobile) return;
  
      e.preventDefault();
  
      const actions: Record<string, () => void> = {
        "?": () => setIsHelpOpen((prev) => !prev),
        "/": () => setIsHelpOpen((prev) => !prev),
        "z": () => setOctave((prev) => Math.max(1, prev - 1)),
        "x": () => setOctave((prev) => Math.min(7, prev + 1)),
      };
  
      actions[e.key.toLowerCase()]?.();
    };
  
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isMobile]);

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
      // const adjustedFrequency = note.frequency * Math.pow(2, octave - 4);
      playSound(note.frequency, note.note, currentPreset.oscillator);
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
          <Title>Virtual Synth</Title>
          <Subtitle>Play with your mouse or keyboard</Subtitle>
        </Header>

        <PianoContainer>
          {/* Show the rotate device banner if on mobile */}
          {showRotateBanner && (
            <RotateBanner>
              Please rotate your device for a better experience.
            </RotateBanner>
          )}
          {!isMobile && (
            <>
              <KeyboardHelp
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
              />
              <HelpButton
                onClick={() => setIsHelpOpen(true)}
                aria-label="Show keyboard shortcuts"
              >
                ?
              </HelpButton>
            </>
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
