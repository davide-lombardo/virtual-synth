import React from "react";
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

  return (
    <SliderContainer>
      <SliderLabel>{label}</SliderLabel>
      <SliderTrack>
        <SliderThumb style={{ left: `${position}%` }} />
        <SliderInput
          type="range"
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
