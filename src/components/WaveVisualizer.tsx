import React, { useRef, useEffect } from "react";
import styled from "styled-components";

const VisualizerCanvas = styled.canvas`
  width: 100%;
  height: var(--visualizer-height);
  background-color: var(--color-visualizer-bg);
  border-radius: var(--border-radius-md);
  border: var(--2px) solid var(--color-border);
`;

const VisualizerContainer = styled.div`
width: 200px;
  padding: var(--spacing-sm);
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  border: var(--2px) solid var(--color-border);
`;

const Title = styled.h3`
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
`;

interface WaveVisualizerProps {
  analyserNode: AnalyserNode | null;
}

const WaveVisualizer: React.FC<WaveVisualizerProps> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      analyserNode.getByteTimeDomainData(dataArray);

      // Calculate average signal strength
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += Math.abs(dataArray[i] - 128);
      }
      const average = sum / bufferLength;

      // Clear background with alpha for trail effect
      ctx.fillStyle = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--color-visualizer-bg");
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--visualizer-line-width"
        )
      );

      // Calculate color based on signal strength
      const hue = average * 2; // cycle through colors as signal changes
      const saturation = 70 + average * 0.3;
      const lightness = 45 + average * 0.3;
      const currentColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      ctx.strokeStyle = currentColor;

      // Glow effect using the same dynamic color
      ctx.shadowBlur = average * 2;
      ctx.shadowColor = currentColor;

      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode]);

  return (
    <VisualizerContainer>
      <Title>Waveform</Title>
      <VisualizerCanvas ref={canvasRef} />
    </VisualizerContainer>
  );
};

export default WaveVisualizer;
