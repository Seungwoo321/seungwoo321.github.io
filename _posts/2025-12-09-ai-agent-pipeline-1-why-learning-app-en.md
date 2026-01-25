---
title: "[AI Agent Pipeline #1] Why I Started Building a Learning App"
date: "2025-12-09"
tags: ["AI", "Claude Code", "Learning", "Side Project"]
categories: AI-Agent
permalink: /en/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-09"
lang: en
locale: en
ref: ai-agent-pipeline-1
hidden: true
---

Have you ever gotten tired of studying with LLMs?

I did. So I decided to auto-generate learning content with LLM and turn it into an app.

> This series documents a side project I worked on in the second half of 2025.

<!--more-->

## 1. The Limits of Learning with LLMs

After ChatGPT came out, my learning pattern changed like this:

1. When I have a question about a concept, I ask ChatGPT
2. Organize the answer in Notion
3. Next day, another question comes up
4. Ask again, organize again...
5. A week later, I can't remember what I originally organized

The problem was **consistency**.

- The depth of explanation differs between yesterday's question and today's
- Same concepts explained with different terminology
- No connection between the organized notes

Eventually, only fragmented pieces of knowledge piled up in Notion.

---

## 2. The Learning Content I Wanted

While asking LLMs questions and organizing answers, I realized:
"I wish I had learning materials like this":

**Consistent Structure**

It would be great if all topics were organized in the same format.
It was tiring to organize answers that came in different formats every time.

**Level-based Explanations**

I wanted to see explanations from easy to expert level for any concept.
I wanted to know how deep my current understanding was,
and how much more I needed to learn.

**Visualizations**

Visualization was the hardest part when organizing in Notion myself.
When asking LLM for visualizations, it consumes many tokens and produces slightly different results each time.
I wished there was content with consistent visualizations.

**Quizzes**

Just reading text is boring.
I wanted to solve problems, test my knowledge, and revive past memories.
Personally, it's also the learning method that works best for me.

---

## 3. The Idea: Auto-generating Content with LLM

Making this kind of learning content manually would take too long.
JavaScript alone has dozens of topics, and each topic requires substantial content.

So the idea came to me:

**"Auto-generate learning content with LLM and turn it into an app"**

This was the goal from the beginning.
Not just building a learning app,
but creating both a **content auto-generation pipeline** and an **app** together.

The core idea was **3-level adaptive learning**:

| Level | Target | Explanation Style |
|:---:|:---|:---|
| **Easy** | Programming beginners | Daily analogies, visualizations, no code |
| **Normal** | General developers | Technical terms + code examples |
| **Expert** | 10+ year seniors | Specifications, engine implementation, optimization |

If users can choose explanations at their level,
the same content can serve learners from beginners to experts.

---

## 4. The Method: Claude Code Sub-agents

I chose **Claude Code's sub-agents** for auto-generating content.

I was subscribed to the Max Plan but wasn't using all the available tokens each week. Looking at the Claude Code CLI documentation, I found I could automate by passing prompts with the `claude -p` option.

I had two goals:

1. **Learning content auto-generation pipeline**: Generate markdown content with AI agents
2. **Learning app**: Render generated content and provide interaction

This series covers the first goal: building the pipeline.

The next part will cover what we're going to generate.

---

> This series shares experiences applying the AI-DLC (AI-Driven Development Lifecycle) methodology to a real project.
> For more details about AI-DLC, please refer to the [Economic Dashboard Development Series](/en/blog/2025/10/06/economic-dashboard-1-why-started/).
