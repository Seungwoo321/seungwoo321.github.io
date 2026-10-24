---
title: 자바스크립트에서 큐와 스택 자료구조 구현하기
date: '2023-03-02'
tags: ["Frontend", "JavaScript", "PS"]
categories: JavaScript
locale: ko
permalink: /blog/:year/:month/:day/:title/
---

자료구조 및 알고리즘을 공부하면서 자주 사용되는 자료구조인 큐와 스택을 자바스크립트로 구현해보고 BOJ에서 문제를 풀어보면서 자바스크립트에서 어떻게 구현하고 활용하는 것이 유리한지 정리해보았습니다.

<!--more-->

## 큐/스택 구현

자바스크립트에서는 큐와 스택 자료구조가 존재하지 않습니다. 일반적으로 코딩테스트 환경에서는 대부분 라이브러리를 사용할 수 없으므로 직접 구현해야 합니다.

- 스택 구현

```js
// 스택 구현
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
```

- 큐 구현

```js
// 큐 구현
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
```

하지만 매번 구현하기 보다 자바스크립트에서 제공하는 배열 메서드를 활용하면 간단하게 해결 할 수 있습니다.

## 배열 메서드를 활용한 스택과 큐 구현

배열의 메서드 shift(), unshift(), pop(), push()는 각각 첫 번째 마지막 요소를 추가/삭제하는 메서드를 사용하면 스택과 큐를 쉽게 구현 할 수 있습니다. 그러나 배열의 메서드를 사용할 때에는 시간 복잡도를 고려해야 합니다. 예를 들어, shift()와 unshift() 메서드를 사용하면 배열의 모든 요소가 한 칸씩 앞으로 이동해야 하므로 시간 복잡도가 O(n)으로 느려집니다. 이 방식은 배열의 길이가 매우 긴 경우에는 느릴 수 있습니다.

반면, pop()과 push() 메서드를 사용하면 배열의 끝에 요소를 추가하거나 추출하므로 배열의 나머지 요소를 이동시킬 필요가 없습니다. 따라서 이 방식은 시간 복잡도가 O(1)으로 매우 빠르고, 스택에서 사용하는데 아주 적합합니다.

## 스택 활용하기

스택은 가장 나중에 추가된 요소가 가장 먼저 제거되는 Last-In-First-Out (LIFO) 구조를 가지고 있기 때문에 pop()과 push() 메서드를 사용하여 구현하는 것이 적합합니다. 이를 예시 코드로 보면 다음과 같습니다.

```js
const stack = [];

stack.push(1); // 스택에 1 추가
stack.push(2); // 스택에 2 추가

const top = stack.pop(); // 스택의 가장 위에 있는 요소 제거 (2)
console.log(top); // 2

stack.push(3); // 스택에 3 추가
```

스택 자료구조를 활용해야 할 때는 반복문을 이용하거나 필요에 따라 재귀함수를 사용하여 구현할 수 있습니다.

예를 들어 팩토리얼을 계산하는 재귀 함수를 구현할 경우 스택을 활용하여 다음과 같이 작성할 수 있습니다.

- 재귀함수로 구현

```js
function factorial (n) {
  if (n < 2) return n
  return factorial(n - 1) * n
}

console.log(factorial(5)); // 120
```

- 반복문으로 구현

```js
function factorial(n) {
  const stack = [];
  let result = 1;

  stack.push(n);

  while (stack.length) {
    const num = stack.pop();
    result *= num;

    if (num > 1) {
      stack.push(num - 1);
    }
  }

  return result;
}

console.log(factorial(5)); // 120

```

스택을 활용하여 재귀 함수를 구현할 때는 재귀 함수가 호출될 때마다 호출 스택에 새로운 프레임이 추가되고 함수가 반환될 때마다 스택에서 프레임이 제거되는 방식으로 활용됩니다.

위와 같이 단순한 팩토리얼 계산 문제에서는 재귀 함수를 사용한 방식이 더 간결하고 직관적인 코드로 작성 할 수 있지만 문제가 복잡해지거나 데이터의 크기가 커지는 경우에는 재귀 함수를 사용한 코드가 복잡해질 수 있으며 호출 스택의 크기를 초과하면 스택 오버플로우(Stack Overflow) 오류가 발생하게 됩니다. 이러한 오류가 발생하면 프로그램이 예기치 않게 종료될 수 있다는 점에 유의해야 합니다.

따라서 호출 스택의 크기에 주의하고 구현하고자 하는 기능과 상황에 따라 적절한 방법을 선택하여 코드를 작성하는 것이 중요합니다.

## 큐 활용하기

큐는 가장 먼저 추가된 요소가 가장 먼저 제거되는 First-In-First-Out (FIFO) 구조를 가지고 있기 때문에 shift()와 push() 메서드를 사용하여 구현할 수 있습니다.

