import styled from "styled-components";

export const AppContainer = styled.div`
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

export const Title = styled.h1`
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
  text-shadow: var(--text-shadow);
`;

export const PianoContainer = styled.div`
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

export const ActionButton = styled.button`
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

export const OctaveButton = styled.button<{ $active: boolean }>`
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

export const Header = styled.header`
  margin-bottom: 2rem;
  text-align: center;
  color: white;
`;

export const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
`;

export const ControlPanel = styled.div`
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

export const StyledSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 1rem;
  color: #333;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4682b4;
    outline: none;
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const RotateBanner = styled.div`
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

export const HelpButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--color-black);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  &:hover {
    background: var(--color-primary);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;
