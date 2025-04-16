## 드래곤볼Z Dokkan Battle 캐릭터 DB 스키마 설계

드래곤볼Z Dokkan Battle의 캐릭터 데이터베이스를 구축하려면, 게임 내 캐릭터의 주요 속성과 시스템 구조를 반영해야 합니다. 실제로 Dokkan Battle 관련 오픈 API와 커뮤니티 DB, 위키 등에서 참고할 수 있는 필드와 구조를 기반으로, 실전에서 활용 가능한 RDBMS(예: MySQL, PostgreSQL) 기준의 스키마 예시를 아래와 같이 제안합니다[1][3][4].

---

### **1. 캐릭터 테이블 (characters)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 캐릭터 고유 ID              |
| name                | VARCHAR       | 캐릭터 이름                 |
| title               | VARCHAR       | 캐릭터 부제/타이틀          |
| rarity              | ENUM          | 희귀도 (N, R, SR, SSR, UR, LR 등) |
| type                | ENUM          | 속성 (AGL, TEQ, INT, STR, PHY) |
| class               | ENUM          | 클래스 (Super, Extreme)     |
| cost                | INT           | 팀 편성 시 소모 코스트      |
| max_level           | INT           | 최대 레벨                   |
| hp                  | INT           | 최대 HP                     |
| atk                 | INT           | 최대 ATK                    |
| def                 | INT           | 최대 DEF                    |
| ki_multiplier       | FLOAT         | 기 게이지 배수              |
| leader_skill        | TEXT          | 리더 스킬                   |
| super_attack        | TEXT          | 슈퍼 어택 설명              |
| passive_skill       | TEXT          | 패시브 스킬 설명            |
| active_skill        | TEXT          | 액티브 스킬 설명 (있을 경우)|
| transformation      | TEXT          | 변신 조건 및 설명           |
| eza                 | BOOLEAN       | 극한 Z각성(EZA) 여부        |
| release_date        | DATE          | 출시일                      |
| image_url           | VARCHAR       | 카드 이미지 URL             |

---

### **2. 링크 스킬 테이블 (link_skills)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 링크 스킬 고유 ID           |
| name                | VARCHAR       | 링크 스킬명                 |
| description         | TEXT          | 효과 설명                   |

---

### **3. 캐릭터-링크스킬 매핑 (character_link_skills)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| character_id        | INT (FK)      | 캐릭터 ID                   |
| link_skill_id       | INT (FK)      | 링크 스킬 ID                |
| level_1_effect      | TEXT          | Lv1 효과                    |
| level_10_effect     | TEXT          | Lv10 효과                   |

---

### **4. 카테고리 테이블 (categories)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 카테고리 고유 ID            |
| name                | VARCHAR       | 카테고리명                  |

---

### **5. 캐릭터-카테고리 매핑 (character_categories)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| character_id        | INT (FK)      | 캐릭터 ID                   |
| category_id         | INT (FK)      | 카테고리 ID                 |

---

### **6. 각성/변신 테이블 (awakenings, transformations)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 각성/변신 고유 ID           |
| character_id        | INT (FK)      | 캐릭터 ID                   |
| type                | ENUM          | 'Awakening', 'Transformation'|
| condition           | TEXT          | 조건                        |
| result_character_id | INT (FK)      | 각성/변신 후 캐릭터 ID      |

---

### **7. 슈퍼 어택 테이블 (super_attacks)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 슈퍼 어택 고유 ID           |
| character_id        | INT (FK)      | 캐릭터 ID                   |
| name                | VARCHAR       | 슈퍼 어택명                 |
| description         | TEXT          | 효과 설명                   |

---

### **8. 획득 정보 테이블 (acquirements)**

| 필드명              | 타입           | 설명                        |
|---------------------|---------------|-----------------------------|
| id                  | INT (PK)      | 고유 ID                     |
| character_id        | INT (FK)      | 캐릭터 ID                   |
| method              | VARCHAR       | 획득 방법 (드랍, 소환, 상점 등) |
| detail              | TEXT          | 상세 설명                   |

---

## **스키마 설계 요약**

- **캐릭터의 기본 정보, 스탯, 스킬, 각성/변신, 링크스킬, 카테고리, 슈퍼어택, 획득 경로** 등 게임 내 주요 정보를 모두 구조화할 수 있습니다.
- **N:M 관계**(예: 캐릭터-카테고리, 캐릭터-링크스킬)는 별도 매핑 테이블로 관리합니다.
- **확장성**: 신규 시스템(예: 히든 포텐셜, 서포트 메모리 등)도 별도 테이블로 추가 가능.

---

## **참고**

- 실제 데이터 예시는 Dokkan.fyi, DokkanAPI, Dokkan 위키 등에서 참고할 수 있습니다[1][3][4].
- JSON 기반 API나 NoSQL로도 충분히 구현 가능하나, 관계형 DB가 검색/필터링에 유리합니다.

---

이 스키마를 기반으로 Dokkan Battle 캐릭터 도감, 검색, 필터, 상세 페이지 등 다양한 기능을 효율적으로 구현할 수 있습니다.

출처
[1] I made another character database. I know, I'm so sorry. (Dokkan.fyi) https://www.reddit.com/r/DBZDokkanBattle/comments/pdkan9/i_made_another_character_database_i_know_im_so/
[2] Dragon Ball Z Dokkan Battle Tier List: best cards and characters https://en.androidguias.com/dragon-ball-dokkan-battle-tier-list/
[3] MNprojects/DokkanAPI - GitHub https://github.com/MNprojects/DokkanAPI
[4] Dragon Ball Z Dokkan Battle Database | DOKKAN.FYI https://dokkan.fyi
[5] dragonball-character-database/client/db.json at master - GitHub https://github.com/andrewbaisden/dragonball-character-database/blob/master/client/db.json
[6] Dokkan Battle Characters https://dokkan.fyi/characters
[7] HOW TO NAVIGATE THE NEW CHARACTER MENU + ... - YouTube https://www.youtube.com/watch?v=9y6qkH5n0R4
[8] How to Get HD Assets! | Dragon Ball Z Dokkan Battle - YouTube https://www.youtube.com/watch?v=7gN3Gum1Y1Y
[9] FULL BREAKDOWN FOR EZA LR GOKU + 18 CHARACTER DATA ... https://www.youtube.com/watch?v=bnN4N7yy0IM
[10] Mobile - Dragon Ball Z Dokkan Battle - The Spriters Resource https://www.spriters-resource.com/mobile/dragonballzdokkanbattle/
[11] Anyone remember how to sort character list with AGL first? https://gamefaqs.gamespot.com/boards/178921-dragon-ball-z-dokkan-battle/78071261?page=1
[12] GLOBAL DATA DOWNLOAD! ATTRIBUTE TYPE EZA ... - YouTube https://www.youtube.com/watch?v=7GNSdtPchxg
