---
title: "[AI 에이전트 파이프라인 #9] 파이프라인 단순화"
date: "2026-01-13"
tags: ["AI", "Claude Code", "프롬프트 엔지니어링", "에이전트", "자동화"]
categories: AI-Agent
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-01-13"
lang: ko
ref: ai-agent-pipeline-9
---

[지난 편](/blog/2026/01/09/ai-agent-pipeline-8-rollback-mechanism/)에서는 재시도와 롤백 메커니즘을 다뤘습니다.

이번 편에서는 **파이프라인을 운영하면서 발견한 개선점들**을 정리했습니다.

<!--more-->

8편까지의 과정을 진행하면서 약 250개의 학습 콘텐츠가 생성되었습니다. 초기에는 파이프라인 테스트를 위해 지속적으로 생성했습니다. 그러다 보니 토큰 소모가 빨라서 주간 리셋 2-3일 전에 토큰을 다 써버리는 일이 잦았습니다. 그래서 지금은 토큰 사용량을 모니터링하면서, 이번 주에 토큰이 남을 것 같으면 스크립트를 돌려 주간 사용량을 채우는 방식으로 운영하고 있습니다.

한편, 블로그 시리즈를 작성하면서 설계 문서와 프로세스를 다시 점검하게 되었고, 그 과정에서 몇 가지 개선점을 발견했습니다.

## 1. category-parser 추가

파이프라인을 운영하다가 문제를 발견했습니다. 하드코딩된 10개 카테고리가 모두 처리되자 "나머지는 어디 있지?"라는 의문이 생겼습니다.

[2편](/blog/2025/12/16/ai-agent-pipeline-2-what-to-generate/)에서 소개한 메타데이터 파이프라인은 토픽 문서에서 category.yaml과 빈 마크다운 파일을 생성합니다. 그런데 카테고리 목록이 스크립트에 하드코딩되어 있었습니다.

```bash
# 기존 방식: 카테고리 목록이 스크립트에 하드코딩
get_topics() {
    local subject=$1
    case "$subject" in
        "javascript-core-concepts")
            echo "01-variables 02-type-system 03-operators ... 10-functions-basic"
            ;;
        ...
    esac
}
```

토픽 문서에는 javascript-core-concepts만 해도 42개 카테고리가 있습니다. 그런데 스크립트에는 10개뿐이었습니다. 10개 주제, 총 169개 카테고리를 모두 하드코딩하는 건 비현실적이었습니다.

해결책은 토픽 문서에서 카테고리 목록을 자동으로 추출하는 것이었습니다. 토픽 문서의 `### N. 제목` 패턴을 파싱하면 모든 카테고리를 추출할 수 있습니다. category-parser 에이전트를 추가해서 이 패턴을 찾고, 각 카테고리에 ID를 부여한 뒤 manifest 파일로 저장하도록 했습니다.

```json
{
  "categories": {
    "javascript-core-concepts": ["01-variables", "02-type-system", ..., "42-metaprogramming"]
  }
}
```

이제 스크립트는 manifest 파일에서 카테고리를 읽어옵니다. 토픽 문서에 카테고리가 추가되면 category-parser를 실행하기만 하면 됩니다.

---

## 2. practice-writer 제거

파이프라인이 완성되고 나서 개발 외 다른 주제로 테스트해봤습니다. 역사, 언어, 수학 같은 비-프로그래밍 분야에도 적용할 수 있는지 확인하고 싶었습니다.

문서 생성과 파싱은 정상이었습니다. 하지만 콘텐츠를 살펴보니 practice-writer가 생성하는 `Code Patterns`와 `Experiments` 섹션이 어색했습니다. 역사나 언어 학습에서 코드 블록이 필요할까요? 그리고 이 앱은 모바일 환경입니다. 코드 에디터도 없고, 실행 환경도 없습니다.

practice-writer를 제거했습니다.

---

## 3. 연쇄적 리팩토링

1-8편까지 블로그를 작성하면서 설계 문서와 프로세스를 다시 점검했습니다. 그 과정에서 연쇄적인 개선이 이루어졌습니다.

### 3.1 IMPROVEMENT_NEEDED 발견

content-validator의 프롬프트에 `IMPROVEMENT_NEEDED`라는 필드를 다루는 규칙이 있었습니다. 검증 점수가 90점 미만이면 어떤 에이전트가 개선해야 하는지 파일에 기록하고, 해당 에이전트부터 다시 시작하는 방식이었습니다. 4편에서 언급한 "각 에이전트가 독립적으로 점수를 매기고 수정을 지시하는" 초기 접근 방식의 흔적이었습니다.

다 제거된 레거시라고 생각했는데, 확인해보니 content-validator에만 일부 남아있었습니다. 문제는 각 에이전트에서 IMPROVEMENT_NEEDED를 처리하는 부분이 없었다는 것입니다. content-validator가 개선 지시를 남겨도 다른 에이전트들이 이를 읽고 처리하는 로직이 없었습니다. 사실상 동작하지 않는 코드였습니다.

왜 이걸 몰랐을까요? 8편에서 구현한 백업/롤백 메커니즘이 효과적이었기 때문입니다. 각 에이전트 단계에서 postcondition 실패 시 백업으로 롤백하고 재시도하는 방식이 대부분의 문제를 해결했습니다. content-validator까지 도달했을 때 점수 미달인 경우가 거의 없었고, 미달이 나면 그냥 처음부터 다시 시작했습니다. 사례가 거의 없다 보니 정확한 원인을 눈치채지 못했습니다.

선택지는 두 가지였습니다. 각 에이전트 프롬프트를 보완해서 IMPROVEMENT_NEEDED가 정상 동작하도록 하거나, 제거하거나. 백업/롤백이 이미 효과적으로 동작하고 있었기 때문에 제거하기로 했습니다.

