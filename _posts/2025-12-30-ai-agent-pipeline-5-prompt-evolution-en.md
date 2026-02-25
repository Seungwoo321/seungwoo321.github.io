---
title: "[AI Agent Pipeline #5] 4 Stages to Completing the Prompt"
date: "2025-12-30"
tags: ["AI", "Claude Code", "Prompt Engineering", "Agent", "Automation"]
categories: AI-Agent
permalink: /en/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-30"
lang: en
locale: en
ref: ai-agent-pipeline-5
---

In the [previous article](/en/blog/2025/12/26/ai-agent-pipeline-4-why-still-failed/), we covered the story of deciding to apply the AI-DLC methodology when stuck.

This article summarizes how I completed the prompts while applying AI-DLC.

<!--more-->

## 1. 4 Stages to Completing the Prompt

While applying the AI-DLC methodology, I changed my prompt writing approach four times.

| Stage | Period | Design Approach | Result |
|:---:|:---|:---|:---|
| 1 | Early Oct | Unit decomposition and design | Systematic design based on AI-DLC |
| 2 | Mid Oct | Markdown prompts | Discovered markdown confusion issue |
| 3 | Late Oct | Contract document reference | Improved but unstable |
| 4 | Nov | XML tag structure | **100% stable** |

Currently, I structure prompts with XML tags like `<role>`, `<input_contract>`, `<output_contract>`. After switching to this structure, first-try success rate approached 100%, and I can now reliably generate about 1,400 lines of markdown content.

The following sections summarize each stage.

---

## 2. Stage 1: Unit Decomposition and Design

In AI-DLC, you decompose the system into units, write design documents for each unit, and implement based on these. In this project, agent prompts are the implementation target, so ultimately it comes down to writing prompts. The system was decomposed into 5 units (Pipe, Contract, Prompt, Orchestration, Quality), and design for prompt writing proceeded.

- **Pipe**: Data transfer mechanism between agents
- **Contract**: Input/output contract definition per agent
- **Prompt**: Agent prompt writing
- **Orchestration**: Execution order management with shell scripts
- **Quality**: Quality verification criteria

