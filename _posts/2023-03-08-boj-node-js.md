---
title: BOJ에서 JavaScript로 문제를 풀 때 메모리와 시간 제한 적용하기
date: '2023-03-08'
tags: ["Shell", "JavaScript", "BOJ"]
categories: PS
locale: ko
permalink: /blog/:year/:month/:day/:title/
---

BOJ에서 JavaScript로 문제를 풀때 시간 초과(TLE)와 메모리 초과(MLE) 문제를 자주 경험해왔습니다. 대부분의 알고리즘 강의나 문제풀이가 Python, C++, Java 위주로 구현되어 있기 때문일겁니다. BOJ 역시 JavaScript 풀이가 적고 같은 풀이라도 언어 특성 때문에 시간 제한과 메모리 제한에 걸리기도 합니다. 문제를 최종 제출하기 전에 문제점을 파악하여 코드를 개선한다면 BOJ에서 JavaScript로 문제를 푸는 데 도움이 될 것입니다.

BOJ는 LeetCode, Programmers, HackerRank 등과는 달리 제출하기 전에 테스트 하거나 디버깅이 어렵습니다. 따라서 로컬에서 테스트하는 것이 필수이며 이때 메모리 제한과 시간 제한을 충족시키는지를 파악하기 위해 BOJ의 node.js 채점 환경으로 쉘 스크립트를 작성해보았습니다.

<!--more-->

## 쉘 스크립트 작성

```bash
#!/bin/bash

# 실행할 파일명
FILENAME=$1

# 메모리 제한 (바이트 단위)
MEM_LIMIT=$(($2 * 1024 * 1024))

# 시간 제한 (초)
TIME_LIMIT=$3

echo "[$(date +"%Y-%m-%d %T")] Start executing $FILENAME (Memory limit: $2MB, Time limit: $TIME_LIMIT s)"

# 실행 시간 제한 설정
(
  timeout --preserve-status --kill-after=5 $TIME_LIMIT node $FILENAME > stdout.txt 2> stderr.txt
) &
pid=$!

wait $pid 2> /dev/null
result=$?

# Check memory usage and print appropriate message
MEM_USED=$(node -e "console.log(process.memoryUsage().heapUsed);")

# Check exit code and print appropriate message
if [ $result -eq 0 ]
then
    echo "[$(date +"%Y-%m-%d %T")] Done executing $FILENAME"
elif [ $result -eq 124 ] || [ $result -eq 143 ]
then
    echo "[$(date +"%Y-%m-%d %T")] Execution of $FILENAME has timed out"
elif [ $MEM_USED -gt $MEM_LIMIT ] || grep -q "FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed" stderr.txt
then
    echo "[$(date +"%Y-%m-%d %T")] Execution of $FILENAME has exceeded memory limit of $2MB"
else
    echo "[$(date +"%Y-%m-%d %T")] Execution of $FILENAME has resulted in an error"
fi
```

이 스크립트는 다음과 같은 기능을 수행합니다.

- 인자로 주어진 파일명, 메모리 제한 크기, 시간 제한 값을 이용하여 프로그램 실행
- 프로그램 실행 중 시간 제한 내에 실행이 완료된 경우 "Done executing [FILENAME]" 메시지 출력
- 프로그램 실행 중 시간 제한을 초과한 경우 "Execution of [FILENAME] has timed out" 메시지 출력
- 프로그램 실행 중 메모리 제한을 초과한 경우 "Execution of [FILENAME] has exceeded memory limit of [메모리 제한 크기]MB" 메시지 출력
- 프로그램 실행 중 오류가 발생한 경우 "Execution of [FILENAME] has resulted in an error" 메시지 출력

위의 기능을 수행하기 위해, 다음과 같은 방법으로 스크립트가 작동합니다.

- 인자로 주어진 파일명과 메모리 제한 크기, 시간 제한 값을 변수에 저장합니다.
- 프로그램 실행 시간 제한을 설정하기 위해 timeout 명령어를 사용합니다. 이 때, --preserve-status 옵션을 이용하여 timeout 명령어가 종료될 때 프로그램의 종료 상태를 유지합니다. 또한 --kill-after 옵션을 이용하여 timeout 명령어가 시간 제한을 초과한 후 프로그램을 종료하도록 설정합니다.
- 프로그램 실행 시간이 초과하거나, 프로그램 실행 중 메모리 제한을 초과하면 각각에 대한 메시지를 출력합니다. 이 때, process.memoryUsage().heapUsed를 이용하여 현재 프로세스의 메모리 사용량을 확인합니다.
- 프로그램 실행 결과가 0이면 "Done executing [FILENAME]" 메시지를 출력하고, 그 외의 경우는 "Execution of [FILENAME] has resulted in an error" 메시지를 출력합니다.

