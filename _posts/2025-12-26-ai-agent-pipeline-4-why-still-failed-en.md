---
title: "[AI Agent Pipeline #4] Why It Still Didn't Work After Splitting"
date: "2025-12-26"
tags: ["AI", "Claude Code", "Prompt Engineering", "Agent", "Automation"]
categories: AI-Agent
permalink: /en/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-26"
lang: en
locale: en
ref: ai-agent-pipeline-4
---

In the [previous article](/en/blog/2025/12/23/ai-agent-pipeline-3-why-seven-agents/), we covered why a single prompt didn't work and the process of splitting into 7 agents.

This article covers what I tried after splitting the agents, and why it still didn't work.

<!--more-->

## 1. Prompt Pollution

When I ran the pipeline and parsing errors occurred, I would pass the error content and sample markdown to Claude and request fixes. Claude would say "fixed" while adding new forbidden rules and required rules.

```markdown
## Absolute Prohibitions
1. Do not confuse markdown header levels
2. Do not add unnecessary comments inside code blocks
3. Do not use emojis
4. Do not use more than two consecutive blank lines
5. ...
```

At first, it seemed effective. But as error types diversified, rules kept accumulating. The prompt grew longer, and new rules started conflicting with existing rules. Eventually, the LLM couldn't follow all rules simultaneously.

Looking back, this approach had several fundamental problems.

### 1.1 Limitations of Negative Instructions

"Don't do X" instructions are not effective for LLMs.
They first think of "what not to do," then end up doing it.

```markdown
# Bad
"Do not put Korean comments inside code blocks"

# Better
"Use only English comments in code blocks"
```

### 1.2 Rule Conflicts

Rules conflict when trying to prevent different errors.

```markdown
Rule A: "Always write complete, executable code"
Rule B: "Keep code concise within 10 lines"
```

### 1.3 Context Pollution

When prompts get too long, LLMs forget the beginning.
The more rules there are, the less they follow truly important instructions.

---

## 2. Introducing Handoff Guide

Apart from prompts, there was another problem. Agents execute sequentially, but what happens if the previous agent's work is abnormal and the next agent keeps running? Documents with missing sections are hard to fix and keep wasting tokens. I needed a way to track how far each agent worked and pass state to the next agent. So I created a 280-line handoff guide document:

```markdown
# Handoff Guide

## Overview
This document defines rules for task transfer (handoff) between agents.

## Handoff Marker Location
At the top of Markdown file, after frontmatter:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: [agent-name] -->
<!-- PROGRESS: [In Progress|Waiting|Complete] -->
<!-- VALIDATION_SCORE: [score/100] -->
<!-- IMPROVEMENT_NEEDED:
  - [agent-name]: [improvement] ([deduction] points)
-->
<!-- STARTED: [YYYY-MM-DD HH:MM] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
Per-agent work records
-->

## Agent Execution Order
1. content-initiator: Discover target files and create pipeline start markers
2. overview-writer: Write overview section
3. concepts-writer: Write core concepts section + define visualization requirements
4. visualization-writer: Generate visualization components
5. practice-writer: Write practice section
6. quiz-writer: Write quiz section
7. content-validator: Verify overall content quality and finalize

## Retry Mechanism
- Shell script: Sequential execution of all agents (max 3 times)
- content-validator score check: 100 points immediate completion, 90-99 points retry
...
```

Each agent checks the status markers (Work Status Markers) at the top of the markdown file before starting work, and updates the markers for the next agent when done. I also defined a mechanism where the validation agent (content-validator) retries from the beginning if the score is below 90, and passes if 90 or above. I thought this would be enough.

---

## 3. Trying English Version

Claude was primarily trained in English, and [multilingual training data is about 10%](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf). So after hearing that "English prompts are more effective," I tried an English version:

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

#### Automatic File Discovery

When no specific file is provided by the orchestration script, automatically discover your target file.

Use the Grep tool to search for files containing the `CURRENT_AGENT: concepts-writer` marker.

#### Work Status Marker Verification

Check the Work Status Markers at the top of each file to determine if you should work on it:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: concepts-writer -->
<!-- PROGRESS: 대기중 -->

**Execution Conditions**:

- ONLY proceed if `CURRENT_AGENT` is set to `concepts-writer`
- If another agent is specified, skip this file

**Improvement Mode Detection**:

- Check for `IMPROVEMENT_NEEDED` field containing feedback for `concepts-writer`
- Example: `- concepts-writer: Rewrite Easy explanations completely (-6 points)`
- If improvement needed, modify ONLY the specified sections
- Remove the improvement item from `IMPROVEMENT_NEEDED` after completion

### Work Initiation and Marker Updates

#### On Work Start

Update markers to indicate you've begun work:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: concepts-writer -->
<!-- PROGRESS: 진행중 -->
<!-- STARTED: [original-time] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
[previous logs]
[WAITING] concepts-writer: 진행중 - [YYYY-MM-DD HH:MM]
-->

## Core Concepts Writing Specifications

Maintain this exact structure:

