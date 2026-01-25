---
title: "[AI Agent Pipeline #3] Why a Single Prompt Didn't Work"
date: "2025-12-23"
tags: ["AI", "Claude Code", "Prompt Engineering", "Agent", "Automation"]
categories: AI-Agent
permalink: /en/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-23"
lang: en
ref: ai-agent-pipeline-3
hidden: true
---

In the [previous article](/en/blog/2025/12/16/ai-agent-pipeline-2-what-to-generate/), we used the metadata pipeline to automatically generate category.yaml and empty content files.

Starting from this article, we'll cover the learning content generation pipeline. Initially, I tried with a single prompt, but it failed.

<!--more-->

## 1. Design Approach: From App Screen to Markdown Structure

Before starting automatic content generation, I first designed the app screens. The workflow went like this:

1. Design the screen (UI) showing how it should look in the app
2. Define markdown structure based on the screen (what sections are needed, what format each section should have)
3. Parse markdown and render with React components
4. Repeatedly modify components and parsing functions until the desired screen is achieved

The markdown structure was determined by working backwards from "how I want to display this." The roughly 1,400-line markdown was a natural result of this process. Now, I needed to make the AI generate this structure consistently.

---

## 2. Started with a Single Prompt, But...

I gave Claude the markdown I created and had it analyze the structure. It identified what sections exist and what format each section follows, then I defined rules based on this and created a single prompt:

```bash
PROMPT="You are the highest-level integrated expert who perfectly writes all sections of all learning content.

## 🎯 Core Mission
Target file: $TARGET_FILE
Topic: $filename

Complete Frontmatter + 5 sections perfectly:
1. Frontmatter (required for webview parser)
2. Overview
3. Core Concepts
4. Code Patterns
5. Experiments
6. Quiz

...

## ⚠️ Absolute Requirements

### Mandatory Rules
1. Existing file priority: If existing content exists, modify/supplement (don't rewrite)
2. Include Frontmatter: Include frontmatter metadata in all files
3. Complete at once: Complete 5 sections with one Write/MultiEdit
4. Reference file level: Same quality level as existing completed files
5. Executable code: All code must be immediately executable in the topic's environment
6. Maintain consistency: Consistency in terminology, concepts, and style across sections
..."
```

It didn't work. Since I reverse-engineered the markdown from the UI and then reverse-extracted rules from that, there was no consistency. The general flow was created, but it wasn't perfect. When generating about 1,400 lines of content at once, the beginning followed instructions well, but the structure fell apart in the middle and the format became completely different toward the end.

> **Lost in the Middle**: The tendency of LLMs to remember the beginning and end of input well but forget the middle part ([Liu et al., 2024](https://arxiv.org/abs/2307.03172))

> **Context Degradation**: The problem where longer outputs gradually forget earlier instructions ([Chroma Research](https://research.trychroma.com/context-rot))

Moreover, if a format error occurred in 1,400 lines of output, a human had to verify it manually. I started automation because I didn't want to organize things manually in Notion, so having to manually verify generated documents felt wrong.

---

## 3. Split into 7 Agents

Initially, I started with 4 agents matching the app's 4 tabs (Overview, Core Concepts, Practice, Quiz). But while building the pipeline, I needed agents to handle the start and end. The content-initiator for file initialization and content-validator for validation were added, making 6 agents.

Then problems arose with concepts-writer. Just explaining core concepts at 3 difficulty levels (Easy/Normal/Expert) was a lot, and asking it to generate visualizations too was too much. concepts-writer would only generate visualization metadata, and actual visualization would be handed off to a separate agent. That's how visualization-writer was created, making it 7 agents in total.

practice-writer handles two sections (Code Patterns + Experiments) but wasn't split further. Code generation is what LLMs do best. In fact, [Claude 3.5 Sonnet achieved 92% on the HumanEval benchmark](https://www.anthropic.com/news/claude-3-5-sonnet), and [Claude Opus 4 achieved 72.5% on SWE-bench](https://www.anthropic.com/news/claude-opus-4-5). There were no major issues with code-related tasks.

| Order | Agent | Responsibility | Characteristics |
|:---:|:---|:---|:---|
| 1 | content-initiator | File initialization, Frontmatter generation | Pipeline start point |
| 2 | overview-writer | # Overview section | Topic overview and key features |
| 3 | **concepts-writer** | # Core Concepts section | **3-level adaptive learning**, visualization metadata |
| 4 | visualization-writer | Actual visualization generation | Based on metadata |
| 5 | practice-writer | # Code Patterns + # Experiments | Code generation is LLM strength |
| 6 | quiz-writer | # Quiz section | 10-12 questions, 6 types |
| 7 | content-validator | Full content validation | Pipeline end point |

With each agent handling only one role, prompts became shorter and rules became clearer.

---

## 4. Initial Agent Prompts

When first splitting the agents, concepts-writer was responsible for visualization too. It explained all core concepts at 3 difficulty levels while simultaneously generating visualizations. Here's part of the prompt at that time:

````markdown
---
name: concepts-writer
version: 6.0.0
description: Agent that explains core concepts by difficulty level and generates visualizations
tools: Read, Write, MultiEdit, Bash
---

You are an expert educator who explains complex technical concepts to learners of various levels.

## Core Mission
Select the core concepts of the topic, explain each concept at 3 difficulty levels,
and generate new visualizations.

## Work Process

### 1. Check Work Instructions
From result/[topicfilename].md YAML front matter:
- target: Check the file path to work on
- references: Reference 02-let-vs-var.md and 03-const-immutability.md

### 2. Reference File Analysis
...

### 3. Core Concepts Writing Rules
Maintain exactly the following order:
Line 1: # Core Concepts (only once per file)
Line 2: Empty line
Line 3: ## Concept: [concept name]
...

## Writing Guidelines by Difficulty

### Easy (Middle school level)
- Use emojis actively (🎯, 📚, 💡, 🏠, 🚫, ✅, etc.)
- Everyday analogies and storytelling
- Explain concepts without code

### Normal (General developers)
- #### Text and #### Code: structure required
- Text explanation is main, code is supplementary
- Include only simple code examples (5-10 lines)

### Expert (Senior developers)
- Cite **ECMAScript specification** with section numbers
- Explain **engine implementation** details
- Use #### Code: header for pseudocode or API signatures

## Important Constraints
1. All required fields must be included (parser fails if any are missing)
2. Follow header levels and formats exactly (##, ###, ####)
3. Easy/Normal/Expert sections are all required
4. Normal starts with #### Text, use #### Code: format
...
````

What's wrong with this prompt?

1. **Markdown confusion?**: The prompt uses `##`, `###`, `####`, and the content to generate uses the same headers—can the LLM distinguish them?
2. **Too many detailed rules?**: Are overly specific instructions like "exactly the following order", "Line 1", "Line 2" the problem?
3. **Implicit handoff?**: Is the unclear state to pass to the next agent the problem?
4. **Reference file dependency?**: Is the pattern of referencing other files unstable?

I split the roles and wrote prompts somewhat systematically, but the results were still unstable. After trial and error—generating documents, checking parsing results, giving feedback, and fixing one by one—I barely completed 3-5 sample documents. But when generating new documents with the same pipeline, problems still occurred.

The next article will cover why it still didn't work even after splitting.

---

> This series shares experiences applying the AI-DLC (AI-Driven Development Lifecycle) methodology to an actual project.
> For more details about AI-DLC, please refer to the [Economic Dashboard Development Series](/en/blog/2025/10/06/economic-dashboard-1-why-started/).
