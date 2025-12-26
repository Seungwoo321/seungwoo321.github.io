---
title: "[AI 에이전트 파이프라인 #4] 분리했는데 왜 여전히 안 됐을까"
date: "2025-12-30"
tags: ["AI", "Claude Code", "프롬프트 엔지니어링", "에이전트", "자동화"]
categories: AI-Agent
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-12-30"
---

[지난 편](/blog/2025/12/23/ai-agent-pipeline-3-why-seven-agents/)에서는 하나의 프롬프트가 왜 안 됐는지, 그리고 7개 에이전트로 분리한 과정을 다뤘습니다.

이번 편에서는 에이전트를 분리한 후에 무엇을 시도했는지, 그리고 그래도 왜 안 됐는지 다룹니다.

<!--more-->

## 1. 프롬프트 오염

파이프라인을 실행하고 파싱 에러가 발생하면, 에러 내용과 샘플 마크다운을 Claude에게 전달하며 수정을 요청했습니다. Claude는 "해결했다"고 하면서 새로운 금지 규칙과 해야 할 규칙을 추가했습니다.

```markdown
## 절대 금지 사항
1. 마크다운 헤더 레벨 혼동 금지
2. 코드 블록 안에 불필요한 주석 금지
3. 이모지 사용 금지
4. 빈 줄 두 개 이상 연속 금지
5. ...
```

처음엔 효과가 있는 것 같았습니다. 하지만 에러 종류가 다양해지면서 규칙이 계속 늘어났습니다. 프롬프트가 점점 길어지고, 새로운 규칙이 기존 규칙과 충돌하기 시작했습니다. 결국 LLM이 모든 규칙을 동시에 지키지 못하는 상황이 됐습니다.

돌이켜보면 이 접근 방식에는 몇 가지 근본적인 문제가 있었습니다.

### 1.1 부정 지시의 한계

"~하지 마라"는 지시는 LLM에게 효과적이지 않습니다.
"하지 말아야 할 것"을 먼저 떠올리고, 그것을 하게 됩니다.

```markdown
# Bad
"코드 블록 안에 한국어 주석을 넣지 마세요"

# Better
"코드 블록에는 영어 주석만 사용합니다"
```

### 1.2 규칙 간 충돌

서로 다른 에러를 막으려다 규칙이 충돌합니다.

```markdown
규칙 A: "반드시 실행 가능한 완전한 코드를 작성하세요"
규칙 B: "코드는 10줄 이내로 간결하게 작성하세요"
```

### 1.3 컨텍스트 오염

프롬프트가 너무 길어지면 LLM은 앞부분을 잊어버립니다.
규칙이 많아질수록 정작 중요한 지시를 따르지 못합니다.

---

## 2. 핸드오프 가이드 도입

프롬프트와 별개로 또 다른 문제가 있었습니다. 에이전트가 순차적으로 실행되는데, 이전 에이전트의 작업이 정상이 아닌데도 다음 에이전트가 계속 실행되면 어떻게 될까요? 중간이 빠진 문서는 수정하기도 힘들고 토큰 낭비만 계속됩니다. 각 에이전트가 어디까지 작업했는지 추적하고, 다음 에이전트에게 상태를 전달하는 방법이 필요했습니다. 그래서 280줄짜리 핸드오프 가이드 문서를 만들었습니다:

```markdown
# 핸드오프 가이드

## 개요
이 문서는 에이전트 간 작업 전달(핸드오프) 규칙을 정의합니다.

## 핸드오프 마커 위치
Markdown 파일 상단, 프론트매터 다음 위치:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: [에이전트명] -->
<!-- PROGRESS: [진행중|대기중|완료] -->
<!-- VALIDATION_SCORE: [점수/100] -->
<!-- IMPROVEMENT_NEEDED:
  - [에이전트명]: [개선사항] ([감점] 감점)
-->
<!-- STARTED: [YYYY-MM-DD HH:MM] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
에이전트별 작업 기록
-->

## 에이전트 실행 순서
1. content-initiator: 작업 대상 파일 발견 및 파이프라인 시작 마커 생성
2. overview-writer: 개요 섹션 작성
3. concepts-writer: 핵심 개념 섹션 작성 + 시각화 요구사항 정의
4. visualization-writer: 시각화 컴포넌트 생성
5. practice-writer: 실습 섹션 작성
6. quiz-writer: 퀴즈 섹션 작성
7. content-validator: 전체 콘텐츠 품질 검증 및 최종 완료 처리

## 재시도 메커니즘
- 쉘 스크립트: 전체 에이전트 순차 실행 (최대 3회)
- content-validator 점수 확인: 100점 즉시 완료, 90-99점 재시도
...
```

