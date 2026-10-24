---
title: "바이브 코딩 6개월, 6년 묵은 이슈를 일주일 만에"
date: "2026-02-25"
tags: ["AI", "Claude Code", "Vue", "React", "vue-pivottable", "tailwind-grid-layout", "오픈소스"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-25"
lang: ko
locale: ko
ref: vibe-coding-vue-pivottable-issues
---

"언젠가 해야지."

6년간 미뤄온 이슈들이 있었습니다. 일주일 만에 12개를 모두 해결했습니다.

<!--more-->

## 미뤄온 것들

vue-pivottable은 2019년에 만든 프로젝트입니다. PivotTable.js를 Vue로 포팅한 것인데, 그 이후로 GitHub 이슈 대응이 계속 밀렸습니다.

![6년간 쌓인 GitHub 이슈들](/assets/images/posts/2026/vue-pivottable-6-years/github-issues-before.png)

2020년 2월, 누군가 물었습니다. "하나의 피벗 테이블에서 여러 값에 각각 다른 집계 함수를 적용할 수 있나요?" 원본 PivotTable.js에도 없는 기능이었습니다. 구현 난이도가 높아 보였습니다. 보류.

2020년 4월, Nuxt.js에서 SSR 오류가 발생한다는 이슈가 올라왔습니다. 당시 SSR에 대한 이해도가 낮았습니다. 빠른 해결책이 떠오르지 않았습니다. 보류.

2021년 6월, Subtotal 플러그인 통합 요청이 들어왔습니다. jQuery 기반 subtotal.js를 Vue로 재구현해야 하는 작업이었습니다. 규모가 커 보였습니다. 보류.

---

## 일주일

2026년 2월 17일부터 22일까지, 12개 이슈를 모두 해결했습니다.

가장 오래된 이슈는 2020년 2월에 등록된 것이었습니다. 6년이 지난 셈입니다.

무엇이 달라졌을까요? [자동화 도구들](/blog/2026/02/24/automation-tools-after-vibe-coding/)을 만들면서 익숙해진 방식이 생겼습니다. 복잡해 보이는 문제도 일단 시작하면 됩니다. AI가 초안을 잡아주고, 디버깅을 도와주고, 테스트 코드를 작성합니다.

6년간 "어렵겠다"고 생각했던 것들이 실제로 해보니 그렇게 어렵지 않았습니다.

---

## 새로 만든 패키지 3개

### 다중 값 집계 (Issue #16)

매출은 합계로, 수량은 평균으로, 이익률은 가중 평균으로. 하나의 셀에서 여러 지표를 다르게 집계하고 싶다는 요청이었습니다.

@vue-pivottable/multi-value-renderer를 만들었습니다. aggregatorMap prop으로 필드별 집계 함수를 지정합니다. "Sum over Sum" 같은 2-Input Aggregator도 지원합니다.

처음에는 드롭다운 기반 UI로 만들었는데, 여러 값을 관리하기 불편했습니다. 태그 기반 UI에 모달 편집 방식으로 바꿨습니다.

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/multi-value-renderer.png" alt="Multi Value Renderer">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable</figcaption>
  </figure>
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/multi-value-renderer-ui.png" alt="Multi Value Renderer UI">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable UI</figcaption>
  </figure>
</div>

👉 [Vue 3 데모](https://multivalue-vue3.pages.dev/) \| [Vue 2 데모](https://multivalue-vue2.pages.dev/)

### 소계와 접기/펼치기 (Issue #47)

원본 PivotTable.js에는 nagarajanchinnasamy가 만든 subtotal.js 플러그인이 있었습니다. 계층적 데이터의 소계 계산과 접기/펼치기 기능을 제공했는데, jQuery 기반이라 Vue에서 쓸 수 없었습니다.

@vue-pivottable/subtotal-renderer로 재구현했습니다. 가장 까다로웠던 건 헤더 colspan 처리였습니다. 초기 버전은 colspan을 전혀 처리하지 않아서 헤더가 중복 출력됐습니다. 기존 vue-pivottable의 spanSize 함수를 참고해서 전면 재작성했습니다.

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/subtotal-renderer.png" alt="Subtotal Renderer">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable</figcaption>
  </figure>
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/subtotal-renderer-ui.png" alt="Subtotal Renderer UI">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable UI</figcaption>
  </figure>
</div>

👉 [Vue 3 데모](https://subtotal-vue3.pages.dev/) \| [Vue 2 데모](https://subtotal-vue2.pages.dev/)

### Nuxt SSR 지원 (Issue #20)

vue-pivottable은 브라우저 환경을 전제로 개발되어 SSR 과정에서 window/document 접근 오류가 발생했습니다.

@vue-pivottable/nuxt를 만들었습니다. nuxt.config에 한 줄 추가하면 클라이언트 사이드 전용 로딩이 자동으로 처리됩니다. Nuxt 2와 Nuxt 3 모두 지원합니다.

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/nuxt-module.png" alt="Nuxt Module">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable</figcaption>
  </figure>
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/nuxt-module-ui.png" alt="Nuxt Module UI">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">PivotTable UI</figcaption>
  </figure>
</div>

👉 [Nuxt 3 데모](https://nuxt3-pivottable.pages.dev/) \| [Nuxt 2 데모](https://nuxt2-pivottable.pages.dev/)

---

## 이미 있었는데 몰랐던 것들

12개 이슈 중 5개는 이미 구현된 기능이었습니다. 문서화가 부족해서 사용자들이 해결 방법을 몰랐던 것입니다.

셀에 하이퍼링크를 추가하고 싶다? clickCallback이 이미 있었습니다. Plotly 차트를 반응형으로 만들고 싶다? plotlyOptions prop이 있었습니다. 컨트롤 UI를 숨기고 싶다? VuePivottable 컴포넌트를 쓰면 됩니다.

기능을 만드는 것만큼 문서화가 중요하다는 걸 다시 느꼈습니다.

---

## 버그도 있었습니다

config prop에 v-model을 바인딩해도 초기 상태에 반영되지 않는 버그가 있었습니다. 피벗 테이블 설정을 저장하고 복원하는 기능이 동작하지 않았습니다.

원인은 단순했습니다. init 메소드에서 config prop 값을 참조하지 않고 있었습니다. 수정하고 테스트 18개를 추가했습니다.

CSS import 오류도 있었습니다. package.json exports 필드에 CSS 경로가 누락되어 있었습니다. 한 줄 추가로 해결됐습니다.

---

## tailwind-grid-layout도 손봤습니다

vue-pivottable만 한 건 아닙니다. tailwind-grid-layout도 같이 정리했습니다.

tailwind-grid-layout은 react-grid-layout의 대안으로 만든 프로젝트입니다. Tailwind CSS 기반이고 번들 사이즈가 작습니다. 기능은 거의 동일하게 구현했는데, 드래그 관련 버그들이 남아 있었습니다.

외부에서 아이템을 드래그해서 그리드에 놓을 때 프리뷰가 마우스를 따라가지 않았습니다. handleDragOver에서 플래그만 설정하고 위치 계산을 하지 않았기 때문입니다. 드롭 시점에서야 위치가 계산되니까 사용자는 아이템이 어디에 놓일지 예측할 수 없었습니다.

DroppableGridContainer에 실시간 마우스 추적 로직을 추가했습니다. 60fps throttle로 성능을 최적화하고, 충돌 검사도 실시간으로 수행합니다. 유효한 위치면 녹색, 충돌하면 빨간색으로 프리뷰가 표시됩니다.

8방향 리사이즈 핸들도 개선했습니다. static 아이템과 충돌할 때 리사이즈가 그냥 무시되던 문제가 있었습니다. 이제는 각 방향별로 충돌을 검사하고, 충돌 시 빨간색 테두리로 시각적 피드백을 제공합니다.

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/tailwind-grid-layout-demo.png" alt="Tailwind Grid Layout Demo">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">라이브 데모</figcaption>
  </figure>
  <figure style="flex: 1; margin: 0;">
    <img src="/assets/images/posts/2026/vue-pivottable-6-years/tailwind-grid-layout-storybook.png" alt="Tailwind Grid Layout Storybook">
    <figcaption style="text-align: center; font-size: 0.9em; color: #666;">Storybook</figcaption>
  </figure>
</div>

👉 [라이브 데모](https://tailwind-grid-layout.pages.dev/) \| [Storybook](https://tailwind-grid-layout-storybook.pages.dev/)

테스트는 339개 통과합니다.

---

## 마무리

6년간 미뤄온 이슈들을 일주일 만에 해결했습니다. "어렵겠다"고 생각했던 것들이 막상 해보니 그렇지도 않았습니다. 미루는 동안 쌓인 심리적 부담이 실제 난이도보다 컸던 것 같습니다.

새로 만든 패키지 3개(multi-value-renderer, subtotal-renderer, nuxt-module)는 모두 Vue 2와 Vue 3를 지원합니다. npm에 배포했습니다.

👉 GitHub: [github.com/vue-pivottable](https://github.com/vue-pivottable) (Vue 3: [vue3-pivottable](https://github.com/vue-pivottable/vue3-pivottable))
