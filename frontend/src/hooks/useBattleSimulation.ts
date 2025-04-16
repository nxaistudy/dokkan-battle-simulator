import { useState } from 'react';
import { Character } from '../types/character';
import { BattleResult } from '../types/battle';

const calculateDamage = (attacker: Character, defender: Character, isSpecialAbility: boolean = false, abilityMultiplier: number = 1): number => {
  const baseDamage = attacker.stats.attack - defender.stats.defense;
  const damage = Math.max(1, Math.floor(baseDamage * abilityMultiplier));
  return damage;
};

const useBattleSimulation = () => {
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateBattle = (player: Character, opponent: Character): BattleResult => {
    setIsSimulating(true);
    const battleLog: string[] = [];
    let currentPlayer = { ...player };
    let currentOpponent = { ...opponent };
    let turns = 0;

    while (currentPlayer.currentHealth > 0 && currentOpponent.currentHealth > 0) {
      turns++;
      
      // 플레이어의 턴
      const playerAction = performAction(currentPlayer, currentOpponent);
      currentOpponent.currentHealth = Math.max(0, currentOpponent.currentHealth - playerAction.damage);
      battleLog.push(playerAction.message);

      if (currentOpponent.currentHealth <= 0) break;

      // 상대의 턴
      const opponentAction = performAction(currentOpponent, currentPlayer);
      currentPlayer.currentHealth = Math.max(0, currentPlayer.currentHealth - opponentAction.damage);
      battleLog.push(opponentAction.message);
    }

    const winner = currentPlayer.currentHealth > 0 ? player : opponent;
    const loser = currentPlayer.currentHealth > 0 ? opponent : player;

    battleLog.push(`\n전투 종료! ${winner.name}의 승리!`);
    battleLog.push(`총 ${turns}턴 소요`);

    setIsSimulating(false);
    return {
      winner,
      loser,
      battleLog,
      turns
    };
  };

  const performAction = (attacker: Character, defender: Character) => {
    // 특수 능력 사용 여부 결정 (30% 확률)
    const useSpecialAbility = Math.random() < 0.3;
    let ability = null;

    if (useSpecialAbility) {
      // 사용 가능한 특수 능력 중 하나 선택
      const availableAbilities = attacker.specialAbilities.filter(ability => ability.currentCooldown === 0);
      if (availableAbilities.length > 0) {
        ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
        ability.currentCooldown = ability.cooldown;
      }
    }

    const damage = calculateDamage(
      attacker,
      defender,
      !!ability,
      ability?.damageMultiplier || 1
    );

    const message = ability
      ? `${attacker.name}의 ${ability.name}! ${defender.name}에게 ${damage}의 데미지를 입혔습니다!`
      : `${attacker.name}의 공격! ${defender.name}에게 ${damage}의 데미지를 입혔습니다!`;

    return {
      attacker,
      defender,
      damage,
      isSpecialAbility: !!ability,
      abilityName: ability?.name,
      message
    };
  };

  return {
    isSimulating,
    simulateBattle
  };
};

export default useBattleSimulation; 