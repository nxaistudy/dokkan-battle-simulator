import React, { useState } from 'react';
import CharacterSelection from '../components/CharacterSelection/CharacterSelection';
import BattleSimulation from '../components/BattleSimulation/BattleSimulation';
import BattleResult from '../components/BattleResult/BattleResult';
import { Character } from '../types/character';
import { BattleResult as BattleResultType } from '../types/battle';

const Home: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [opponentCharacter, setOpponentCharacter] = useState<Character | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResultType | null>(null);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleBattleComplete = (result: BattleResultType) => {
    setBattleResult(result);
  };

  const handleRestart = () => {
    setSelectedCharacter(null);
    setOpponentCharacter(null);
    setBattleResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">드래곤볼Z 도칸 배틀</h1>

      {!selectedCharacter && (
        <CharacterSelection onCharacterSelect={handleCharacterSelect} />
      )}

      {selectedCharacter && !opponentCharacter && (
        <CharacterSelection onCharacterSelect={setOpponentCharacter} />
      )}

      {selectedCharacter && opponentCharacter && !battleResult && (
        <BattleSimulation
          playerCharacter={selectedCharacter}
          opponentCharacter={opponentCharacter}
          onBattleComplete={handleBattleComplete}
        />
      )}

      {battleResult && (
        <BattleResult result={battleResult} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default Home; 