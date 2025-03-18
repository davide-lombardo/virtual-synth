import React from 'react';
import styled from 'styled-components';

const HelpOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const HelpModal = styled.div`
  background: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ShortcutRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const KeyCommand = styled.kbd`
  background: var(--color-background-dark);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
`;

const KeyboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 3rem 0;
  font-family: monospace;
`;

const KeyboardRow = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
`;

const Key = styled.div<{ $isActive?: boolean }>`
  width: 50px;
  height: 50px;
  border: 2px solid ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-border)'};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 14px;
  background: ${props => props.$isActive ? 'var(--color-primary-dark)' : 'var(--color-background-dark)'};
  color: ${props => props.$isActive ? '#1a1a1a' : 'white'};

  span:last-child {
    font-size: 12px;
    color: var(--color-primary);
  }
`;

interface KeyboardHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <HelpOverlay onClick={onClose}>
      <HelpModal onClick={e => e.stopPropagation()}>
        <h2 style={{ textAlign: 'center' }}>Piano Keyboard Layout</h2>
        <KeyboardLayout>
          {/* Black keys row */}
          <KeyboardRow>
            <Key><span></span></Key>
            <Key><span></span></Key>
            <Key $isActive><span>W</span><span>C#</span></Key>
            <Key $isActive><span>E</span><span>D#</span></Key>
            <Key><span></span></Key>
            <Key $isActive><span>T</span><span>F#</span></Key>
            <Key $isActive><span>Y</span><span>G#</span></Key>
            <Key $isActive><span>U</span><span>A#</span></Key>
            <Key><span></span></Key>
          </KeyboardRow>
          
          {/* White keys row */}
          <KeyboardRow>
            <Key><span></span></Key>
            <Key $isActive><span>A</span><span>C</span></Key>
            <Key $isActive><span>S</span><span>D</span></Key>
            <Key $isActive><span>D</span><span>E</span></Key>
            <Key $isActive><span>F</span><span>F</span></Key>
            <Key $isActive><span>G</span><span>G</span></Key>
            <Key $isActive><span>H</span><span>A</span></Key>
            <Key $isActive><span>J</span><span>B</span></Key>
            <Key><span></span></Key>
          </KeyboardRow>
        </KeyboardLayout>

        <h3 style={{ marginBottom: '1rem' }}>Controls</h3>
        <ShortcutRow>
          <KeyCommand>Z / X</KeyCommand>
          <span>Octave Down / Up</span>
        </ShortcutRow>
        <ShortcutRow>
          <KeyCommand>White Keys</KeyCommand>
          <span>A S D F G H J</span>
        </ShortcutRow>
        <ShortcutRow>
          <KeyCommand>Black Keys</KeyCommand>
          <span>W E T Y U</span>
        </ShortcutRow>
        <ShortcutRow>
          <KeyCommand>?</KeyCommand>
          <span>Toggle this help</span>
        </ShortcutRow>

        <div style={{ marginTop: '3rem', fontSize: '0.9em', opacity: 0.8 }}>
          The keyboard layout mimics a piano, where white keys are on the bottom row
          and black keys are on the top row.
        </div>
      </HelpModal>
    </HelpOverlay>
  );
};

export default KeyboardHelp;
