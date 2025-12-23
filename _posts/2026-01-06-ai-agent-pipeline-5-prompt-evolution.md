---
title: "[AI 에이전트 파이프라인 #5] 프롬프트 완성까지의 3단계"
date: "2026-01-06"
tags: ["AI", "Claude Code", "프롬프트 엔지니어링", "에이전트", "자동화"]
categories: AI-Agent
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-01-06"
---

[지난 편](/blog/2025/12/30/ai-agent-pipeline-4-why-still-failed/)에서는 시행착오 끝에 AI-DLC 방법론을 적용하기 시작한 이야기를 다뤘습니다.

이번 편에서는 **AI-DLC를 적용했는데도 왜 불안정했는지**, 그리고 어떻게 해결했는지 다룹니다.

<!--more-->

## 1. 현재 안정화된 프롬프트 구조

현재는 `<role>`, `<input_contract>`, `<output_contract>` 같은 XML 태그로 프롬프트를 구조화하고 있습니다. 이 구조로 전환한 후 first-try 성공률이 100%에 가까워졌고, 약 1,400줄의 마크다운 콘텐츠를 안정적으로 생성할 수 있게 되었습니다.

하지만 처음부터 이 구조를 알았던 건 아닙니다. 여러 시행착오 끝에 도달한 결과입니다.

| 단계 | 시기 | 특징 | 결과 |
|:---:|:---|:---|:---|
| 1 | 10월 초 | AI-DLC 적용 + 원인 파악 | 마크다운 혼동 문제 발견 |
| 2 | 10월 말 | 해결 시도 1: Contract 문서 참조 | 개선되었으나 불안정 |
| 3 | 11월 | 해결 시도 2: XML 태그 구조 | **100% 안정** |

이어지는 섹션에서 각 단계의 과정을 다룹니다.

---

## 2. 1단계: AI-DLC 적용

지난 편에서 AI-DLC를 적용하기로 결정했습니다. 실제로 적용해보았습니다.

AI-DLC는 단계별로 플랜을 만들고 실행하는 방법론입니다:

1. **기획** (Inception) - 시스템 의도, 유닛 분해
2. **설계를 위한 플랜** 작성
3. **설계** 작성 (도메인 설계, 논리 설계)
4. **구현을 위한 플랜** 작성
5. **구현** (Construction)

이 프로젝트에서는 에이전트 프롬프트가 구현 대상이니까, 최종적으로 프롬프트 작성이 되는 겁니다.

```
docs/aidlc-docs/
├── system-intent.md          # 시스템 개발 의도
├── inception/
│   ├── plan.md               # 실행 계획
│   └── units/
│       ├── unit-01-pipe-mechanism.md
│       ├── unit-02-filter-contracts.md
│       └── ...
```

이때 작성한 프롬프트 일부입니다:

```markdown
---
name: concepts-writer
version: 6.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
---

You are an expert educator specializing in explaining complex technical concepts to learners at various levels.

## Core Mission

Autonomously identify the next content file requiring a Core Concepts section by examining Work Status Markers, then create high-quality, multi-level concept explanations with visualizations.

## Operational Workflow

### Work Status Marker Verification and File Selection

#### Automatic File Discovery:
When no specific file is provided by the orchestration script, automatically discover your target file.

Use the Grep tool to search for files containing the `CURRENT_AGENT: concepts-writer` marker.

#### Work Status Marker Verification:
Check the Work Status Markers at the top of each file to determine if you should work on it:

...

## Core Concepts Writing Specifications

Maintain this exact structure:

Line 1: # Core Concepts (once per file)
Line 2: Empty line
Line 3: ## Concept: [Concept Name]
Line 4: Empty line
Line 5: **ID**: [identifier]

### Easy Section Writing Rules:

**Required Components**:
1. **One-line concept summary** (first sentence)
2. **🎈🏃‍♂️🎭 Analogy-centered explanation** (main part)
3. **🤔💡 Problem/advantage explanation** (why it matters)
4. **🆚 Comparison with other concepts** (differences)

### Normal Section Writing Rules:

#### #### Text and #### Code Alternating Structure Required

Exact pattern:
1. #### Text - Technical explanation
2. #### Code: [Descriptive Title] - Code example
3. #### Text - Additional explanation (if needed)
4. #### Code: [Another Example] (if needed)

...

## Work Status Marker Management and Handoff

### Agent Chain:
**content-initiator** → overview-writer → **concepts-writer** → visualization-writer → practice-writer → quiz-writer → content-validator
```