### 3.2 JSON Schema 도입

IMPROVEMENT_NEEDED를 제거하고 끝난 게 아니었습니다. 새로운 처리 흐름이 필요했습니다.

각 에이전트 단계에서는 백업/롤백으로 재시도합니다. 하지만 content-validator에서 점수 미달이 되면 어떻게 해야 할까요? 이 시점에서는 파일 백업이 있는지 확실하지 않습니다. 내용이 남아있는 상태에서 "무엇 때문에 점수가 미달인지"를 파악하고, 해당 에이전트에게 피드백을 전달해서 재시도해야 했습니다.

기존에는 LLM 응답을 그대로 출력하고 있었습니다. 문제 에이전트를 파싱하려고 보니 출력 형식이 일정하지 않아 정확히 추출하기 어려웠습니다. Claude에게 물어보니 `--output-format json`과 `--json-schema` 옵션을 사용하면 출력 형식을 고정할 수 있다고 제안했습니다.

```bash
# JSON 스키마로 구조화된 출력
"$CLAUDE_PATH" -p "$prompt" \
    --output-format json \
    --json-schema "$json_schema" \
    ...

# jq로 간단하게 추출
local problem_section=$(jq -r ".structured_output.problem_section" "$json_file")
local feedback=$(jq -r ".structured_output.feedback" "$json_file")
```

content-validator뿐 아니라 모든 에이전트 출력에 JSON Schema를 적용했습니다. 출력 로그가 정형화되면서 파싱이 안정적으로 동작하게 되었습니다.

### 3.3 content-initiator 발견 및 제거

JSON Schema 적용으로 출력 로그가 심플해졌습니다. 그러자 이전부터 알고 있었지만 신경 쓰지 않았던 문제가 눈에 들어왔습니다. 로그가 항상 2/7로 시작하고 있었습니다. 1단계가 스킵된다는 건 알고 있었습니다. 당시에는 어차피 결과가 같으니 크게 신경 쓰지 않았습니다.

이번에는 확실하게 해결하기로 했습니다. 왜 스킵되는지, 없애도 되는지, 메타데이터 파이프라인이 생성하는 것과 content-initiator가 생성하는 것에 차이가 있는지 검증했습니다.

메타데이터 파이프라인에서 이미 마크다운 파일을 생성하고 있었습니다. 콘텐츠 파이프라인의 1단계인 content-initiator는 전제조건 검사에서 "이미 파일이 존재함"으로 판단되어 건너뛰어지고 있었습니다. content-initiator의 역할은 빈 마크다운 파일을 생성하고 기본 front matter를 작성하는 것이었습니다. 메타데이터 파이프라인과 동일한 결과물이었습니다.

LLM 에이전트가 아니라 쉘 함수로 충분했습니다. 메타데이터 파이프라인에서 이미 쓰고 있던 `initialize_markdown_file()` 함수를 콘텐츠 파이프라인에도 적용했습니다.

### 3.4 최종 재시도 흐름

이러한 과정을 거쳐 완성된 재시도 흐름입니다.

1. **각 에이전트 단계**: postcondition 실패 시 백업으로 롤백하고 재시도 (최대 3회)
2. **content-validator 점수 미달**: JSON에서 `problem_section`과 `feedback` 파싱 → 해당 에이전트 1회 재실행
3. **재검증 성공**: 파이프라인 완료
4. **재검증 실패**: `reset_file_with_frontmatter()` → `initialize_markdown_file()` 호출 → 파일 초기화 후 종료

```bash
# content-validator 점수 미달 시 revision mode
if [ "$agent_name" = "content-validator" ] && [ $postcond_result -eq 2 ]; then
    local problem_section=$(parse_agent_json "content-validator" "problem_section" "quiz")
    local feedback=$(parse_agent_json "content-validator" "feedback" "")
    local problem_agent=$(get_problem_agent "$problem_section")

    # 해당 에이전트 1회 재실행
    execute_revision_with_json "$problem_agent" "$revision_prompt" "$session_id"

    # 재검증
    if [ $revalidate_result -eq 0 ]; then
        return 0  # 성공
    else
        reset_file_with_frontmatter "$file_path"  # 초기화
        return 1
    fi
fi
```

무한루프를 방지하기 위해 재시도는 1회로 제한했습니다. 그래도 실패하면 파일을 초기화하고 종료합니다. 다음 실행 시 처음부터 다시 시작됩니다.

---

## 마무리

이번 편에서는 파이프라인을 운영하면서 발견한 개선점들을 정리했습니다.

- **category-parser 추가**: 하드코딩된 169개 카테고리 목록 대신 토픽 문서에서 동적으로 파싱
- **practice-writer 제거**: 비-프로그래밍 주제 테스트 결과 불필요하다고 판단
- **연쇄적 리팩토링**: IMPROVEMENT_NEEDED 제거 → JSON Schema 도입 → content-initiator 제거 → 최종 흐름 완성

7개였던 콘텐츠 에이전트가 5개로 줄었습니다. IMPROVEMENT_NEEDED 기반의 복잡한 개선 루프 대신 단순한 실패/재시도 구조가 되면서 디버깅도 쉬워졌습니다.

다음 편에서는 지금까지의 여정을 돌아보며 시리즈를 마무리할 예정입니다.

---

> 이 시리즈는 AI-DLC(AI-assisted Document Lifecycle) 방법론을 실제 프로젝트에 적용한 경험을 공유합니다.
> AI-DLC에 대한 자세한 내용은 [경제지표 대시보드 개발기 시리즈](/blog/2025/10/06/economic-dashboard-1-why-started/)를 참고해주세요.