By executing [AI-DLC prompts](https://github.com/Seungwoo321/aidlc-docs/tree/main/frontend-learning-webview.v2/prompts) step by step, the following document structure was created. However, out of 18 prompts, I only executed up to #15 (unit-05 plan generation). With core functionality implementation complete by #14, I generated only the plan for the quality verification unit with #15 and switched to actual pipeline testing. Improvements like the XML tag structure covered in later sections were discovered and applied during testing.

```
docs/aidlc-docs/
├── system-intent.md                      # System development intent
├── methodology-comparison-report.md      # Architecture comparison report
├── prompts/                              # AI-DLC prompts (18 total, executed up to #15)
│   ├── 01-system-architect-role.md
│   ├── 02-inception-unit-decomposition.md
│   ├── 03-construction-unit1-domain.md
│   ├── ...
│   └── 018-operations-quality-monitoring.md
├── inception/
│   ├── plan.md                           # Execution plan
│   └── units/
│       ├── unit-01-pipe-mechanism.md     # Pipe mechanism unit
│       ├── unit-02-filter-contracts.md   # Filter contracts unit
│       ├── unit-03-agent-prompts.md      # Agent prompts unit
│       ├── unit-04-orchestration.md      # Orchestration unit
│       ├── unit-05-quality-metrics.md    # Quality metrics unit
│       └── integration_plan.md           # Integration plan
├── specifications/
│   ├── work-status-markers-spec.md       # WSM specification
│   └── contracts/                        # Contract documents per agent
│       ├── content-initiator-contract.md
│       ├── overview-writer-contract.md
│       ├── concepts-writer-contract.md
│       ├── visualization-writer-contract.md
│       ├── practice-writer-contract.md
│       ├── quiz-writer-contract.md
│       └── content-validator-contract.md
├── guides/
│   └── agent-handoff-guide.md            # Agent handoff guide
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
│           ├── content-generator-v7.sh   # Orchestration script
│           └── lib/
│               └── common-utils.sh       # Common utilities
└── logs/
    └── content-generator-v7.log          # Execution log
```

The `inception/` folder contains the execution plan and 5 unit definitions. Each unit handles a core component of the pipeline. The `specifications/` folder defines the Work Status Markers spec for data transfer between agents and contract documents for each of the 7 agents. The `guides/` folder contains a guide summarizing handoff rules between agents.

The `construction/` folder is where actual design happens. For each unit, domain design (`domain_design.md`) and logical design (`logical_design.md`) were written. Domain design defines the problems the unit should solve and core concepts, while logical design designs specific implementation approaches. `unit-04-orchestration/src/` contains orchestration code implemented in shell scripts.

---

## 3. Stage 2: Markdown Prompt Generation

In the previous section, Contract documents were written through AI-DLC. Converting these documents to prompts created a completely different structure from v6 in article 4.

Input Contract and Output Contract were separated into explicit sections. What the agent receives as input and what it should output were defined in contract form, and Execution Instructions contained step-by-step execution instructions as checklists. This is how Contract document content was structured with markdown headers and included directly in prompts.

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

| Item | Requirement |
|------|----------|
| Required Files | Target markdown file with Overview section |
| File Encoding | UTF-8 |
| Frontmatter | Required (populated by content-initiator) |
| Existing Sections | Work Status Markers, `# Overview` |

### Work Status Markers

| Field | Required Value |
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

| Field | Update Value |
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

**Order**: Basic → Advanced (educational order)

### Step 3: Design concept structure for each concept

For each selected concept, plan:

- **Concept Name**: Clear, descriptive title
- **ID**: kebab-case identifier (e.g., "var-hoisting", "block-scope")
- **Easy content**: 4-5 subsections with analogies
- **Normal content**: 2-4 Text/Code pairs
- **Expert content**: ECMAScript spec + Performance subsections
- **Visualization** (recommended): Component name and type

### Step 4: Write Easy section (middle school level)

**Structure** (4-5 subsections with bold headers):

1. **Opening statement** with emoji (one sentence concept summary)
2. **What does this mean?** or similar question header
   - Everyday analogy (drawers, balloons, traffic lights, classroom, etc.)
   - Explain technical terms in parentheses immediately
3. **🤔 Why is this a problem?** or **💡 Why is this good?**
   - Why it matters with concrete example
4. **🆚 How is it different from other methods?** or similar comparison
   - Compare with alternative approaches
5. **Additional insight** (optional, if needed)

**Writing principles**:

- Use emojis as supporting aids (🎈, 🏠, 📚, 💡, 🚫, ✅, 🎯, etc.)
- Everyday object analogies are key
- Absolutely NO code examples
- Question-answer structure for engagement
- Middle school level language

### Step 5: Write Normal section (general developers)

**MUST follow this structure**:

1. Start with `#### Text`
2. Alternate `#### Text` and `#### Code: [Descriptive Title]`
3. More Text than Code (explanation first, code confirms concept)

**Text writing**:

- Use technical terms as-is (with brief explanations)
- Focus on cause-effect relationships
- Use subsections (**Key Points**, **Cautions**, etc.) with bold headers
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

### Step 6: Write Expert section (20+ year experts)

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
- Easy: Question-answer structure (**What does this mean?**, **🤔 Why is this a problem?**, etc.)
- Normal: MUST start with `#### Text`
- Normal: Alternate `#### Text` and `#### Code:` sections
- Normal Code: 3-8 lines each, executable, ES6+, no semicolons
- Expert: Quote ECMAScript spec with section numbers (bold format **Section 13.3.2**)
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

Prompts were implemented based on design documents written through AI-DLC. **But the results were still unstable.**

To find the cause, I analyzed failure logs. Look at the prompt above. It's full of markdown headers like `## Role & Responsibility`, `## Input Contract`, `### File State`. But the content the agent should generate also uses markdown headers like `## Concept:`, `### Easy`, `### Normal`. Prompt is markdown, content to generate is also markdown. The AI was confusing the two.

---

## 4. Stage 3: Contract Document Reference

I needed to solve the markdown confusion problem. As a first attempt, I removed Contract content from prompts and had them reference only the document path.

In v7, Input/Output Contracts were included directly in prompts. In v8, I replaced them with a single line `**Contract**: See contracts/concepts-writer-contract.md` and left only execution instructions (Instructions) in the prompt. I had agents read Contract documents when needed.

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

### 5. Write Easy section (middle school level)

**For each concept**, create Easy section with this structure (4-5 subsections):

1. **Opening statement** with emoji (one sentence concept summary)
2. **What does this mean?** or similar question header
   - Everyday analogy (drawers, balloons, traffic lights, classroom, etc.)
   - Explain technical terms in parentheses immediately
3. **🤔 Why is this a problem?** or **💡 Why is this good?**
   - Why it matters with concrete example
4. **🆚 How is it different from other methods?** or similar comparison
   - Compare with alternative approaches
5. **Additional insight** (optional, if needed)

**Writing principles**:

- Use emojis as supporting aids (🎈, 🏠, 📚, 💡, 🚫, ✅, 🎯, etc.)
- Everyday object analogies are key
- Absolutely NO code examples
- Question-answer structure for engagement
- Middle school level language

---

### 6. Write Normal section (general developers)

**CRITICAL**: Normal section MUST follow this structure:

1. **Start with `#### Text`**
2. Alternate `#### Text` and `#### Code: [Descriptive Title]`
3. More Text than Code (explanation first, code confirms concept)

**Text writing guidelines**:

- Use technical terms as-is (with brief explanations)
- Focus on cause-effect relationships
- Use subsections (**Key Points**, **Cautions**, etc.) with bold headers
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

### 7. Write Expert section (20+ year experts)

**Required subsections**:

1. `#### ECMAScript Specification`
2. `#### Performance and Optimization`

**ECMAScript Specification subsection**:

- Quote ECMAScript specification with section numbers
- Explain internal mechanisms
- Reference specific algorithms or operations
- Use bold for spec section numbers (e.g., **Section 13.3.2**)
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

The result was failure. The LLM didn't consistently reference external documents. Sometimes it read Contract documents well, sometimes it ignored them. And thinking back, even if it referenced consistently, when the LLM reads an external document, that content gets included in the context, so the markdown confusion problem would have remained.

---

## 5. Stage 4: XML Tag Structure

The problem with the Contract document reference approach was that the LLM didn't consistently reference external documents. I started looking for solutions from scratch again.

### The Path to Discovering XML Tags

I started searching for Anthropic official videos and YouTube videos about prompts, and **re-read** the prompt-related content in Claude Code official documentation carefully. And what caught my eye consistently was XML tags.

Actually, I had seen content recommending "use XML tags" before, but I ignored it because I wasn't familiar with them.

But my thinking changed when I looked again. Regardless of whether it's recommended, **for this project that generates markdown content with markdown prompts, distinguishing structure with `<>` seemed worth trying**.

### Sources

- [Anthropic Official Docs - Use XML tags](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags): "Claude is particularly skilled at interpreting XML tags"
- [Claude Code Official Docs - Be specific about output format](https://docs.anthropic.com/en/docs/claude-code/best-practices#be-specific-about-output-format): Examples of output format structured with XML tags
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview): Overall prompt engineering guide

The solution was to **include Contract content directly in prompts** but structure it with XML tags.

So I first updated the AI-DLC design documents to include XML tags. I structured Contract content with XML tags like `<input_contract>`, `<output_contract>`, and inlined them directly in prompts.

```markdown
---
name: concepts-writer
description: Generate Core Concepts section with 3-level adaptive learning (Easy/Normal/Expert)
tools: Read, Edit
model: sonnet
---

# concepts-writer

<role>
Primary Role: Write Core Concepts section (3-level difficulty explanations)

Responsibilities:

1. Write # Core Concepts section (3-5 core concepts)

2. Write 3-level difficulty (Easy, Normal, Expert) explanations for each concept

3. Generate ### Visualization metadata (optional)

4. Update HANDOFF LOG (add [DONE] event)
5. Set CURRENT_AGENT (visualization-writer)

Unique Characteristics:

- System's key differentiator: 3-level adaptive learning implementation
- Easy: Middle school level (everyday analogies, emojis, absolutely no code)
- Normal: General developers (technical terms + simple code)
- Expert: 20+ year experts (ECMAScript specs, engine implementation)
- Visualization metadata: Optional, only when concept visualization is needed
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
[Everyday analogy-centered explanation - 4-5 subsections]
- Absolutely no code
- Understandable by middle schoolers
- Use emojis

#### Normal 💼
[Technical terms + code alternating explanation]
##### Text Subsection
[Explanation]

##### Code: [Title]
[Simple code]

#### Expert 🚀

##### ECMAScript Specification

[Spec citation and explanation]

##### Performance and Optimization

[Engine implementation and optimization]

Work Status Markers:
- CURRENT_AGENT: visualization-writer
- STATUS: IN_PROGRESS
- UPDATED: Current timestamp (ISO 8601)
- HANDOFF LOG: Add [DONE] concepts-writer | Core Concepts section completed | {timestamp}

Content Guarantees:
- 3-5 concepts
- Each concept has 3 difficulty levels (Easy, Normal, Expert)
- Easy: Absolutely no code, everyday analogies only
- Normal: Text/Code alternating
- Expert: ECMAScript Specification + Performance sections
- Visualization metadata: Optional, only when concept visualization is needed
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

Core principle: Understandable even by middle schoolers with no programming experience

Target: Middle schoolers with no programming experience

Language: Everyday terms, explain technical terms immediately

Method: Everyday object analogies (drawers, balloons, traffic lights, classroom, letters, library, etc.)

Structure:
- Use emojis (🌱 in Easy header)
- 4-5 question-answer subsections
- ##### Question-style subsection titles
- Answers: 2-3 sentences, everyday analogy-centered

Prohibitions:
- ❌ Absolutely no code examples
- ❌ No using technical terms alone (without explanation)
- ❌ No explaining with abstract concepts only
</step>

<step number="5">
Generate Core Concepts section - Normal Level

For each concept, create Normal 💼 level:

Core principle: Use technical terms + verify with simple code

Target: 1-3 year developers

Language: Use technical terms as-is (with brief explanations)

Method: Explanation (Text) + Verification (Code) alternating

Structure:

- ##### Text Subsection (explanation)

- ##### Code: [Title] (code verification)

- Text > Code pattern repeating (more explanation)

Code characteristics:

- Simple code (5-15 lines)
- Executable
- Explained with comments
- Predictable results
</step>

<step number="6">
Generate Core Concepts section - Expert Level

For each concept, create Expert 🚀 level:

Core principle: ECMAScript spec + engine implementation analysis

Target: 20+ year experts, language designers, engine developers

Language: ECMAScript spec terminology as-is

Method: Spec citation + engine implementation analysis

Required structure (2 subsections):

1. ##### ECMAScript Specification - spec citation and explanation

2. ##### Performance and Optimization - engine implementation and optimization

Spec citation format:

- Cite in "ECMAScript 2023, Section X.Y.Z" format
- Quote actual spec text (English as-is or translated)
- Interpret meaning of spec

Performance analysis:

- Mention engine implementations like V8, SpiderMonkey
- Memory layout, optimization techniques
- Performance differences, benchmark results
</step>
</execution>

<constraints>
<do>
- ALWAYS validate CURRENT_AGENT == "concepts-writer" before proceeding
- ALWAYS check that Core Concepts section doesn't already exist
- ALWAYS check that Overview section exists (prerequisite)
- ALWAYS generate 3-5 concepts (based on difficulty level)
- ALWAYS include all 3 difficulty levels for each concept (Easy, Normal, Expert)
- ALWAYS use everyday analogies for Easy level
- ALWAYS use Text/Code alternating for Normal level
- ALWAYS include ECMAScript Specification + Performance for Expert level
- ALWAYS generate Visualization metadata if needs_visualization: true
- ALWAYS update UPDATED timestamp when modifying WSM
- ALWAYS add [DONE] entry to HANDOFF LOG
- ALWAYS set CURRENT_AGENT to "visualization-writer"
- ALWAYS use UTF-8 encoding
</do>

<do_not>
- NEVER include code in Easy level (absolutely forbidden)
- NEVER skip any of the 3 difficulty levels
- NEVER use technical terms alone in Easy level (always explain)
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
Korean content must be properly encoded
Verify encoding after file modification

3-Level Difficulty Guidelines:

Easy 🌱 (middle school level):

- ❌ Absolutely no code examples
- ✅ Everyday object analogies required (drawers, balloons, traffic lights, classroom, etc.)
- ✅ Use emojis
- ✅ 4-5 question-answer subsections
- ✅ Explain technical terms immediately

Normal 💼 (general developers):

- ✅ Use technical terms as-is (with brief explanations)
- ✅ Text ↔ Code alternating pattern
- ✅ Simple executable code (5-15 lines)
- ✅ Explanation > Code (more explanation)

Expert 🚀 (20+ year experts):

- ✅ ECMAScript Specification section required
- ✅ Performance and Optimization section required
- ✅ Spec citation (with Section numbers)
- ✅ Engine implementation analysis (V8, SpiderMonkey, etc.)
- ✅ Optimization techniques, memory layout
</critical>
</constraints>

...
```

The result was success. When I clearly separated prompt structure and content to generate with XML tags, first-try success rate went from ~33% to nearly 100%. Of course, the rollback and retry mechanism on failure also contributed to final success rate, which I'll cover later.

Separating role/input/output with `<role>`, `<input_contract>`, `<output_contract>` tags, and including Contract content directly in prompts but structuring with XML tags was effective.

---

## 6. Conclusion

This article summarized the 4-stage process to completing prompts. I designed with AI-DLC (Stage 1), converted to markdown prompts but confusion issues occurred (Stage 2), tried to solve with Contract document reference but failed (Stage 3), and finally succeeded by structuring with XML tags (Stage 4).

For simple cases like the metadata pipeline covered in article 2, meta-prompting alone was sufficient. But in this pipeline where 7 agents generate complex content, defining input/output with clear contracts and structuring prompts with XML tags was effective for me.

The next article will cover how the completed agents collaborate.

---

> This series shares experiences applying the AI-DLC (AI-Driven Development Lifecycle) methodology to an actual project.
> For more details about AI-DLC, please refer to the [Economic Dashboard Development Series](/en/blog/2025/10/06/economic-dashboard-1-why-started/).
