export enum CharacterType {
  STR = 'STR',
  AGL = 'AGL',
  TEQ = 'TEQ',
  INT = 'INT',
  PHY = 'PHY'
}

export enum TeamType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY'
}

export interface SpecialAbility {
  name: string;
  description: string;
  damageMultiplier: number;
  cooldown: number;
  currentCooldown: number;
}

export interface Character {
  id: string;
  name: string;
  image: string;
  type: CharacterType;
  health: number;
  attack: number;
  defense: number;
  stats: {
    attack: number;
    defense: number;
    health: number;
    maxHealth: number;
    speed: number;
  };
  specialAbilities: SpecialAbility[];
  currentHealth: number;
  leaderSkill?: {
    name: string;
    description: string;
    effect: {
      attack: number;
      defense: number;
      health: number;
    };
  };
  passiveSkill?: {
    name: string;
    description: string;
    effect: {
      attack: number;
      defense: number;
      health: number;
    };
  };
}

export interface Team {
  id: string;
  type: TeamType;
  characters: Character[];
  leader: Character;
}

export interface BattleState {
  playerTeam: Team;
  enemyTeam: Team;
  currentTurn: number;
  battleLog: string[];
}

export interface BattleAction {
  type: 'ATTACK' | 'SPECIAL_ABILITY';
  attacker: Character;
  defender: Character;
  specialAbilityIndex?: number;
} 