각 에이전트가 작업을 시작하기 전에 마크다운 파일 상단의 상태 마커(Work Status Markers)를 확인하고, 작업이 끝나면 다음 에이전트를 위해 마커를 업데이트합니다. 검증 에이전트(content-validator)가 90점 미만을 주면 처음부터 재시도하고, 90점 이상이면 통과시키는 메커니즘도 정의했습니다. 이 정도면 될 거라고 생각했습니다.

---

## 3. 영어 버전 시도

Claude는 영어로 주로 학습되었고, [다국어 학습 데이터는 약 10% 정도](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)입니다. 그래서 "영어 프롬프트가 더 효과적이다"라는 이야기를 듣고 영어 버전도 시도해봤습니다:

```markdown
---
name: concepts-writer
version: 6.0.0
description: Writes Core Concepts section with 3-level difficulty explanations
tools: Read, MultiEdit, Grep
---

You are an expert educator specializing in explaining complex technical concepts
to learners at various levels.

## Core Mission
Autonomously identify the next content file requiring Core Concepts section...

## Operational Workflow
### Work Status Marker Verification and File Selection
...
```

영어로 바꿔도 결과는 비슷했습니다. Anthropic의 [Context Engineering 가이드](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)에 따르면, 모델이 발전할수록 프롬프트의 정확한 문구보다 **어떤 정보를 제공하느냐**가 더 중요해지고 있습니다. 언어가 문제는 아닌 것 같았습니다. 하지만 그렇다면 뭐가 문제인지, 어떻게 해결해야 하는지는 여전히 알 수 없었습니다.

---

## 4. "왜 안 되는지 모르겠다"

프롬프트는 몇백 줄에 달할 만큼 상세했습니다. 에이전트도 7개로 분리했고, 각 에이전트마다 구체적인 규칙을 정의했습니다. 에러가 나면 규칙을 추가하고, 핸드오프 가이드도 만들고, 영어 버전도 시도했습니다. 그런데 실행하면 매번 다른 결과가 나왔습니다. 아무것도 근본적인 해결이 되지 않았습니다.

---

## 5. 전환점: AI-DLC 적용

막막한 상황에서 AI-DLC(AI-assisted Document Lifecycle) 방법론을 적용해보기로 했습니다.

AI-DLC는 AI와 협업하여 소프트웨어를 개발하는 방법론입니다. 다만 [AI-DLC 백서](https://github.com/Seungwoo321/aidlc-docs/blob/main/ai-dlc-whitepaper-ko.md)는 DDD 변형 기반으로 백엔드와 인프라 개념을 포함하고 있어서, 현재 프로젝트(에이전트 프롬프트를 쉘로 오케스트레이션하는 파이프라인)에 그대로 적용하기는 어려웠습니다.

그래서 [아키텍처 비교 보고서](https://github.com/Seungwoo321/aidlc-docs/blob/main/frontend-learning-webview.v2/methodology-comparison-report.md)를 작성했습니다. 5가지 아키텍처를 비교한 결과, **Modular Monolithic Pipeline Architecture**를 선택했습니다. 7개 에이전트가 순차적으로 실행되는 구조가 Pipeline의 필터 개념과 자연스럽게 맞았기 때문입니다.

AI-DLC로 개발 프로세스를 진행하되, 실제 시스템 아키텍처는 프로젝트에 맞게 선택한 것입니다.

다음 편에서는 그 결과가 어땠는지 다룹니다.

---

> 이 시리즈는 AI-DLC(AI-assisted Document Lifecycle) 방법론을 실제 프로젝트에 적용한 경험을 공유합니다.
> AI-DLC에 대한 자세한 내용은 [경제지표 대시보드 개발기 시리즈](/blog/2025/10/06/economic-dashboard-1-why-started/)를 참고해주세요.
