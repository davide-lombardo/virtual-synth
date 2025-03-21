import styled from "styled-components";

export const KeyboardContainer = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  height: 180px;
  margin: 20px 0;
  user-select: none;
`;

interface KeyProps {
  $isBlack: boolean;
  $isActive: boolean;
}

export const Key = styled.div<KeyProps>`
  position: relative;
  height: ${(props) => (props.$isBlack ? "110px" : "180px")};
  flex-grow: ${(props) => (props.$isBlack ? 0 : 1)};
  flex-basis: ${(props) => (props.$isBlack ? "30px" : "40px")};
  margin: ${(props) => (props.$isBlack ? "0 -15px" : "0")};
  z-index: ${(props) => (props.$isBlack ? 2 : 1)};
  border-radius: 0 0 6px 6px;
  cursor: pointer;
  transition: background 0.1s ease, box-shadow 0.2s ease, transform 0.05s ease;

  @media (max-width: 768px) {
    height: ${(props) => (props.$isBlack ? "90px" : "150px")};
    flex-basis: ${(props) => (props.$isBlack ? "24px" : "32px")};
    margin: ${(props) => (props.$isBlack ? "0 -12px" : "0")};
  }

  @media (max-width: 480px) {
    height: ${(props) => (props.$isBlack ? "75px" : "120px")};
    flex-basis: ${(props) => (props.$isBlack ? "20px" : "28px")};
    margin: ${(props) => (props.$isBlack ? "0 -10px" : "0")};
  }

  ${(props) => getKeyBackground(props.$isBlack, props.$isActive)}
  ${(props) => getKeyShadows(props.$isBlack, props.$isActive)}
  transform: ${(props) => (props.$isActive ? "translateY(2px)" : "none")};

  &:hover {
    ${(props) => getKeyHoverBackground(props.$isBlack, props.$isActive)}
    ${(props) => getKeyHoverShadows(props.$isBlack, props.$isActive)}
  }

  &:active,
  &.key-pressed {
    ${(props) => getActiveKeyStyles(props.$isBlack)}
    transform: translateY(2px);
  }
`;

export const getKeyBackground = (isBlack: boolean, isActive: boolean) => {
  const activeBackground = isBlack
    ? `linear-gradient(to bottom, #000 0%, #222 100%)`
    : `linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%)`;

  const inactiveBackground = isBlack
    ? `linear-gradient(to bottom, #222 0%, #111 40%, #000 100%)`
    : `linear-gradient(to bottom,
        #ffffff 0%,
        #f9f9f9 10%,
        #f2f2f2 30%,
        #dddddd 70%,
        #cccccc 90%,
        #bbbbbb 100%)`;

  return `background: ${isActive ? activeBackground : inactiveBackground};`;
};

export const getKeyShadows = (isBlack: boolean, isActive: boolean) => {
  const activeShadows = isBlack
    ? `0px 3px 6px rgba(0, 0, 0, 0.7),
       inset 0px -2px 4px rgba(255, 255, 255, 0.05),
       inset 0px 1px 2px rgba(255, 255, 255, 0.1)`
    : `0px 3px 5px rgba(0, 0, 0, 0.2),
       inset 0px 2px 4px rgba(255, 255, 255, 0.7),
       inset 0px -2px 5px rgba(0, 0, 0, 0.15)`;

  const inactiveShadows = isBlack
    ? `0px 5px 8px rgba(0, 0, 0, 0.7),
       inset 0px -3px 5px rgba(255, 255, 255, 0.1),
       inset 0px 1px 2px rgba(255, 255, 255, 0.2),
       0px 1px 3px rgba(255, 255, 255, 0.05)`
    : `0px 4px 6px rgba(0, 0, 0, 0.3),
       0px 8px 12px rgba(0, 0, 0, 0.2),
       inset 0px 2px 4px rgba(255, 255, 255, 0.8),
       inset 0px -3px 6px rgba(0, 0, 0, 0.1),
       0px 2px 3px rgba(255, 255, 255, 0.15),
       0px 1px 4px rgba(0, 0, 0, 0.05)`;

  return `box-shadow: ${isActive ? activeShadows : inactiveShadows};`;
};

export const getKeyHoverBackground = (isBlack: boolean, isActive: boolean) => {
  const activeBackground = isBlack
    ? `linear-gradient(to bottom, #000 0%, #222 100%)`
    : `linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%)`;

  const inactiveBackground = isBlack
    ? `linear-gradient(to bottom, #333 0%, #111 100%)`
    : `linear-gradient(to bottom,
        #ffffff 0%,
        #fdfdfd 5%,
        #f5f5f5 20%,
        #e8e8e8 60%,
        #dcdcdc 100%)`;

  return `background: ${isActive ? activeBackground : inactiveBackground};`;
};

export const getKeyHoverShadows = (isBlack: boolean, isActive: boolean) => {
  const activeShadows = isBlack
    ? `0px 3px 6px rgba(0, 0, 0, 0.7),
       inset 0px -2px 4px rgba(255, 255, 255, 0.05),
       inset 0px 1px 2px rgba(255, 255, 255, 0.1)`
    : `0px 3px 5px rgba(0, 0, 0, 0.2),
       inset 0px 2px 4px rgba(255, 255, 255, 0.7),
       inset 0px -2px 5px rgba(0, 0, 0, 0.15)`;

  const inactiveShadows = isBlack
    ? `0px 5px 10px rgba(0, 0, 0, 0.8),
       inset 0px -3px 6px rgba(255, 255, 255, 0.1),
       inset 0px 2px 4px rgba(255, 255, 255, 0.2)`
    : `0px 5px 8px rgba(0, 0, 0, 0.35),
       0px 10px 15px rgba(0, 0, 0, 0.25),
       inset 0px 3px 5px rgba(255, 255, 255, 0.9),
       inset 0px -4px 8px rgba(0, 0, 0, 0.15)`;

  return `box-shadow: ${isActive ? activeShadows : inactiveShadows};`;
};

export const getActiveKeyStyles = (isBlack: boolean) => {
  return `
    background: ${
      isBlack
        ? `linear-gradient(to bottom, #000 0%, #222 100%)`
        : `linear-gradient(to bottom, #e0e0e0 0%, #d0d0d0 100%)`
    };
    box-shadow: ${
      isBlack
        ? `0px 3px 6px rgba(0, 0, 0, 0.7),
           inset 0px -2px 4px rgba(255, 255, 255, 0.05),
           inset 0px 1px 2px rgba(255, 255, 255, 0.1)`
        : `0px 3px 5px rgba(0, 0, 0, 0.2),
           inset 0px 2px 4px rgba(255, 255, 255, 0.7),
           inset 0px -2px 5px rgba(0, 0, 0, 0.15)`
    };
  `;
};