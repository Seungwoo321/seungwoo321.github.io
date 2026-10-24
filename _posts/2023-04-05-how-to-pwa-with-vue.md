---
title: 오리진이 다른 리소스를 서비스워커로 캐싱하기
date: "2023-03-28"
tags: ["Workbox", "Frontend", "PWA", "Cache"]
categories: Web
locale: ko
permalink: /blog/:year/:month/:day/:title/
---

Vue CLI3의 vue add pwa 명령어를 실행하면 쉽게 PWA를 설정할 수 있습니다. 이것만으로 빌드 시 생성되는 파일이 서비스 워커에 의해 캐싱이 됩니다. 여기에 추가로 교차 오리진에서 호출하는 리소스를 캐싱 해본 경험을 정리했습니다.
<!--more-->

## 왜 서비스 워커를 도입하려는가

항상 호출되지만 거의 변경되지 않는 JSON 파일이 프로젝트에 포함되어 있어서 빌드 시 크기를 그만큼 차지하고 JSON 파일의 내용 변경 시 전체 서비스를 새로 빌드 해서 배포해야 하는 문제가 있었습니다.

이를 해결하기 위해 JSON 파일을 S3에 업로드하고 이 파일을 수정하는 관리자용 페이지를 개발했습니다. 서비스에서는 새 클라우드 프론트(CloudFront)에 연결된 주소를 사용하여 호출하도록 변경했습니다.

그러나 호출할 때마다 네트워크 호출 비용이 발생하는 것은 이전과 동일합니다.

이를 개선하기 위해 서비스 워커를 사용하여 중간에 네트워크 요청을 가로채고 클라이언트의 캐시 저장 공간에 저장하여 캐시 된 데이터가 있으면 이를 반환하고 없으면 네트워크 요청을 계속하도록 구현하기로 했습니다. 이를 통해 네트워크 호출 비용을 최소화하고 클라이언트의 사용자 경험을 개선하고자 했습니다.

## 기본 설정 살펴보기

vue cli3를 사용한 프로젝트에서 앞서 언급한 `vue add pwa` 명령어로 뷰 프로젝트에 PWA를 추가했을 때 관련된 내용을 살펴보면 프로젝트 루트에 `register-service-worker`를 사용해서 서비스 워커를 등록하는 `registerServiceWorker.js`파일이 생성되어 있고 `main.js`에는 다음과 같이 추가되어 있을 겁니다.

```js
// Register Service worker
import './registerServiceWorker'
```

vue.config.js에 별다른 설정을 하지 않아도 다음과 같이 빌드 된 서비스를 실행해서 개발자 도구의 애플리케이션 탭을 열어 보면 서비스 워커가 등록되어 있고 캐시 저장 공간이 생성된 것을 볼 수 있습니다.

- 서비스 워커

<img src="/assets/images/posts/2023/04/05/001.png"/>

- 캐시 저장공간

<img src="/assets/images/posts/2023/04/05/002.png"/>

캐시를 지우고 서비스 워커를 등록 취소한다음 새로고침 해보면 다시 서비스 워커가 등록되면서 빌드 시 생성되었던 정적 파일들이 캐싱 되는 것을 볼 수 있습니다.

## workbox 설정

@vue/cli-plugin-pwa의 가이드 문서를 살펴보면 workbox의 옵션을 지원하는 것을 알 수 있는데 주의할 점이 오리진이 다른 경우에는 `path`뿐만 아니라 앞부분까지 전체를 입력해 주어야 합니다. urlPattern에 `path`에 대한 정규 표현식만 넣으면  오리진이 다른 네트워크 요청에 대해서는 캐싱을 하지 못 합니다.

```js
// vue.config.js
workboxPluginMode: 'GenerateSW',
workboxOptions: {
    runtimeCaching: [
        {
            urlPattern: new RegExp('https://cdn\\.third-party-site\\.com.*/styles/.*\\.css'),
            handler: 'CacheFirst',
            options: {
                cacheName: 'json-cache-v1',
                expiration: {
                    maxAgeSeconds: 60 * 60 * 24 // 1 day
                }
            }
        }
    ]
}
```

## S3 CORS 정책 설정

S3 콘솔에서는 선택한 버킷의 권한 탭에 CORS(Cross-origin 리소스 공유)에서 다음과 같이 CORS 정책을 설정할 수 있습니다.

```json

[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

## 클라우드 프론트 CORS 정책 설정

클라우드 프론트 콘솔에서는 선택한 배포의 동작 탭에서 편집 화면에 들어가면 `캐시 키 및 원본 요청` 의 `응답 헤더 정책 - 선택사항`에서 클라이언트에게 내려줄 response의 헤더 정책을 생성하고 선택할 수 있습니다.

<img src="/assets/images/posts/2023/04/05/003.png"/>

새로운 정책 생성을 선택하면 Access-Control-Allow-Origin 등 CORS 관련 헤더 값을 설정할 수 있습니다

여기서 끝이 아니고 하단에 `사용자 지정 헤더 - 선택사항`에서 Service-Worker-Allowed 헤더에 호출하는 도메인 허용까지 해 주고 나서야 CORS로 요청한 리소스를 서비스 워커가 캐싱 할 수 있게 됩니다.

<img src="/assets/images/posts/2023/04/05/004.png"/>

## 정리

오리진이 다른 리소스를 호출해서 서비스 워커로 캐싱하는 과정에서 제대로 캐싱이 되지 않았던 원인은 다음과 같았습니다.

우선, vue.config.js의 pwa 설정을 할 때 URL 패턴에는 path 뿐만 아니라 전체 도메인까지 포함해야 합니다. 또한 클라우드 프론트의 응답 헤더에는 Access-Control-Allow-origin뿐만 아니라 Service-Worker-Allowed 헤더까지 추가해줘야 합니다.

이러한 설정들이 되어 있지 않으면 서비스 워커는 오리진이 다른 리소스를 캐싱하지 못하고 매번 네트워크 요청을 보내기 때문에 캐시 효과를 얻을 수 없습니다.

## Reference

- <https://joshua1988.github.io/vue-camp/pwa/workbox-caching.html#%E1%84%85%E1%85%A5%E1%86%AB%E1%84%90%E1%85%A1%E1%84%8B%E1%85%B5%E1%86%B7-%E1%84%8F%E1%85%A2%E1%84%89%E1%85%B5%E1%86%BC>
- <https://developer.chrome.com/docs/workbox/reference/workbox-build/#method-generateSW>
- <https://developer.chrome.com/docs/workbox/modules/workbox-routing/>
