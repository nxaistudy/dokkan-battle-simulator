import { Character, Team, BattleState } from '../types/character';
import {
  calculateDamage,
  applyDamage,
  updateTeamHealth,
  isBattleOver,
  getWinningTeam
} from './battleUtils';

export interface BattleAction {
  type: 'ATTACK' | 'SPECIAL_ABILITY';
  attacker: Character;
  defender: Character;
  specialAbilityIndex?: number;
}

export interface BattleResult {
  damage: number;
  newAttacker: Character;
  newDefender: Character;
  logMessage: string;
}

export const executeBattleAction = (
  action: BattleAction,
  playerTeam: Team,
  enemyTeam: Team
): { playerTeam: Team; enemyTeam: Team; battleLog: string[] } => {
  const { attacker, defender, type, specialAbilityIndex } = action;
  const specialAbility = specialAbilityIndex !== undefined ? 
    attacker.specialAbilities[specialAbilityIndex] : undefined;
  
  // 데미지 계산
  const damage = calculateDamage(attacker, defender, specialAbility);
  
  // 데미지 적용
  const newDefender = applyDamage(defender, damage);
  
  // 팀 상태 업데이트
  const isPlayerAttacker = playerTeam.characters.some(char => char.id === attacker.id);
  const updatedPlayerTeam = isPlayerAttacker ? 
    playerTeam : updateTeamHealth(playerTeam, newDefender);
  const updatedEnemyTeam = isPlayerAttacker ? 
    updateTeamHealth(enemyTeam, newDefender) : enemyTeam;
  
  // 전투 로그 생성
  const abilityName = specialAbility ? specialAbility.name : '기본 공격';
  const logMessage = `${attacker.name}의 ${abilityName}로 ${defender.name}에게 ${damage}의 데미지를 입혔습니다!`;
  
  return {
    playerTeam: updatedPlayerTeam,
    enemyTeam: updatedEnemyTeam,
    battleLog: [logMessage]
  };
};

export const simulateBattleTurn = (
  battleState: BattleState,
  playerAction: BattleAction
): BattleState => {
  const { playerTeam, enemyTeam, currentTurn, battleLog } = battleState;
  
  // 플레이어 턴 실행
  const playerTurnResult = executeBattleAction(
    playerAction,
    playerTeam,
    enemyTeam
  );
  
  // 전투 종료 체크
  if (isBattleOver(playerTurnResult.playerTeam, playerTurnResult.enemyTeam)) {
    const winningTeam = getWinningTeam(playerTurnResult.playerTeam, playerTurnResult.enemyTeam);
    const victoryMessage = winningTeam?.type === 'PLAYER' ? 
      '플레이어 팀의 승리!' : '적 팀의 승리!';
    
    return {
      ...battleState,
      playerTeam: playerTurnResult.playerTeam,
      enemyTeam: playerTurnResult.enemyTeam,
      battleLog: [...battleLog, ...playerTurnResult.battleLog, victoryMessage]
    };
  }
  
  // 적 AI 턴 (가장 HP가 높은 캐릭터를 공격)
  const enemyTeamAlive = playerTurnResult.enemyTeam.characters.filter(char => char.currentHealth > 0);
  const playerTeamAlive = playerTurnResult.playerTeam.characters.filter(char => char.currentHealth > 0);
  
  if (enemyTeamAlive.length > 0 && playerTeamAlive.length > 0) {
    const enemyAttacker = enemyTeamAlive[0]; // 간단한 AI: 첫 번째 살아있는 캐릭터
    const playerDefender = playerTeamAlive[0]; // 간단한 AI: 첫 번째 살아있는 캐릭터
    
    const enemyAction: BattleAction = {
      type: 'ATTACK',
      attacker: enemyAttacker,
      defender: playerDefender
    };
    
    const enemyTurnResult = executeBattleAction(
      enemyAction,
      playerTurnResult.playerTeam,
      playerTurnResult.enemyTeam
    );
    
    // 전투 종료 체크
    if (isBattleOver(enemyTurnResult.playerTeam, enemyTurnResult.enemyTeam)) {
      const winningTeam = getWinningTeam(enemyTurnResult.playerTeam, enemyTurnResult.enemyTeam);
      const victoryMessage = winningTeam?.type === 'PLAYER' ? 
        '플레이어 팀의 승리!' : '적 팀의 승리!';
      
      return {
        ...battleState,
        playerTeam: enemyTurnResult.playerTeam,
        enemyTeam: enemyTurnResult.enemyTeam,
        currentTurn: currentTurn + 1,
        battleLog: [...battleLog, ...playerTurnResult.battleLog, ...enemyTurnResult.battleLog, victoryMessage]
      };
    }
    
    return {
      ...battleState,
      playerTeam: enemyTurnResult.playerTeam,
      enemyTeam: enemyTurnResult.enemyTeam,
      currentTurn: currentTurn + 1,
      battleLog: [...battleLog, ...playerTurnResult.battleLog, ...enemyTurnResult.battleLog]
    };
  }
  
  return {
    ...battleState,
    playerTeam: playerTurnResult.playerTeam,
    enemyTeam: playerTurnResult.enemyTeam,
    currentTurn: currentTurn + 1,
    battleLog: [...battleLog, ...playerTurnResult.battleLog]
  };
}; 