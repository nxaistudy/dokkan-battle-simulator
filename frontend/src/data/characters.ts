import { Character, CharacterType, Team, TeamType, BattleState } from '../types/character';

// 캐릭터 이미지를 위한 DiceBear 아바타 URL 생성 함수
const getAvatarUrl = (seed: string) => {
  // DiceBear의 'avataaars' 스타일 사용
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`;
};

export const mockCharacters: Character[] = [
  {
    id: 'char1',
    name: '슈퍼 사이어인 갓 슈퍼 사이어인 베지트',
    image: getAvatarUrl('vegito-blue'),
    type: CharacterType.STR,
    health: 15000,
    attack: 12000,
    defense: 8000,
    stats: {
      attack: 12000,
      defense: 8000,
      health: 15000,
      maxHealth: 15000,
      speed: 130
    },
    specialAbilities: [
      {
        name: '파이널 갤릭 건',
        description: '강력한 에너지파 공격',
        damageMultiplier: 2.5,
        cooldown: 3,
        currentCooldown: 0
      }
    ],
    currentHealth: 15000,
    leaderSkill: {
      name: '신의 힘',
      description: '모든 캐릭터의 공격력과 방어력 30% 증가',
      effect: {
        attack: 1.3,
        defense: 1.3,
        health: 1.0
      }
    }
  },
  {
    id: 'char2',
    name: '슈퍼 사이어인 갓 슈퍼 사이어인 손오공',
    image: getAvatarUrl('goku-blue'),
    type: CharacterType.AGL,
    health: 14000,
    attack: 11000,
    defense: 7500,
    stats: {
      attack: 11000,
      defense: 7500,
      health: 14000,
      maxHealth: 14000,
      speed: 140
    },
    specialAbilities: [
      {
        name: '신성한 카메하메하',
        description: '강력한 기공격',
        damageMultiplier: 2.3,
        cooldown: 2,
        currentCooldown: 0
      }
    ],
    currentHealth: 14000,
    leaderSkill: {
      name: '초월자의 기운',
      description: '모든 캐릭터의 체력 20% 증가',
      effect: {
        attack: 1.0,
        defense: 1.0,
        health: 1.2
      }
    }
  },
  {
    id: 'char3',
    name: '슈퍼 사이어인 갓 슈퍼 사이어인 블루 쿠우라',
    image: getAvatarUrl('cooler-blue'),
    type: CharacterType.TEQ,
    health: 13000,
    attack: 10500,
    defense: 8500,
    stats: {
      attack: 10500,
      defense: 8500,
      health: 13000,
      maxHealth: 13000,
      speed: 125
    },
    specialAbilities: [
      {
        name: '데스 빔',
        description: '관통력이 높은 공격',
        damageMultiplier: 2.0,
        cooldown: 2,
        currentCooldown: 0
      }
    ],
    currentHealth: 13000,
    leaderSkill: {
      name: '극한의 힘',
      description: '모든 캐릭터의 방어력 40% 증가',
      effect: {
        attack: 1.0,
        defense: 1.4,
        health: 1.0
      }
    }
  }
];

export const mockTeams: Team[] = [
  {
    id: 'team1',
    type: TeamType.PLAYER,
    characters: mockCharacters,
    leader: mockCharacters[0]
  },
  {
    id: 'team2',
    type: TeamType.ENEMY,
    characters: [...mockCharacters].reverse(),
    leader: mockCharacters[2]
  }
];

export const initialBattleState: BattleState = {
  playerTeam: mockTeams[0],
  enemyTeam: mockTeams[1],
  currentTurn: 1,
  battleLog: []
}; 