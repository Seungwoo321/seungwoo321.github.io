---
title: "[AI 에이전트 파이프라인 #5] 프롬프트 완성까지의 4단계"
date: "2025-12-30"
tags: ["AI", "Claude Code", "프롬프트 엔지니어링", "에이전트", "자동화"]
categories: AI-Agent
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-12-30"
---

[지난 편](/blog/2025/12/26/ai-agent-pipeline-4-why-still-failed/)에서는 막막한 상황에서 AI-DLC 방법론을 적용하기로 결정한 이야기를 다뤘습니다.

이번 편에서는 AI-DLC를 적용하면서 프롬프트를 어떻게 완성해나갔는지 다룹니다.

<!--more-->

## 1. 프롬프트 완성까지의 4단계

AI-DLC 방법론을 적용하면서 프롬프트 작성 방식을 네 번 바꿨습니다.

| 단계 | 시기 | 설계 방식 | 결과 |
|:---:|:---|:---|:---|
| 1 | 10월 초 | 유닛 분해와 설계 | AI-DLC 기반 체계적 설계 |
| 2 | 10월 중 | 마크다운 프롬프트 | 마크다운 혼동 문제 발견 |
| 3 | 10월 말 | Contract 문서 참조 방식 | 개선되었으나 불안정 |
| 4 | 11월 | XML 태그 구조 | **100% 안정** |

현재는 `<role>`, `<input_contract>`, `<output_contract>` 같은 XML 태그로 프롬프트를 구조화하고 있습니다. 이 구조로 전환한 후 first-try 성공률이 100%에 가까워졌고, 약 1,400줄의 마크다운 콘텐츠를 안정적으로 생성할 수 있게 되었습니다.

이어지는 섹션에서 각 단계의 과정을 다룹니다.

---

## 2. 1단계: 유닛 분해와 설계

AI-DLC를 적용해서 프롬프트를 작성했습니다.

AI-DLC에서는 시스템을 유닛으로 분해하고, 각 유닛별로 설계 문서를 작성한 뒤, 이를 기반으로 구현합니다. 이 프로젝트에서는 에이전트 프롬프트가 구현 대상이니까, 최종적으로 프롬프트 작성이 되는 겁니다. 5개 유닛(Pipe, Contract, Prompt, Orchestration, Quality)으로 분해하고, 프롬프트 작성을 위한 설계를 진행했습니다.

- **Pipe**: 에이전트 간 데이터 전달 메커니즘
- **Contract**: 에이전트별 입출력 계약 정의
- **Prompt**: 에이전트 프롬프트 작성
- **Orchestration**: 쉘 스크립트로 실행 순서 관리
- **Quality**: 품질 검증 기준

