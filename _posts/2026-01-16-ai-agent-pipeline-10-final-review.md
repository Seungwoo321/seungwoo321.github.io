---
title: "[AI 에이전트 파이프라인 #10] 완성된 앱과 회고"
date: "2026-01-16"
tags: ["AI", "Claude Code", "프롬프트 엔지니어링", "에이전트", "자동화"]
categories: AI-Agent
locale: ko
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-01-16"
---

[지난 편](/blog/2026/01/13/ai-agent-pipeline-9-pipeline-complete/)에서는 파이프라인을 운영하면서 발견한 개선점들을 다뤘습니다.

이번 편은 **마지막 편**입니다. 2025년 8월에 시작해서 6개월, 드디어 완성입니다. 완성된 앱의 UI와 기술 선택에 대한 회고를 다룹니다.

<!--more-->

## 1. 완성된 콘텐츠 UI

에이전트 파이프라인이 생성한 마크다운이 앱에서 어떻게 렌더링되는지 보여드리겠습니다.

먼저 앱에서 학습 탭을 클릭하면 전체 탭에서 모든 주제 문서의 카테고리 목록이 표시됩니다. 아래 스크린샷에서는 JavaScript Browser Concepts가 첫 번째 주제로 보입니다. 카테고리를 선택하면 10개 토픽이 나타나고, 토픽을 선택하면 WebView가 콘텐츠를 렌더링합니다.

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/01-learning-topics.png" alt="학습 탭 토픽 목록 (모바일)" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/01-learning-topics.png" alt="학습 탭 토픽 목록 (태블릿)" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">학습 탭 전체 목록 - 모바일(좌)과 태블릿(우)</figcaption>
</figure>

"1. 브라우저 아키텍처 완전 정복" 카테고리를 선택하면 10개 토픽 목록이 나타납니다. 여기서 "브라우저의 멀티 프로세스 아키텍처는 어떻게 구성될까?" 토픽을 선택하면 WebView가 파이프라인이 생성한 콘텐츠를 렌더링합니다. 아래 스크린샷부터가 파이프라인 결과물입니다.

토픽 화면은 3개 섹션으로 구성됩니다: 개요, 핵심개념, 퀴즈. 상단의 "선택된 설명 수준"은 환경설정에서 지정한 기본 난이도입니다. 아래 스크린샷에서는 3단계 난이도를 모두 보여주기 위해 일반, 쉬움, 전문가 탭을 차례로 선택했습니다. 핵심개념 섹션에서는 concepts-writer가 생성한 3단계 난이도 설명을 탭으로 전환하며 볼 수 있습니다. "쉬움"을 선택하면 콘텐츠 하단에 "중학생도 이해할 수 있는 설명" 배지가 표시되고, "전문가"를 선택하면 "20년 이상 전문가를 위한 깊은 설명" 배지가 표시됩니다. 기본값인 "일반"에는 배지가 없습니다.

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/02-topic-concepts-normal.png" alt="핵심개념 일반 (모바일)" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/02-topic-concepts-normal.png" alt="핵심개념 일반 (태블릿)" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">핵심개념 - 일반 난이도</figcaption>
</figure>

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/03-topic-concepts-easy.png" alt="핵심개념 쉬움 (모바일)" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/03-topic-concepts-easy.png" alt="핵심개념 쉬움 (태블릿)" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">핵심개념 - 쉬움 (중학생도 이해할 수 있는 설명)</figcaption>
</figure>

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/04-topic-concepts-expert.png" alt="핵심개념 전문가 (모바일)" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/04-topic-concepts-expert.png" alt="핵심개념 전문가 (태블릿)" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">핵심개념 - 전문가 (기술적 깊이 있는 설명)</figcaption>
</figure>

퀴즈 섹션에서는 quiz-writer가 생성한 12문제로 학습 내용을 점검합니다. 각 문제의 난이도는 1-5 숫자로 표시되며, 난이도 1-2가 4문제, 난이도 3이 5문제, 난이도 4-5가 3문제로 고정 배분됩니다.

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/05-topic-quiz.png" alt="퀴즈 섹션 (모바일)" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/05-topic-quiz.png" alt="퀴즈 섹션 (태블릿)" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">퀴즈 섹션 - 12문제로 학습 내용 점검</figcaption>
</figure>

9편에서 다뤘듯이, 모바일 환경의 한계와 비개발 주제와의 부조화로 practice-writer를 제거했습니다. 원래 실습 섹션(Code Patterns, Experiments)이 있었지만, 모바일 앱에서 코드를 직접 실행하기 어렵고 비개발 주제에서도 어색했기 때문입니다. 최종 UI는 개요, 핵심개념, 퀴즈 3개 섹션으로 구성됩니다.

---

## 2. 왜 Claude Code였는가

이 작업을 시작한 2025년 8월에는 에이전트 프레임워크에 대해 알지 못했습니다. 당시 Max Plan을 구독하고 있었는데 매주 사용 가능한 토큰을 다 소진하지 못하고 있었습니다. 그래서 이 토큰을 활용할 방법을 찾다가 Claude Code CLI 문서에서 `-p` 옵션으로 프롬프트를 전달할 수 있다는 걸 알게 됐습니다. CLI 기반 반복 작업을 자동화하려면 쉘 스크립트가 자연스러운 선택이었습니다.

파이프라인이 어느 정도 완성된 후에 에이전트 프레임워크들을 알게 됐습니다.

