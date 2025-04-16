import React, { useState } from 'react';
import { Character, Team, TeamType } from '../types/character';
import { mockTeams } from '../data/characters';

interface CharacterSelectionProps {
  onStartBattle: (playerTeam: Team, enemyTeam: Team) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onStartBattle }) => {
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);

  const handleCharacterSelect = (character: Character) => {
    if (selectedCharacters.includes(character)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else if (selectedCharacters.length < 3) {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleStartBattle = () => {
    if (selectedCharacters.length === 3) {
      const playerTeam: Team = {
        id: 'player-team',
        type: TeamType.PLAYER,
        characters: selectedCharacters,
        leader: selectedCharacters[0]
      };
      
      onStartBattle(playerTeam, mockTeams[1]); // 적 팀은 고정
    }
  };

  return (
    <div className="character-selection">
      <h2>캐릭터 선택</h2>
      <p>3명의 캐릭터를 선택해주세요</p>
      
      <div className="character-grid">
        {mockTeams[0].characters.map(character => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacters.includes(character) ? 'selected' : ''}`}
            onClick={() => handleCharacterSelect(character)}
          >
            <img src={character.image} alt={character.name} />
            <div className="character-info">
              <h3>{character.name}</h3>
              <div className="type-badge">{character.type}</div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="start-button"
        onClick={handleStartBattle}
        disabled={selectedCharacters.length !== 3}
      >
        전투 시작
      </button>

      <style>{`
        .character-selection {
          padding: 20px;
          text-align: center;
        }

        .character-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .character-card {
          border: 2px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .character-card.selected {
          border-color: #4CAF50;
          box-shadow: 0 0 10px #4CAF50;
        }

        .character-card img {
          width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .character-info {
          margin-top: 10px;
        }

        .type-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #2196F3;
          color: white;
          font-size: 12px;
          margin: 5px 0;
        }

        .start-button {
          padding: 15px 30px;
          font-size: 1.2rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .start-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .start-button:hover:not(:disabled) {
          background-color: #45a049;
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default CharacterSelection; 