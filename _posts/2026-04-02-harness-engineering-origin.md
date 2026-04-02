---
title: "하네스 엔지니어링, Claude Code 유출 사건으로 알게 된 것들"
date: "2026-04-02"
tags: ["Harness Engineering", "Claude Code", "Agent", "AIDLC"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-04-02"
lang: ko
locale: ko
ref: harness-engineering-origin
---

"이제는 하네스 엔지니어링이다" — 링크드인에서 누군가 이런 글을 올린 걸 봤습니다. 카카오톡 오픈 채팅방에서도 "이제 하네스 엔지니어링을 공부해야 하는 건가요?"라는 채팅이 올라왔습니다. 하네스? 뭐지? 하고 그냥 넘겼습니다.

은근히 외부 동향이나 신기술에 관심이 많은 것 같지만, 사실 저는 그렇지 않습니다. 듣고도 넘기는 일이 많습니다.

그러다 2026년 3월 31일(UTC), Claude Code 소스 유출 사건이 터졌습니다. 처음에는 "아니, 모델이 아니라 CLI가 유출된 건데 그게 그렇게 큰일인가?" 싶었습니다. 그런데 알고 보니 유출된 게 바로 그 **하네스** — 모델을 감싸는 실행 환경 전체 — 였고, 그래서 이걸 클린룸 방식으로 재작성한 [claw-code](https://github.com/ultraworkers/claw-code)가 하루 만에 GitHub 역사상 최단 시간 100K 스타를 찍은 거였습니다.

그제야 아, 하네스가 그런 거였구나, 하고 제대로 찾아보기 시작했습니다. 찾아보니 이미 우리가 하고 있던 것과 꽤 겹치더군요. 이 글에서는 하네스 엔지니어링이 어디서 시작됐는지 정리하고, 제가 써보고 있는 방식도 소개합니다.

<!--more-->

## 하네스란 무엇인가

하네스(Harness)는 원래 말(horse)에게 씌우는 마구를 뜻합니다. 안장, 고삐, 재갈 — 강력하지만 예측 불가능한 동물을 원하는 방향으로 제어하는 장비 세트입니다.

AI 에이전트에서의 하네스도 같은 역할입니다. **모델은 응답을 생성하고, 하네스는 그 외 모든 것을 관리합니다.** 툴 오케스트레이션, 파일시스템 접근, 서브 에이전트 관리, 컨텍스트 구성, 인간 승인, 실패 복구까지. 모델을 감싸서 실제로 "작동하는 시스템"으로 만드는 계층입니다.

---

## 패러다임의 변화

AI 개발 방법론은 세 단계를 거쳐 진화해왔습니다.

| 시기 | 패러다임 | 핵심 질문 |
|------|---------|----------|
| 2022-2024 | **Prompt Engineering** | 모델에게 어떻게 잘 물어볼까? |
| 2025 | **Context Engineering** | 모델에게 어떤 맥락을 줄까? |
| 2026~ | **Harness Engineering** | 모델을 감싸는 시스템을 어떻게 설계할까? |

프롬프트 엔지니어링은 "AI에게 잘 말하는 기술"이었습니다. 컨텍스트 엔지니어링은 "모델에게 필요한 정보를 잘 구성하는 기술"로 확장됐습니다. 하네스 엔지니어링은 여기서 한 단계 더 나아가, **모델을 둘러싼 전체 실행 환경을 설계하는 분야**입니다.

---

## 기원: Mitchell Hashimoto의 블로그

하네스라는 용어가 업계에서 본격적으로 쓰이기 시작한 계기가 있습니다.

**Terraform의 창시자 Mitchell Hashimoto**가 [블로그](https://mitchellh.com/writing/my-ai-adoption-journey)에서 자신의 AI 프로그래밍 여정을 정리했습니다. 그는 AI와 함께 코드를 작성하는 과정을 여러 단계로 나누었는데, 그 마지막 단계를 **"Engineer the Harness"**라고 불렀습니다. 모델 자체를 바꾸는 것보다 모델을 감싸는 하네스를 잘 설계하는 것이 더 큰 차이를 만든다는 통찰이었습니다.

이후 **OpenAI**가 Codex 기반의 내부 개발 방법론을 [Harness Engineering](https://openai.com/index/harness-engineering/)이라는 글로 공개하면서 용어가 공식화됐습니다. **Martin Fowler**도 [자신의 블로그](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)에서 하네스 엔지니어링을 다루면서 정식 엔지니어링 분야로 인정받기 시작했습니다.

---

## 왜 지금 뜨는가

2025년에 GPT-4.1, Claude Sonnet 4, Gemini 2.5 Pro 등이 쏟아지면서 흥미로운 현상이 생겼습니다. **모델 간 성능 차이는 점점 줄어드는데, 같은 모델이라도 어떤 하네스에서 돌리느냐에 따라 완전히 다른 결과가 나온다**는 것을 다들 체감한 겁니다.

Claude Code가 강력한 이유도 Claude 모델 자체의 성능만이 아닙니다. 세션 관리, 툴 실행 프레임워크, 컨텍스트 컴팩션, MCP 오케스트레이션 등 **하네스 설계가 잘 되어 있기 때문**입니다.

모델은 엔진이고, 하네스는 차체입니다. 아무리 좋은 엔진이라도 차체, 조향 장치, 브레이크가 없으면 도로 위에서 쓸모가 없습니다.

---

## 하네스가 관리하는 것들

구체적으로 하네스는 어떤 것들을 담당할까요? 어떤 도구를 어떤 순서로 호출할지, 어떤 파일을 읽고 쓸 수 있는지, 복잡한 작업을 여러 에이전트에 어떻게 분배할지. 대화 기록을 압축하고 관련 정보를 선별하며, 위험한 작업 전에는 사용자 확인을 받고, 에러가 나면 자동으로 재시도하거나 대안 경로를 찾습니다. 시스템 프롬프트와 규칙을 주입하고, 작업 전후에 커스텀 로직을 실행하는 플러그인/훅 시스템까지. 모델 바깥의 모든 것이 하네스의 영역입니다.

---

## 현재 하네스 생태계

이런 배경 때문인지, 2026년 현재 하네스를 둘러싼 오픈소스 생태계가 빠르게 형성되고 있습니다. "하네스 전쟁(Harness War)"이라는 표현이 나올 정도입니다.

| 프로젝트 | Stars | 설명 |
|---------|-------|------|
| **OpenClaw** | 250K+ | 멀티 플랫폼 AI 어시스턴트 |
| **superpowers** | 110K+ | 에이전트 스킬 프레임워크 |
| **everything-claude-code** | 130K+ | Claude Code 하네스 최적화 시스템 |
| **claw-code** | 128K+ | Claude Code 하네스의 클린룸 리라이트 |
| **DeerFlow** | 37K+ | ByteDance의 SuperAgent 하네스 |
| **revfactory/harness** | 1.5K+ | 에이전트 팀을 설계하는 메타 스킬 |
| **oh-my-openagent** | - | 멀티 모델 에이전트 하네스 |

---

## 그래서 나는 어떻게 써보고 있는가

저는 AWS 워크샵에서 알게 된 **[AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)** 방법론을 Claude Code 스킬로 만들어서 쓰고 있었는데, 이번에 하네스를 알게 되면서 [revfactory/harness](https://github.com/revfactory/harness)의 참조 자료를 거의 그대로 가져다가 합쳐봤습니다. 저는 이 둘을 제가 쓰기 편한 형태로 조합해서 써보고 있는 중입니다. 관심 있으시면 [aidlc-plugin](https://github.com/Seungwoo321/aidlc-plugin) 레포를 참고해주세요.

이미 잘 만들어진 것을 그대로 쓰는 것도 좋은 방법이지만, 나에게 맞게 조금씩 바꿔보는 재미도 있습니다. 여러분도 자주 쓰는 워크플로우가 있다면 하네스로 한번 구성해보는 건 어떨까요.

---

## 마무리

프롬프트 엔지니어링이 "AI에게 잘 말하는 기술"이었다면, 하네스 엔지니어링은 "AI가 잘 일할 수 있는 환경을 만드는 기술"입니다. 모델은 계속 발전하겠지만, 같은 모델로도 하네스에 따라 전혀 다른 결과가 나오는 시대입니다. 완성된 정답은 없고, 각자의 도메인과 워크플로우에 맞는 하네스를 찾아가는 과정 자체가 중요하다고 생각합니다.

---

**참고 자료**

하네스 엔지니어링을 이해하는 데 도움이 된 글:
- [2025 Was Agents. 2026 Is Agent Harnesses. — Aakash Gupta](https://aakashgupta.medium.com/2025-was-agents-2026-is-agent-harnesses-heres-why-that-changes-everything-073e9877655e)
- [What Is an Agent Harness? — Salesforce](https://www.salesforce.com/agentforce/ai-agents/agent-harness/?bc=OTH)
- [What is an agent harness? — Parallel Web Systems](https://parallel.ai/articles/what-is-an-agent-harness)

관련 레포:
- [obra/superpowers](https://github.com/obra/superpowers) — 에이전트 스킬 프레임워크 (110K+ Stars)
- [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — 멀티 모델 에이전트 하네스
- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — LangChain의 에이전트 하네스
