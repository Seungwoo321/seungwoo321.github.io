---
title: Vue Pivottable TypeScript 마이그레이션 빌드 에러 해결 기록
date: "2025-05-28"
tags: ["vue", "typescript"]
categories: Vue Pivottable
locale: ko
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2025-05-29"
---

## 📋 발생한 문제

### 에러 메시지

```bash
[vite:dts] Internal Error: Unable to follow symbol for "PivotData"
You have encountered a software defect. Please consider reporting the issue to the maintainers of this application.
    at AstSymbolTable._analyzeChildTree
```

### 빌드 환경

- `vite-plugin-dts` 사용
- `rollupTypes: true` 설정
- 복잡한 `PivotData` 클래스 (500+ 라인)

---

## 🔍 원인 분석

**핵심 원인**: `rollupTypes: true`로 모든 타입을 하나의 파일로 번들링하려다가 `api-extractor`가 복잡한 `PivotData` 클래스 분석에 실패

- `api-extractor`는 복잡한 클래스 구조 분석에 한계가 있음
- `VuePivottableUi` 컴포넌트가 `PivotData`를 사용하는 진입점이었지만, 실제 문제는 `PivotData` 클래스 자체의 복잡성

---

## 💡 해결방법 1: rollupTypes 비활성화

```javascript
// vite.config.js
dts({
  rollupTypes: false  // 타입 번들링 비활성화
})
```

**결과**:

- ✅ 즉시 빌드 성공
- ❌ 타입 파일이 여러 개로 분산됨

---

## 💡 해결방법 2: 문제 컴포넌트 제외

```javascript
// src/index.js
import { VuePivottable } from './components'  // VuePivottableUi 제외
export { VuePivottable, PivotUtilities, Renderer }
```

**결과**:

- ✅ `rollupTypes: true` 유지하면서 빌드 성공  
- ❌ 핵심 UI 컴포넌트 사용 불가 (라이브러리 의미 상실)

---

## 💡 해결방법 3: 타입 오버라이드

### 1단계: 타입 오버라이드 파일 생성

```typescript
//  src/helper/utilities.d.ts
// src/helper/utilities.d.ts (새로 생성)
// utilities.js와 같은 폴더에 같은 이름으로 .d.ts 생성

// 👇 PivotData 클래스만 간단한 타입으로 오버라이드
declare class PivotData {
  constructor(inputProps?: any)
  props: any
  getRowKeys (): any[]
  getColKeys (): any[]
  getAggregator (rowKey: any, colKey: any): any
  [key: string]: any
}

// 👇 복잡한 함수들도 간단한 타입으로 오버라이드
declare const aggregators: Record<string, any>
declare const aggregatorTemplates: Record<string, any>
declare const locales: Record<string, any>
declare const naturalSort: (a: any, b: any) => number
declare const numberFormat: (opts?: any) => any
declare const getSort: any
declare const sortAs: any
declare const derivers: any

// 👇 이 부분이 핵심 - utilities.js의 exports를 덮어씀
export {
  PivotData,
  aggregators,
  aggregatorTemplates,
  locales,
  naturalSort,
  numberFormat,
  getSort,
  sortAs,
  derivers
}


```

### 2단계: vite.config.js에서 경로 매핑

```javascript
// vite.config.js
dts({
  rollupTypes: true,
  compilerOptions: {
    paths: {
      '@/helper/utilities': ['./src/helper/utilities.d.ts']
    }
  }
})
```

**핵심**: `vite-plugin-dts`는 내부적으로 `api-extractor`를 사용하므로, 다른 경로에 타입 오버라이드 파일을 둘 때는 `paths` 설정이 필요함

**결과**:

- ✅ 모든 기능 유지하면서 빌드 성공
- ✅ 단일 타입 파일 생성
- ❌ 타입 오버라이드 파일 추가 관리 필요

---

## 📊 3가지 방법 비교

| 방법 | 빌드 성공 | 기능 완성도 | 타입 파일 구조 |
|------|-----------|-------------|----------------|
| rollupTypes: false | ✅ | 완전 | 분산 |
| 컴포넌트 제외 | ✅ | 제한적 | 단일 |
| 타입 오버라이드 | ✅ | 완전 | 단일 |

---

## 🎯 최종 해결책

**타입 오버라이드 방법 채택**

- 이유: 모든 기능을 유지하면서 깔끔한 단일 타입 파일 생성
- 복잡한 `PivotData` 클래스를 간단한 인터페이스로 오버라이드하여 `api-extractor` 분석 문제 해결
