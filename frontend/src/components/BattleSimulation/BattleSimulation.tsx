import React from 'react';
import { Character } from '../../types/character';
import { BattleResult } from '../../types/battle';
import useBattleSimulation from '../../hooks/useBattleSimulation';

interface BattleSimulationProps {
  playerCharacter: Character;
  opponentCharacter: Character;
  onBattleComplete: (result: BattleResult) => void;
}

const BattleSimulation: React.FC<BattleSimulationProps> = ({
  playerCharacter,
  opponentCharacter,
  onBattleComplete,
}) => {
  const [battleLog, setBattleLog] = React.useState<string[]>([]);
  const { isSimulating, simulateBattle } = useBattleSimulation();

  const startBattle = () => {
    const result = simulateBattle(playerCharacter, opponentCharacter);
    setBattleLog(result.battleLog);
    onBattleComplete(result);
  };

  return (
    <div className="battle-simulation">
      <div className="flex justify-between mb-8">
        <div className="character-card">
          <img src={playerCharacter.image} alt={playerCharacter.name} className="w-32 h-32 object-cover rounded" />
          <h3 className="text-xl font-semibold">{playerCharacter.name}</h3>
          <div className="stats">
            <p>공격력: {playerCharacter.stats.attack}</p>
            <p>방어력: {playerCharacter.stats.defense}</p>
            <p>체력: {playerCharacter.currentHealth}/{playerCharacter.stats.maxHealth}</p>
          </div>
        </div>

        <div className="vs-text text-4xl font-bold self-center">VS</div>

        <div className="character-card">
          <img src={opponentCharacter.image} alt={opponentCharacter.name} className="w-32 h-32 object-cover rounded" />
          <h3 className="text-xl font-semibold">{opponentCharacter.name}</h3>
          <div className="stats">
            <p>공격력: {opponentCharacter.stats.attack}</p>
            <p>방어력: {opponentCharacter.stats.defense}</p>
            <p>체력: {opponentCharacter.currentHealth}/{opponentCharacter.stats.maxHealth}</p>
          </div>
        </div>
      </div>

      <div className="battle-log border rounded p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
        {battleLog.map((log, index) => (
          <p key={index} className="mb-1">{log}</p>
        ))}
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        onClick={startBattle}
        disabled={isSimulating}
      >
        {isSimulating ? '전투 진행 중...' : '전투 시작'}
      </button>
    </div>
  );
};

export default BattleSimulation; 