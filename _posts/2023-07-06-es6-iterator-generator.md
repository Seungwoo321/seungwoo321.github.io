---
title: 러닝 자바스크립트 - ES6 위크맵/위크셋/이터레이터/제너레이터
date: '2023-07-06'
tags: ["Frontend", "JavaScript"]
categories: JavaScript
locale: ko
---

‘러닝 자바스크립트’를 읽었다. 책만 본다고 개발 실력이 늘지는 않지만 코딩만 한다고 개발 실력이 느는 것 또한 아님을 새삼 느꼈다. ES6를 주로 ES5나 ES3에서 이관된 문법이나 개념에 대해서만 알고 있었던 거다. 그래서 ES6에서도 익숙하지 않은 개념들에 대해서 정리했다..

<!--more-->

## 위크맵 (WeakMap)

ES6 이전에는 키와 값을 연결할 때 객체를 주로 사용해야 했다. 이제는 맵(Map)이 있기 때문에 맵을 사용하면 된다. 그런데 위크맵이란 게 또 있다. 위크맵이 맵과 다른 점은 다음과 같다

- 키는 반드시 객체여야 한다.
- 키가 가비지 컬렉션 포함될 수 있다.
- 이터러블이 아니다
- clear() 메서드가 없다

맵의 키는 맵이 존재하는 한 메모리에 계속 유지한다. 위크맵은 그렇지 않다. (책의 예제를 그대로 가져와서 좀 더 재미있고 이해하기 쉬운 내용으로 변경했다)

```js
const SalaryMan = (function () {
 const annualPay = new WeakMap();
 return class {
  setAnnualPay (pay) {
   annualPay.set(this, pay);
  }
  getAnnualPay () {
   return annualPay.get(this);
  }
 }
})();

const memberOfn = new SalaryMan();
const memberOfm = new SalaryMan();

memberOfn.setAnnualPay(6000);
memberOfm.setAnnualPay(3000);

memberOfn.getAnnualPay() // 6000
memberOfm.getAnnualPay() // 3000
```

회사원 생성자 함수는 연봉정보를 저장하는 위크맵을 생성하고 IIFE 함수로 감싼다. 그리고 외부에서는 setPay, getPay 메서드로만 연봉 정보에 접근할 수 있는 클래스를 반환한다.

연봉정보를 저장할 때 위크맵을 사용했기 때문에 N사 직원의 연봉과 M사 직원의 연봉정보는 가비지 컬렉션에 포함돼서 더 이상 참조하지 않게 되면 메모리에서 해제된다. 여기서 위크맵 대신 맵을 사용했다면 어떻게 될까. N사 직원과 M사 직원이 더 이상 참조되지 않아도 연봉정보는 계속 메모리에 남아 있게 된다. delete 메서드를 사용해서 명시적으로 제거가 필요하다.

따라서 위크맵과 맵의 선택은 메모리 관리와 객체 생명주기에 따라 결정되어야 한다.

## 위크셋 (WeakSet)

셋(Set)은 중복을 허용하지 않는 데이터 집합이다. 그리고 위크셋(WeakSet)이 셋과 다른 점은 다음과 같다

- 위크셋은 객체만 포함할 수 있다.
- 이 객체들은 가비지 컬렉션의 대상이 된다.
- 위크맵과 마찬가지로 이터러블이 아니다

위크셋의 용도는 매우 적다고 한다. 주어진 객체가 셋 안에 존재하는지 아닌지를 알아보는 것뿐이다. 따라서 나열이 필요하면 셋을 그렇지 않다면 위크셋을 사용하면 되겠다.

## 이터레이터

이터레이터는 제너레이터와 함께 ES6에 도입된 매우 중요한 개념이다. 처음 도입된 개념이라서 이전의 자바스크립트에만 익숙하다면 생소할 수 있다. 이번에도 책의 예제 코드 그대로에 내용만 익숙한 애국가 1절로 변경해 보았다.

```js
// 애국가 1절
const nationalAnthem = [
 "동해물과 백두산이 마르고 닳도록",
 "하느님이 보우 - 하사 우리나라 만세",
 "무 -궁화 삼 -천리 화려강- 산",
 "대한사람 대한-으로 길이 보전하세"
];
```

