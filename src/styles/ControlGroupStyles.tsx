import styled from "styled-components";

// CSS Variables
export const StyledComponentsVariables = styled.div`
  --control-border-color: #888;
  --control-bg-color: #2a2a2a;
  --control-padding: 1rem;
  --control-border-radius: 10px;
  --control-gap: 1.5rem;

  --text-color: #ccc;
  --text-size-small: 0.9rem;
  --text-size-normal: 1rem;

  --indicator-color: #4aff83;
  --indicator-size: 10px;

  --slider-track-width: 150px;
  --slider-track-height: 6px;
  --slider-track-color: #555;
  --slider-label-width: 40px;

  --slider-thumb-width: 20px;
  --slider-thumb-height: 20px;
  --slider-thumb-border-color: #666;
  --slider-thumb-gradient-light: #aaa;
  --slider-thumb-gradient-dark: #888;
  --slider-thumb-hover-light: #ccc;
  --slider-thumb-hover-dark: #aaa;

  --shadow-inset: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-normal: 0 2px 5px rgba(0, 0, 0, 0.3);
  --animation-duration: 0.2s;
`;

// Styled components
export const GroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--control-gap);
  background-color: var(--control-bg-color);
  padding: var(--control-padding);
  border-radius: var(--control-border-radius);
`;

export const SectionLabel = styled.div`
  width: 100%;
  font-size: var(--text-size-small);
  color: var(--text-color);
  font-weight: bold;
  text-transform: uppercase;
  display: flex;
  align-items: center;

  &::before {
    content: "";
    width: var(--indicator-size);
    height: var(--indicator-size);
    background-color: var(--indicator-color);
    border-radius: 50%;
    margin-right: var(--control-gap);
  }
`;

export const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: var(--control-gap);
`;

export const SliderLabel = styled.label`
  font-size: var(--text-size-normal);
  color: var(--text-color);
  min-width: var(--slider-label-width);
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

export const SliderTrack = styled.div`
  width: 100%;
  height: var(--slider-track-height);
  background: var(--slider-track-color);
  border-radius: calc(var(--slider-track-height) / 2);
  position: relative;
  box-shadow: var(--shadow-inset);
  flex-grow: 1;
  touch-action: none;
`;

export const SliderThumb = styled.div`
  width: var(--slider-thumb-width);
  height: var(--slider-thumb-height);
  background: linear-gradient(
    145deg,
    var(--slider-thumb-gradient-dark),
    var(--slider-thumb-gradient-light)
  );
  border: 2px solid var(--slider-thumb-border-color);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  box-shadow: var(--shadow-normal);
  transition: background var(--animation-duration) ease;

  &:hover {
    background: linear-gradient(
      145deg,
      var(--slider-thumb-hover-dark),
      var(--slider-thumb-hover-light)
    );
  }
`;

export const SliderInput = styled.input`
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
`;
