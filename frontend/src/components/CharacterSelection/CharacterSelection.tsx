import React from 'react';
import { Character } from '../../types/character';
import { characters } from '../../data/characters';

interface CharacterSelectionProps {
  onCharacterSelect: (character: Character) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onCharacterSelect }) => {
  return (
    <div className="character-selection">
      <h2 className="text-2xl font-bold mb-4">캐릭터 선택</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div
            key={character.id}
            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onCharacterSelect(character)}
          >
            <img src={character.image} alt={character.name} className="w-full h-48 object-cover rounded" />
            <h3 className="text-xl font-semibold mt-2">{character.name}</h3>
            <div className="mt-2">
              <p>공격력: {character.stats.attack}</p>
              <p>방어력: {character.stats.defense}</p>
              <p>체력: {character.stats.health}</p>
              <p>속도: {character.stats.speed}</p>
            </div>
            <div className="mt-2">
              <h4 className="font-semibold">특수 능력:</h4>
              {character.specialAbilities.map((ability, index) => (
                <div key={index} className="mt-1">
                  <p className="font-medium">{ability.name}</p>
                  <p className="text-sm text-gray-600">{ability.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelection; 