### 당시 작업 방식

- 시스템 의도, 요구사항, 제약사항 문서화
- 5개 유닛으로 분해 (Pipe, Contract, Prompt, Orchestration, Quality)
- 각 유닛별 domain_design.md, logical_design.md 작성

### 결과

설계는 완벽했습니다. 구현도 설계대로 완벽하게 했습니다. **그런데 결과가 여전히 불안정했습니다.**

실패 로그들을 분석하면서 원인을 찾기 시작했습니다. 위의 프롬프트를 보세요. `## Core Mission`, `### Work Status Marker Verification`, `#### Automatic File Discovery:` 같은 헤더들이 가득합니다. 그런데 에이전트가 생성해야 할 콘텐츠도 `## Concept:`, `### Easy`, `### Normal` 같은 마크다운 헤더입니다. 프롬프트도 마크다운, 생성할 콘텐츠도 마크다운. AI가 둘을 혼동하고 있었습니다.

---

## 3. 2단계: Contract 문서 참조

원인을 파악했으니 해결책을 시도했습니다. AI-DLC를 적용하면서 Contract 문서들은 이미 별도로 작성되어 있었습니다. 하지만 이 규칙들을 프롬프트에 인라인하니 마크다운 혼동 문제가 발생했습니다. 첫 번째 시도는 프롬프트에 직접 포함하는 대신, 원래의 Contract 문서를 참조하도록 변경하는 것이었습니다.

Contract 문서들의 구조는 다음과 같았습니다:

```
docs/aidlc-docs/
├── specifications/
│   ├── contracts/                    # 에이전트별 계약 문서
│   │   ├── concepts-writer-contract.md
│   │   ├── overview-writer-contract.md
│   │   └── ...
│   └── work-status-markers-spec.md   # WSM 명세
├── construction/
│   ├── unit-02-filter-contracts/     # 도메인/논리 설계
│   └── unit-03-agent-prompts/        # 프롬프트 설계
```

프롬프트는 이 문서들을 참조하도록 했습니다:

```markdown
---
name: concepts-writer
version: 8.0.0
description: When concepts need 3-level difficulty explanations
tools: Read, MultiEdit, Grep
model: sonnet
---

# Concepts Writer - Execution Prompt

**Your job**: Generate the Core Concepts section following the contract.

**Contract**: See `docs/aidlc-docs/specifications/contracts/concepts-writer-contract.md`
```

### 당시 작업 방식

- 프롬프트는 "무엇을 하라"만 간단히
- 상세 규칙은 Contract 문서에 정의 (Input/Output 형식, WSM 규칙 등)
- 에이전트가 실행 시 Contract 문서를 참조하도록 경로만 명시

### 결과

- 프롬프트 길이는 줄었음
- 규칙 관리도 쉬워짐 (문서 한 곳에서 관리)
- **하지만 LLM이 외부 문서를 일관되게 참조하지 않음**
- 어떤 때는 Contract 문서를 잘 읽고, 어떤 때는 무시함

돌이켜 생각해보면, 설령 일관되게 참조했더라도 LLM이 외부 문서를 읽으면 그 내용이 컨텍스트에 포함되므로 마크다운 혼동 문제는 여전했을 겁니다.

---

## 4. 3단계: XML 태그 구조

2단계의 문제는 LLM이 외부 Contract 문서를 일관되게 참조하지 않는다는 것이었습니다.
참조 방식으로도 안 되니까, 다시 처음부터 방법을 찾기 시작했습니다.

### XML 태그를 발견하기까지

Anthropic 공식 영상과 프롬프트 관련 유튜브 영상들을 찾아보기 시작했고, Claude Code 공식 문서의 프롬프트 관련 내용을 **다시** 정독했습니다. 그리고 공통적으로 눈에 띄었던 게 XML 태그였습니다.

사실 이전에도 "XML 태그 사용을 권장한다"는 내용을 본 적이 있었지만, 익숙하지 않아서 무시했었습니다.

