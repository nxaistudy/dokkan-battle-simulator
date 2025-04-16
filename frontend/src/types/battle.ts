import { Character } from './character';

export interface BattleAction {
  attacker: Character;
  defender: Character;
  damage: number;
  isSpecialAbility: boolean;
  abilityName?: string;
  message: string;
}

export interface BattleResult {
  winner: Character;
  loser: Character;
  battleLog: string[];
  turns: number;
} 