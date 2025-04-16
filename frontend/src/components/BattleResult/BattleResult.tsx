import React from 'react';
import { Character } from '../../types/character';

interface BattleResult {
  winner: Character;
  loser: Character;
  battleLog: string[];
}

interface BattleResultProps {
  result: BattleResult;
  onRestart: () => void;
}

const BattleResult: React.FC<BattleResultProps> = ({ result, onRestart }) => {
  return (
    <div className="battle-result">
      <h2 className="text-2xl font-bold mb-4">전투 결과</h2>
      
      <div className="winner-section mb-8">
        <h3 className="text-xl font-semibold text-green-600 mb-2">승리: {result.winner.name}</h3>
        <img src={result.winner.image} alt={result.winner.name} className="w-32 h-32 object-cover rounded" />
      </div>

      <div className="battle-log border rounded p-4 h-64 overflow-y-auto mb-4">
        {result.battleLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={onRestart}
      >
        다시 시작하기
      </button>
    </div>
  );
};

export default BattleResult; 