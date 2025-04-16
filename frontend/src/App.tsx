import React, { useState } from 'react';
import BattleScreen from './components/BattleScreen';
import CharacterSelection from './components/CharacterSelection';
import { Team } from './types/character';
import './App.css';

const App: React.FC = () => {
  const [battleState, setBattleState] = useState<{
    playerTeam: Team | null;
    enemyTeam: Team | null;
  }>({
    playerTeam: null,
    enemyTeam: null
  });

  const handleStartBattle = (playerTeam: Team, enemyTeam: Team) => {
    setBattleState({ playerTeam, enemyTeam });
  };

  const handleResetBattle = () => {
    setBattleState({ playerTeam: null, enemyTeam: null });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>드래곤볼Z 도칸 배틀 전투 시뮬레이터</h1>
      </header>
      <main>
        {battleState.playerTeam && battleState.enemyTeam ? (
          <BattleScreen
            playerTeam={battleState.playerTeam}
            enemyTeam={battleState.enemyTeam}
            onReset={handleResetBattle}
          />
        ) : (
          <CharacterSelection onStartBattle={handleStartBattle} />
        )}
      </main>
    </div>
  );
};

export default App;
