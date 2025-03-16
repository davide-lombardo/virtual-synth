import { SynthSettings } from "./types/audio.model";

export class SynthEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;

  private activeOscillators = new Map<
    string,
    {
      oscillators: OscillatorNode[];
      gainNode: GainNode;
      releaseTimeout?: number;
    }
  >();

  private settings: SynthSettings = {
    oscillator: { type: "sine", detune: 0, mix: [1] },
    envelope: { attack: 0.2, decay: 0, sustain: 1, release: 0.3 },
    filter: { type: "lowpass", frequency: 5000, Q: 1 },
    effects: { mix: 0.3, time: 0.3, feedback: 0.4 },
    masterVolume: 1.0,
  };


  private ADSR = { attack: 0.2, decay: 0, sustain: 1, release: 0.3 };
  private readonly UNISON_WIDTH = 8;
  private readonly FFT_SIZE = 2048;
  private readonly SMOOTHING = 0.4;

  constructor() {
    this.setupAudioContext();
  }

  private setupAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();

      this.masterGain = this.createGainNode();
      this.filterNode = this.createFilterNode();
      this.analyserNode = this.createAnalyserNode();
      this.delayNode = this.audioContext.createDelay(5.0);
      this.feedbackGain = this.createGainNode();
      this.dryGain = this.createGainNode();
      this.wetGain = this.createGainNode();

      this.applySettings();
    }
  }

  private createGainNode(): GainNode {
    return this.audioContext!.createGain();
  }

  private createFilterNode(): BiquadFilterNode {
    const filter = this.audioContext!.createBiquadFilter();
    filter.type = this.settings.filter.type;
    return filter;
  }

  private createAnalyserNode(): AnalyserNode {
    const analyser = this.audioContext!.createAnalyser();
    analyser.fftSize = this.FFT_SIZE;
    analyser.smoothingTimeConstant = this.SMOOTHING;
    return analyser;
  }

  private applySettings() {
    if (!this.audioContext) return;
    
    this.masterGain!.gain.value = this.settings.masterVolume;
    this.filterNode!.type = this.settings.filter.type;
    this.filterNode!.frequency.value = this.settings.filter.frequency;
    this.filterNode!.Q.value = this.settings.filter.Q;

    this.analyserNode!.fftSize = this.FFT_SIZE;
    this.analyserNode!.smoothingTimeConstant = this.SMOOTHING;

    this.delayNode!.delayTime.value = this.settings.effects.time;
    this.feedbackGain!.gain.value = this.settings.effects.feedback;
    this.dryGain!.gain.value = 1 - this.settings.effects.mix;
    this.wetGain!.gain.value = this.settings.effects.mix;

    this.filterNode!.connect(this.masterGain!);
    this.masterGain!.connect(this.dryGain!);
    this.masterGain!.connect(this.delayNode!);
    this.delayNode!.connect(this.feedbackGain!);
    this.feedbackGain!.connect(this.delayNode!);
    this.delayNode!.connect(this.wetGain!);
    this.dryGain!.connect(this.analyserNode!);
    this.wetGain!.connect(this.analyserNode!);
    this.analyserNode!.connect(this.audioContext.destination);
  }

  public updateSettings(newSettings: Partial<SynthSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.applySettings();
  }

  public resume() {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  public dispose() {
    this.activeOscillators.forEach((_, note) => {
      this.stopSound(note);
    });

    if (this.audioContext) {
      if (this.filterNode) {
        this.filterNode.disconnect();
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
      }
      if (this.analyserNode) {
        this.analyserNode.disconnect();
      }
      if (this.delayNode) {
        this.delayNode.disconnect();
      }
      if (this.feedbackGain) {
        this.feedbackGain.disconnect();
      }
      if (this.dryGain) {
        this.dryGain.disconnect();
      }
      if (this.wetGain) {
        this.wetGain.disconnect();
      }

      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public setADSR(newADSR: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }) {
    this.ADSR = { ...newADSR };
  }

  public setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  public setFilter(params: { frequency: number; Q: number }) {
    if (this.filterNode) {
      this.filterNode.frequency.value = params.frequency;
      this.filterNode.Q.value = params.Q;
    }
  }

  public setEcho(params: { mix: number; time: number; feedback: number }) {
    if (this.delayNode && this.feedbackGain && this.dryGain && this.wetGain) {
      this.delayNode.delayTime.value = params.time;
      this.feedbackGain.gain.value = params.feedback;
      this.dryGain.gain.value = 1 - params.mix;
      this.wetGain.gain.value = params.mix;
    }
  }

  public playSound(
    frequency: number,
    note: string,
    oscillatorType: OscillatorType = "sine"
  ) {
    this.setupAudioContext();
    this.resume();

    if (this.activeOscillators.has(note)) {
      this.stopSound(note);
    }

    const audioCtx = this.audioContext;
    if (!audioCtx || !this.filterNode) return;

    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    const attackDuration = this.ADSR.attack;
    const attackTime = now + attackDuration;
    const decayDuration = this.ADSR.decay;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, attackTime);

    if (decayDuration > 0) {
      gainNode.gain.setTargetAtTime(
        this.ADSR.sustain,
        attackTime,
        decayDuration / 3
      );
    } else if (this.ADSR.sustain < 1) {
      gainNode.gain.setValueAtTime(this.ADSR.sustain, attackTime);
    }

    const oscillators = [
      this.createOscillator(audioCtx, frequency, oscillatorType, 0),
      this.createOscillator(
        audioCtx,
        frequency,
        oscillatorType,
        -this.UNISON_WIDTH
      ),
      this.createOscillator(
        audioCtx,
        frequency,
        oscillatorType,
        this.UNISON_WIDTH
      ),
    ];

    oscillators.forEach((osc) => osc.connect(gainNode));
    gainNode.connect(this.filterNode);
    oscillators.forEach((osc) => osc.start());

    this.activeOscillators.set(note, { oscillators, gainNode });
  }

  private createOscillator(
    audioCtx: AudioContext,
    frequency: number,
    type: OscillatorType,
    detune: number
  ): OscillatorNode {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.detune.setValueAtTime(detune, audioCtx.currentTime);
    return osc;
  }

  public stopSound(note: string) {
    if (!this.audioContext) return;

    const oscData = this.activeOscillators.get(note);
    if (!oscData) return;

    if (oscData.releaseTimeout) {
      clearTimeout(oscData.releaseTimeout);
    }

    const { oscillators, gainNode } = oscData;
    const releaseTime = this.ADSR.release;

    gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    gainNode.gain.setTargetAtTime(
      0,
      this.audioContext.currentTime,
      releaseTime / 3
    );

    const releaseTimeout = window.setTimeout(() => {
      oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          console.error("Error stopping oscillator:", e);
        }
      });

      try {
        gainNode.disconnect();
      } catch (e) {
        console.error("Error disconnecting gain node:", e);
      }

      this.activeOscillators.delete(note);
    }, releaseTime * 1000);

    this.activeOscillators.set(note, { ...oscData, releaseTimeout });
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }
  public getAudioData(): Uint8Array | null {
    if (!this.analyserNode) return null;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(dataArray);

    return dataArray;
  }
}