---
title: 모노레포 배포 워크플로우 개선기 TypeScript 마이그레이션 실패에서 배운 교훈
date: "2025-06-19"
tags: ["vue", "typescript", "github-actions", "monorepo", "deployment", "ci-cd", "npm", "changesets", "vue-pivottable"]
categories: TypeScript
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-06-19"
---

TypeScript 마이그레이션 실패를 통해 배운 모노레포 배포 워크플로우 개선 사례: Beta/Stable 2단계 배포와 Changesets 도입으로 안전한 배포 시스템 구축기
<!--more-->

## 시작: 평범한 TypeScript 마이그레이션이 대참사로

vue3-pivottable 프로젝트를 TypeScript로 마이그레이션하던 날이었습니다. "메인 패키지만 먼저 배포하고 하위 패키지는 나중에 수정하지 뭐" 라고 생각했던 것이 화근이었습니다.

## 첫 번째 실수: 빌드 실패를 무시하다

```
✓ vue-pivottable 빌드 성공
✗ plotly-renderer 빌드 실패
✗ lazy-table-renderer 빌드 실패

"아 하위 패키지는 나중에 고치면 되겠지..."
```

### 당시 워크플로우 (실제 파일 분석)

**관련 워크플로우:**

- create-release-pr.yml (main → release 동기화)
- release-vue-pivottable.yml (메인 패키지)
- release-plotly-renderer.yml (하위 패키지)
- release-lazy-table-renderer.yml (하위 패키지)

#### 성공하는 경우

```mermaid
sequenceDiagram
    participant F as feature
    participant D as develop
    participant M as main
    participant MTR as main-to-release
    participant R as release
    participant RTM as release-to-main
    participant NPM as npm

    F->>D: PR & Merge
    D->>M: PR
    M->>M: 승인 (1차) ✓
    M->>MTR: create-release-pr.yml 실행
    MTR->>R: PR 자동 생성
    R->>R: PR 승인 (2차) ✓
    R->>R: 각 패키지별 워크플로우 실행
    R->>NPM: Semantic Release 배포 ✓
    R->>RTM: release-to-main PR 생성
    RTM->>M: PR
    M->>M: PR 승인 (3차) ✓
    
    Note over F,NPM: 총 3회 승인 필요
```

#### 실패한 경우 (TypeScript 마이그레이션)

```mermaid
sequenceDiagram
    participant F as feature/*
    participant D as develop
    participant M as main
    participant R as release
    participant NPM as npm

    F->>D: PR & Merge
    D->>M: PR
    M->>M: 승인 1 ✓
    M-->>R: create-release-pr.yml<br/>(main-to-release PR 생성)
    R->>R: 승인 2 ✓
    R->>R: Semantic Release 실행
    R->>NPM: 배포 시도 ❌
    Note over NPM: 빌드 실패로 배포 안됨
```

main 브랜치에서 release 브랜치로 동기화 후 배포가 실행되는데, 빌드가 실패해서 배포가 안 되었습니다.

## 두 번째 실수: 리버트의 함정

"그럼 리버트하면 되겠네?"

PR에서 리버트를 실행했더니 main이 업데이트되고 다시 배포가 시작되었습니다. 그런데...

```
배포 성공!
그런데... lazy-table-renderer 버전이 1.0.x → 1.1로?
왜 이 패키지만 버전이 올라갔지? 🤔
```

**실제 상황**: TypeScript 마이그레이션 PR에 lazy-table-renderer 변경사항이 포함되어 있었고, Semantic Release가 이를 감지하여 버전을 올렸습니다.

## GitHub App으로 보호 규칙 우회 시도 (PR #178-189)

### 왜 GitHub App?

"보호된 main 브랜치에 직접 푸시할 수 있다면 얼마나 편할까?"

이 생각으로 12개의 PR을 만들어 GitHub App 토큰으로 보호 규칙을 우회하려고 시도했습니다.

### 시도 과정 (30분 간격으로 연속 시도)

```yaml
# PR #178: APP_INSTALLATION_ID 테스트
# PR #179: APP_ID 1254720으로 수정
# PR #180: 시크릿 길이 디버그
# PR #181: 공식 action으로 변경
# PR #182: PRIVATE_KEY 형식 수정
# PR #183-188: Private Key 형식 검증
# PR #189: APP_ID 재확인
```

### 결론: GitHub의 보안 철학

**GitHub App 토큰도 브랜치 보호 규칙을 우회할 수 없습니다!**

이것은 의도적인 설계입니다:

- Personal Access Token ❌
- GitHub App Token ❌  
- OAuth Token ❌
- GITHUB_TOKEN ❌

모든 종류의 토큰이 브랜치 보호 규칙을 준수해야 합니다.

## 세 번째 실수: 강제 푸시의 나비효과

이제 완전히 꼬이기 시작했습니다. release→main PR이 미승인 상태로 남아있어서 강제 푸시가 더 큰 참사를 일으켰습니다:

```mermaid
sequenceDiagram
    participant M as main
    participant R as release
    participant RTM as release-to-main PR
    participant NPM as npm

    Note over M,R: 초기 상태
    M->>M: JS 버전 (리버트됨)
    R->>R: TS 버전 (실패)
    RTM->>RTM: release→main PR 미승인

    Note over M: 강제 푸시 시도
    M->>M: 보호 규칙 해제
    M->>M: git push --force<br/>(TS 커밋)

    Note over M,R: 예상치 못한 결과
    R->>R: 여전히 JS 버전 존재
    R->>NPM: JS 버전 재배포 😱
    Note over M: TS로 강제 푸시했는데<br/>왜 JS가 배포되지?
```

"에라 모르겠다. 보호 규칙 끄고 강제 푸시!"

```bash
git push --force origin <ts-commit>:main
```

결과: release→main PR이 미승인이라 release 브랜치의 JS 버전이 다시 배포되었습니다. 😱

## 완전히 꼬인 상황

```mermaid
graph TB
    subgraph "1. 초기 상태"
        A1[main: TS 버전]
        A2[release: TS 버전 빌드 실패]
    end

    subgraph "2. 리버트 후"
        B1[main: JS 버전으로 리버트]
        B2[release: 여전히 TS 버전]
        B3[lazy-table-renderer 1.1 배포됨]
    end

    subgraph "3. 강제 푸시 후"
        C1[main: TS 버전 강제 푸시]
        C2[release: JS 버전 존재]
        C3[release→main PR 미승인]
    end

    subgraph "4. 최종 결과"
        D1[npm: JS 버전 재배포 😱]
        D2[완전히 꼬인 Git 히스토리]
    end

    A1 -->|리버트| B1
    A2 --> B2
    B1 -->|강제 푸시| C1
    B2 -->|충돌| C2
    C2 -->|자동 배포| D1
    C3 -->|미승인으로 인한 Git 히스토리 불일치| D2

    classDef error fill:#ff9999
    class A2,D1,D2 error
```

결국 GitHub Actions를 모두 삭제하고 처음부터 다시 시작했습니다.

## 개선된 워크플로우: 실패해도 괜찮은 환경 만들기

### 핵심 개선사항

#### 1. Beta/Stable 2단계 배포

```mermaid
sequenceDiagram
    participant F as feature
    participant D as develop
    participant M as main
    participant Beta as npm beta
    participant Stable as npm latest
    participant R as release/vX.X.X

    Note over F,D: 1. 개발 단계
    F->>D: PR + Changeset
    D->>D: Changeset 소비
    D->>D: 버전 + beta suffix
    D->>Beta: 자동 Beta 배포
    D->>M: PR 생성/업데이트

    Note over M,Stable: 2. Production 배포
    M->>M: PR 승인
    M->>R: 임시 브랜치 생성
    R->>R: Beta suffix 제거
    R->>Stable: 자동 Stable 배포
    R->>M: 버전 동기화 PR
    R->>D: 버전 동기화 PR
```

#### 2. Changesets로 명시적 버전 관리

```yaml
# 어떤 패키지를 변경했나요?
- vue-pivottable

# 어떤 종류의 변경인가요?
- minor
```

더 이상 커밋 메시지로 추측하지 않습니다.

#### 3. 패키지 독립성 보장

```json
{
  "linked": [], // 연결된 패키지 없음
  "fixed": [] // 고정 버전 없음
}
```

lazy-table-renderer가 멋대로 버전 업되는 일이 없어졌습니다.

#### 4. release 브랜치 전략 변경

- 이전: 영구적인 release 브랜치 (꼬일 수 있음)
- 현재: 임시 release/vX.X.X 브랜치 (배포 후 삭제 가능)

#### 5. 디버깅 및 분석 역량 개선

1. **빈 태그 'v' 오류**

   ```yaml
   # 문제: id가 없어서 ${{ steps.version.outputs.version }}이 비어있음
   - name: Version packages as beta
     # id: version <- 이게 없었음!
   ```

2. **베타 버전 중복 (1.1.1-beta.123-beta.456)**

   ```bash
   # 문제: 마지막 베타만 제거
   sed 's/-beta\.[0-9]*$//' 
   
   # 해결: 모든 베타 제거
   sed 's/-beta\.[0-9]*//g'
   ```

3. **빌드 순서 문제**

   ```bash
   # 문제: 하위 패키지가 메인 패키지 타입에 의존
   pnpm -r build  # 모든 패키지 동시 빌드
   
   # 해결: 순차적 빌드
   pnpm build  # 메인 먼저
   pnpm -r --filter './packages/*' build  # 하위 패키지
   ```

4. **실패 감지 문제**

   ```bash
   # 문제: 빌드 실패해도 계속 진행
   pnpm build || true
   
   # 해결: 실패 시 즉시 중단
   set -e
   pnpm build
   ```

#### 6. 코드 품질 게이트 (컮밋 전 검사)

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

