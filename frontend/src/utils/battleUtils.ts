import { Character, CharacterType, Team } from '../types/character';

// 타입 상성 계산
export const calculateTypeAdvantage = (attackerType: CharacterType, defenderType: CharacterType): number => {
  const typeAdvantageMap: Record<CharacterType, CharacterType> = {
    [CharacterType.STR]: CharacterType.PHY,
    [CharacterType.PHY]: CharacterType.INT,
    [CharacterType.INT]: CharacterType.TEQ,
    [CharacterType.TEQ]: CharacterType.AGL,
    [CharacterType.AGL]: CharacterType.STR
  };

  if (attackerType === defenderType) return 1.0;
  if (typeAdvantageMap[attackerType] === defenderType) return 1.5;
  return 0.5;
};

// 데미지 계산
export const calculateDamage = (
  attacker: Character,
  defender: Character,
  specialAbility?: { damageMultiplier: number }
): number => {
  const typeAdvantage = calculateTypeAdvantage(attacker.type, defender.type);
  
  // 기본 공격력 계산
  let baseAttack = attacker.stats.attack;
  
  // 리더 스킬 적용
  if (attacker.leaderSkill) {
    const leaderBoost = attacker.leaderSkill.effect.attackBoost;
    baseAttack *= leaderBoost;
  }
  
  // 패시브 스킬 적용
  if (attacker.passiveSkill) {
    const passiveBoost = attacker.passiveSkill.effect.attackBoost;
    baseAttack *= passiveBoost;
  }
  
  // 스페셜 어빌리티 배수 적용
  const saMultiplier = specialAbility ? specialAbility.damageMultiplier : 1.0;
  
  // 방어력 계산
  let defense = defender.stats.defense;
  
  // 방어력 버프 적용
  if (defender.leaderSkill) {
    const leaderDefenseBoost = defender.leaderSkill.effect.defenseBoost;
    defense *= leaderDefenseBoost;
  }
  
  if (defender.passiveSkill) {
    const passiveDefenseBoost = defender.passiveSkill.effect.defenseBoost;
    defense *= passiveDefenseBoost;
  }
  
  // 최종 데미지 계산
  const damage = Math.floor((baseAttack * saMultiplier) / defense) * typeAdvantage;
  
  return Math.max(1, damage); // 최소 데미지는 1
};

// HP 감소 및 사망 체크
export const applyDamage = (character: Character, damage: number): Character => {
  const newHealth = Math.max(0, character.currentHealth - damage);
  return {
    ...character,
    currentHealth: newHealth
  };
};

// 팀 상태 업데이트
export const updateTeamHealth = (team: Team, updatedCharacter: Character): Team => {
  const updatedCharacters = team.characters.map(char => 
    char.id === updatedCharacter.id ? updatedCharacter : char
  );
  
  return {
    ...team,
    characters: updatedCharacters,
    leader: team.leader.id === updatedCharacter.id ? updatedCharacter : team.leader
  };
};

// 전투 가능 여부 체크
export const isBattleOver = (playerTeam: Team, enemyTeam: Team): boolean => {
  const playerAlive = playerTeam.characters.some(char => char.currentHealth > 0);
  const enemyAlive = enemyTeam.characters.some(char => char.currentHealth > 0);
  
  return !playerAlive || !enemyAlive;
};

// 승리 팀 확인
export const getWinningTeam = (playerTeam: Team, enemyTeam: Team): Team | null => {
  const playerAlive = playerTeam.characters.some(char => char.currentHealth > 0);
  const enemyAlive = enemyTeam.characters.some(char => char.currentHealth > 0);
  
  if (!playerAlive) return enemyTeam;
  if (!enemyAlive) return playerTeam;
  return null;
}; 