```js
const queue = [1, 2, 3];

while (queue.length) {
  const front = queue.shift();
  console.log(front);
}
```

그러나 shift() 메서드는 매번 한 칸씩 앞으로 이동해야 하므로 데이터가 클수록 매우 느립니다. 이는 배열 메서드를 호출할 때마다 내부적으로 반복문을 실행하므로 배열의 길이가 길수록 메서드를 호출하는 빈도가 더 많아지기 때문입니다.

```js
const queue = [1, 2, 3];
let i = 0;

while (i < queue.length) {
  const front = queue[i++]
  console.log(front);
}
```

큐(Queue)는 데이터를 먼저 넣은 순서대로 꺼내는 자료구조입니다. 자바스크립트에서 큐를 활용 해야 될 때 배열을 사용하게 되면 배열의 첫 번째 인덱스에는 가장 오래전에 들어온 요소가 위치하고 마지막 인덱스에는 가장 최근에 들어온 요소가 위치하게 됩니다.

따라서, 이 배열의 인덱스를 이용해서 값을 조작하면서 큐의 성질을 이용하는 방식으로 큐를 구현할 수 있습니다. 예를 들어 큐에 새로운 값을 추가할 때는 배열의 push() 메서드를 사용하고, 큐에서 값을 꺼낼 때는 shift() 메서드 대신 배열의 첫 번째 인덱스로 접근 후 인덱스 값을 증가시켜서 꺼내는 방법을 사용할 수 있습니다.

다음은 큐를 이용하여 너비 우선 탐색을 하는 BFS(Breadth-First Search)를 구현한 예시 코드입니다.

```js
function bfs(graph, start) {
  const queue = [start];
  let i = 0;
  const visited = new Set([start]);

  while (i < queue.length) {
    const node = queue[i++]
    console.log(node);

    const neighbors = graph[node];
    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

const graph = {
  1: [2, 3],
  2: [1, 4, 5],
  3: [1, 6],
  4: [2],
  5: [2, 6],
  6: [3, 5],
};

bfs(graph, 1); // 1 2 3 4 5 6

```

## 링크드 리스트를 활용한 큐 구현

큰 데이터셋에서 shift() 메서드는 비효율적인 것은 맞지만, while 문을 이용한 인덱스 접근 방법도 큰 데이터셋에서는 성능상 이슈가 있을 수 있습니다. 이런 경우에는 큐를 구현할 때 링크드 리스트(linked list)를 이용하는 것이 좋습니다. 링크드 리스트는 노드(node)라는 객체를 이용해서 값을 저장하고, 이전 노드와 다음 노드를 참조하는 방식으로 구현되기 때문에 데이터의 삽입과 삭제가 상대적으로 빠릅니다. 이를 예시 코드로 보면 다음과 같습니다.

```js
// 노드 구현
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

// 큐 구현
class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
  }

  enqueue(item) {
    const node = new Node(item);

    if (this.isEmpty()) {
      this.front = node;
      this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.front.data;
    this.front = this.front.next;

    if (!this.front) {
      this.rear = null;
    }

    return item;
  }

  isEmpty() {
    return !this.front;
  }
}
```

배열은 메모리에 연속적으로 요소를 저장하기 때문에 인덱스를 이용해 특정 요소에 빠르게 접근할 수 있습니다. 하지만 shift() 메서드를 사용해서 첫 번째 요소를 삭제하고 다음 요소에 접근한다면 배열에서 요소를 삭제한 후 앞으로 이동시키는 작업이 필요해서 성능 저하를 유발 할 수 있습니다.

링크드 리스트를 사용할 때는 배열과는 달리 메모리에 연속적으로 저장되어 있지 않기 때문에, 메모리를 할당하고 해제하는 작업이 필요합니다.

이를 위해 각 노드에는 다음 노드의 주소를 저장하는 포인터가 필요합니다. 또한, 노드를 추가하거나 삭제할 때에는 포인터를 수정하여 리스트가 제대로 연결되도록 해야 합니다.

즉, 삽입/삭제가 빈번하지 않고 순차적으로 요소에 접근할 경우 배열을 사용하는 것이 효율적일 수 있고 삽입/삭제가 빈번하게 일어나는 경우에는 링크드 리스트로 구현하는 것이 메모리의 활용도가 높아져서 배열보다 더 효율적인 자료구조가 될 수 있습니다.

## 추천문제

- [BOJ 18258 - 실버 IV](https://www.acmicpc.net/problem/18258)
- [BOJ 1966 - 실버 III](https://www.acmicpc.net/problem/1966)
- [BOJ 1926 - 실버 I](https://www.acmicpc.net/problem/1926)
- [BOJ 2468 - 실버 I](https://www.acmicpc.net/problem/2468)
