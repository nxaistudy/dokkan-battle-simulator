## Dokkan Battle 캐릭터 DB 스키마 기반 전투 시뮬레이션 방법론

### **1. 시뮬레이션 개요**

Dokkan Battle의 전투는 캐릭터의 스탯(HP, ATK, DEF), 속성 상성, 링크 스킬, 리더 스킬, 슈퍼 어택, 패시브/액티브 스킬, 기 게이지 등 다양한 요소가 복합적으로 작용합니다. 실제 게임과 유사한 시뮬레이션을 위해서는 이 요소들을 반영한 공식과 처리 순서가 필요합니다.

---

### **2. 전투 시뮬레이션 주요 단계**

- **팀 구성**: 캐릭터, 리더, 프렌드, 서브 멤버, 서포트 아이템 등 선택
- **스탯 계산**: 리더/프렌드 스킬, 링크 스킬, 카테고리, 패시브 등으로 최종 스탯 산출
- **속성 상성 적용**: AGL > STR > PHY > INT > TEQ > AGL (순환), Super/Extreme 구분
- **기 게이지 및 슈퍼 어택 발동**: 기 수급, 슈퍼 어택/액티브 스킬 발동 여부 결정
- **데미지 공식 적용**: 공격/방어력, 속성, 스킬 효과, 추가 버프/디버프 반영
- **HP 감소 및 전투 종료 판정**

---

### **3. 데미지 공식 (Damage Formula)**

Dokkan Battle의 실제 데미지 공식은 공개되어 있지 않으나, 커뮤니티와 데이터마이닝을 통해 아래와 같은 근사 공식이 널리 사용됩니다.

#### **기본 데미지 공식**

$$
\text{Damage} = \left\lfloor \frac{ATK \times SA\_Multiplier}{DEF} \right\rfloor \times \text{TypeModifier} \times \text{Link/Passive/Leader Buffs}
$$

- **ATK**: 공격자의 최종 공격력 (리더/링크/패시브/카테고리 등 모든 버프 적용)
- **SA_Multiplier**: 슈퍼 어택 배수 (예: 1.5, 2.0 등)
- **DEF**: 수비자의 최종 방어력 (모든 버프/디버프 적용)
- **TypeModifier**: 속성 상성 (유리 1.5, 불리 0.5, 동일 1.0)
- **Link/Passive/Leader Buffs**: 링크 스킬, 패시브, 리더 스킬 등에서 오는 추가 배수

#### **예시 공식 (커뮤니티 표준)**

$$
\text{Damage} = \left\lfloor \frac{ATK \times SA\_Multiplier}{DEF} \right\rfloor \times \text{TypeModifier}
$$

- **ATK**: (기본 ATK + 버프) × (기 게이지에 따른 추가 배수)
- **DEF**: (기본 DEF + 버프)
- **TypeModifier**: 1.5 (유리), 1.0 (동일), 0.5 (불리)

#### **공식 적용 예시**

1. **스탯 계산**  
   - ATK = (기본 ATK + 리더/링크/패시브/카테고리 버프) × (기 게이지에 따른 추가 배수)
   - DEF = (기본 DEF + 리더/링크/패시브/카테고리 버프)

2. **슈퍼 어택 배수 적용**  
   - SA_Multiplier: 슈퍼 어택 종류에 따라 1.3~2.0 등 다양

3. **속성 상성 적용**  
   - 예: 공격자가 AGL, 수비자가 STR → TypeModifier = 1.5

4. **최종 데미지 산출**  
   - 위 공식에 따라 계산

---

### **4. 시뮬레이션 알고리즘 예시 (의사코드)**

```python
def calculate_damage(attacker, defender, ki, sa_multiplier, type_modifier, buffs):
    # 1. 최종 ATK/DEF 계산
    final_atk = attacker.base_atk * buffs['atk'] + buffs['flat_atk']
    final_def = defender.base_def * buffs['def'] + buffs['flat_def']
    
    # 2. 기 게이지에 따른 추가 배수 적용
    ki_multiplier = 1 + (ki - 12) * 0.05  # 예시: 12기 이상마다 5% 증가
    final_atk *= ki_multiplier
    
    # 3. 슈퍼 어택 배수 적용
    final_atk *= sa_multiplier
    
    # 4. 속성 상성 적용
    damage = (final_atk / final_def) * type_modifier
    
    # 5. 기타 버프/디버프 적용
    damage *= buffs['other']
    
    return int(damage)
```

---

### **5. 기타 고려 요소**

