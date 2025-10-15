---
title: "[경제지표 대시보드 개발기 #6] AI-DLC 첫 실험기 — AI와 문서로 대화하기"
date: "2025-10-13"
tags: ["사이드프로젝트", "AI-DLC", "프롬프트", "문서화"]
categories: AI-DLC
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-10-13"
---

워크샵 이후 사이드 프로젝트에 AI-DLC를 적용해 **프롬프트 → 계획 → 질문/답변 → 승인** 흐름을 실험했습니다. AI가 문서를 작성했고, 저는 검토자/승인자로 진행했습니다.

<!--more-->

## 실험 설정

- **대상**: E-Torch 경제지표 대시보드  
- **목표**: *Inception* 단계 산출물 생성(계획, 사용자 스토리, 단위 그룹화)  
- **역할**: AI(클로드 코드)가 작성하고 저는 검토/수정/승인을 수행했습니다.

### 핵심 프롬프트

> 앞으로의 작업을 계획하고 md 파일(`plan.md`)에 계획의 각 단계별로 체크박스와 함께 단계를 작성하세요.
> 질문은 `[Question]`, 제 답변은 `[Answer]`로 남기고, **승인 후 한 단계씩 실행**하세요.

프로젝트 배경, 목표, 스택을 포함해 **Inception → Construction → Transition** 순으로 지시했습니다.  

전체 프롬프트와 커뮤니케이션 로그는 레포에 정리했습니다:  
**[전체 프롬프트 보기](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/prompt.md)**

---

`2. 기획 단계(Inception) - 사용자 스토리 작성` 프롬프트를 실행하면 `plan.md`가 생성됩니다. 다음은 요약 결과입니다.

```markdown
# E-Torch AI DLC Inception 작업 계획

## 1단계: 기획 (Inception)

### 단계 1.1: 사용자 스토리 작성

앞으로의 작업을 계획하고 각 단계별로 체크박스와 함께 단계를 작성합니다.

## 작업 단계

#### 단계 1: 사용자 페르소나 정의

- [x] Free/Pro/관리자 정의  

[Question] Free/Pro의 주요 시나리오?  
[Answer] Free = 대시보드 3 / 위젯 6, 최근 3년  
    Pro = 무제한, 전체 기간, 버전 관리

#### 단계 2: 에픽 정의

- [x] 인증, 대시보드, 위젯, 데이터 통합, 구독, 관리자

#### 단계 6: 문서화 및 검토

- [x] `user_stories.md` 작성  
- [ ] 이해관계자 검토 → 피드백 → 승인
```

**[plan.md 전체 보기](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/inception/plan.md)**

---

AI가 계획 문서를 작성하면서 [Question] 남기면 저는 질문을 검토해 [Answer]에 답변을 채우고 필요한 경우 추가 피드백을 프롬프트로 전달했습니다.
이 과정을 반복하면서 계획이 점점 구체화되었고, 최종 승인 하면 사용자 스토리 문서가 생성됩니다.

```markdown

### US2.1: 대시보드 목록 조회 (요약)

**As a** 사용자
**I want to** 내가 생성한 대시보드 목록을 볼 수 있기
**So that** 원하는 대시보드를 선택할 수 있다

**Acceptance Criteria:**

- Given: 사용자가 로그인한 상태
- When: 대시보드 페이지에 접속
- Then: 내가 생성한 대시보드 목록이 표시됨
- And: 각 대시보드의 이름, 설명, 카테고리, 수정일이 표시됨
- And: 최근 수정순, 이름순, 생성일순 정렬 옵션 제공
- And: 카테고리 필터 및 검색 기능 제공
- And: 내가 만든 것/즐겨찾기한 것 탭 분리
- And: 기본 대시보드가 있으면 버튼/배지 표시
- And: US6.5에 정의된 플랜별 대시보드 수 제한 적용

### US3.1: 위젯 생성 (요약)

**As a** 일반 사용자
**I want** 새로운 위젯을 생성하기
**So that** 원하는 지표를 시각화할 수 있다

**시나리오 A - 내 위젯 페이지에서 생성:**
- Given: 내 위젯 페이지에서
- When: "새 위젯 만들기" 버튼 클릭
- Then: 위젯 생성 화면 표시
- And: 위젯 타입 선택
- And: 지표 검색 및 선택
- And: 시각화 옵션 설정
- And: 생성된 위젯이 내 위젯 라이브러리에 저장된다
- And: 선택적으로 대시보드 추가 가능

```

**[user_stories.md 전체 보기](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/inception/user_stories.md)**

---

다음은 `3. 기획 단계(Inception) - 사용자 스토리 단위별 그룹화` 프롬프트를 실행하고 `units_plan.md`문서를 검토하고 질문에 답변을 추가하고 승인한 결과입니다.

## 사용자 스토리 → 단위(Unit) 그룹화

`/inception/units/*.md`로 6개 단위를 정의했습니다.

- **Dashboard**  
- **Widget Library**  
- **Data Integration**  
- **Authentication**  
- **Subscription**  
- **Admin Console**

단위 간 계약은 `integration_contract.md`에 정리되었습니다.  
워크샵에서는 하나의 `plan.md`를 업데이트하는 방식이었지만
저는 각 문서에 질문과 답변을 그대로 남겨 **의사결정 근거**를 보존했습니다.

**[단위 문서 및 계약서 보기](https://github.com/Seungwoo321/aidlc-docs/tree/main/e-torch.v1/inception/units)**

---

## 진행하며 느낀 점

계획, 질문, 승인이라는 흐름이 문서에 그대로 남으면서 다음 단계로의 기준이 명확해졌습니다.  
스토리에서 단위, 그리고 계약으로 이어지는 구조가 일정한 형식을 갖추게 되어 문서 품질도 일관적이었습니다.  

다만 *Construction* 단계에서 **DDD 설계**가 자동으로 진행되면서  
4계층(Infra, Domain, Application, UI) 구조가 전제되는 부분은  
프론트엔드 중심의 프로젝트에서는 다소 과하다고 느꼈습니다.  

결국 이번 실험을 통해 “문서화 절차는 효과적이었지만, 설계 방식은 정말 이 프로젝트에 맞는가?” 라는 의문이 생겼습니다.

---

*다음 편에서는 DDD 설계 문서에 대한 고민을 공유합니다.*
