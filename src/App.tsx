import { useState } from 'react';
import FiltradosIA from './components/FiltradosIA';
import LlamadasIA from './components/LlamadasIA';

type Screen = 'filtrados' | 'llamadas';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('filtrados');

  return (
    <>
      {currentScreen === 'filtrados' && (
        <FiltradosIA onNavigateToLlamadas={() => setCurrentScreen('llamadas')} />
      )}
      {currentScreen === 'llamadas' && (
        <LlamadasIA onExit={() => setCurrentScreen('filtrados')} />
      )}
    </>
  );
}

export default App;