- **링크 스킬/카테고리**: N:M 관계로 여러 캐릭터가 동시에 버프를 주고받음
- **패시브/액티브 스킬**: 조건부 발동, 추가 공격/방어/회복 등
- **가드/회피/치명타**: 확률적 발동, 데미지 경감/무효화/2배 등
- **상태이상/디버프**: DEF 감소, ATK 감소 등

---

### **6. 시뮬레이션 활용 예시**

- **팀별 평균 데미지/턴별 데미지 시뮬레이션**
- **특정 보스(DEF, HP, 속성 등) 상대로의 효율 비교**
- **링크/카테고리 조합별 시너지 분석**

---

### **참고**

- 실제 게임은 다양한 예외와 특수효과(예: 무효화, 추가타, 반격 등)가 존재하므로, DB 스키마의 각 스킬/효과 필드를 활용해 조건문으로 처리해야 합니다.
- 커뮤니티에서 널리 쓰이는 데미지 공식은 위와 유사하며, 실제 게임과 100% 일치하지 않을 수 있습니다[2].

---

이 방법론과 공식을 활용하면, DB에 저장된 캐릭터 정보를 바탕으로 실제 Dokkan Battle에 가까운 전투 시뮬레이션을 구현할 수 있습니다.

출처
[1] ドラゴンボールZ ドッカンバトル - Apps on Google Play https://play.google.com/store/apps/details?id=com.bandainamcogames.dbzdokkan
[2] What are common damage formulas for games that have attack and ... https://www.reddit.com/r/gamedesign/comments/pxhx8d/what_are_common_damage_formulas_for_games_that/
[3] Totally Accurate Battle Simulator for Android/iOS - TapTap https://www.taptap.io/app/233395
[4] Rise of Kingdoms: The Mysterious Battle Formula EXPLAINED https://www.youtube.com/watch?v=repNOsEKJ-s
[5] Game Secrets ~ Combat Basics (written by kirilloid) - Travian https://blog.travian.com/ru/2023/09/game-secrets-combat-system-formulas-written-by-kirilloid/
[6] 200% Perfect Combat Simulation Helping Guide : r/DBZDokkanBattle https://www.reddit.com/r/DBZDokkanBattle/comments/kv990b/200_perfect_combat_simulation_helping_guide/
[7] 1 TURN NUKE! 200% Perfect! Combat Simulation! Round 1 (Global) https://www.youtube.com/watch?v=Jp-cR7vT7Uk
[8] THE BEST WAYS TO FARM KAIS AND LEVEL UP SUPER ATTACK ... https://www.youtube.com/watch?v=arePHNTT1Wg
[9] NEW DATING SIMULATION MODE??? DOKKYUN BATTLE Dragon ... https://www.youtube.com/watch?v=EBZ1tcZsZ_I
[10] BE SMART!!!! 10TH ANNIVERSARY MASTER IT! THE DREAM ... https://www.youtube.com/watch?v=XnC9Dvo0DfY
[11] Combat system design: how a game designer can calculate the basics https://app2top.com/game_design/combat-system-design-how-a-game-designer-can-calculate-the-basics-264500.html
[12] Fun Battle Simulator - Apps on Google Play https://play.google.com/store/apps/details?id=com.issetstudio.fun.battle.simulator
[13] Mathematical Formulas for Game Battle Calculations https://math.stackexchange.com/questions/1169281/mathematical-formulas-for-game-battle-calculations
[14] A good battle simulator : r/RealTimeStrategy - Reddit https://www.reddit.com/r/RealTimeStrategy/comments/1f7hvwv/a_good_battle_simulator/
[15] What is battle formula of strategy game? [closed] - Stack Overflow https://stackoverflow.com/questions/15823786/what-is-battle-formula-of-strategy-game
[16] 6 Battle Simulator Games On Mobile Android iOS #2 - YouTube https://www.youtube.com/watch?v=YvEDXZBPtKo
[17] Browser RPG fight calculation formula https://gamedev.stackexchange.com/questions/154920/browser-rpg-fight-calculation-formula
[18] How to play DRAGON BALL Z DOKKAN BATTLE on PC with MuMu ... https://www.mumuplayer.com/blog/play-dragon-ball-z-dokkan-battle-on-pc.html
[19] Battle Simulator: Warfare, Launches on Mobile - PlaySide Studios https://www.playsidestudios.com/news/battle-simulator-warfare-launches-on-mobile
[20] Battle Fight Simulation - Apps on Google Play https://play.google.com/store/apps/details?id=com.sd.battlefight
