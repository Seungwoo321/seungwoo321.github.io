---
name: write-post
description: 이 블로그의 소개와 작성 원칙에 맞춰 경험 중심 초안을 쓰고 독립된 구조·문장 검토를 순서대로 수행합니다. 발행은 포함하지 않습니다.
---

# 포스팅 작성

## 입력과 근거

대상 파일을 명시한다. 인수가 없으면 사용자의 주제·발행 월로 경로를 정해 알린다. 최근 수정 파일을 추측해서 이어 쓰지 않는다.

1. `content/pages/about.md`, `.claude/rules/blog-tone.md`, `.claude/rules/blog-content-criteria.md`를 읽는다. 소개의 경험 기록 목적을 따른다.
2. 사용자 메모와 관련 기존 글·프로젝트 자료를 읽는다. 기존 미발행 글은 참고 자료이며 새 글에 합치거나 발행하지 않는다.
3. `.local/blog/<slug>/evidence.md`에 주장별 **내용 / 종류(experience·fact·uncertain) / 출처 / 확인일 / 본문 처리**를 기록한다. 경험은 사용자 진술에 연결하고, 외부 사실은 공식 문서·출시 공지 등 원문 URL과 사건 날짜·확인 날짜를 구분한다. 날짜·모델명·플랜·제한 변경은 추정하지 않고 확인한다. 현재 문서만으로 과거 정책을 확정하지 않는다.
4. 확인 불가 정보는 사실처럼 단정하지 않는다. 사용자 기억으로 표시하거나 핵심에 불필요하면 본문에서 제외하고 근거 장부에 남긴다. 체감 차이를 성능 측정이나 정책 변경의 증거로 바꾸지 않는다.

## 초안

문제 → 선택 → 실제 시도 → 예상과 달랐던 결과 → 다음 선택의 흐름을 살린다. 정형 목차를 강제하지 않는다. 경험과 선택 이유를 기술 설명보다 앞에 둔다. 없는 사건·숫자·대화를 보충하지 않는다. 계정의 회사/개인 구분처럼 사용자가 제외한 정보는 본문에 넣지 않는다. 결론은 현재 판단과 한계를 담고 참여 유도 문구를 강제하지 않는다.

메타데이터는 저장소 관례를 따르되 `published: false`를 명시한다. 작성·수정 허용은 발행·커밋 허용을 뜻하지 않는다.

## 두 번의 독립 검토

작성자는 수정하고 검토자는 읽기만 한다. 작성자·구조 검토자·문장 검토자는 서로 다른 에이전트로 둔다. 아래 명령은 저장소 루트에서 실행한다. 상태는 재개를 위한 단일 진실이며 삭제·재초기화로 실패를 감추지 않는다.

```bash
python3 script/blog-review.py init --draft _posts/<file>.md --evidence .local/blog/<slug>/evidence.md --state .local/blog/<slug>/state.json --author <writer-id>
python3 script/blog-review.py status --state .local/blog/<slug>/state.json
```

`status`의 경로와 두 SHA256 값을 검토자에게 전달한다. 검토자는 파일을 읽기 전·후 `status`로 해시가 같은지 확인한다. 원본 근거와 작성 규칙을 함께 읽고 다음 순서로 기존 스킬을 적용한다.

1. 별도 에이전트가 `review-structure` 스킬로 검토하고 `structure.json`을 작성한다.
2. 작성자가 보고서를 `record`한다. 실패하면 지적을 반영한 뒤 구조 검토부터 다시 시작한다.
3. 구조 통과 후 다른 에이전트가 `review-writing` 스킬로 검토하고 `writing.json`을 작성한다.
4. 보고서를 `record`하고 `check`가 성공한 경우에만 두 검토 완료를 보고한다.

```bash
python3 script/blog-review.py record --state .local/blog/<slug>/state.json --report .local/blog/<slug>/structure.json
python3 script/blog-review.py record --state .local/blog/<slug>/state.json --report .local/blog/<slug>/writing.json
python3 script/blog-review.py check --state .local/blog/<slug>/state.json
```

초안·근거·소개·규칙·검토 스킬·하네스가 변경되면 기존 통과는 무효다. 문장 검토 후 한 글자라도 수정하면 구조부터 다시 검토한다. 수정과 두 검토는 최대 3라운드 수행한다. 소진 시 초안을 유지하고 미해결 지적과 재개 명령을 보고하며 완료를 주장하지 않는다.

## 검토 보고서 계약

두 리뷰 스킬과 에이전트가 공유하는 JSON 계약이다. 추가 필드는 허용하지 않는다. `reviewer`는 실제 검토 에이전트 식별자이며 작성자가 이름만 바꿔 검토를 대신하지 않는다.

```json
{
  "stage": "structure",
  "draft_sha256": "status의 현재 값",
  "policy_sha256": "status의 현재 값",
  "reviewer": "검토 에이전트 식별자",
  "verdict": "fail",
  "findings": [
    {"severity": "error", "location": "파일:행 또는 섹션", "message": "근거와 수정 필요 사항"}
  ]
}
```

`stage`: `structure` 또는 `writing`. `verdict`: `pass` 또는 `fail`. `severity`: `error` 또는 `warning`. `pass`는 빈 `findings`, `fail`은 한 개 이상의 지적을 요구한다. 미해결 경고가 있으면 통과하지 않는다. 스크립트는 형식·메타데이터·해시·순서를 검증하며 사실성·글의 품질은 독립 검토자가 판단한다. Ruby(Psych)와 Python 3가 필요하다. 종료 코드: 성공 0, 검토 미완료 1, 입력/검증 오류 2.