| 프레임워크 | 특징 |
|:---|:---|
| **LangGraph** | LangChain 기반 그래프 워크플로우. 상태 관리와 체크포인팅 내장, 조건부 분기 지원 |
| **CrewAI** | 역할 기반 멀티에이전트. 에이전트 간 협업 패턴이 잘 정의됨, 러닝커브 낮음 |
| **AutoGen** | Microsoft의 대화형 에이전트. 코드 실행 환경 내장, 멀티에이전트 대화 지원 |

이 프레임워크들은 체계적인 상태 관리와 체크포인팅을 제공하고, 에이전트 간 협업 패턴도 잘 정의되어 있었습니다. 6편에서 다룬 WSM(Work Status Markers)이나 Contract의 Precondition/Postcondition 검증처럼 쉘 스크립트로 직접 구현한 것들이 이미 프레임워크에 내장되어 있었습니다.

마이그레이션을 잠깐 고민했습니다. 하지만 이미 Max Plan을 구독하고 있었고, 남는 토큰을 활용하면 추가 비용 없이 파이프라인을 실행할 수 있었습니다. 에이전트 프레임워크를 알게 됐을 때는 이미 Claude Code 서브에이전트로 충분히 동작하는 파이프라인을 완성한 상태였기 때문에 지금 당장 새 프레임워크로 다시 구축할 필요는 없었습니다. 나중에 기회가 되면 실제 비용을 비교해서 API 호출 방식으로 마이그레이션하는 것도 고려해볼 생각입니다.

"쉘 스크립트 대신 Python이나 Node.js로 짜면 더 깔끔하지 않나?"라는 생각이 들 수도 있습니다. 맞습니다. 하지만 이미 최적화해서 안정적으로 동작하고 있기 때문에 굳이 다시 작성할 이유가 없었습니다.

---

## 3. 전체 시리즈 정리

10편에 걸쳐 다룬 내용을 정리해봤습니다.

| # | 제목 | 핵심 |
|:---:|:---|:---|
| 1 | [학습 앱을 만들기 시작한 이유](/blog/2025/12/09/ai-agent-pipeline-1-why-learning-app/) | 동기와 목표 |
| 2 | [무엇을 생성할 것인가](/blog/2025/12/16/ai-agent-pipeline-2-what-to-generate/) | 토픽 문서 설계 |
| 3 | [하나의 프롬프트로는 왜 안 됐을까](/blog/2025/12/23/ai-agent-pipeline-3-why-seven-agents/) | 단일 프롬프트 실패 |
| 4 | [분리했는데 왜 여전히 안 됐을까](/blog/2025/12/26/ai-agent-pipeline-4-why-still-failed/) | 프롬프트 오염 |
| 5 | [프롬프트 완성까지의 4단계](/blog/2025/12/30/ai-agent-pipeline-5-prompt-evolution/) | XML 태그 도입 |
| 6 | [7개 에이전트는 어떻게 협업하는가](/blog/2026/01/02/ai-agent-pipeline-6-seven-agents-collaboration/) | WSM과 Contract |
| 7 | [쉘 스크립트로 에이전트 실행하기](/blog/2026/01/06/ai-agent-pipeline-7-shell-orchestration/) | 정상 실행 흐름 |
| 8 | [재시도와 롤백](/blog/2026/01/09/ai-agent-pipeline-8-rollback-mechanism/) | 실패 처리 흐름 |
| 9 | [개선점 발견과 리팩토링](/blog/2026/01/13/ai-agent-pipeline-9-pipeline-complete/) | 에이전트 단순화 |
| 10 | **완성된 앱과 회고** (이번 편) | UI와 기술 선택 회고 |

---

## 4. 마무리

2025년 8월부터 2026년 1월까지, 약 6개월간의 여정이었습니다.

메타데이터 파이프라인은 처음부터 잘 작동했습니다. 문제는 콘텐츠 생성이었습니다. 약 1,400줄의 마크다운을 안정적으로 생성하는 게 쉽지 않았습니다. 단일 프롬프트로 시도했다가 실패하고, 7개 에이전트로 분리했지만 여전히 불안정했습니다. 에러가 나면 규칙을 추가했고, 규칙이 늘어날수록 더 나빠졌습니다.

AI-DLC 방법론을 적용하면서 Contract 패턴을 도입했습니다. 각 에이전트가 무엇을 입력받고 무엇을 출력해야 하는지 명확히 정의했습니다. 하지만 마크다운 프롬프트로 마크다운 콘텐츠를 생성하니 LLM이 둘을 혼동했습니다. XML 태그로 프롬프트 구조와 콘텐츠 구조를 분리하자 first-try 성공률이 100%에 가까워졌습니다.

에이전트 프레임워크를 알게 된 건 이미 Claude Code 서브에이전트로 파이프라인을 완성한 후였습니다. LangGraph나 CrewAI로 마이그레이션하면 더 체계적인 구조를 갖출 수 있겠지만, 지금 당장은 필요하지 않았습니다.

1,690개 이상의 토픽을 위한 파이프라인이 완성되었습니다. 이제 시간만 투자하면 나머지 콘텐츠도 생성할 수 있습니다.

이 시리즈가 비슷한 시도를 하는 분들께 도움이 되길 바랍니다.

---

> 이 시리즈는 AI-DLC(AI-Driven Development Lifecycle) 방법론을 실제 프로젝트에 적용한 경험을 공유합니다.
> AI-DLC에 대한 자세한 내용은 [경제지표 대시보드 개발기 시리즈](/blog/2025/10/06/economic-dashboard-1-why-started/)를 참고해주세요.