다음 코드는 한 줄씩 콘솔에 실행해 보자.

```js
const it = nationalAnthem.values();

it.next(); // {value: '동해물과 백두산이 마르고 닳도록', done: false}
it.next(); // {value: '하느님이 보우 - 하사 우리나라 만세', done: false}
it.next(); // {value: '무 -궁화 삼 -천리 화려강- 산', done: false}
it.next(); // {value: '대한사람 대한-으로 길이 보전하세', done: false}
it.next(); // {value: undefined, done: true}
it.next(); // {value: undefined, done: true}
```

배열에 `values`메서드를 사용해서 이터레이터를 만들 수 있다. 그리고 next() 메서드를 호출하면 노래 한 구절을 부른 게 된다. 이 메서드는 지금 부른 노래 가사를 나타내는 `value`프로퍼티와 마지막까지 완창했는지를 나타내는 `done`프로퍼티를 가지는 객체를 반환한다. 더 진행할 것이 없으면 `done`은 `true` 가 되고 `value`는 `undefined`가 된다. 중요한 점은 여기서 끝이 아니라 `next`를 계속 호출할 수 있다는거다.

인덱스 변수를 사용하지 않고 배열을 순회하는 `for ... of`의 원리가 이터레이터다. `while` 루프를 사용해서 이터레이터를 흉내 내 볼 수 있다.

```js
const it = nationalAnthem.values();

let current = it.next();
while (!current.done) {
 console.log(current.value);
 current = it.next();
}
```

```text
// 실행 결과
동해 물과 백두산이 마르고 닳도록
하느님이 보우 - 하사 우리나라 만세
무 -궁화 삼 -천리 화려강- 산
대한 사람 대한-으로 길이 보전하세
{value: undefined, done: true}
```

이터레이터는 모두 독립적이다. 새 이터레이터를 만들 때마다 처음에서 시작한다.

```js
const it1 = nationalAnthem.values();
const it2 = nationalAnthem.values();

// it1로 애국가를 2구절 부른다.
it1.next(); // {value: '동해물과 백두산이 마르고 닳도록', done: false}
it1.next(); // {value: '하느님이 보우 - 하사 우리나라 만세', done: false}

// it2로 애국가를 1구절 부른다.
it2.next(); // {value: '동해물과 백두산이 마르고 닳도록', done: false}

// it1로 애국가를 1구절을 더 부른다.
it1.next(); // {value: '무 -궁화 삼 -천리 화려강- 산', done: false}
```

### 이터레이션 프로토콜

이터레이션 프로토콜(Iteration Protocol)은 모든 객체를 이터러블 객체로 바꿀 수 있다. `Symbol.iterator` 메서드를 객체에 구현하여 이터레이터를 반환하면 된다. 책에서 소개하는 피보나치 수열을 생성하는 예제를 보면 쉽게 이해할 수 있다.

```js
class FibonacciSequence {
 [Symbol.iterator]() {
  let a = 0; 
  let b = 1;
  return {
   next () {
    let ref = {
     value: b, 
     done: false
    };
    b += a;
    a = ref.value;
    return ref;
   }
  };
 }
}
```

이런 식으로 이터레이션 프로토콜을 활용하면 임의의 객체를 이터러블 객체로 만들 수 있다. 이제 `for...of` 루프나 다른 이터레이션 기능을 사용하여 객체를 순회할 수 있다.

```js
const fib = new FibonacciSequence();
let i = 0
for (let n of fib) {
  console.log(n);
  if (++i > 9)  break;
}
```

```text
// 실행 결과
1
1
2
3
5
8
13
21
34
55
```

## 제너레이터

제너레이터는 이터레이터를 사용해서 자신의 실행을 제어하는 함수다. 일반 함수와 달리 호출 즉시 실행되지 않고 이터레이터를 반환한다. 그리고 언제든 호출자에게 제어권을 넘길 수 있다.

책의 예제는 무지개색을 반환하는데 대신 추천 책 리스트를 담아봤다.

