import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { NoteMapping } from "../types/audio.model";
import { useSynth } from "../hooks/useSynth";

const VisualizerContainer = styled.div`
  margin-top: 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 1rem;
  height: 150px;
  width: 200px;
  position: relative;
  overflow: hidden;
`;

const VisualizerCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const VisualizerLabel = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  z-index: 1;
`;

interface WaveVisualizerProps {
  activeNotes: Map<string, NoteMapping>;
}

const WaveVisualizer: React.FC<WaveVisualizerProps> = ({ activeNotes }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const { getAnalyserNode } = useSynth();

  useEffect(() => {
    const analyser = getAnalyserNode();
    if (!analyser) return;

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    // Set up canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (canvas) {
        const { width, height } = canvas.getBoundingClientRect();
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current || !ctx || !canvas) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;

      // Get time domain data
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Style for waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = activeNotes.size > 0 ? "#4aff83" : "#64b5f6";
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128.0; // Adjusted to center around zero
        const y = (v * canvas.height) / 2 + canvas.height / 2; // Adjusted to center vertically

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Add a glow effect when notes are playing
      if (activeNotes.size > 0) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4aff83";
      } else {
        ctx.shadowBlur = 0;
      }

      // Request next frame
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activeNotes]);

  return (
    <VisualizerContainer>
      <VisualizerLabel>WAVEFORM</VisualizerLabel>
      <VisualizerCanvas ref={canvasRef} />
    </VisualizerContainer>
  );
};

export default WaveVisualizer;
