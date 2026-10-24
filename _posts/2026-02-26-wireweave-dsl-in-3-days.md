---
title: "바이브 코딩 6개월, Wireframe MCP를 만들어봤다"
date: "2026-02-26"
tags: ["AI", "Claude Code", "DSL", "Wireweave", "와이어프레임", "MCP", "wireframe"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-26"
lang: ko
locale: ko
ref: vibe-coding-wireweave-dsl
---

"글로 아무리 잘 설명해도 화면을 대신할 수는 없었습니다."

e-torch 프로젝트는 순조롭게 진행되고 있었습니다. 다만 세부적인 화면을 설명할수록 텍스트의 한계가 느껴졌습니다. 이 불편함이 DSL 프로젝트로 이어졌습니다.

<!--more-->

## 화면 설명의 어려움

사이드 프로젝트에서 KOSIS 데이터를 다루고 있었습니다. 트리 구조로 데이터를 탐색하고, 항목을 선택하고, 미리보기에서 여러 차트 형태로 확인한 다음 등록하는 플로우입니다.

문제는 트리 구조가 단순하지 않다는 점이었습니다. 마지막 노드만 선택하는 게 아니었습니다. 부모 노드도 선택할 수 있었고, 부모에 값이 있는 경우도 있고 없는 경우도 있었습니다. 자식들의 합이 부모와 다른 경우도 있었습니다.

처음에는 트리맵으로 이 구조를 보여주고 싶었습니다. UI 플로우를 어떻게 해야 할지 AI와 논의하면서 문서로 정리했습니다. 분석하고, 논의하고, 다시 분석하고. 결국 트리맵은 포기했습니다. 데이터가 맞지 않았거든요.

이 과정에서 느꼈습니다. 화면 기획을 글로 전달하는 건 한계가 있다고.

---

## 배경

Figma AI는 무료 플랜에서 대부분의 기능이 제한됩니다. AI로 화면 기획을 하고 싶었는데 Figma에서는 어려울 거라고 생각했습니다.

주로 화면을 새로 그릴 때는 마크다운으로 AI가 작성하게 해서 아스키 코드로 간단하게 표현했습니다. 더 세부적인 그림이 필요하면 SVG로 그리기도 했는데, 토큰 소모가 커서 HTML로 그려본 적도 있습니다.

그런데 막상 구현할 때 다시 읽어보면 명확하지 않았습니다. 같은 설명을 다르게 해석할 여지가 있었습니다.

"어떻게 하면 AI한테 더 잘 설명할 수 있을까" 고민하고 있었습니다. 그러다 Mermaid를 보면서 갑자기 생각이 들었습니다.

"와이어프레임도 이렇게 할 수 있지 않을까?"

별도 문법으로 작성하고, 마크다운에서 바로 미리보기가 되면 좋겠다고 생각했습니다.

---

## AI-DLC로 설계하기

[AI 에이전트 파이프라인 시리즈](/blog/2026/01/16/ai-agent-pipeline-10-final-review/)에서 AI-DLC 방법론을 적용한 경험을 다뤘습니다. [e-torch 시리즈](/blog/2026/02/10/e-torch-intro/)도 이 방법론으로 진행하고 있습니다.

e-torch를 진행하다가 화면 기획의 어려움을 느꼈고, 그게 이 DSL 프로젝트로 이어졌습니다. 와이어프레임 DSL도 마찬가지로 설계 문서를 만들고, DSL 문법을 정의하고, 파서를 구현하는 순서로 진행했습니다.

설계가 끝나고 나서는 이런 대화만 반복했습니다.

"단계별로 실행할까요?"

"네 진행하세요."

Claude Code가 제안하는 프롬프트를 엔터로 실행하는 식이었습니다. 다른 일 하다가 화면 돌아오면 또 엔터. 3일 뒤에 확인해보니 DSL 핵심이 완성되어 있었습니다.

---

## 이게 내가 원한 와이어프레임

HTML이나 SVG로 와이어프레임을 그릴 수도 있습니다. 문제는 그 다음입니다.

간단하게 스케치하면 AI가 그 코드를 참고해서 구현할 때 스케치 수준 그대로 만들어버립니다. 반대로 구체적으로 그리려면 1px 단위로 조절해야 하는데, HTML이나 SVG에서는 번거롭습니다. 그 정도로 세세하게 할 거면 차라리 React 코드로 바로 구현하는 게 낫습니다. 하지만 머릿속 그림이 아직 명확하지 않아 정리가 필요한 상황에서는 과한 방법입니다.

이 딜레마에서 벗어나고 싶었습니다. 디자인은 없지만 충분히 구체적인, 1:1로 매칭되는 와이어프레임. Mermaid처럼 한 단계 더 간단한 언어로요.

### 간단한 예시: 모바일 앱

```wireframe
page "Mobile App" width=375 height=812 {
  header p=4 border {
    row justify=between align=center {
      title "My App" level=4
      icon "menu"
    }
  }

  main p=4 {
    card p=6 mb=4 {
      title "Welcome" level=2
      text "Experience the best mobile wireframe" muted
      button "Get Started" primary w=full mt=4
    }

    col gap=3 {
      row gap=3 {
        col span=6 {
          card p=3 {
            icon "check" size=sm
            text "Fast" weight=semibold
          }
        }
        col span=6 {
          card p=3 {
            icon "shield" size=sm
            text "Secure" weight=semibold
          }
        }
      }
      row gap=3 {
        col span=6 {
          card p=3 {
            icon "star" size=sm
            text "Simple" weight=semibold
          }
        }
        col span=6 {
          card p=3 {
            icon "heart" size=sm
            text "Beautiful" weight=semibold
          }
        }
      }
    }
  }

  footer p=4 border {
    row justify=around {
      col align=center {
        icon "home" size=sm
        text "Home" size=xs
      }
      col align=center {
        icon "search" size=sm
        text "Search" size=xs
      }
      col align=center {
        icon "user" size=sm
        text "Profile" size=xs
      }
    }
  }
}
```

Preview 탭에서 렌더링된 화면을, Code 탭에서 소스 코드를 볼 수 있습니다.

### 복잡한 예시: 유튜브 홈

```wireframe
page width=1280 height=800 {
  header h=56 border p=0 {
    row justify=between align=center px=4 {
      row gap=4 align=center {
        icon "menu" size=lg
        row gap=1 align=center {
          icon "youtube" size=lg
          text "YouTube" bold size=lg
        }
      }
      row flex=1 justify=center {
        row w=600 gap=0 {
          input placeholder="검색" w=full
          button "" icon="search" outline
          button "" icon="mic" ghost
        }
      }
      row gap=3 align=center {
        button "" icon="square-plus" ghost
        button "" icon="bell" ghost
        avatar "User" size=sm
      }
    }
  }
  row {
    sidebar w=220 p=0 border {
      col gap=0 py=2 px=3 {
        row gap=3 align=center p=2 rounded bg=muted {
          icon "home" size=sm
          text "홈" size=sm
        }
        row gap=3 align=center p=2 {
          icon "zap" size=sm muted
          text "Shorts" size=sm muted
        }
        divider
        row justify=between align=center py=2 {
          text "구독" size=sm weight=semibold
          icon "chevron-right" size=sm muted
        }
        col gap=0 {
          row gap=3 align=center py=1 {
            avatar "TC" size=xs
            text "Tech Channel" size=xs
          }
          row gap=3 align=center py=1 {
            avatar "MV" size=xs
            text "Music Videos" size=xs
          }
          row gap=3 align=center py=1 {
            avatar "GL" size=xs
            text "Gaming Live" size=xs
          }
          row gap=3 align=center py=1 {
            icon "chevron-down" size=xs muted
            text "더보기" size=xs muted
          }
        }
        divider
        row justify=between align=center py=2 {
          text "내 페이지" size=sm weight=semibold
          icon "chevron-right" size=sm muted
        }
        col gap=0 {
          row gap=3 align=center py=1 {
            icon "history" size=sm muted
            text "기록" size=sm muted
          }
          row gap=3 align=center py=1 {
            icon "list" size=sm muted
            text "재생목록" size=sm muted
          }
          row gap=3 align=center py=1 {
            icon "clock" size=sm muted
            text "나중에 볼 동영상" size=sm muted
          }
        }
      }
    }
    main p=0 scroll {
      col gap=0 {
        row gap=2 px=4 py=3 border align=center {
          badge "전체" variant=primary
          badge "팟캐스트" variant=outline
          badge "라이브" variant=outline
          badge "음악" variant=outline
          badge "믹스" variant=outline
          badge "게임" variant=outline
          icon "chevron-right" size=sm muted
        }
        col gap=6 p=4 {
          row gap=4 {
            col flex=1 gap=2 {
              placeholder "Wireweave Ad" h=200 w=full
              col gap=2 {
                text "AI와 함께 와이어프레임을 작성하세요 - Wireweave" size=sm weight=semibold
                text "스폰서 · Wireweave" size=xs muted
                row gap=2 {
                  button "자세히 보기" outline size=sm
                  button "시작하기" primary size=sm
                }
              }
            }
            col flex=1 gap=2 {
              placeholder "Live Thumbnail" h=200 w=full
              row gap=3 {
                avatar "TC" size=sm
                col gap=0 flex=1 {
                  text "[LIVE] Tech Talk Stream" size=sm weight=semibold
                  text "Tech Channel" size=xs muted
                  text "1.2K watching" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "DC" size=sm
                col gap=0 flex=1 {
                  text "10 Tips for Better Productivity" size=sm weight=semibold
                  text "Daily Content" size=xs muted
                  text "150K views · 2 weeks ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
          }
          col gap=3 {
            row justify=between align=center {
              row gap=2 align=center {
                icon "flame" size=sm
                text "Shorts" weight=semibold size=md
              }
              icon "more-vertical" size=sm muted
            }
            row gap=3 {
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Amazing Dance Moves" size=xs weight=semibold
                text "3.1M views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Quick Cooking Tips" size=xs weight=semibold
                text "250K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Funny Pet Moments" size=xs weight=semibold
                text "370K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Life Hacks You Need" size=xs weight=semibold
                text "250K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Travel Highlights" size=xs weight=semibold
                text "1.01M views" size=xs muted
              }
            }
          }
          row gap=4 {
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "MV" size=sm
                col gap=0 flex=1 {
                  text "Top Hits Playlist 2024" size=sm weight=semibold
                  text "Music Videos" size=xs muted
                  text "7.3M views · 1 year ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "CC" size=sm
                col gap=0 flex=1 {
                  text "Learn Coding in 30 Days" size=sm weight=semibold
                  text "Code Camp" size=xs muted
                  text "10K views · 3 weeks ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "FT" size=sm
                col gap=0 flex=1 {
                  text "Fitness Routine for Beginners" size=sm weight=semibold
                  text "Fitness Today" size=xs muted
                  text "5.1K views · 4 days ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
          }
          col gap=3 {
            row justify=between align=center {
              row gap=2 align=center {
                icon "flame" size=sm
                text "Shorts" weight=semibold size=md
              }
              icon "more-vertical" size=sm muted
            }
            row gap=3 {
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Quick DIY Projects" size=xs weight=semibold
                text "8.5K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Tech Tips in 60 Sec" size=xs weight=semibold
                text "14K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Books That Changed Me" size=xs weight=semibold
                text "33K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Behind the Scenes" size=xs weight=semibold
                text "450K views" size=xs muted
              }
              col flex=1 gap=1 {
                placeholder "Shorts" h=280 w=full
                text "Sibling Pranks" size=xs weight=semibold
                text "4.15M views" size=xs muted
              }
            }
          }
          row gap=4 {
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "VL" size=sm
                col gap=0 flex=1 {
                  text "Vlog: A Day in My Life" size=sm weight=semibold
                  text "Vlogger Life" size=xs muted
                  text "210K views · 7 days ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "CK" size=sm
                col gap=0 flex=1 {
                  text "Easy Recipe: Chocolate Cookies" size=sm weight=semibold
                  text "Chef Kitchen" size=xs muted
                  text "4.1M views · 2 weeks ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
            col flex=1 gap=2 {
              placeholder "Thumbnail" h=200 w=full
              row gap=3 {
                avatar "TN" size=sm
                col gap=0 flex=1 {
                  text "Weekly Tech News Roundup" size=sm weight=semibold
                  text "Tech News Daily" size=xs muted
                  text "40K views · 2 weeks ago" size=xs muted
                }
                icon "more-vertical" size=sm muted
              }
            }
          }
        }
      }
    }
  }
}
```

Preview 탭에서 렌더링된 화면을, Code 탭에서 소스 코드를 볼 수 있습니다.

파서는 Peggy로 만들었습니다. 렌더러는 HTML과 SVG 둘 다 지원합니다. 컴포넌트는 36개입니다.

### AI 시대의 DSL

사실 저도 이 문법을 잘 모릅니다. AI가 작성해줄 것을 전제로 만들었기 때문입니다.

Mermaid를 생각해보세요. 예전에는 직접 문법을 익혀서 작성했습니다. 지금은 AI에게 "Mermaid로 이런 플로우차트 그려줘"라고 하면 코드가 나옵니다. 저는 결과만 확인하면 됩니다.

**Wireframe DSL**도 마찬가지입니다. 화면을 설명하면 AI가 DSL로 와이어프레임을 작성합니다. 저는 미리보기를 확인하고 피드백을 줍니다.

다만, AI가 제대로 작성하려면 체계적인 규칙이 필요합니다. 문법 명세, 컴포넌트 정의, 속성 가이드. 이런 것들이 있어야 AI도 이해하고 원하는 형태로 그려줍니다.

> "DSL과 AI 기술의 조합에는 엄청난 잠재력이 있다. DSL이 LLM을 사용하는 애플리케이션에 명확성, 예측 가능성, 간결함을 제공한다."
> — [TypeFox, Langium AI](https://www.typefox.io/blog/langium-ai-the-fusion-of-dsls-and-llms/)

---

## 만들어진 것들

AI가 와이어프레임 DSL을 잘 작성하려면 문법 명세를 참조하고 렌더링 결과를 확인할 수 있어야 합니다. 그래서 **Wireweave MCP 서버**를 만들었습니다. Claude나 다른 AI 도구에서 연결해서 사용합니다.

대시보드도 만들었습니다. 어떤 도구가 호출됐는지, 응답 시간은 얼마인지, 상태 코드는 뭔지 확인할 수 있습니다.

VSCode 확장, 문서 사이트, 대시보드까지. 처음 결과는 3일 만에 나왔고, 한 달에 걸쳐 12개 레포를 만들었습니다. 플레이그라운드와 랜딩은 대시보드로 통합했습니다.

기존 웹개발과는 다른 영역도 경험했습니다. 그중 하나가 수익 구조입니다. Wireweave는 오픈소스로만 공개해도 충분하지만, API 키를 발급하고 키 기반으로 사용량을 추적하고 과금하는 구조를 만들어보고 싶었습니다. 이런 방식이 요즘 SaaS의 표준이 되고 있습니다. [2025년 기준 85%의 SaaS 리더가 사용량 기반 가격 정책을 채택했고](https://metronome.com/state-of-usage-based-pricing-2025), 크레딧 모델 채택 기업은 전년 대비 126% 증가했습니다.

수익 구조를 만들려면 결제 시스템이 필요했습니다. Paddle은 MOR(Merchant of Record)라서 세금 처리까지 대행합니다. 승인 요청을 보내고 피드백을 받고, 수정하고 다시 요청하는 과정을 반복했습니다. 지금 [wireweave.org](https://wireweave.org)에 들어가면 그 결과물입니다.

며칠 전 Paddle 승인 메일을 받았습니다. 결제 연동까지 완료된 상태입니다.

---

## 마무리

기존 프로젝트들은 오래 걸렸습니다. 파이프라인은 6개월, e-torch는 아직 진행 중입니다. 이 프로젝트는 달랐습니다. 목적이 분명했습니다. "AI한테 UI 설명하기 어렵다"는 문제가 명확했고, "DSL로 해결하자"는 방향도 명확했습니다. 3일 만에 핵심이 나왔습니다.

결국 도구를 만든 건 사람을 위해서입니다. AI가 그린 와이어프레임을 사람이 보고 피드백을 주려면, 그 화면이 렌더링되어야 합니다. AI가 구현을 도와주면서, 기획하고 설계하는 역할이 더 중요해진 것 같습니다. 특정 직업이 없어지고 대체되는 게 아니라, 협업의 방식이 바뀌는 거라고 생각합니다.

AI와의 소통이 어려운 영역이 있다면, 중간 단계로 DSL을 만들어보는 건 어떨까요. 막상 해보면 생각보다 결과가 좋습니다.