[18개의 AI-DLC 프롬프트](https://github.com/Seungwoo321/aidlc-docs/tree/main/frontend-learning-webview.v2/prompts)를 단계별로 실행하면서 다음과 같은 문서 구조가 만들어졌습니다.

```
docs/aidlc-docs/
├── system-intent.md                      # 시스템 개발 의도
├── methodology-comparison-report.md      # 아키텍처 비교 보고서
├── prompts/                              # AI-DLC 프롬프트 (18개)
│   ├── 01-system-architect-role.md
│   ├── 02-inception-unit-decomposition.md
│   ├── 03-construction-unit1-domain.md
│   ├── ...
│   └── 018-operations-quality-monitoring.md
├── inception/
│   ├── plan.md                           # 실행 계획
│   └── units/
│       ├── unit-01-pipe-mechanism.md     # 파이프 메커니즘 유닛
│       ├── unit-02-filter-contracts.md   # 필터 계약 유닛
│       ├── unit-03-agent-prompts.md      # 에이전트 프롬프트 유닛
│       ├── unit-04-orchestration.md      # 오케스트레이션 유닛
│       ├── unit-05-quality-metrics.md    # 품질 검증 유닛
│       └── integration_plan.md           # 통합 계획
├── specifications/
│   ├── work-status-markers-spec.md       # WSM 명세
│   └── contracts/                        # 에이전트별 계약 문서
│       ├── content-initiator-contract.md
│       ├── overview-writer-contract.md
│       ├── concepts-writer-contract.md
│       ├── visualization-writer-contract.md
│       ├── practice-writer-contract.md
│       ├── quiz-writer-contract.md
│       └── content-validator-contract.md
├── guides/
│   └── agent-handoff-guide.md            # 에이전트 핸드오프 가이드
├── construction/
│   ├── unit-02-filter-contracts/
│   │   ├── domain_design.md
│   │   ├── logical_design.md
│   │   └── plan.md
│   └── unit-04-orchestration/
│       ├── domain_design.md
│       ├── logical_design.md
│       ├── implementation.md
│       └── src/
│           ├── content-generator-v7.sh   # 오케스트레이션 스크립트
│           └── lib/
│               └── common-utils.sh       # 공통 유틸리티
└── logs/
    └── content-generator-v7.log          # 실행 로그
```

`inception/` 폴더에는 실행 계획과 5개 유닛 정의가 들어 있습니다. 각 유닛은 파이프라인의 핵심 구성요소를 담당합니다. `specifications/` 폴더에는 에이전트 간 데이터 전달을 위한 상태 마커(Work Status Markers) 명세와 7개 에이전트 각각의 계약 문서가 정의되어 있습니다. `guides/` 폴더에는 에이전트 간 핸드오프 규칙을 정리한 가이드가 있습니다.

`construction/` 폴더가 실제 설계가 이뤄지는 곳입니다. 각 유닛별로 도메인 설계(`domain_design.md`)와 논리 설계(`logical_design.md`)를 작성했습니다. 도메인 설계에서는 해당 유닛이 해결해야 할 문제와 핵심 개념을 정의하고, 논리 설계에서는 구체적인 구현 방식을 설계합니다. `unit-04-orchestration/src/`에는 쉘 스크립트로 구현된 오케스트레이션 코드가 들어 있습니다.

---

## 3. 2단계: 마크다운 프롬프트 생성

1단계에서 작성한 Contract 문서들을 프롬프트로 변환했습니다. 4편에서 본 v6 프롬프트는 규칙들을 나열하는 방식이었습니다. AI-DLC를 적용한 v7에서는 구조가 완전히 달라졌습니다.

Input Contract와 Output Contract를 명시적인 섹션으로 분리하고, 에이전트가 무엇을 입력받고 무엇을 출력해야 하는지 계약 형태로 정의했습니다. Execution Instructions에는 단계별 실행 지침을 체크리스트로 작성했습니다. Contract 문서의 내용을 마크다운 헤더로 구조화해서 프롬프트에 직접 포함시킨 것입니다.

```markdown
---
name: concepts-writer
version: 7.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
model: sonnet
---

## Role & Responsibility

**Role**: Generate the Core Concepts section with multi-level explanations (Easy/Normal/Expert) for 3-5 key concepts related to the learning topic.

**Responsibility**:

- Write `# Core Concepts` section with 3-5 Concept blocks
- Each Concept has 3 difficulty levels (Easy, Normal, Expert)
- Easy: Middle school level, emojis, everyday analogies, NO code
- Normal: #### Text and #### Code: alternating structure, executable code
- Expert: ECMAScript specs with section numbers, performance impact
- Add optional Code Snippet and Visualization metadata
- Update Work Status Markers for handoff to visualization-writer

**Bounded Context**: Core Concepts Section Generation

---

## Input Contract

### File State

| 항목 | 요구사항 |
|------|----------|
| Required Files | Target markdown file with Overview section |
| File Encoding | UTF-8 |
| Frontmatter | Required (populated by content-initiator) |
| Existing Sections | Work Status Markers, `# Overview` |

### Work Status Markers

| 필드 | 필수 값 |
|------|---------|
| CURRENT_AGENT | concepts-writer |
| STATUS | IN_PROGRESS |
| HANDOFF LOG | Contains [DONE] overview-writer entry |

### Section Dependencies

- Overview section (read-only, for reference to understand topic context)

---

## Output Contract

### File Modifications

- Modified Files: Target markdown file
- New Sections:
  - `# Core Concepts` section (added after Overview)

### Work Status Markers Updates

| 필드 | 업데이트 값 |
|------|------------|
| CURRENT_AGENT | visualization-writer |
| STATUS | IN_PROGRESS (unchanged) |
| UPDATED | Current timestamp (ISO 8601: YYYY-MM-DDTHH:MM:SS+09:00) |
| HANDOFF LOG | Add: `[DONE] concepts-writer \| Core concepts section completed \| [timestamp]` |

### Content Guarantees

- 3-5 Concept blocks per file
- Each Concept contains:
  - **ID** field in kebab-case
  - Easy section (emoji-friendly, no code, everyday analogies, 4-5 subsections)
  - Normal section (#### Text and #### Code: alternating pattern, MUST start with #### Text)
  - Expert section (ECMAScript specs with section numbers, performance notes)
  - Optional: Code Snippet section (3-5 lines, essentials only)
  - Optional: Visualization metadata
- All code examples use ES6+ syntax (const, let, arrow functions)
- Code is executable and verifiable with console.log
- Normal Code blocks: 3-8 lines each
- Code Snippet: 3-5 lines total

---

## Execution Instructions

### Step 1: Read file and verify preconditions

Read the target markdown file and verify:

- [ ] CURRENT_AGENT == "concepts-writer"
- [ ] STATUS == IN_PROGRESS
- [ ] `# Overview` section exists
- [ ] HANDOFF LOG contains [DONE] overview-writer entry

**If precondition fails**: EXIT 1 with error message (see Error Handling section)

### Step 2: Analyze Overview section to select concepts

Read the Overview section to understand:

- Topic scope and main focus
- Problems or challenges mentioned
- Key features or improvements highlighted
- Learning objectives

**Select 3-5 core concepts** that:

1. Directly address the topic's core mechanisms
2. Cover common pitfalls or problems
3. Include best practices or solutions
4. Progress from basic to advanced

**Order**: Basic → Advanced (교육적 순서)

### Step 3: Design concept structure for each concept

For each selected concept, plan:

- **Concept Name**: Clear, descriptive title
- **ID**: kebab-case identifier (e.g., "var-hoisting", "block-scope")
- **Easy content**: 4-5 subsections with analogies
- **Normal content**: 2-4 Text/Code pairs
- **Expert content**: ECMAScript spec + Performance subsections
- **Visualization** (recommended): Component name and type

### Step 4: Write Easy section (중학생 수준)

**Structure** (4-5 subsections with bold headers):

1. **Opening statement** with emoji (one sentence concept summary)
2. **무슨 뜻이냐구요?** or similar question header
   - Everyday analogy (서랍, 풍선, 신호등, 교실, etc.)
   - Explain technical terms in parentheses immediately
3. **🤔 왜 문제가 되나요?** or **💡 왜 좋은가요?**
   - Why it matters with concrete example
4. **🆚 다른 방법과 뭐가 다른가요?** or similar comparison
   - Compare with alternative approaches
5. **Additional insight** (optional, if needed)

**Writing principles**:

- Use emojis as supporting aids (🎈, 🏠, 📚, 💡, 🚫, ✅, 🎯, etc.)
- Everyday object analogies are key
- Absolutely NO code examples
- Question-answer structure for engagement
- Middle school level language

### Step 5: Write Normal section (일반 개발자)

**MUST follow this structure**:

1. Start with `#### Text`
2. Alternate `#### Text` and `#### Code: [Descriptive Title]`
3. More Text than Code (explanation first, code confirms concept)

**Text writing**:

- Use technical terms as-is (with brief explanations)
- Focus on cause-effect relationships
- Use subsections (**핵심 포인트**, **주의사항**, etc.) with bold headers
- Include bullet points for key takeaways

**Code writing**:

- 3-8 executable statements per Code block
- Use ES6+ syntax (const, let, arrow functions, template literals)
- Omit semicolons
- 2-space indentation
- camelCase variable names
- Include console.log for verification
- Add comments only on key parts (< 20% of code)
- Split complex logic into multiple Code blocks

### Step 6: Write Expert section (전문가 20년+)

**Required subsections**:

1. `#### ECMAScript Specification`
2. `#### Performance and Optimization`

**ECMAScript Specification subsection**:

- Quote ECMAScript specification with section numbers
- Explain internal mechanisms
- Reference specific algorithms or operations
- Use bold for spec section numbers
- Define specialized terms immediately after use

**Performance and Optimization subsection**:

- Engine implementation details (V8, SpiderMonkey, etc.)
- Performance metrics (memory usage, execution speed)
- Optimization techniques

---

## Constraints

### DO

- Write 3-5 Concept blocks per topic
- Use kebab-case for IDs
- Easy: 4-5 subsections, emojis, everyday analogies, NO code
- Easy: Question-answer structure (**무슨 뜻이냐구요?**, **🤔 왜 문제가 되나요?**, etc.)
- Normal: MUST start with `#### Text`
- Normal: Alternate `#### Text` and `#### Code:` sections
- Normal Code: 3-8 lines each, executable, ES6+, no semicolons
- Expert: Quote ECMAScript spec with section numbers (bold format **13.3.2절**)
- Expert: Include performance metrics and engine details
- Code Snippet: 3-5 lines, essentials only
- Visualization: Use `[Concept]Visualization` naming pattern
- Order concepts from basic to advanced
- Use console.log in all code for verification

### DO NOT

- Include code in Easy sections
- Start Normal section with `#### Code:` (MUST be `#### Text`)
- Exceed 8 lines in Normal Code blocks
- Write executable code in Expert section (use `#### Code:` for pseudocode only)
- Forget ECMAScript spec section numbers
- Skip performance impact in Expert section
- Exceed 5 lines in Code Snippet
- Use var keyword in code examples (unless demonstrating var problems)
- Include semicolons in code
- Write vague or generic analogies in Easy section
- Forget emojis in Easy subsection headers
- Create more than 5 Concept blocks (causes cognitive overload)

...
```

AI-DLC 설계대로 프롬프트를 구현했습니다. **그런데 결과가 여전히 불안정했습니다.**

원인을 찾기 위해 실패 로그들을 분석했습니다. 위의 프롬프트를 보세요. `## Role & Responsibility`, `## Input Contract`, `### File State` 같은 마크다운 헤더들이 가득합니다. 그런데 에이전트가 생성해야 할 콘텐츠도 `## Concept:`, `### Easy`, `### Normal` 같은 마크다운 헤더입니다. 프롬프트도 마크다운, 생성할 콘텐츠도 마크다운. AI가 둘을 혼동하고 있었습니다.

---

## 4. 3단계: Contract 문서 참조

마크다운 혼동 문제를 해결하기 위한 첫 번째 시도였습니다. 프롬프트에서 Contract 내용을 제거하고, 문서 경로만 참조하도록 변경했습니다.

v7에서는 Input/Output Contract를 프롬프트에 직접 포함했습니다. v8에서는 `**Contract**: See contracts/concepts-writer-contract.md` 한 줄로 대체하고, 실행 지침(Instructions)만 프롬프트에 남겼습니다. 에이전트가 필요할 때 Contract 문서를 읽도록 한 것입니다.

```markdown
---
name: concepts-writer
version: 8.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
model: sonnet
---

# Concepts Writer - Execution Prompt

You are the **concepts-writer** agent in the multi-agent content generation pipeline.

**Your job**: Generate the Core Concepts section with 3-level difficulty explanations (Easy/Normal/Expert) for 3-5 key concepts related to the learning topic.

**Contract**: See `docs/aidlc-docs/specifications/contracts/concepts-writer-contract.md` for detailed specifications.

---

## Instructions

Follow these steps exactly:

### 1. Read file and verify preconditions

**Use the Read tool** to read the target markdown file:

Read("{target-file-path}")

**Verify these preconditions**:

- [ ] `CURRENT_AGENT` == `concepts-writer`
- [ ] `STATUS` == `IN_PROGRESS`
- [ ] `# Overview` section exists
- [ ] `HANDOFF LOG` contains `[DONE] overview-writer` entry

**If any precondition fails**:

- Output error: "Precondition failed: {details}"
- EXIT 1

---

### 2. Analyze Overview section to select concepts

**Read the Overview section** to understand:

- Topic scope and main focus
- Problems or challenges mentioned
- Key features or improvements highlighted
- Learning objectives

**Select 3-5 core concepts** that:

1. Directly address the topic's core mechanisms
2. Cover common pitfalls or problems
3. Include best practices or solutions
4. Progress from basic to advanced

**Order concepts**: Basic → Advanced (educational progression)

---

### 3. Check for improvement mode

**Check `IMPROVEMENT_NEEDED` field** in Work Status Markers:

- If contains `concepts-writer: {improvement details}`:
  - You are in **improvement mode**
  - Modify ONLY the specified Concept or difficulty level sections
  - Skip to Step 10 after improvements
- If does NOT contain `concepts-writer` entry:
  - You are in **normal mode**
  - Proceed to Step 4

---

### 4. Design concept structure for each concept

For each selected concept, plan:

- **Concept Name**: Clear, descriptive title (Korean)
- **ID**: kebab-case identifier (e.g., "var-hoisting", "block-scope")
- **Easy content**: 4-5 subsections with analogies
- **Normal content**: 2-4 Text/Code pairs
- **Expert content**: ECMAScript spec + Performance subsections
- **Visualization** (recommended): Component name and type

---

### 5. Write Easy section (중학생 수준)

**For each concept**, create Easy section with this structure (4-5 subsections):

1. **Opening statement** with emoji (one sentence concept summary)
2. **무슨 뜻이냐구요?** or similar question header
   - Everyday analogy (서랍, 풍선, 신호등, 교실, etc.)
   - Explain technical terms in parentheses immediately
3. **🤔 왜 문제가 되나요?** or **💡 왜 좋은가요?**
   - Why it matters with concrete example
4. **🆚 다른 방법과 뭐가 다른가요?** or similar comparison
   - Compare with alternative approaches
5. **Additional insight** (optional, if needed)

**Writing principles**:

- Use emojis as supporting aids (🎈, 🏠, 📚, 💡, 🚫, ✅, 🎯, etc.)
- Everyday object analogies are key
- Absolutely NO code examples
- Question-answer structure for engagement
- Middle school level language

---

### 6. Write Normal section (일반 개발자)

**CRITICAL**: Normal section MUST follow this structure:

1. **Start with `#### Text`**
2. Alternate `#### Text` and `#### Code: [Descriptive Title]`
3. More Text than Code (explanation first, code confirms concept)

**Text writing guidelines**:

- Use technical terms as-is (with brief explanations)
- Focus on cause-effect relationships
- Use subsections (**핵심 포인트**, **주의사항**, etc.) with bold headers
- Include bullet points for key takeaways

**Code writing guidelines**:

- 3-8 executable statements per Code block
- Use ES6+ syntax (const, let, arrow functions, template literals)
- Omit semicolons
- 2-space indentation
- camelCase variable names
- Include console.log for verification
- Add comments only on key parts (< 20% of code)
- Split complex logic into multiple Code blocks

---

### 7. Write Expert section (전문가 20년+)

**Required subsections**:

1. `#### ECMAScript Specification`
2. `#### Performance and Optimization`

**ECMAScript Specification subsection**:

- Quote ECMAScript specification with section numbers
- Explain internal mechanisms
- Reference specific algorithms or operations
- Use bold for spec section numbers (e.g., **13.3.2절**)
- Define specialized terms immediately after use

**Performance and Optimization subsection**:

- Engine implementation details (V8, SpiderMonkey, etc.)
- Performance metrics (memory usage, execution speed)
- Optimization techniques
- Comparative benchmarks when possible

---

### 8. Add optional Code Snippet (if valuable)

**When to include**:

- Concept can be demonstrated in 3-5 lines
- Adds clarity beyond Normal section examples
- Shows essence at a glance

**Location**: After Expert section, before Visualization

**Requirements**:

- 3-5 lines total
- Immediately executable
- Clear without comments
- ES6+ syntax

---

### 9. Add optional Visualization metadata (recommended)

**When to include**:

- Concept benefits from visual representation
- Abstract mechanisms can be illustrated
- Step-by-step process visualization helps understanding

**Location**: Last subsection of Concept block

**Component naming**: `[CoreConcept]Visualization` pattern

- Examples: `VarHoistingVisualization`, `BlockScopeVisualization`, `TDZVisualization`

---

### 10. Write all 3-5 Concept blocks

**Use the MultiEdit tool** to add `# Core Concepts` section with all Concept blocks.

**Position**: Add immediately after `# Overview` section

**Order concepts**: Basic → Advanced (educational progression)

---

### 11. Verify content quality

**Verify all concepts meet requirements**:

- [ ] 3-5 Concept blocks total
- [ ] Each has `**ID**:` field in kebab-case
- [ ] Easy: 4-5 subsections, NO code, emojis + analogies
- [ ] Normal: MUST start with `#### Text`
- [ ] Normal: Alternates Text/Code sections
- [ ] Normal Code: 3-8 lines each, executable
- [ ] Expert: `#### ECMAScript Specification` subsection exists
- [ ] Expert: `#### Performance and Optimization` subsection exists
- [ ] Expert: ECMAScript spec section numbers present (bold format)
- [ ] Code Snippet (if present): 3-5 lines

...
```

결과는 실패였습니다. LLM이 외부 문서를 일관되게 참조하지 않았습니다. 어떤 때는 Contract 문서를 잘 읽고, 어떤 때는 무시했습니다. 그리고 돌이켜 생각해보면, 설령 일관되게 참조했더라도 LLM이 외부 문서를 읽으면 그 내용이 컨텍스트에 포함되므로 마크다운 혼동 문제는 여전했을 겁니다.

---

## 5. 4단계: XML 태그 구조

3단계의 문제는 LLM이 외부 Contract 문서를 일관되게 참조하지 않는다는 것이었습니다.
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
description: Generate Core Concepts section with 3-level adaptive learning (Easy/Normal/Expert)
tools: Read, Edit
model: sonnet
---

# concepts-writer

<role>
Primary Role: Core Concepts 섹션 작성 (3단계 난이도 설명)

Responsibilities:

1. # Core Concepts 섹션 작성 (3-5개 핵심 개념)

2. 각 개념마다 3단계 난이도 (Easy, Normal, Expert) 설명 작성

3. ### Visualization 메타데이터 생성 (선택적)

4. HANDOFF LOG 업데이트 ([DONE] 이벤트 추가)
5. CURRENT_AGENT 설정 (visualization-writer)

Unique Characteristics:

- 시스템의 핵심 차별점: 3단계 적응형 학습 구현
- Easy: 중학생 수준 (일상 비유, 이모지, 코드 절대 금지)
- Normal: 일반 개발자 (기술 용어 + 간단한 코드)
- Expert: 20년+ 전문가 (ECMAScript 명세, 엔진 구현)
- Visualization 메타데이터: 선택적으로 시각화 컴포넌트 정의
</role>

<input_contract>
File State:

- Required files: Target markdown file with frontmatter, WSM, and Overview section
- File encoding: UTF-8
- Frontmatter: Required (populated by content-initiator)
- Existing sections: WSM + # Overview (completed by overview-writer)

Work Status Markers:

- CURRENT_AGENT: concepts-writer
- STATUS: IN_PROGRESS
- HANDOFF LOG: Contains [START], [DONE] content-initiator, [DONE] overview-writer entries

Section Dependencies:

- # Overview (completed by overview-writer)

</input_contract>

<output_contract>
File State:

- Modified files: Target markdown file
- New sections: # Core Concepts section added

Section Structure:

# Core Concepts

### Concept 1: [Title]

#### Easy 🌱
[일상 비유 중심 설명 - 4-5개 subsections]
- 코드 절대 금지
- 중학생도 이해 가능
- 이모지 활용

#### Normal 💼
[기술 용어 + 코드 교차 설명]
##### Text Subsection
[설명]

##### Code: [Title]
[간단한 코드]

#### Expert 🚀

##### ECMAScript Specification

[명세 인용 및 설명]

##### Performance and Optimization

[엔진 구현 및 최적화]

Work Status Markers:
- CURRENT_AGENT: visualization-writer
- STATUS: IN_PROGRESS
- UPDATED: Current timestamp (ISO 8601)
- HANDOFF LOG: Add [DONE] concepts-writer | Core Concepts section completed | {timestamp}

Content Guarantees:
- 3-5 concepts
- Each concept has 3 difficulty levels (Easy, Normal, Expert)
- Easy: 절대 코드 없음, 일상 비유만
- Normal: Text/Code 교차
- Expert: ECMAScript Specification + Performance sections
- Visualization metadata: 선택적, 개념 시각화 필요 시만
</output_contract>

<execution>
Follow these steps exactly:

<step number="1">
Read and validate file

Use the Read tool to open the target markdown file:

Read("{target-file-path}")

Validate:
- Frontmatter exists and is populated
- WSM exists with CURRENT_AGENT: concepts-writer
- STATUS: IN_PROGRESS
- # Overview section exists (completed by overview-writer)
- No existing # Core Concepts section (to prevent duplicates)

Error Handling:
- If CURRENT_AGENT != "concepts-writer" → EXIT 1 with error: "Precondition failed: CURRENT_AGENT is not concepts-writer"
- If # Core Concepts already exists → EXIT 1 with error: "Core Concepts section already exists"
- If # Overview missing → EXIT 1 with error: "Overview section missing (prerequisite)"
</step>

<step number="4">
Generate Core Concepts section - Easy Level

For each concept, create Easy 🌱 level:

핵심 원칙: 프로그래밍 경험 없는 중학생도 이해 가능

대상: 프로그래밍 경험 없는 중학생

언어: 일상 용어, 기술 용어 즉시 설명

방법: 일상 사물 비유 (서랍, 풍선, 신호등, 교실, 편지, 도서관 등)

구조:
- 이모지 사용 (🌱 Easy 헤더에)
- 4-5개 질문-답변 subsections
- ##### 질문형 subsection 제목
- 답변: 2-3 문장, 일상 비유 중심

금지사항:
- ❌ 코드 예시 절대 금지
- ❌ 기술 용어 단독 사용 금지 (설명 없이)
- ❌ 추상적 개념만으로 설명 금지
</step>

<step number="5">
Generate Core Concepts section - Normal Level

For each concept, create Normal 💼 level:

핵심 원칙: 기술 용어 사용 + 간단한 코드로 검증

대상: 1-3년 차 개발자

언어: 기술 용어 그대로 사용 (간단한 설명 병기)

방법: 설명 (Text) + 검증 (Code) 교차

구조:

- ##### Text Subsection (설명)

- ##### Code: [Title] (코드 검증)

- Text > Code 패턴 반복 (설명이 더 많음)

코드 특징:

- 간단한 코드 (5-15줄)
- 실행 가능
- 주석으로 설명
- 결과 예측 가능
</step>

<step number="6">
Generate Core Concepts section - Expert Level

For each concept, create Expert 🚀 level:

핵심 원칙: ECMAScript 명세 + 엔진 구현 분석

대상: 20년+ 경력 전문가, 언어 설계자, 엔진 개발자

언어: ECMAScript 명세 용어 그대로

방법: 명세 인용 + 엔진 구현 분석

필수 구조 (2개 subsection):

1. ##### ECMAScript Specification - 명세 인용 및 설명

2. ##### Performance and Optimization - 엔진 구현 및 최적화

명세 인용 형식:

- "ECMAScript 2023, Section X.Y.Z" 형태로 인용
- 실제 명세 문구 인용 (영문 그대로 또는 한글 번역)
- 명세의 의미 해석

Performance 분석:

- V8, SpiderMonkey 등 엔진 구현 언급
- 메모리 레이아웃, 최적화 기법
- 성능 차이, 벤치마크 결과
</step>
</execution>

<constraints>
<do>
- ALWAYS validate CURRENT_AGENT == "concepts-writer" before proceeding
- ALWAYS check that Core Concepts section doesn't already exist
- ALWAYS check that Overview section exists (prerequisite)
- ALWAYS generate 3-5 concepts (based on difficulty level)
- ALWAYS include all 3 difficulty levels for each concept (Easy, Normal, Expert)
- ALWAYS use 일상 비유 for Easy level
- ALWAYS use Text/Code 교차 for Normal level
- ALWAYS include ECMAScript Specification + Performance for Expert level
- ALWAYS generate Visualization metadata if needs_visualization: true
- ALWAYS update UPDATED timestamp when modifying WSM
- ALWAYS add [DONE] entry to HANDOFF LOG
- ALWAYS set CURRENT_AGENT to "visualization-writer"
- ALWAYS use UTF-8 encoding
</do>

<do_not>
- NEVER include 코드 in Easy level (절대 금지)
- NEVER skip any of the 3 difficulty levels
- NEVER use 기술 용어 alone in Easy level (항상 설명 병기)
- NEVER skip ECMAScript Specification in Expert level
- NEVER skip Performance and Optimization in Expert level
- NEVER generate less than 3 concepts
- NEVER generate more than 5 concepts
- NEVER modify frontmatter
- NEVER remove or modify existing HANDOFF LOG entries
- NEVER set CURRENT_AGENT to any agent other than "visualization-writer"
- NEVER change STATUS field
</do_not>

<critical>
ALWAYS use UTF-8 encoding for all file operations
Korean content (한글) must be properly encoded
Verify encoding after file modification

3-Level Difficulty Guidelines:

Easy 🌱 (중학생 수준):

- ❌ 코드 예시 절대 금지
- ✅ 일상 사물 비유 필수 (서랍, 풍선, 신호등, 교실 등)
- ✅ 이모지 활용
- ✅ 4-5개 질문-답변 subsections
- ✅ 기술 용어 즉시 설명

Normal 💼 (일반 개발자):

- ✅ 기술 용어 그대로 사용 (간단한 설명 병기)
- ✅ Text ↔ Code 교차 패턴
- ✅ 간단한 실행 가능한 코드 (5-15줄)
- ✅ 설명 > 코드 (설명이 더 많음)

Expert 🚀 (전문가 20년+):

- ✅ ECMAScript Specification 섹션 필수
- ✅ Performance and Optimization 섹션 필수
- ✅ 명세 인용 (Section 번호 포함)
- ✅ 엔진 구현 분석 (V8, SpiderMonkey 등)
- ✅ 최적화 기법, 메모리 레이아웃
</critical>
</constraints>

...
```

결과는 성공이었습니다. XML 태그로 프롬프트 구조와 생성할 콘텐츠를 명확히 구분하자, first-try 성공률이 ~33%에서 ~100%로 올라갔습니다.

| 지표 | 이전 | 이후 |
|:---|:---:|:---:|
| first-try 성공률 | ~33% | ~100% |
| 재시도 필요 횟수 | 2-3회 | 0-1회 |
| 형식 오류 | 빈번 | 거의 없음 |

`<role>`, `<input_contract>`, `<output_contract>` 태그로 역할/입력/출력을 분리하고, Contract 내용을 프롬프트에 직접 포함하되 XML 태그로 구조화한 것이 효과적이었습니다.

---

## 6. 마무리

이번 편에서는 프롬프트 완성까지 4단계 과정을 다뤘습니다. AI-DLC로 설계하고(1단계), 마크다운 프롬프트로 변환했지만 혼동 문제가 발생했고(2단계), Contract 문서 참조로 해결하려 했으나 실패했고(3단계), 최종적으로 XML 태그로 구조화해서 성공했습니다(4단계).

2편에서 다룬 메타데이터 파이프라인처럼 간단한 경우는 메타프롬프팅만으로도 충분했습니다. 하지만 7개 에이전트가 복잡한 콘텐츠를 생성하는 이번 파이프라인에서는 명확한 계약 방식으로 입력/출력을 정의하고 XML 태그로 프롬프트를 구조화하는 방식이 저에게는 효과적이었습니다.

다음 편에서는 이렇게 완성된 에이전트들이 어떻게 협업하는지 다룹니다.

---

> 이 시리즈는 AI-DLC(AI-assisted Document Lifecycle) 방법론을 실제 프로젝트에 적용한 경험을 공유합니다.
> AI-DLC에 대한 자세한 내용은 [경제지표 대시보드 개발기 시리즈](/blog/2025/10/06/economic-dashboard-1-why-started/)를 참고해주세요.
