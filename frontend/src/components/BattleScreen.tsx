import React, { useState, useEffect, useRef } from 'react';
import { Character, Team, BattleState, BattleAction, CharacterType } from '../types/character';
import { simulateBattleTurn } from '../utils/battleLogic';

interface BattleScreenProps {
  playerTeam: Team;
  enemyTeam: Team;
  onReset: () => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ playerTeam, enemyTeam, onReset }) => {
  const [battleState, setBattleState] = useState<BattleState>({
    playerTeam,
    enemyTeam,
    currentTurn: 1,
    battleLog: []
  });
  const [selectedAttacker, setSelectedAttacker] = useState<Character | null>(null);
  const [selectedDefender, setSelectedDefender] = useState<Character | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<number | null>(null);
  const [isAutoBattle, setIsAutoBattle] = useState(false);
  const [battleLog, setBattleLog] = useState<{ text: string; isNew: boolean }[]>([]);
  const [isBattleEnded, setIsBattleEnded] = useState(false);
  const [isAutoBattlePaused, setIsAutoBattlePaused] = useState(false);
  const autoBattleRef = useRef<boolean>(false);
  const pauseRef = useRef<boolean>(false);

  const addLogMessage = (message: string) => {
    setBattleLog(prev => [...prev, { text: message, isNew: true }]);
    // 애니메이션 효과를 위해 isNew 플래그를 잠시 후 제거
    setTimeout(() => {
      setBattleLog(prev => 
        prev.map((log, i) => 
          i === prev.length - 1 ? { ...log, isNew: false } : log
        )
      );
    }, 500);
  };

  useEffect(() => {
    const initialMessages = [
      "전투가 시작되었습니다!",
      `플레이어 팀 리더: ${playerTeam.leader.name}`,
      `적 팀 리더: ${enemyTeam.leader.name}`,
      "-------------------",
      "공격할 캐릭터를 선택하세요."
    ];

    // 각 메시지를 0.5초 간격으로 순차적으로 추가
    initialMessages.forEach((message, index) => {
      setTimeout(() => {
        addLogMessage(message);
      }, index * 500);
    });
  }, [playerTeam, enemyTeam]);

  const handleCharacterSelect = (character: Character, isAttacker: boolean) => {
    if (isAttacker) {
      setSelectedAttacker(character);
      addLogMessage(`${character.name}이(가) 공격을 준비합니다.`);
    } else {
      setSelectedDefender(character);
      addLogMessage(`${character.name}이(가) 대상으로 선택되었습니다.`);
    }
  };

  const calculateDamage = (attacker: Character, defender: Character, multiplier: number = 1) => {
    // 기본 데미지 계산 공식
    const attackPower = attacker.attack || 0;  // 기본값 설정
    const defensePower = defender.defense || 1; // 0으로 나누기 방지
    const baseDamage = Math.floor((attackPower * multiplier) / defensePower);
    
    // 타입 상성 적용
    const typeModifier = getTypeModifier(attacker.type, defender.type);
    
    // 최종 데미지 계산 (최소 1)
    const finalDamage = Math.max(1, Math.floor(baseDamage * typeModifier));
    
    // 콘솔에 계산 과정 출력 (디버깅용)
    console.log('Damage Calculation:', {
      attacker: attacker.name,
      attackPower,
      defender: defender.name,
      defensePower,
      multiplier,
      baseDamage,
      typeModifier,
      finalDamage
    });

    return finalDamage;
  };

  const getTypeModifier = (attackerType: CharacterType, defenderType: CharacterType) => {
    // 타입 상성: STR > AGL > TEQ > INT > PHY > STR
    const typeOrder = [CharacterType.STR, CharacterType.AGL, CharacterType.TEQ, CharacterType.INT, CharacterType.PHY];
    const attackerIndex = typeOrder.indexOf(attackerType);
    const defenderIndex = typeOrder.indexOf(defenderType);
    
    if (attackerIndex === defenderIndex) return 1.0;
    if ((attackerIndex + 1) % 5 === defenderIndex) return 1.5;
    if ((defenderIndex + 1) % 5 === attackerIndex) return 0.5;
    return 1.0;
  };

  const handleAttack = () => {
    if (!selectedAttacker || !selectedDefender) return;

    const damage = calculateDamage(selectedAttacker, selectedDefender);
    
    // 데미지 적용
    const updatedEnemyTeam = {
      ...battleState.enemyTeam,
      characters: battleState.enemyTeam.characters.map(char => 
        char.id === selectedDefender.id 
          ? { ...char, health: Math.max(0, char.health - damage) }
          : char
      )
    };

    // 전투 상태 업데이트
    setBattleState(prev => ({
      ...prev,
      enemyTeam: updatedEnemyTeam,
      currentTurn: prev.currentTurn + 1
    }));

    // 전투 로그 추가
    addLogMessage(`${selectedAttacker.name}이(가) ${selectedDefender.name}에게 ${damage}의 데미지를 입혔습니다.`);
    
    resetSelection();
  };

  const handleSpecialAbility = (abilityIndex: number) => {
    if (!selectedAttacker || !selectedDefender) return;

    const ability = selectedAttacker.specialAbilities[abilityIndex];
    const damage = calculateDamage(selectedAttacker, selectedDefender, ability.damageMultiplier || 1.5);
    
    // 데미지 적용
    const updatedEnemyTeam = {
      ...battleState.enemyTeam,
      characters: battleState.enemyTeam.characters.map(char => 
        char.id === selectedDefender.id 
          ? { ...char, health: Math.max(0, char.health - damage) }
          : char
      )
    };

    // 전투 상태 업데이트
    setBattleState(prev => ({
      ...prev,
      enemyTeam: updatedEnemyTeam,
      currentTurn: prev.currentTurn + 1
    }));

    // 전투 로그 추가
    addLogMessage(`${selectedAttacker.name}이(가) ${ability.name}을(를) 사용하여 ${selectedDefender.name}에게 ${damage}의 데미지를 입혔습니다.`);
    
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedAttacker(null);
    setSelectedDefender(null);
    setSelectedAbility(null);
  };

  // 자동 전투 시작
  const startAutoBattle = async () => {
    setIsAutoBattle(true);
    autoBattleRef.current = true;
    pauseRef.current = false;
    addLogMessage("자동 전투가 시작됩니다!");
    await delay(1000);

    while (autoBattleRef.current && !isBattleEnded) {
      if (pauseRef.current) {
        await delay(100); // 일시정지 상태에서는 0.1초마다 체크
        continue;
      }
      
      // 플레이어 턴
      for (const attacker of battleState.playerTeam.characters) {
        if (attacker.currentHealth <= 0) continue;

        // 공격 대상 랜덤 선택
        const availableTargets = battleState.enemyTeam.characters.filter(c => c.currentHealth > 0);
        if (availableTargets.length === 0) {
          setIsBattleEnded(true);
          addLogMessage("플레이어 팀이 승리했습니다!");
          return;
        }

        const defender = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        
        // 공격자 선택 로그
        addLogMessage(`${attacker.name}이(가) 행동을 준비합니다.`);
        await delay(1000);

        // 대상 선택 로그
        addLogMessage(`${defender.name}을(를) 목표로 지정했습니다.`);
        await delay(1000);

        // 특수 능력 사용 여부 랜덤 결정
        const useSpecialAbility = Math.random() > 0.7 && 
          attacker.specialAbilities.some(ability => ability.currentCooldown === 0);

        if (useSpecialAbility) {
          const availableAbilities = attacker.specialAbilities.filter(a => a.currentCooldown === 0);
          const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
          
          // 특수 능력 사용
          const damage = calculateDamage(attacker, defender, ability.damageMultiplier);
          addLogMessage(`${attacker.name}이(가) ${ability.name}을(를) 사용합니다!`);
          await delay(1000);
          
          // 데미지 적용
          updateCharacterHealth(defender, damage);
          addLogMessage(`${defender.name}에게 ${damage}의 데미지를 입혔습니다!`);
          await delay(1000);
          
          // 쿨다운 적용
          updateAbilityCooldown(attacker, ability);
        } else {
          // 기본 공격
          const damage = calculateDamage(attacker, defender);
          addLogMessage(`${attacker.name}이(가) 기본 공격을 시도합니다.`);
          await delay(1000);
          
          // 데미지 적용
          updateCharacterHealth(defender, damage);
          addLogMessage(`${defender.name}에게 ${damage}의 데미지를 입혔습니다!`);
          await delay(1000);
        }

        // 전투 결과 확인
        if (defender.currentHealth <= 0) {
          addLogMessage(`${defender.name}이(가) 쓰러졌습니다!`);
          await delay(1000);
        }
      }

      // 적 턴
      for (const attacker of battleState.enemyTeam.characters) {
        if (attacker.currentHealth <= 0) continue;

        // 공격 대상 랜덤 선택
        const availableTargets = battleState.playerTeam.characters.filter(c => c.currentHealth > 0);
        if (availableTargets.length === 0) {
          setIsBattleEnded(true);
          addLogMessage("적 팀이 승리했습니다!");
          return;
        }

        const defender = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        
        // 공격자 선택 로그
        addLogMessage(`${attacker.name}이(가) 행동을 준비합니다.`);
        await delay(1000);

        // 대상 선택 로그
        addLogMessage(`${defender.name}을(를) 목표로 지정했습니다.`);
        await delay(1000);

        // 특수 능력 사용 여부 랜덤 결정
        const useSpecialAbility = Math.random() > 0.7 && 
          attacker.specialAbilities.some(ability => ability.currentCooldown === 0);

        if (useSpecialAbility) {
          const availableAbilities = attacker.specialAbilities.filter(a => a.currentCooldown === 0);
          const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
          
          // 특수 능력 사용
          const damage = calculateDamage(attacker, defender, ability.damageMultiplier);
          addLogMessage(`${attacker.name}이(가) ${ability.name}을(를) 사용합니다!`);
          await delay(1000);
          
          // 데미지 적용
          updateCharacterHealth(defender, damage);
          addLogMessage(`${defender.name}에게 ${damage}의 데미지를 입혔습니다!`);
          await delay(1000);
          
          // 쿨다운 적용
          updateAbilityCooldown(attacker, ability);
        } else {
          // 기본 공격
          const damage = calculateDamage(attacker, defender);
          addLogMessage(`${attacker.name}이(가) 기본 공격을 시도합니다.`);
          await delay(1000);
          
          // 데미지 적용
          updateCharacterHealth(defender, damage);
          addLogMessage(`${defender.name}에게 ${damage}의 데미지를 입혔습니다!`);
          await delay(1000);
        }

        // 전투 결과 확인
        if (defender.currentHealth <= 0) {
          addLogMessage(`${defender.name}이(가) 쓰러졌습니다!`);
          await delay(1000);
        }
      }

      // 턴 종료
      setBattleState(prev => ({
        ...prev,
        currentTurn: prev.currentTurn + 1
      }));
      addLogMessage(`${battleState.currentTurn}턴이 종료되었습니다.`);
      await delay(1000);

      // 쿨다운 감소
      updateAllCooldowns();
    }
  };

  const toggleAutoBattlePause = () => {
    const newPauseState = !isAutoBattlePaused;
    setIsAutoBattlePaused(newPauseState);
    pauseRef.current = newPauseState;
    addLogMessage(newPauseState ? "자동 전투가 일시정지되었습니다." : "자동 전투가 재개되었습니다.");
  };

  const stopAutoBattle = () => {
    autoBattleRef.current = false;
    setIsAutoBattle(false);
    setIsAutoBattlePaused(false);
    pauseRef.current = false;
    addLogMessage("자동 전투가 중지되었습니다.");
  };

  // 딜레이 함수
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 캐릭터 체력 업데이트
  const updateCharacterHealth = (character: Character, damage: number) => {
    character.currentHealth = Math.max(0, character.currentHealth - damage);
    setBattleState(prev => ({
      ...prev,
      playerTeam: {
        ...prev.playerTeam,
        characters: prev.playerTeam.characters.map(c => 
          c.id === character.id ? { ...c, currentHealth: character.currentHealth } : c
        )
      },
      enemyTeam: {
        ...prev.enemyTeam,
        characters: prev.enemyTeam.characters.map(c => 
          c.id === character.id ? { ...c, currentHealth: character.currentHealth } : c
        )
      }
    }));
  };

  // 쿨다운 업데이트
  const updateAbilityCooldown = (character: Character, ability: any) => {
    ability.currentCooldown = ability.cooldown;
    setBattleState(prev => ({
      ...prev,
      playerTeam: {
        ...prev.playerTeam,
        characters: prev.playerTeam.characters.map(c => 
          c.id === character.id ? { 
            ...c, 
            specialAbilities: c.specialAbilities.map(a => 
              a.name === ability.name ? { ...a, currentCooldown: ability.cooldown } : a
            )
          } : c
        )
      },
      enemyTeam: {
        ...prev.enemyTeam,
        characters: prev.enemyTeam.characters.map(c => 
          c.id === character.id ? { 
            ...c, 
            specialAbilities: c.specialAbilities.map(a => 
              a.name === ability.name ? { ...a, currentCooldown: ability.cooldown } : a
            )
          } : c
        )
      }
    }));
  };

  // 모든 캐릭터의 쿨다운 감소
  const updateAllCooldowns = () => {
    setBattleState(prev => ({
      ...prev,
      playerTeam: {
        ...prev.playerTeam,
        characters: prev.playerTeam.characters.map(c => ({
          ...c,
          specialAbilities: c.specialAbilities.map(a => ({
            ...a,
            currentCooldown: Math.max(0, a.currentCooldown - 1)
          }))
        }))
      },
      enemyTeam: {
        ...prev.enemyTeam,
        characters: prev.enemyTeam.characters.map(c => ({
          ...c,
          specialAbilities: c.specialAbilities.map(a => ({
            ...a,
            currentCooldown: Math.max(0, a.currentCooldown - 1)
          }))
        }))
      }
    }));
  };

  return (
    <div className="battle-screen">
      <div className="teams">
        <div className="player-team">
          <h2>플레이어 팀</h2>
          {battleState.playerTeam.characters.map((character, index) => (
            <div 
              key={index} 
              className={`character-card ${character.currentHealth <= 0 ? 'defeated' : ''}`}
            >
              <h3>{character.name}</h3>
              <p>타입: {character.type}</p>
              <p>HP: {character.currentHealth}/{character.health}</p>
              <p>공격력: {character.attack}</p>
              <p>방어력: {character.defense}</p>
              <div className="abilities">
                {character.specialAbilities.map((ability, i) => (
                  <div key={i} className="ability">
                    {ability.name}
                    {ability.currentCooldown > 0 && ` (${ability.currentCooldown}턴)`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="enemy-team">
          <h2>적 팀</h2>
          {battleState.enemyTeam.characters.map((character, index) => (
            <div 
              key={index} 
              className={`character-card ${character.currentHealth <= 0 ? 'defeated' : ''}`}
            >
              <h3>{character.name}</h3>
              <p>타입: {character.type}</p>
              <p>HP: {character.currentHealth}/{character.health}</p>
              <p>공격력: {character.attack}</p>
              <p>방어력: {character.defense}</p>
              <div className="abilities">
                {character.specialAbilities.map((ability, i) => (
                  <div key={i} className="ability">
                    {ability.name}
                    {ability.currentCooldown > 0 && ` (${ability.currentCooldown}턴)`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="battle-controls">
        {!isAutoBattle && !isBattleEnded && (
          <button onClick={startAutoBattle} className="auto-battle-button">
            자동 전투 시작
          </button>
        )}
        {isAutoBattle && !isBattleEnded && (
          <>
            <button onClick={toggleAutoBattlePause} className={`pause-button ${isAutoBattlePaused ? 'paused' : ''}`}>
              {isAutoBattlePaused ? '자동 전투 재개' : '자동 전투 일시정지'}
            </button>
            <button onClick={stopAutoBattle} className="stop-button">
              자동 전투 중지
            </button>
          </>
        )}
        <button onClick={onReset} className="reset-button">
          다시 시작
        </button>
      </div>

      <div className="battle-log">
        <h3>전투 로그</h3>
        <div className="log-content">
          {battleLog.map((log, index) => (
            <p 
              key={index} 
              className={`log-message ${log.isNew ? 'new-message' : ''}`}
            >
              {log.text}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        .battle-screen {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background-color: #1a1a1a;
          color: #ffffff;
          min-height: 100vh;
        }

        .teams {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .player-team, .enemy-team {
          flex: 1;
        }

        .character-card {
          border: 2px solid #444;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          background-color: #2a2a2a;
          color: #ffffff;
          transition: all 0.3s;
        }

        .character-card.defeated {
          opacity: 0.5;
          border-color: #ff4444;
        }

        .abilities {
          margin-top: 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .ability {
          background-color: #444;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .battle-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 20px 0;
        }

        .auto-battle-button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .auto-battle-button:hover {
          background-color: #45a049;
          transform: translateY(-2px);
        }

        .battle-log {
          margin-top: 20px;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 15px;
          max-height: 300px;
          overflow-y: auto;
          background-color: #2a2a2a;
        }

        .log-content {
          font-family: monospace;
          line-height: 1.5;
        }

        .log-message {
          margin: 5px 0;
          padding: 5px;
          border-bottom: 1px solid #444;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.5s ease forwards;
        }

        .log-message.new-message {
          animation: slideIn 0.5s ease forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        h2, h3 {
          color: #ffffff;
          margin-bottom: 15px;
        }

        p {
          color: #ffffff;
          margin: 5px 0;
        }

        .reset-button {
          padding: 10px 20px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background-color: #d32f2f;
          transform: translateY(-2px);
        }

        .pause-button {
          padding: 10px 20px;
          background-color: #ff9800;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pause-button:hover {
          background-color: #f57c00;
          transform: translateY(-2px);
        }

        .pause-button.paused {
          background-color: #2196F3;
        }

        .pause-button.paused:hover {
          background-color: #1976D2;
        }

        .stop-button {
          padding: 10px 20px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stop-button:hover {
          background-color: #d32f2f;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default BattleScreen; 