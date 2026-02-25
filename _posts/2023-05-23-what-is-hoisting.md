---
title: 자바스크립트 ES6와 호이스팅(Hoisting)
date: "2023-05-23"
last_modified_at: "2023-05-23"
tags: ["JavaScript"]
categories: JavaScript
locale: ko
permalink: /blog/:year/:month/:day/:title/
---
ES6에서 let과 const는 호이스팅이 발생하지 않는 것처럼 보여서 호이스팅이 발생하지 않는다고 이해할 수 있지만 사실은 그렇지 않다. 이게 무슨 의미인지 정리했다.

<!--more-->

## 선행되어야 하는 개념

- 함수 레벨 스코프와 블록 레벨 스코프
- 실행 컨텍스트에서 변수가 생성되는 과정

### 함수 레벨 스코프와 블록 레벨 스코프

함수 레벨 스코프는 함수 내에서 선언한 변수는 함수 내에서만 유효한 것이고 블록 레벨 스코프는 코드 블록 내에서 선언된 변수는 코드 블록 내에서만 유효한 변수다.

자바스크립트는 함수 레벨 스코프를 따르고 var는 함수 레벨 스코프다. let과 const는 블록 레벨 스코프를 따른다.

어떤 차이가 있는지 아래 예시를 통해서 알 수 있다.

> 개발자 도구를 열어서 바로 실행해 보자.

예제 1.

```js
for (var i = 0; i < 5; i ++) {
    setTimeout(function () {
        console.log(i);
    }, 100);
}
cosnole.log(i); // i는 자유변수라서 for 루프가 종료되어도 5가 출력된다.
```

예제 1에서 `var` 키워드로 선언된 변수 `i`는 함수 레벨 스코프를 가지기 때문에 `i`는 전역 변수로 취급된다. 따라서 setTimeout의 콜백 함수에서 `i`를 참조할 때는 이미 `for` 루프가 끝까지 진행되어 종료된 후의 값인 5가 출력 된다.

예제 2.

```js
for (let j = 0; j < 5; j ++) {
    setTimeout(function () {
        console.log(j);
    }, 100);
}
console.log(j) // ReferenceError
```

예제 2에서 `let` 키워드로 선언된 변수 `j`는 블록 레벨 스코프를 가지기 때문에 `for` 루프의 각 반복마다 새로운 `j`가 생성되고 해당 반복 블록 내에서만 유효한 지역 변수다. 따라서 setTimeout의 콜백 함수에서 `j`는 각 반복에서의 `j`를 참조하기 때문에 0, 1, 2, 3, 4가 순서대로 출력 된다.

### 실행 컨텍스트에서 변수가 생성되는 과정

변수 선언이란 해당 변수만을 위한 메모리 공간을 할당받는 것이다. 자바스크립트에서 변수는 실행 컨텍스트(Exectuion Context)에서 다음 3단계에 걸쳐 생성된다.

1. 선언 단계 (Declaration phase): 실행 컨텍스트의 변수 객체에 등록한다. 스코프가 시작된다.
2. 초기화 단계 (Initialization phase): 변수를 위한 메모리가 할당되고 undefined로 초기화된다.
3. 할당 단계 (Assignment phase) : undefined로 할당된 값에 실제 값을 할당한다.

실제 코드를 보면서 살펴보자.

#### var 키워드로 선언한 변수

`var` 키워드로 선언한 변수 `foo`는 실제로 선언과 초기화 단계가 한 번에 이루어져서 선언과 동시에 `undefined`로 초기화되고, 그 후에 'bar`로 값이 할당되는 단계로 나누어진다.

예제 3.

```js
var foo = 'bar';
```

위 코드는 이렇게 동작할 것이다.

```js
var foo, foo = undefined  // 선언 및 초기화 단계
/** ------------------------------------------ */
foo = 'bar';              // 할당
```

#### let 키워드로 선언한 변수

`let` 키워드로 선언한 변수는 **선언 단계와 초기화 단계가 분리**되어 있다. 그리고 선언 단계에서 실행 컨텍스트의 변수 객체에 등록이 된 후부터 초기화 전의 시점을 일시적 사각지대(TDZ)라고 한다.

예제 4.

```js
let foo = 'bar'
```

위 코드는 이렇게 동작할 것이다.

```js
let foo; // 선언
// ---- ReferenceError ---
//    _____  ___  ____
//   |_   _||   \|_  /
//     | |  | |) |/ / 
//     |_|  |___//___|
//                    
// ---- ReferenceError ---
foo = undefined; // 초기화
foo = 'bar'; // 할당
```

이렇게 선언 후 초기화가 되기 전의 TDZ에 진입했을 때 변수에 접근하려고 하면 참조 에러(ReferenceError)가 발생한다.

#### const 키워드로 선언한 변수

`const` 키워드로 선언하는 변수는 선언과 동시에 값이 할당까지 이루어져야 하며 이후에는 값을 변경할 수 없다.

예제 5.

```js
const foo = 'bar'
```

## ES6와 호이스팅 (Hoisting)

호이스팅이란 모든 선언문이 각각이 속한 스코프의 꼭대기로 끌어올려지는 작업이다. ES6에서 `let` 키워드로 선언한 변수 또한 블록 레벨 스코프로 호이스팅이 이루어지기 때문에 실행 컨텍스트의 변수 객체에 등록되고 `undefined`로 초기화되기 전까지인 TDZ에 진입했을 때 변수에 접근하려면 하면 참조 에러(ReferenceError)가 발생한다. 호이스팅이 발생하지 않는 것처럼 보이는 것뿐이다. `const` 키워드도 선언하는 변수도 같지만 선언과 동시에 값이 할당되어야 하는 것이 규칙이기 때문에 문법 오류(SyntaxError)가 발생한다.

예제 6.

```js
console.log(a); // undefined
var a = 'a'

const b; // SyntaxError

console.log(c); // ReferenceError
const c = 'c';

console.log(d); // ReferenceError
let d = 'd';
```

## Reference

- [PoiemaWeb](https://poiemaweb.com/es6-block-scope)
- [MDN](https://developer.mozilla.org/ko/docs/Glossary/Hoisting)