Line 1: # Core Concepts (once per file)
Line 2: Empty line
Line 3: ## Concept: [Concept Name]
Line 4: Empty line
Line 5: **ID**: [identifier]

- Use kebab-case
- Meaningful name that encapsulates the concept

### Easy Section Writing Rules

**Required Components**:

1. **One-line concept summary** (first sentence)
2. **🎈🏃‍♂️🎭 Analogy-centered explanation** (main part)
3. **🤔💡 Problem/advantage explanation** (why it matters)
4. **🆚 Comparison with other concepts** (differences)

**Writing Principles**:

- Emojis as **supporting aids** only
- **Everyday analogies** are key (drawers, balloons, traffic lights, etc.)
- Technical terms → **immediately explain in simple words**
- **Absolutely NO code** (Easy is for pure concept understanding)
- Each subsection follows **question-answer structure**

### Normal Section Writing Rules

#### #### Text and #### Code Alternating Structure Required

Exact pattern:

1. #### Text - Technical explanation

2. #### Code: [Descriptive Title] - Code example

3. #### Text - Additional explanation (if needed)

4. #### Code: [Another Example] (if needed)

**Code Writing Rules**:

- **3-8 executable statements** (never exceed 10)
- Comments only on **key parts** (less than 20% of total)
- **More Text than Code** (explanation first)
- Split complex logic into **multiple Code blocks**
- Use ES6+ syntax (const, let, arrow functions)
- Verifiable results with console.log

Text Writing Rules:

- Use technical terms as-is
- Focus on cause-effect relationships
- Summarize key points with bullet points

### Expert Section Writing Rules

Required Components:

1. **ECMAScript Specification Perspective** subsection
2. Specification section numbers and content citations
3. **V8 Engine Implementation** subsection (optional)
4. **Performance and Optimization** subsection

#### Code: [Pseudocode/API] Usage

- Not executable code, but explanatory code
- Express ECMAScript internal operations
- C++ code or assembly also acceptable

Text Writing Rules:

- Add definitions immediately after using specialized terms
- Always mention performance implications
- Include memory usage or execution speed metrics

## Critical Constraints

1. **UTF-8 Encoding (CRITICAL)**: All files MUST be written in UTF-8 encoding.
2. All required fields must be included (parser fails if any missing)
3. Strictly follow header levels and formats (##, ###, ####)
4. Easy/Normal/Expert sections all required
5. Normal must start with #### Text, use #### Code: format
6. Expert code uses #### Code: format

## Work Status Marker Management and Handoff

### On Work Completion

Update markers to hand off to the next agent:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: visualization-writer -->
<!-- PROGRESS: 대기중 -->
<!-- STARTED: [original-time] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
[previous logs]
[DONE] concepts-writer: 완료 - [YYYY-MM-DD HH:MM]
[WAITING] visualization-writer: 대기중 - [YYYY-MM-DD HH:MM]
-->

### Handoff Rules

1. **Change CURRENT_AGENT to "visualization-writer"**
2. **Change PROGRESS to "대기중"**
3. **Update UPDATED timestamp**
4. **Add completion record to HANDOFF LOG**

### Agent Chain

**content-initiator** → overview-writer → **concepts-writer** → visualization-writer → practice-writer → quiz-writer → content-validator

- Previous Agent: overview-writer
- Next Agent: visualization-writer
```

The results were similar even in English. According to Anthropic's [Context Engineering Guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), as models improve, **what information you provide** becomes more important than the exact wording of prompts. Language didn't seem to be the problem. But then what was the problem and how to solve it—I still couldn't figure it out.

---

## 4. "I Don't Know Why It's Not Working"

The prompts were hundreds of lines long with great detail. I split into 7 agents, defined specific rules for each agent. When errors occurred, I added rules, created handoff guides, and tried English versions. But each execution produced different results. Nothing was a fundamental solution.

---

## 5. Turning Point: Applying AI-DLC

In this stuck situation, I decided to apply the AI-DLC (AI-Driven Development Lifecycle) methodology.

AI-DLC is a methodology for developing software in collaboration with AI. However, the [AI-DLC whitepaper](https://github.com/Seungwoo321/aidlc-docs/blob/main/ai-dlc-whitepaper-ko.md) is based on DDD variations and includes backend and infrastructure concepts, making it difficult to apply directly to the current project (a pipeline orchestrating agent prompts with shell scripts).

So I wrote an [Architecture Comparison Report](https://github.com/Seungwoo321/aidlc-docs/blob/main/frontend-learning-webview.v2/methodology-comparison-report.md). After comparing 5 architectures, I chose **Modular Monolithic Pipeline Architecture**. The structure where 7 agents execute sequentially naturally matched the Pipeline's filter concept.

I proceeded with the AI-DLC development process, but selected the actual system architecture to fit the project.

The next article will cover how that turned out.

---

> This series shares experiences applying the AI-DLC (AI-Driven Development Lifecycle) methodology to an actual project.
> For more details about AI-DLC, please refer to the [Economic Dashboard Development Series](/en/blog/2025/10/06/economic-dashboard-1-why-started/).
