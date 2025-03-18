import React, { useRef } from "react";
import {
  SliderContainer,
  SliderLabel,
  SliderTrack,
  SliderThumb,
  SliderInput,
  StyledComponentsVariables,
  GroupContainer,
  SectionLabel,
} from "../styles/ControlGroupStyles";

// Types
type SliderProps = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
};

type ControlGroupProps = {
  title: string;
  controls: React.ReactNode | SliderProps[];
};

// Helper function to calculate slider thumb position percentage
const calculatePosition = (value: number, min: number, max: number): number => {
  return ((value - min) / (max - min)) * 100;
};

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
}) => {
  const position = calculatePosition(value, min, max);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const newValue = min + percentage * (max - min);
    const clampedValue = Math.min(max, Math.max(min, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;

    const event = {
      target: {
        value: steppedValue.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(event);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    updateValueFromPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    updateValueFromPosition(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <SliderContainer>
      <SliderLabel>{label}</SliderLabel>
      <SliderTrack
       ref={sliderRef}
       onTouchStart={handleTouchStart}
       onTouchMove={handleTouchMove}
       onTouchEnd={handleTouchEnd}
       onTouchCancel={handleTouchEnd}
      >
        <SliderThumb style={{ left: `${position}%` }} />
        <SliderInput
          type="range"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          aria-label={label}
        />
      </SliderTrack>
    </SliderContainer>
  );
};

// ControlGroup component
const ControlGroup: React.FC<ControlGroupProps> = ({ title, controls }) => {
  return (
    <StyledComponentsVariables>
      <GroupContainer>
        <SectionLabel>{title}</SectionLabel>
        {Array.isArray(controls)
          ? controls.map((sliderProps, index) => (
              <Slider
                key={`${title}-${sliderProps.label}-${index}`}
                {...sliderProps}
              />
            ))
          : controls}
      </GroupContainer>
    </StyledComponentsVariables>
  );
};

export default React.memo(ControlGroup);
