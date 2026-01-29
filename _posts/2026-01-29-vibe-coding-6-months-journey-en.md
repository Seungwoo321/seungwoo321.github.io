---
title: "6 Months of Vibe Coding: I Thought I Was Getting Dumber"
date: "2026-01-29"
tags: ["AI", "Claude Code", "Vibe Coding", "Developer Experience", "Productivity"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-01-29"
lang: en
---

"Am I getting dumber?"

A few months after I started using Claude Code, this thought suddenly hit me. AI writes the code, and I just review it. The feeling of typing with my own hands seemed to be fading away.

Six months later, that anxiety has transformed into something completely different. This is a record of that journey.

<!--more-->

## Stage 1: Frustration, Then a New World

I started by creating documents in the Claude chat app. (This was early 2025, before the memory feature existed.)

I struggled for two weeks. When the context got long, it couldn't remember previously declared variables and produced code that didn't work even for the same functionality. I tried to maintain consistency by filtering down to only essential information and worked hard to create the next document. Since I was copying and pasting code, the term "vibe coding" didn't resonate with me.

Then I discovered Claude Code.

I placed the documents I had painstakingly written in the project folder and started development based on them. What amazed me was that it could read incorrectly written code, fix it, and make corrections on its own. Because it has direct access to files.

That's when I realized: not just development, but documentation too—I could just let Claude Code write it.

The two weeks of struggling became meaningless in that moment. Running it in the terminal meant that even when the context filled up, automatic summarization allowed me to continue the next task. In chat, opening a new session made previous conversations useless. I had been using Claude because of its code writing ability compared to ChatGPT, especially its documentation ability, but Claude Code completely changed my workflow.

([Documents I wrote at the time](https://github.com/Seungwoo321/etorch-docs))

---

## Stage 2: Overconfidence, Then Setback

While developing an economic indicators dashboard, I had waiting time. While AI writes code, I just sit there. Too short to do other work, too awkward to just wait. So I started side projects simultaneously. I thought I'd try vibe coding with these.

I enjoyed Flexbox Froggy and wanted to make something similar in JavaScript. I started with a single AI task instruction document. Without concrete planning, I directed it while looking at actual screen results: "do this like this, do that like that." [PenguinJS](https://penguinjs-playground.vercel.app/ko) - I made 2 games and even deployed it. ([GitHub](https://github.com/Seungwoo321/penguinjs))

I also made [tailwind-grid-layout](https://github.com/Seungwoo321/tailwind-grid-layout). A Tailwind CSS version of react-grid-layout. Published to npm.

With PenguinJS, I didn't really understand what I had built. With tailwind-grid-layout, while trying to achieve 100% test coverage using the `--dangerously-skip-permissions` option, git reset was executed and my work was lost. That's when I started using git worktree to separate my work.

Vibe coding without reviewing code had clear limitations. I needed structure.

---

## Stage 3: Starting Over

Right on time, an opportunity came up at work for an AWS AI-DLC workshop. It was training on AI-powered product development methodology.

User stories → Unit separation → Domain model → Logical design → Implementation → Testing. Each stage has verification points, and documents and code are synchronized per Unit. It was a systematic way to collaborate with AI. It felt like I had found a framework to concretize the "vibe" in vibe coding.

I started applying it to the economic indicators dashboard and began writing the [Economic Dashboard AI-DLC Series](/blog/2025/10/06/economic-dashboard-1-why-started/).

I also tried automation using sub-agents. I built a pipeline that automatically generates over 250 learning contents and documented this process in the [AI Agent Pipeline Series](/blog/2025/12/14/ai-agent-pipeline-1-vibe-coding/).

([AI-DLC Documentation](https://github.com/Seungwoo321/aidlc-docs/))

---

## Stage 4: Anxiety and Self-Doubt

I established structure with AI-DLC and built automation pipelines. Results started to show.

But the better things went, the more anxious I became.

**"Am I getting dumber?"**

AI writes the code, and I just review and give feedback. I used to type directly, but now I only read AI-generated code. It felt like my ability to write code by hand was atrophying.

I used to deliberate over writing a single function and carefully consider every variable name. Now I just tell the AI "do it like this" and it's done. It's convenient, but I felt like I was losing something.

What if I have to code without AI later? When Claude Code actually had outages, I felt lost.

---

## Stage 5: Meta-Cognition

While still anxious, I attended FE Conf (a Korean frontend conference) and listened to other developers' stories at various seminars and developer meetups. Other developers were having similar concerns.

Through this, I reached a conclusion.

**AI-generated code performs better than code I write myself.**

This was an undeniable fact. Code that would take me 30 minutes to write, AI writes in 30 seconds, and the quality is generally better. In areas like edge case handling, error handling, and code style consistency.

So the question changes:

- ~~"Am I getting dumber because of AI?"~~
- **"Let AI handle what AI does well, and what should I be doing?"**

There was a time when we moved from hand-coding to IDE autocomplete. Back then, people probably thought "Won't my skills stagnate if I rely on autocomplete?" In 2022, GitHub Copilot officially launched, and tools like Cursor started offering tab completion, bringing another wave of change. I skipped this era. And now, coding agents write the code.

But you can't just go by feeling alone. How you concretize that feeling and convey it to the agent is what matters. The developer's role in code writing is simply shifting.

---

## Stage 6: New Joy, Then Normalcy

After the meta-cognition phase, I've developed a completely different sense.

I used to find joy in writing code directly. Typing, running, seeing results—that process was dopamine.

Now it's different. Those very actions that made me anxious in Stage 4—directing tasks to AI, reviewing results, giving feedback, confirming improved results—this **feedback loop itself** is fun.

Especially the ability to work on multiple tasks simultaneously is huge. Assign task A in one session, task B in another session, review task C in yet another. It feels like distributing work to multiple junior developers and reviewing their output.

And after this stage, it eventually became **normal** for me. Like when we moved from notepad to IDE autocomplete. At first it's fascinating, then it becomes natural, and eventually it will just become a tool.

The resistance, disappointment, and helplessness about using AI disappeared. Like not feeling any special emotion when learning React or Vue. It became a stage of just studying to use it better and finding ways to leverage it.

---

## After That: Trying to Use It Better

After it became normal, automating things when I find inconveniences became a pattern. Things I used to think "this is annoying... should I build it? can I even?" and move on from, I now think "I can have AI do this" and actually build them.

- [genai-commit](https://github.com/Seungwoo321/genai-commit) - Automatic commit message generation
- [genai-sonar-lint](https://github.com/Seungwoo321/genai-sonar-lint) - Linting automation
- [wireweave](https://github.com/wireweave) - DSL for UI wireframing

For reference, here's my usage over the past 9 weeks, checked with the `ccusage` command.

![ccusage weekly report](/assets/images/ccusage-weekly-report.png)

Total of **$6,586.98**, approximately 8.1 billion tokens used.

---

## Conclusion

Here's a summary of my 6-month journey.

1. **Frustration, Then a New World** → Chat limitations, discovered Claude Code
2. **Overconfidence, Then Setback** → The price of not reviewing code
3. **Starting Over** → Learning systematic methodology
4. **Anxiety and Self-Doubt** → "Am I getting dumber?"
5. **Meta-Cognition** → Let AI handle what it does well, focus on my role
6. **New Joy, Then Normalcy** → It just became a tool
7. **After That** → Automation to use AI better

I don't think AI is making us dumber. Let AI handle what AI does well, and we should focus on what we do well. And in that process, might we be able to do things we couldn't do before?

What stage are you at right now?
