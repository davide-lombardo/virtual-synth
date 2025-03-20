import KeyboardContent from "./components/KeyboardContent";
import { SynthProvider } from "./contexts/SynthContext";


function App() {
  return (
    <SynthProvider>
      <KeyboardContent></KeyboardContent>
    </SynthProvider>
  );
}

export default App;