온라인 저지 시스템에서도 비슷한 방식으로 시간 및 메모리 제한을 설정하고 측정하고 있을것으로 예상하는데 BOJ에서는 각 언어별로 다양한 컴파일러와 인터프리터를 사용하여 소스코드를 컴파일하거나 실행한 후 해당 프로그램의 실행 시간과 메모리 사용량을 측정하고 이를 통해 시간 및 메모리 제한을 넘어가는 경우 TLE(Time Limit Exceeded) 또는 MLE(Memory Limit Exceeded) 등의 에러 메시지를 출력합니다.

따라서 BOJ의 메모리 및 시간 제한 측정 방식은 위 스크립트와 다소 차이가 있을 수 있습니다.

## 시간 제한 테스트

infinite_loop.js 코드를 실행하면 무한 루프를 돌며 프로그램이 종료되지 않습니다. 이를 테스트하기 위해 스크립트를 실행할 때 시간 제한을 10초로 설정하고 infinite_loop.js 파일을 실행시켜 봅니다.

- 테스트 코드:

```js
// infinite_loop.js

while (true) {}
```

- 실행 결과:

```bash
$ ./run.sh infinite_loop.js 128 10
[2023-03-08 16:01:46] Start executing infinite_loop.js (Memory limit: 128MB, Time limit: 10 s)
[2023-03-08 16:01:56] Execution of infinite_loop.js has timed out
```

그러면 "Execution of infinite_loop.js has timed out" 메시지가 출력되며 정상적으로 시간 제한이 적용되는 것을 확인할 수 있습니다. BOJ에서는 시간 초과(TLE) 에러가 발생할 것입니다.

## 메모리 제한 테스트

mem_limit.js 코드를 실행하면 무한 루프를 돌면서 메모리를 계속 사용합니다. 이를 테스트하기 위해, 스크립트를 실행할 때 메모리 제한을 1MB로 설정하고 mem_limit.js 파일을 실행시켜 봅니다.

- 테스트 코드:

```js
// mem_limit.js
const arr = [];
while (true) {
  arr.push(new Array(1000000));
}
```

- 실행 결과:

```bash
$ ./run.sh mem_limit.js 1 10
[2023-03-08 16:20:14] Start executing mem_limit.js (Memory limit: 1MB, Time limit: 10 s)
[2023-03-08 16:20:25] Execution of mem_limit.js has exceeded memory limit of 1MB
```

그러면 "Execution of mem_limit.js has exceeded memory limit of 1MB" 메시지가 출력되며 정상적으로 메모리 제한이 적용되는 것을 확인할 수 있습니다 BOJ에서는 메모리 초과(MLE) 에러가 발생할 것입니다.

## 정상 실행시

- 메모리와 시간제한 조건을 만족할 경우 프로그램 실행결과가 출력됩니다.

```js
$ ./run.sh solution.js 192 1
[2023-03-08 16:24:00] Start executing solution.js (Memory limit: 192MB, Time limit: 1 s)
[2023-03-08 16:24:00] Done executing solution.js
13
```

## 스크립트 작성하면서 발생한 오류들

### 메모리 제한이 동작하지 않았던 이유

메모리 제한이 동작하지 않았던 이유는 kill 명령어가 SIGTERM 시그널을 보내면서 실행되는 프로세스가 제대로 종료되지 않아서였습니다. 이 문제를 해결하기 위해 kill 명령어를 kill -0 $pid로 대체해서 실행되는 프로세스가 존재하는지 확인하고 프로세스를 종료할 수 있도록 수정해 주었습니다.

### Abort trap: 6 메시지가 출력 되는 현상

이 메시지는 일반적으로 메모리 초과나 다른 예기치 않은 상황에서 발생하는 오류로 timeout이 적용된 명령어의 실행이 중지되면서 발생했습니다. 이 메시지가 출력되지 않도록 하기위해서 위해서 timeout 명령어에 --kill-after 옵션을 추가하여, 시간 제한을 초과할 경우 명령어가 종료되도록 했습니다.

### Terminated: 15 메시지가 출력되는 현상

스크립트가 제한 시간을 초과하여 종료되었을 때도 kill 명령어로 SIGTERM 시그널을 보내서 Terminated: 15 메시지가 출력되었습니다. 이 문제를 해결하기 위해 timeout 명령어에 --preserve-status 옵션을 추가하여 실행되는 프로세스가 시간 초과로 종료되었을 때 SIGTERM 시그널이 아닌 정상 종료(exit) 코드가 반환되도록 수정해 주었습니다.

## 마무리

이 글을 통해서 JavaScript로 BOJ에서 문제를 푸는 데 도움이 되기를 바랍니다.