```js
function* jachungBook () {
 yield '나는 4시간만 일한다';
 yield '생각이 돈이 되는 순간';
 yield '타이탄의 도구들 (블랙 에디션)';
 yield '욕망의 진화';
 yield '클루지 (kluge)';
 yield '뇌, 욕망의 비밀을 풀다';
 yield '지능의 역설';
 yield '정리하는 뇌'
}
```

이전에 이터레이터 파트에서 살펴본 것처럼 우선 이터레이터 객체를 얻는다. 제너레이터를 호출하면 이터레이터 객체를 얻을 수 있다. 그 다음 `next`를 호출해서 함수를 단계별로 진행할 수 있다.

```js
const it = jachungBook()
it.next(); // {value: '나는 4시간만 일한다', done: false}
it.next(); // {value: '생각이 돈이 되는 순간', done: false}
it.next(); // {value: '타이탄의 도구들 (블랙 에디션)', done: false}
it.next(); // {value: '욕망의 진화', done: false}
it.next(); // {value: '클루지 (kluge)', done: false}
it.next(); // {value: '뇌, 욕망의 비밀을 풀다', done: false}
it.next(); // {value: '지능의 역설', done: false}
it.next(); // {value: '정리하는 뇌', done: false}
it.next(); // {value: undefined, done: true}
```

`jachungBook` 제너레이터는 이터레이터를 반환하므로 `for … of` 루프에서 쓸 수 있다.

```js
for (let book of jachungBook()) {
 console.log(book);
}
```

```text
// 실행 결과
나는 4시간만 일한다
생각이 돈이 되는 순간
타이탄의 도구들 (블랙 에디션)
욕망의 진화
클루지 (kluge)
뇌, 욕망의 비밀을 풀다
지능의 역설
정리하는 뇌
```

### yield 표현식과 양방향 통신

제너레이터와 호출자는 양방향 통신이 가능하다. 통신은 `yield` 표현식을 통해 이뤄진다. 표현식은 값으로 평가되고 `yield`는 표현식이므로 반드시 어떤 값으로 평가된다.

```js
function* interrogate () {
 const book = yield "지금 읽고 있는 책의 제목은 무엇인가요 ?";
 const page = yield "몇 페이지까지 읽었나요 ?"
 return `${book} 책을 ${page} 페이지까지 읽으셨군요`
}
```

`yield` 표현식의 값은 호출자가 이터레이터에서 `next`를 호출할 때 제공한 매개변수다.

```js
const it = interrogate();
it.next(); // {value: '지금 읽고 있는 책의 제목은 무엇인가요 ?', done: false}
it.next('역행자') // {value: '몇 페이지까지 읽었나요 ?', done: false}
it.next(300) // {value: '역행자 책을 300 페이지까지 읽으셨군요', done: true}
```

위 예제와 같이 제너레이터를 활용하면 호출자가 함수의 실행을 제어할 수 있다. 그런데 `yield`문은 제너레이터의 마지막 문이더라도 제너레이터를 끝내지 않는다. 그래서 `return` 문을 사용하면 그 위치와 관계없이 `done` 은 `true` 가 되고 `value` 프로퍼티는 `return` 이 반환하는 값이 된다.

하지만 `for…of` 루프에서 사용하면 마지막 값이 절대 출력되지 않기 때문에 주의해야한다. 제너레이터의 첫 예제 코드에서 마지막 책을 `return` 문으로 변경하고 실행해보면 "정리하는 뇌"는 출력되지 않는 것을 볼 수 있다.

또한 많이 사용하는 `async/await`는 실제 내부적으로 프로미스와 제너레이터를 사용하여 구현된다.

### ‘러닝 자바스크립트’ 책 후기

아주 깊게 다루지는 않지만 ES6를 전반적으로 다룬다는 측면에서 많이 도움이 되었다. 애매하게 알고 있었던 개념들에 대해서 정리가 되었고 특히 더 깊은 지식에 대해서는 추천 자료와 링크들을 제공하고 있다. 이 부분은 모아서 한번 정리해 볼 생각이다.
