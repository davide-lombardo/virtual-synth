import React from "react";
import styled from "styled-components";

interface CurrentNoteDisplayProps {
  note: string | null;
}

const LedContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 50px;
  background-color: black;
  border-radius: var(--border-radius-lg);
  margin-top: var(--spacing-md);
  font-size: var(--font-size-xl);
  color: #ff0000;
  text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 15px #ff0000, 0 0 20px #ff0000;
  font-family: 'Courier New', Courier, monospace;
`;

const CurrentNoteDisplay: React.FC<CurrentNoteDisplayProps> = ({ note }) => {
  return <LedContainer>{note || "---"}</LedContainer>;
};

export default CurrentNoteDisplay;
