import ErrorBoundary from "./components/ErrorBoundary";
import KeyboardContent from "./components/KeyboardContent";
import { SynthProvider } from "./contexts/SynthContext";

function App() {
  return (
    <ErrorBoundary>
      <SynthProvider>
        <KeyboardContent></KeyboardContent>
      </SynthProvider>
    </ErrorBoundary>
  );
}

export default App;
