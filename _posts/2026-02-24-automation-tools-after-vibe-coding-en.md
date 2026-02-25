---
title: "6 Months of Vibe Coding: Automating One Annoyance at a Time"
date: "2026-02-24"
tags: ["AI", "Claude Code", "Automation", "Dev Tools", "Productivity"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-24"
lang: en
locale: en
ref: vibe-coding-automation-tools
---

"When I find something inconvenient, automating it has become a pattern."

I wrote this in my [6-month retrospective](/blog/2026/01/29/vibe-coding-6-months-journey/). Without any grand plan, I just built tools one by one, starting with whatever annoyed me. In this post, I'll talk about those tools.

<!--more-->

The biggest change after using Claude Code for 6 months is that I no longer hesitate over "should I build this or not" — I just build it.

## Things I Wanted to Do

8 years ago, I tried to automate EC2 access and Bastion server permission management with shell scripts. I struggled for days. That's when I decided:

"Never use shell scripts again."

Node or Python is so much easier. Of course, I never actually built it. There was no real trigger to do so.

But this time, working with LLMs, I started writing shell scripts again. Because I can just ask the AI to do it. What used to take days now takes minutes.

([Those old shell scripts](https://github.com/Seungwoo321/shellScript) - last updated October 2021)

---

## Commit Message Automation

### The Start: Shell Script

While working with Claude Code, having to tell it to commit after every task felt like it broke my workflow. But writing commit messages manually was tedious too.

So I made a script that handles commits in a separate terminal.

```bash
./scripts/generate-commit-msg.sh
```

It sends the diff via `claude -p`, receives a message in JSON, and commits after user confirmation.

It worked well. The problem came next.

### The Problem: Deployment Hassle

3-4 work project worktrees, 4-5 personal side projects. Almost 10 projects were using this script.

When I fixed a bug, I had to copy it to all 10 projects. Worktree projects had conflicts when modified on both sides.

Beyond deployment issues, there were functional limitations too. Diffs over 50KB got truncated, making messages weird for large changes. So I made v2, compressing file lists into tree format to process without information loss.

But then I had to copy v2 to all 10 projects again.

### The Solution: Node.js CLI

I ended up making it an npm package. Running it with `npx` means no copying to each project.

```bash
npx genai-commit claude-code
```

One more thing: I didn't want to waste Claude Code tokens. My company provides a Cursor license that I wasn't really using. So I added Cursor CLI support.

```bash
npx genai-commit cursor-cli
```

I also added Jira integration. Enter a ticket URL and it combines previous commits for that ticket with current changes into one commit. Originally I split commits by diff size, but bundling same-ticket work together is cleaner.

I kept one principle: commit only happens after the user types `y` when the message is displayed. And it never pushes.

([genai-commit GitHub](https://github.com/Seungwoo321/genai-commit))

---

## Linting Automation

A tool I made while considering SonarLint adoption.

Initially I tried to process all rules at once. But there was a problem. Applying the first fix changes line numbers. Then the second fix applies to the wrong place.

So I switched to processing one rule at a time. Apply fix → re-run ESLint → select next rule. Analyze with fresh line numbers each time.

```bash
npx genai-sonar-lint analyze src/
```

I divided the roles:

- **Human**: Decides which rule and how to handle it (fix/disable/ignore)
- **Script**: Runs ESLint, collects results, applies fixes
- **LLM**: Generates fix code

It's not just fixes. It also supports disabling rules or adding `eslint-disable` comments. Not everything needs to be fixed by AI. Sometimes ignoring is the right call.

([genai-sonar-lint GitHub](https://github.com/Seungwoo321/genai-sonar-lint))

---

## Session Management: Trello Skill

I work with multiple Claude Code terminals open. A few work projects, a few personal projects. Running them simultaneously, I lose track of what I did in which session.

So I made a Claude Code skill (custom slash command) that integrates with Trello.

```
/trello create    → Create new card (auto-summary from conversation)
/trello log       → Add work content as comment
/trello done      → Change status
```

When starting a session, create a card. Log progress along the way. Mark done when finished. Later when wondering "what did I do last time?", just check the card.

---

## Ticket Management: Jira Skill

My company uses Jira. Creating and managing tickets takes considerable time. Sometimes it feels inefficient.

But the company uses it for quantitative evaluation metrics, and it's also an attempt to systematize work processes. I decided not to just resist it.

So I chose to automate within the given environment.

```
/jira              → View current branch ticket
/jira list         → My assigned tickets
/jira status wip   → Change status
/jira comment "content" → Add comment
```

Natural language works too. Like "show my tickets" or "change this to done".

Here's something to think about. Status changes, comment additions, list queries — scripts can do all of these. It's possible without AI.

What can AI additionally automate? **Generative text**. Writing ticket content, summarizing comments, generating commit messages.

Once this distinction became clear, deciding where to use AI and where to use scripts became easier.

---

## What Changed

Before, I only automated what scripts could handle. Status changes, file processing, API calls.

Now generative text is also an automation target. Commit messages, ticket content, code fixes. Things I would have said "humans should do this" about before.

And being able to quickly build these tools with AI is significant. The distance from idea to implementation has shortened.

---

## Wrap Up

In my 6-month retrospective I said "if it's inconvenient, automate it" — these are the actual things I built. Automatic commit message generation (genai-commit), linting automation (genai-sonar-lint), multi-session management (Trello skill), ticket management automation (Jira skill).

In the next post, I'll talk about [Wireweave](https://wireweave.org), a DSL for screen planning.
