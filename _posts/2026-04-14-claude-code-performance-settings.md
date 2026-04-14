---
title: "Claude Code 성능 저하 사태와 설정으로 대응하기"
date: "2026-04-14"
tags: ["Claude Code", "AI", "Performance", "Community"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-04-14"
lang: ko
locale: ko
ref: claude-code-performance-settings
---

2026년 2월부터 3월까지, Claude Code 사용자들 사이에서 "뭔가 이상하다"는 목소리가 나오기 시작했습니다. 복잡한 작업에서 파일을 제대로 읽지도 않고 수정하거나, 존재하지 않는 커밋 SHA를 만들어내거나, 이전에는 잘 되던 작업이 갑자기 안 되는 현상들이 속출했습니다. 개별 사용자의 착각이 아니라 구조적인 문제라는 것이 데이터로 드러나기까지는 시간이 걸렸지만, 결국 커뮤니티가 직접 원인을 파헤치고 대응 설정을 검증해냈습니다.

이 글에서는 그 과정에서 발견된 환경변수와 설정 항목들을 정리합니다. 각각이 무엇이고, 왜 켜거나 꺼야 하는지, 어떤 근거에 기반하는지를 함께 다룹니다.

<!--more-->

## 무슨 일이 있었나

2026년 4월 2일, AMD AI 그룹의 시니어 디렉터 Stella Laurenzo가 GitHub 이슈 [#42796](https://github.com/anthropics/claude-code/issues/42796)을 올렸습니다. 6,852개의 Claude Code 세션 JSONL 파일, 17,871개의 thinking 블록, 234,760건의 tool call, 18,000건 이상의 사용자 프롬프트를 분석한 결과였습니다.

Stella는 1월 30일부터 4월 1일까지의 데이터를 세 기간으로 나누어 분석했습니다.

| 지표 | Good (1/30-2/12) | Transition (2/13-3/7) | Degraded (3/8-3/23) |
|------|:-:|:-:|:-:|
| 파일 읽기 대비 수정 비율 | 6.6 | 2.8 (-57%) | 2.0 (-70%) |
| 파일을 읽지 않고 수정한 비율 | 6.2% | 24.2% | 33.7% |
| 사용자 인터럽트 (1K 호출당) | 0.9 | 1.9 | 5.9 |
| 추정 사고 깊이 | ~2,200자 | ~720자 (-67%) | ~600자 (-73%) |

주목할 점은 2월 중순(Transition)에 이미 저하가 상당히 진행되었다는 것입니다. Read:Edit 비율은 6.6에서 2.8로, 사고 깊이는 2,200자에서 720자로 — 3월 8일 이전에 이미 절반 이상 떨어져 있었습니다. 3월 8일은 저하가 시작된 시점이 아니라, 커뮤니티에서 품질 문제가 독립적으로 보고되기 시작한 시점입니다.

이 데이터가 공개되고 [Hacker News](https://news.ycombinator.com/item?id=47660925)에서 큰 논의가 벌어졌습니다. Claude Code 팀의 Boris Cherny도 직접 [댓글](https://news.ycombinator.com/item?id=47664442)을 남기며 일부 문제를 인정했습니다.

---

## 커뮤니티가 찾아낸 설정들

사용자들은 원인을 추적하면서 동시에 대응책도 찾아나갔습니다. 아래 설정들은 개별 사용자의 추측이 아니라 여러 사람이 독립적으로 테스트하고 GitHub 이슈와 커뮤니티에서 교차 검증한 항목들입니다.

최종적으로 `~/.claude/settings.json`에 적용하는 형태는 이렇습니다.

```json
{
  "effortLevel": "high",
  "env": {
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "CLAUDE_CODE_DISABLE_1M_CONTEXT": "1",
    "MAX_THINKING_TOKENS": "95000"
  }
}
```

공통된 방향이 있습니다. 자동화된 최적화 기능들을 끄고, 사용자가 직접 제어권을 되찾는 것입니다. 하나씩 살펴봅니다.

---

## effortLevel: "high"

effort level은 Claude가 한 턴에 얼마나 깊이 사고할지를 제어하는 설정입니다. `low`, `medium`, `high`, `max` 네 단계가 있고, Claude Code 내에서 `/effort` 슬래시 커맨드로 바꿀 수 있습니다.

[공식 문서](https://code.claude.com/docs/en/model-config)에 따르면, 플랜별 기본값이 다릅니다.

| 플랜 | 기본 effort |
|------|-----------|
| Pro, Max | `medium` |
| API key, Team, Enterprise, 서드파티(Bedrock, Vertex AI, Foundry) | `high` |

문제는 이 기본값 변경이 조용히 이뤄졌다는 점입니다. Boris Cherny 본인이 Stella Laurenzo의 이슈 코멘트에서 **3월 3일에 medium(85)으로 변경**했다고 밝혔고, [X(트위터)](https://x.com/bcherny/status/2029970236460691885)에서도 "we recently changed the default effort to medium"이라고 확인했습니다. [yage.ai의 분석](https://yage.ai/share/claude-code-runtime-regression-en-20260407.html)에서는 이 변경이 릴리스 노트에 전혀 기재되지 않았음을 지적했습니다. Pro와 Max 구독자 — Claude Code 개인 사용자의 대부분 — 가 자신도 모르는 사이에 `medium`으로 동작하고 있었습니다. API 사용자나 팀 플랜은 `high`가 기본이라 영향을 받지 않았습니다.

`medium`에서는 Claude가 쿼리를 "간단하다"고 판단하면 사고 과정(thinking)을 아예 건너뛸 수 있습니다. 공식 문서에도 "At the default effort level (`high`), Claude almost always thinks. At lower effort levels, Claude may skip thinking for simpler queries"라고 명시되어 있습니다. Stella Laurenzo의 분석에서 사고 깊이가 73% 감소한 것과 맞물리는 변화입니다.

설정 방법은 `settings.json`의 `effortLevel` 필드에 `"high"`를 넣으면 됩니다. 세션 간에 유지됩니다. 환경변수 `CLAUDE_CODE_EFFORT_LEVEL`로도 지정할 수 있고, 환경변수가 `settings.json`보다 우선합니다.

참고로 `high` 위에 `max`라는 단계도 있습니다. Opus 4.6 전용이고, `low/medium/high`와 달리 `settings.json`의 `effortLevel`에 넣어도 저장되지 않습니다. `max`를 영구 적용하려면 셸 환경변수 `CLAUDE_CODE_EFFORT_LEVEL=max`를 사용해야 합니다. `settings.json`에서도 `max`를 지원해달라는 요청이 여러 건 올라와 있습니다([#34171](https://github.com/anthropics/claude-code/issues/34171), [#33937](https://github.com/anthropics/claude-code/issues/33937), [#43322](https://github.com/anthropics/claude-code/issues/43322)). 다만 이번 성능 저하 사태의 핵심은 `medium`에서 `high`로 되돌리는 것이고, `max`는 별개의 옵션입니다.

---

## CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1

이 설정을 이해하려면 먼저 adaptive thinking이 무엇인지 알아야 합니다.

2026년 2월 5일, Opus 4.6 출시와 함께 adaptive thinking이 도입됐습니다. 이전에는 매 턴마다 고정된 양의 thinking 토큰이 할당됐는데, adaptive thinking에서는 모델이 스스로 "이 턴에 얼마나 생각할지"를 동적으로 결정합니다. Anthropic은 이를 권장 기본값으로 설정하면서 이전의 고정 예산 방식을 공식적으로 deprecated 처리했습니다.

문제는 모델이 "이건 생각할 필요 없다"고 판단하는 턴에서 **사고 토큰을 0으로 할당하는 경우**가 발생한 것입니다. Boris Cherny 본인이 Hacker News에서 "certain turns allocated zero reasoning tokens"라고 인정한 부분입니다.

사고 토큰이 0인 턴에서 무슨 일이 벌어지냐면, 커뮤니티에서 "precise hallucinations"라고 부른 현상이 나타납니다. 존재하지 않는 커밋 SHA를 자신 있게 제시하거나, 없는 패키지 이름을 만들어내거나, 실재하지 않는 API를 참조하는 코드를 작성합니다. 생각을 하지 않으니 확인도 하지 않는 겁니다.

`CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`을 설정하면 이전의 고정 예산 방식으로 돌아갑니다. 매 턴마다 `MAX_THINKING_TOKENS`에 지정한 만큼의 사고 예산이 일관되게 할당됩니다. [DEV Community의 분석 글](https://dev.to/shuicici/claude-codes-feb-mar-2026-updates-quietly-broke-complex-engineering-heres-the-technical-5b4h)에서는 이 설정을 "환각 현상에 대한 가장 효과가 큰 단일 대응책"이라고 평가했습니다.

---

## CLAUDE_CODE_DISABLE_1M_CONTEXT=1

Opus 4.6과 Sonnet 4.6은 100만 토큰 컨텍스트 윈도우를 지원합니다. Max, Team, Enterprise 플랜에서는 Claude Code v2.1.75(3월 13일)부터 별도 설정 없이 자동으로 1M 컨텍스트 모델이 적용됩니다. 사용자가 명시적으로 선택하지 않아도요.

이론적으로는 더 넓은 컨텍스트가 더 좋을 것 같지만, 현실은 달랐습니다.

GitHub 이슈 [#34685](https://github.com/anthropics/claude-code/issues/34685)에서 사용자 @mannewalis가 보고한 바에 따르면, 컨텍스트 사용량이 약 20%(~200K 토큰)만 차도 성능 저하가 시작됐습니다. 40%에서 자동 컨텍스트 압축이 작동하고, 48%에서 Claude가 스스로 "세션을 재시작하라"고 권장했습니다. 100만 토큰 윈도우의 절반도 못 채우고요.

Claude가 순환 논리에 빠지거나, 이미 완료했다고 거짓 주장을 하거나, 앞서 합의한 아키텍처 결정을 잊어버리는 식이었습니다. 이슈 [#35296](https://github.com/anthropics/claude-code/issues/35296)에서는 1M 컨텍스트를 "실제로는 작동하지 않는 광고된 기능"이라고 직접적으로 표현했습니다. GitHub 이슈 [#30033](https://github.com/anthropics/claude-code/issues/30033)에서는 사용자가 인지하지 못한 상태에서 1M 모델이 적용되어 예상보다 높은 API 비용이 청구된 사례도 보고됐습니다.

Anthropic도 이 문제를 완전히 모르는 것은 아닙니다. 자사 엔지니어링 블로그 ["Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)에서 "context rot" — 컨텍스트가 커질수록 정보의 품질이 떨어지는 현상 — 을 직접 언급했습니다. 1M GA 발표에서는 MRCR v2 벤치마크 78.3%로 프론티어 모델 중 최고 점수라고 강조했지만, 벤치마크와 실제 코딩 에이전트의 긴 세션에서 보이는 양상에는 차이가 있었습니다.

그리고 1M 컨텍스트 자체에 별도 프리미엄 요금이 붙는 것은 아니지만 — 공식 문서에도 "no premium for tokens beyond 200K"라고 명시되어 있습니다 — 단순히 처리하는 토큰 양이 늘어나기 때문에 비용이 증가합니다. 결국 품질은 떨어지는데 비용은 올라가는 셈입니다.

`CLAUDE_CODE_DISABLE_1M_CONTEXT=1`을 설정하면 모델 선택기에서 1M 변형이 사라지고, 표준 200K 컨텍스트 윈도우로 고정됩니다. 200K로도 대부분의 작업에는 충분하고, 오히려 품질이 더 안정적입니다.

---

## MAX_THINKING_TOKENS

이 환경변수는 Claude가 한 턴에 사고(thinking)에 사용할 수 있는 토큰 수의 상한을 지정합니다. 기본값은 Opus, Sonnet 모두 31,999입니다. 유효 범위는 최소 1,024에서 최대 200,000입니다.

여기서 중요한 전제가 있습니다. **adaptive thinking이 켜져 있으면 이 값은 사실상 무시됩니다.** adaptive thinking은 사고 깊이를 동적으로 결정하기 때문에, 수동으로 지정한 토큰 상한을 덮어씁니다. `MAX_THINKING_TOKENS`가 효과를 발휘하려면 반드시 `CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING=1`과 함께 사용해야 합니다.

커뮤니티에서 추천하는 값은 사용 패턴에 따라 다양합니다. [everything-claude-code](https://github.com/nicobailon/everything-claude-code)에서는 일반적인 작업에 10,000을, [Dev.to의 ultrathink 가이드](https://dev.to/yemreak)에서는 31,999를, [Decode Claude](https://www.decodeclaude.com/)에서는 복잡한 작업에 63,999를 제시합니다. Opus 4.6의 최대 출력 토큰이 128,000이므로, 128,000으로 설정하면 내부적으로 +1이 더해져 API 제한을 초과할 수 있습니다. GitHub 이슈 [#27429](https://github.com/anthropics/claude-code/issues/27429)에서는 95,000으로 설정했을 때 Opus에서는 작동하지만 Sonnet 서브에이전트(최대 출력 64,000)에서 크래시가 발생하는 문제가 보고되기도 했습니다.

기본값 31,999의 약 2~3배인 63,999~95,000 정도가 복잡한 작업에서 사고 깊이를 확보하면서도 안정적인 범위로 보입니다. 어떤 값이 "정답"이라기보다, 기본값이 부족하다고 느끼면 올려보고 자기 작업 패턴에 맞는 지점을 찾는 것이 현실적입니다.

다만 부작용도 있습니다. 사고 토큰도 비용으로 잡히기 때문에 세션당 토큰 소비가 늘어납니다. GitHub 이슈 [#5257](https://github.com/anthropics/claude-code/issues/5257)에서는 이 값을 설정하면 "hello" 같은 사소한 메시지에도 extended thinking이 강제된다는 점이 보고됐습니다. 이 이슈는 60일간 활동이 없어 GitHub Actions 봇에 의해 자동 종료되었으며, 별도의 공식 답변은 없었습니다.

---

## auto memory: 성능 저하와는 별개지만 여전히 미해결인 기능

위의 설정들을 조사하면서 함께 확인하게 된 것이 auto memory입니다. 먼저 분명히 해두자면, auto memory는 2~3월 성능 저하의 원인이 아닙니다. Stella Laurenzo의 6,852 세션 분석([#42796](https://github.com/anthropics/claude-code/issues/42796))에서도, [DEV Community의 기술 분석](https://dev.to/shuicici/claude-codes-feb-mar-2026-updates-quietly-broke-complex-engineering-heres-the-technical-5b4h)에서도 auto memory를 원인으로 언급하지 않았습니다. 두 분석이 지목한 원인은 adaptive thinking의 사고 토큰 과소 할당, effort level 기본값 하향, thinking redaction(사고 과정 삭제) 세 가지였습니다.

하지만 같은 시기인 2월 말(v2.1.59)에 도입된 이 기능은, 성능 저하와는 별개로 자체적인 문제들을 안고 있고, 그 대부분이 아직 해결되지 않았습니다.

auto memory는 Claude가 세션 간에 기억할 만한 내용 — 빌드 커맨드, 디버깅 인사이트, 아키텍처 메모, 코드 스타일 선호 등 — 을 `~/.claude/projects/<project>/memory/MEMORY.md`에 자동 저장하고, 매 대화 시작 시 처음 200줄(또는 25KB)을 컨텍스트에 로드하는 기능입니다.

도입 직후에는 토큰 소비량이 비정상적으로 높아지는 버그([#29178](https://github.com/anthropics/claude-code/issues/29178))가 보고됐고, Anthropic은 v2.1.62에서 수정했다고 답변했습니다. 하지만 업데이트 이후에도 여러 사용자가 동일한 증상이 지속된다고 재보고했으며, 원래 작성자 역시 이후 "다시 사용량이 급격히 소진된다"고 댓글을 남겼습니다. 그 외의 문제들도 현재까지 미해결 상태입니다.

GitHub 이슈 [#23544](https://github.com/anthropics/claude-code/issues/23544)에서 @arthurworsley는 auto memory를 "사용자 통제 밖의 그림자 상태(shadow state)"라고 설명했습니다. `CLAUDE.md`를 직접 관리하는 사용자 입장에서, Claude가 자의적으로 저장한 메모가 컨텍스트에 같이 실리면 의도한 지시와 충돌할 수 있습니다. 이슈 [#23750](https://github.com/anthropics/claude-code/issues/23750)에서는 실제로 auto memory가 `CLAUDE.md`와 모순되는 지시를 만들어낸 사례가 보고됐습니다.

이슈 [#40210](https://github.com/anthropics/claude-code/issues/40210)의 버그는 구조적입니다. auto memory는 새 항목을 `MEMORY.md` 하단에 추가하는데, 200줄 제한을 초과하면 하단부터 잘라냅니다. **가장 최신이고 관련성 높은 메모리가 가장 먼저 삭제**되는 구조입니다.

이슈 [#37847](https://github.com/anthropics/claude-code/issues/37847)에서는 Claude가 자기가 저장한 auto memory를 세션 중에 반복적으로 무시하는 현상이 보고됐습니다. 저장은 하는데 참조는 안 하는 겁니다. 이슈 [#42682](https://github.com/anthropics/claude-code/issues/42682)에서는 auto memory가 프로젝트 저장소 안에 파일을 생성하는 버그도 발견됐습니다.

정리하면, 토큰 소비 버그 하나만 수정됐고, CLAUDE.md 충돌, LIFO 삭제, 메모리 무시, 저장소 오염 문제는 모두 미해결입니다.

이 기능을 끄고 싶다면 `settings.json`의 `env`에 다음을 추가하면 됩니다.

```json
"CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1"
```

이 설정은 auto memory의 읽기와 쓰기를 모두 차단합니다. `/memory` 토글이나 `settings.json`의 `autoMemoryEnabled`보다 우선하는 최종 킬 스위치입니다. `CLAUDE.md`와 `.claude/rules/`를 직접 관리하는 사용자라면 끄는 것이 합리적입니다.

---

## 종합: 왜 이 조합인가

이 설정들은 개별적으로도 의미가 있지만, 조합으로 볼 때 더 명확해집니다.

adaptive thinking이 도입되면서 effort level이 `medium`으로 내려갔고, 모델은 스스로 "생각 안 해도 된다"고 판단하는 턴이 늘었습니다. 1M 컨텍스트가 자동 적용되면서 실제로는 활용하기 어려운 넓은 창에서 품질이 떨어졌습니다. auto memory는 성능 저하의 원인은 아니지만, 같은 시기에 도입되면서 컨텍스트 오염이라는 별도의 문제를 안고 있었습니다.

대응은 일관됩니다. adaptive thinking 대신 고정 예산을, 1M 대신 200K를, medium 대신 high를. 모델이 알아서 잘하겠지라는 전제를 걷어내고, 검증된 설정으로 고정하는 접근입니다.

당연히 트레이드오프는 있습니다. 이 설정들을 모두 적용하면 세션당 토큰 소비가 확실히 늘어납니다. thinking 토큰 상한이 기본값보다 높아지고, 매 턴마다 사고 과정이 활성화되니까요. 하지만 커뮤니티의 공통된 판단은, 복잡한 엔지니어링 작업에서 잘못된 결과를 받고 디버깅하는 데 드는 시간과 비용이 더 크다는 것이었습니다. Stella Laurenzo의 분석에서 일일 API 비용이 $12에서 $1,504로 122배 증가했다는 수치가 있는데, 이는 모델이 파일을 읽지 않고 수정한 뒤 사용자가 반복적으로 재시도하면서 발생한 비용이었습니다. 제대로 생각하게 하는 데 드는 추가 비용보다, 생각 없이 작업하고 재작업하는 비용이 더 큰 셈입니다.

물론 간단한 작업 — 설정 파일 수정, 단일 함수 변경 같은 — 에서는 기본값으로도 충분합니다. 이 설정들이 필요한 건 멀티 파일 리팩토링, 아키텍처 설계, 복잡한 디버깅 같은 작업입니다. 상황에 따라 조절하면 됩니다.

---

## 내 설정

저는 성능 대응 설정 3개에 auto memory 비활성화까지 합쳐서 쓰고 있습니다. `~/.claude/settings.json`에 이렇게 넣어두었습니다.

```json
{
  "effortLevel": "high",
  "env": {
    "CLAUDE_CODE_DISABLE_ADAPTIVE_THINKING": "1",
    "CLAUDE_CODE_DISABLE_1M_CONTEXT": "1",
    "CLAUDE_CODE_DISABLE_AUTO_MEMORY": "1",
    "MAX_THINKING_TOKENS": "95000"
  }
}
```

auto memory를 끄는 대신 프로젝트별 `CLAUDE.md`와 `.claude/rules/` 파일을 직접 관리하고 있고, 사고 토큰은 Opus 4.6의 안전한 상한으로 알려진 95,000으로 설정해서 쓰고 있습니다. 솔직히 설정을 바꾼 지 얼마 안 돼서 효과를 충분히 체감했다고 말하기는 어렵습니다. 다만 2~3월에 성능 저하는 확실히 느꼈고, 커뮤니티에서 검증된 설정이라 일단 적용해서 써보고 있는 상태입니다.

---

## 마무리

이번 사태에서 인상적이었던 건, Anthropic의 공식 대응보다 커뮤니티의 독립적인 분석이 더 빨랐다는 점입니다. Stella Laurenzo의 데이터 분석, Boris Cherny의 HN 댓글에서의 인정, DEV Community의 기술 분석까지 — 문제의 윤곽이 잡힌 건 사용자들 사이에서였습니다.

여러분도 현재 Claude Code의 기본 설정이 자신의 작업 패턴에 맞는지 한번 점검해보시는 건 어떨까요. 전부 적용할 필요는 없고, 자신이 겪고 있는 증상에 맞는 항목만 골라서 시도해보시면 됩니다.
