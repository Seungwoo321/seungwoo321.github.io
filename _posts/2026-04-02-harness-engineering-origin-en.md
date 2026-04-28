---
title: "Harness Engineering: What I Learned from the Claude Code Leak"
date: "2026-04-02"
tags: ["Harness Engineering", "Claude Code", "Agent", "AIDLC"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-04-02"
lang: en
locale: en
ref: harness-engineering-origin
series: "claude-code"
---

"It's the age of harness engineering now" — I saw someone post this on LinkedIn. In a KakaoTalk open chat, someone asked, "Do we need to study harness engineering now?" Harness? What's that? I scrolled past.

I might seem like someone who keeps up with trends and new tech, but honestly, I'm not. I see things and move on more often than not.

Then on March 31, 2026 (UTC), the Claude Code source leak happened. My first reaction was, "Wait, the model didn't leak — just the CLI. Why is everyone losing their minds?" But it turned out that what leaked was the **harness** — the entire execution environment wrapping the model — and that's why [claw-code](https://github.com/ultraworkers/claw-code), a clean-room rewrite of it, hit 100K GitHub stars in a single day, the fastest in history.

That's when it clicked. Oh, so that's what a harness is. I started digging in properly. Turns out, it overlapped quite a bit with what we were already doing. In this post, I'll cover where harness engineering started and how I've been trying it out myself.

<!--more-->

## What Is a Harness?

The word "harness" originally refers to the tack you put on a horse — saddle, reins, bit. A set of equipment to control a powerful but unpredictable animal and steer it in the right direction.

In AI agents, a harness plays the same role. **The model generates responses; the harness manages everything else.** Tool orchestration, filesystem access, sub-agent management, context composition, human approval, failure recovery. It's the layer that wraps a model and turns it into an actual working system.

---

## The Paradigm Shift

AI development methodology has evolved through three stages.

| Period | Paradigm | Core Question |
|--------|----------|---------------|
| 2022-2024 | **Prompt Engineering** | How do we ask the model well? |
| 2025 | **Context Engineering** | What context do we give the model? |
| 2026~ | **Harness Engineering** | How do we design the system wrapping the model? |

Prompt engineering was "the art of talking to AI well." Context engineering expanded to "the art of composing the right information for the model." Harness engineering goes one step further — **it's the discipline of designing the entire execution environment surrounding the model**.

---

## Origin: Mitchell Hashimoto's Blog

There's a specific moment when the term "harness" started gaining traction in the industry.

**Mitchell Hashimoto, the creator of Terraform**, wrote a [blog post](https://mitchellh.com/writing/my-ai-adoption-journey) reflecting on his AI programming journey. He broke down the process of writing code with AI into several stages, and he called the final stage **"Engineer the Harness."** His insight was that designing the harness well makes a bigger difference than switching the model itself.

Later, **OpenAI** published [Harness Engineering](https://openai.com/index/harness-engineering/), formalizing the term through their internal Codex-based methodology. **Martin Fowler** also covered it on [his blog](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html), helping establish it as a recognized engineering discipline.

---

## Why Now?

In 2025, GPT-4.1, Claude Sonnet 4, Gemini 2.5 Pro, and others poured in, and something interesting happened. **The performance gap between models kept shrinking, yet the same model under different harnesses produced completely different results** — and everyone felt it.

Claude Code isn't powerful just because of the Claude model itself. It's because the **harness design is solid** — session management, tool execution framework, context compaction, MCP orchestration, and more.

The model is the engine; the harness is the chassis. No matter how good the engine, without a chassis, steering, and brakes, it's useless on the road.

---

## What a Harness Manages

What exactly does a harness handle? Which tools to call in what order, which files can be read or written, how to distribute complex tasks across multiple agents. It compresses conversation history and filters relevant information, gets user confirmation before risky operations, and automatically retries or finds alternative paths when errors occur. It injects system prompts and rules, and runs custom logic before and after tasks through plugin/hook systems. Everything outside the model is the harness's domain.

---

## The Current Harness Ecosystem

Perhaps because of this, the open-source ecosystem around harnesses is forming rapidly in 2026. The term "Harness War" has even emerged.

| Project | Stars | Description |
|---------|-------|-------------|
| **OpenClaw** | 250K+ | Multi-platform AI assistant |
| **superpowers** | 110K+ | Agent skills framework |
| **everything-claude-code** | 130K+ | Claude Code harness optimization system |
| **claw-code** | 128K+ | Clean-room rewrite of Claude Code harness |
| **DeerFlow** | 37K+ | ByteDance's SuperAgent harness |
| **revfactory/harness** | 1.5K+ | Meta-skill for designing agent teams |
| **oh-my-openagent** | - | Multi-model agent harness |

---

## How I'm Trying It Out

I had been using the **[AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)** methodology (which I learned about at an AWS workshop) as Claude Code skills. After learning about harnesses this time, I took the reference materials from [revfactory/harness](https://github.com/revfactory/harness) pretty much as-is and combined them. I'm trying out this combination in a form that works for me. If you're interested, check out the [aidlc-plugin](https://github.com/Seungwoo321/aidlc-plugin) repo.

Using well-made things as-is is perfectly fine, but there's also a certain fun in tweaking them to fit your own needs. If you have workflows you use often, why not try structuring them as a harness?

---

## Closing

If prompt engineering was "the art of talking to AI well," harness engineering is "the art of building an environment where AI can work well." Models will keep improving, but we're in an era where the same model produces entirely different results depending on the harness. There's no finished answer — I think what matters is the process of finding the harness that fits your own domain and workflow.

---

**References**

Articles that helped me understand harness engineering:
- [2025 Was Agents. 2026 Is Agent Harnesses. — Aakash Gupta](https://aakashgupta.medium.com/2025-was-agents-2026-is-agent-harnesses-heres-why-that-changes-everything-073e9877655e)
- [What Is an Agent Harness? — Salesforce](https://www.salesforce.com/agentforce/ai-agents/agent-harness/?bc=OTH)
- [What is an agent harness? — Parallel Web Systems](https://parallel.ai/articles/what-is-an-agent-harness)

Related repos:
- [obra/superpowers](https://github.com/obra/superpowers) — Agent skills framework (110K+ Stars)
- [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — Multi-model agent harness
- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — LangChain's agent harness