그런데 이번에 다시 보면서 생각이 바뀌었습니다. 권장 여부와 별개로, **마크다운 프롬프트로 마크다운 콘텐츠를 생성하는 이 프로젝트에서는 `<>`로 구조를 구분하는 게 시도해볼 만하다**고 생각했습니다.

### 출처

- [Anthropic 공식 문서 - Use XML tags](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags): "Claude is particularly skilled at interpreting XML tags"
- [Claude Code 공식 문서 - Be specific about output format](https://docs.anthropic.com/en/docs/claude-code/best-practices#be-specific-about-output-format): XML 태그로 구조화된 출력 형식 예시
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview): 전반적인 프롬프트 엔지니어링 가이드

해결책은 **Contract 내용을 프롬프트에 직접 포함**시키되, XML 태그로 구조화하는 것이었습니다.

그래서 먼저 AI-DLC 설계 문서들을 XML 태그 포함 형태로 업데이트했습니다. `<input_contract>`, `<output_contract>` 같은 XML 태그로 Contract 내용을 구조화하고, 이를 프롬프트에 직접 인라인했습니다.

```markdown
---
name: concepts-writer
description: Generate Core Concepts section with 3-level adaptive learning
tools: Read, Edit
model: sonnet
---

# concepts-writer

<role>
Primary Role: Core Concepts 섹션 작성 (3단계 난이도 설명)

Responsibilities:
1. # Core Concepts 섹션 작성 (3-5개 핵심 개념)
2. 각 개념마다 3단계 난이도 설명 작성
3. HANDOFF LOG 업데이트
4. CURRENT_AGENT 설정

Unique Characteristics:
- 시스템의 핵심 차별점: 3단계 적응형 학습 구현
</role>

<input_contract>
File State:
- Required files: Target markdown file with frontmatter, WSM, and Overview
- Existing sections: WSM + # Overview (completed by overview-writer)

Work Status Markers:
- CURRENT_AGENT: concepts-writer
- STATUS: IN_PROGRESS
</input_contract>

<output_contract>
Section Structure:
## Concept: [Title]

**ID**: kebab-case-id

### Easy
[도입 문장 1-2줄]
...

### Normal
...

### Expert
...

Content Guarantees:
- 3-5 concepts with 3 difficulty levels each
</output_contract>
```

---

## 5. 결과

XML 태그 도입 전후 비교:

| 지표 | 이전 | 이후 |
|:---|:---:|:---:|
| first-try 성공률 | ~33% | ~100% |
| 재시도 필요 횟수 | 2-3회 | 0-1회 |
| 형식 오류 | 빈번 | 거의 없음 |

XML 태그로 프롬프트 구조와 생성할 콘텐츠를 명확히 구분한 것이 효과적이었습니다. `<role>`, `<input_contract>`, `<output_contract>` 태그로 역할/입력/출력을 분리하고, Contract 내용을 프롬프트에 직접 포함하되 XML 태그로 구조화했습니다.

메타데이터 생성 파이프라인처럼 간단한 경우는 AI에게 프롬프트를 작성해달라고 요청하는 것만으로도 충분합니다. 하지만 복잡한 파이프라인이라면 AI-DLC 같은 방법론을 도입해서 명확한 계약 방식으로 입력/출력을 정의하고, 프롬프트 작성을 위한 설계와 설계를 위한 플랜을 작성하며 체계적으로 진행하는 것을 권장합니다. 실제로 Contract 문서가 존재하고, 이를 기반으로 프롬프트를 작성하는 방식입니다. 프롬프트가 복잡해질수록 XML 태그로 구성요소를 명확히 구조화하면 LLM의 오해석을 줄이고 일관된 출력을 얻을 수 있습니다.

다음 편에서는 이렇게 완성된 에이전트들이 어떻게 협업하는지 다룹니다.

---

> 이 시리즈는 AI-DLC(AI-assisted Document Lifecycle) 방법론을 실제 프로젝트에 적용한 경험을 공유합니다.
> AI-DLC에 대한 자세한 내용은 [경제지표 대시보드 개발기 시리즈](/blog/2025/10/06/economic-dashboard-1-why-started/)를 참고해주세요.
