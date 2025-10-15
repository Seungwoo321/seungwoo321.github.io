---
title: "[경제지표 대시보드 개발기 #7] 백엔드 중심 DDD, 프론트엔드에서는 왜 과했을까"
date: "2025-10-15"
tags: ["사이드프로젝트", "AI-DLC", "DDD", "프론트엔드"]
categories: AI-DLC
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-10-15"
---

AI-DLC를 진행하면서 문서가 점점 ‘백엔드 중심 DDD’로 기울어지는 것을 느꼈습니다.  
처음엔 구조가 완벽해 보였지만, 문서에 제시된 설계를 따라가다 보니  
이 구조가 실제로 프론트엔드 코드로 구현된다면 상당히 복잡해질 것 같다는 예감이 들었습니다.  
그래서 설계 단계를 더 진행하기보다는, 문서 자체를 분석하며 그 이유를 찾기로 했습니다.

<!--more-->

## 1. 불필요하게 복잡한 Application Layer

[링크](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/construction/widget-library/domain_model.md#application-layer)

> **발췌 — Application Layer 구조 (원문 일부)**  
>
> “`src/application/ … services, dto, use-cases` … Application Layer는 Domain Layer만 의존”  
> “`create-widget.use-case.ts`, `copy-public-widget.use-case.ts` … 개별 유즈케이스 파일 분리”

단순한 CRUD를 수행하는 프론트엔드 코드에  
**DTO, UseCase, Service**로 나뉜 3단계 구조는 지나치게 무거워 보였습니다.  
유지보수성을 높이기보다, 오히려 **파일 수만 늘리고 타입 정의가 중복되는 구조**였습니다.  

React Query나 간단한 API 클라이언트 함수만으로도 충분히 대체 가능한 수준이었기에,  
“모든 동작을 레이어로 나누는 것이 과연 효율적인가”라는 의문이 생겼습니다.

---

## 2. 과도한 이벤트 기반 설계

[링크](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/construction/widget-library/domain_model.md#3-widgetdeleted)

> **발췌 — WidgetDeleted 도메인 이벤트 (원문 일부)**  
>
> “삭제된 위젯은 `WidgetDeleted` 이벤트를 발행하며,  
> Dashboard Unit이 이를 비동기로 구독해 참조를 제거한다.  
> 실패 시 재시도 메커니즘을 통해 Eventual Consistency를 보장한다.”

단순히 “삭제하면 목록에서 사라진다” 정도의 기능에  
**이벤트 발행, 재시도, 일관성 보장**까지 포함된 건 과했습니다.  
이건 프론트엔드보다는 메시지 큐 기반의 서버 설계에 가깝습니다.  

React Query의 `invalidateQueries()` 한 줄이면 해결될 문제였기에,  
“문제의 복잡도를 프론트엔드가 아닌 백엔드의 방식으로 다루고 있다”고 느꼈습니다.

---

## 3. 리포지토리 / 매퍼 패턴의 과용

[링크](https://github.com/Seungwoo321/aidlc-docs/blob/main/e-torch.v1/construction/widget-library/domain_model.md#%EB%A6%AC%ED%8F%AC%EC%A7%80%ED%86%A0%EB%A6%AC-%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4-repository-interface)

> **발췌 — Repository 인터페이스 (원문 일부)**  
>
> “`IWidgetRepository`(Domain 인터페이스) ↔ `supabase-widget.repository.ts`(Infra 구현) ↔  
> `widget.mapper.ts`(도메인↔DB 변환)”

Supabase나 REST API 클라이언트를 감싸는 리포지토리를 별도로 두는 건  
프론트엔드에서는 **추상화보다 중복을 더 늘리는 구조**로 보였습니다.  
실제 데이터는 이미 타입 안전하게 전달되는데,  
그 위에 매퍼와 인터페이스를 또 얹는 건 **역으로 타입 불일치를 유발할 위험**이 있었습니다.  

Zod 스키마와 Supabase 클라이언트를 직접 사용하는 편이  
더 간결하고, 현실적인 선택이라는 생각이 들었습니다.

---

## 결론

DDD는 복잡한 비즈니스 로직을 구조화하는 훌륭한 접근이지만,  
클로드 코드가 생성한 도메인 문서는 **‘백엔드 중심의 완결성’**을 전제로 하고 있었습니다.  
하지만 프론트엔드의 복잡도는 **도메인 모델이 아니라 상태와 흐름**에서 발생합니다.  

그래서 저는 이 문서를 ‘틀렸다’고 보진 않았습니다.  
단지, **제가 만드는 프론트엔드의 맥락에서는 과했다**고 느꼈습니다.  
그래서 현재 프로젝트의 구조에 맞는 아키텍처를 새로 정립하고,  
그 위에서 **AI-DLC 방법론을 다시 적용해보려고** 합니다.

---

*다음 편에서는 프론트엔드 중심으로 AI-DLC 아키텍처를 다시 설계한 과정을 공유합니다.*