- **커밋 전 자동 수정**: ESLint + Prettier
- **빠른 피드백**: 변경된 파일만 검사
- **일관된 코드 품질**: 모든 개발자 동일 규칙

### 개선된 워크플로우 실증: PR #194, #195 사례

베타 배포 후 추가 업데이트가 필요한 상황이 실제로 발생했지만, 새로운 워크플로우로 안전하게 처리되었습니다:

```mermaid
sequenceDiagram
    participant D as Developer
    participant Dev as develop
    participant Beta as npm beta
    participant PR194 as PR #194 (main)
    participant Stable as npm latest

    Note over D,Dev: 1. 초기 개발
    D->>Dev: 개발 완료 (PR #194)
    Dev->>Beta: 베타 버전 1.1.2-beta.xxx 배포 ✓
    Dev->>PR194: main으로 PR 자동 생성

    Note over D,Dev: 2. 추가 개선사항 발견 & 적용
    D->>Dev: 빌드 순서 및 오류 처리 개선 (PR #195)
    Dev->>Beta: 새 베타 버전 배포 ✓
    Dev->>PR194: PR #194 자동 업데이트! ⭐

    Note over PR194,Stable: 3. 안전한 배포
    PR194->>Stable: 승인 후 모든 수정사항 포함 배포 ✓
```

#### 핵심 차이점

**과거 (문제 발생):**

- 추가 변경사항 → 수동으로 모든 것 다시 처리
- 복잡한 Git 수술 필요
- 어떤 변경사항이 포함되었는지 추적 어려움

**현재 (안전한 해결):**

- 추가 변경사항 → PR이 자동으로 최신 상태 유지
- 베타에서 모든 변경사항 검증 완료
- Stable 사용자는 모든 개선사항이 포함된 완성본만 받음

## 실제 효과

### Before: 공포의 배포

- 배포 = 러시안 룰렛
- 실패 시 전체 사용자 영향
- 복잡한 Git 수술 필요

### After: 안전한 배포

- Beta에서 먼저 테스트
- 실패해도 Stable 사용자 안전
- 명확한 롤백 경로

## 주요 교훈

1. **실패를 격리하라**

   - Beta 단계는 "실패해도 괜찮은" 안전망

2. **암묵적 → 명시적**

   - Semantic Release의 커밋 추측 → Changesets의 명시적 선언

3. **복잡성을 줄여라**

   - 영구 release 브랜치 → 임시 브랜치
   - 복잡한 다중 워크플로우 → 명확한 3개 워크플로우

4. **자동화는 단순해야 한다**
   - 복잡한 자동화는 디버깅이 어렵다

## 최종 워크플로우: 안전한 배포 시스템

```mermaid
graph TB
    subgraph "개발 단계"
        F[feature 브랜치]
        D[develop 브랜치]
        Beta[npm beta 태그]
        DPR[develop→main PR]
        
        F -->|PR + Changeset| D
        D -->|자동 베타 배포| Beta
        D -->|PR 생성/업데이트| DPR
        DPR -->|승인 필요| M
    end
    
    subgraph "프로덕션 배포"
        M[main 브랜치]
        R[release/vX.X.X 브랜치]
        Stable[npm latest 태그]
        MPR[main 동기화 PR]
        
        M -->|배포 실행 + 임시 브랜치 생성| R
        M -->|베타 제거 + stable 배포| Stable
        R -->|PR 생성| MPR
        MPR -->|승인 필요| M
        R -->|자동 동기화| D
    end
    
    style Beta fill:#ffcc00
    style Stable fill:#00cc00
    style DPR fill:#ffcccc
    style MPR fill:#ffcccc
```

### 핵심 개선사항 대비표

| 구분 | 이전 (문제 발생) | 현재 (개선됨) |
|------|-----------------|-------------|
| 배포 단계 | 단일 (release → npm) | 2단계 (develop→beta, main→stable) |
| 실패 영향 | 전체 사용자 | 베타 사용자만 |
| 버전 관리 | 커밋 메시지 추측 | Changesets 명시적 선언 |
| 브랜치 전략 | 영구 release | 임시 release/vX.X.X |
| 빌드 순서 | 동시 (의존성 문제) | 순차 (main → sub) |
| 품질 검사 | CI 후 발견 | Husky 전 차단 |

## 마무리

TypeScript 마이그레이션 실패는 뼈아픈 경험이었지만, 덕분에 더 나은 워크플로우를 만들 수 있었습니다.

현재 패키지들은 안정적으로 배포되고 있습니다:

- vue-pivottable (메인 패키지)
- @vue-pivottable/plotly-renderer
- @vue-pivottable/lazy-table-renderer

이제는:

- **Beta 테스트**: `npm install vue-pivottable@beta`
- **문제 발견**: Stable 사용자는 안전
- **수정 후**: main 머지로 안전하게 배포

"실패해도 괜찮은" 환경을 만드는 것이 안정적인 배포의 핵심이었습니다.
