import { useState, useEffect, useCallback, ChangeEvent, useMemo } from "react";
import { useSynthContext } from "../contexts/SynthContext";
import { useSynth } from "../hooks/useSynth";
import { OctaveButton, StyledSelect, AppContainer, Header, Title, Subtitle, PianoContainer, RotateBanner, HelpButton, ControlPanel, ActionContainer, ActionButton } from "../styles/AppStyles";
import { NoteMapping } from "../types/audio.model";
import { instrumentPresets } from "../utils/preset";
import ControlGroup, { Slider } from "./ControlGroup";
import Keyboard from "./Keyboard";
import KeyboardHelp from "./KeyboardHelp";
import CurrentNoteDisplay from "./NoteVisualizer";
import WaveVisualizer from "./WaveVisualizer";

function KeyboardContent() {
  // State hooks
  const [activeNotes, setActiveNotes] = useState<Map<string, NoteMapping>>(
    new Map()
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showRotateBanner, setShowRotateBanner] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const {
    playSound,
    stopSound,
    getAnalyserNode,
  } = useSynth();

  const {
    currentPreset,
    setCurrentPreset,
    octave,
    setOctave,
    adsr,
    setAdsrValues,
    setFilterType,
    filterType,
    setFilter,
    masterVolume,
    setMasterVolume,
    echoSettings,
    setEchoSettings,
    isEchoEnabled,
    setIsEchoEnabled,
  } = useSynthContext();

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

  // Listener for help toggle and octave settings
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMobile) return;

      // Only prevent default for keys we're handling
      if (['?', '/', 'z', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      if (e.key === '?' || e.key === '/') {
        setIsHelpOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'z') {
        setOctave(prev => Math.max(1, prev - 1));
      } else if (e.key.toLowerCase() === 'x') {
        setOctave(prev => Math.min(7, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isMobile, setOctave]);

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
        
        if (selected.filter.type) {
          setFilterType(selected.filter.type as BiquadFilterType);
        }
        
        setFilter({
          frequency: selected.filter.frequency,
          Q: selected.filter.Q,
          type: selected.filter.type as BiquadFilterType || filterType,
        });
      }
    },
    [setCurrentPreset, setAdsrValues, setFilterType, setFilter, filterType]
  );

  // Handle filter type change
  const handleFilterTypeChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as BiquadFilterType;
      setFilterType(newType);
      
      // Update filter with new type
      setFilter(prev => ({
        ...prev,
        type: newType
      }));
    },
    [setFilterType, setFilter]
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, type: "frequency" | "Q") => {
      const value = parseFloat(e.target.value);
      
      // Update both the preset (for UI consistency) and the actual filter
      setCurrentPreset(prevPreset => ({
        ...prevPreset,
        filter: {
          ...prevPreset.filter,
          [type]: value,
        }
      }));
      
      setFilter(prev => ({
        ...prev,
        [type]: value
      }));
    },
    [setCurrentPreset, setFilter]
  );

  // Handle ADSR changes
  const handleADSRChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>,
      param: "attack" | "decay" | "sustain" | "release"
    ) => {
      const value = parseFloat(e.target.value);
      setAdsrValues(prev => ({ ...prev, [param]: value }));
    },
    [setAdsrValues]
  );

  // Handle volume changes
  const handleVolumeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMasterVolume(parseFloat(e.target.value));
    }, 
    [setMasterVolume]
  );

  // Handle echo changes
  const handleEchoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, param: "mix" | "time" | "feedback") => {
      const value = parseFloat(e.target.value);
      setEchoSettings(prev => ({ ...prev, [param]: value }));
    },
    [setEchoSettings]
  );

  // Toggle echo
  const toggleEcho = useCallback(() => {
    setIsEchoEnabled(prev => !prev);
  }, [setIsEchoEnabled]);

  // Note handling
  const handleNoteOn = useCallback(
    (note: NoteMapping) => {
      setActiveNotes(prev => new Map(prev).set(note.note, note));
      playSound(note.frequency, note.note, currentPreset.oscillator);
    },
    [currentPreset.oscillator, playSound]
  );

  const handleNoteOff = useCallback(
    (note: NoteMapping) => {
      setActiveNotes(prev => {
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
    [octave, setOctave]
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

  useEffect(() => {
    if (!isEchoEnabled) {
      // Store current echo settings in the state but with mix set to 0 (effectively disabled)
      // This avoids changing the sliders visually but disables the effect
      const updatedSettings = { ...echoSettings, mixBackup: echoSettings.mix, mix: 0 };
      setEchoSettings(updatedSettings);
    } else if (echoSettings.mixBackup !== undefined) {
      // Restore the previous mix value if available
      const updatedSettings = { ...echoSettings, mix: echoSettings.mixBackup };
      delete updatedSettings.mixBackup;
      setEchoSettings(updatedSettings);
    }
  }, [isEchoEnabled]);

  return (
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
  );
}

export default KeyboardContent;