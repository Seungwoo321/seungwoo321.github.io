---
title: "6 Months of Vibe Coding: I Built a Wireframe MCP"
date: "2026-02-26"
tags: ["AI", "Claude Code", "DSL", "Wireweave", "Wireframe", "MCP"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-26"
lang: en
locale: en
ref: vibe-coding-wireweave-dsl
---

"No matter how well I explained in text, it couldn't replace a screen."

The e-torch project was progressing smoothly. But as I explained screens in more detail, I felt the limitations of text. This frustration led to the DSL project.

<!--more-->

## The Difficulty of Explaining Screens

I was working with KOSIS data in a side project. The flow was: explore data in a tree structure, select items, preview in various chart formats, then register.

The problem was the tree structure wasn't simple. It wasn't just selecting leaf nodes. Parent nodes could be selected too, sometimes parents had values and sometimes they didn't. Sometimes the sum of children didn't match the parent.

Initially I wanted to show this structure with a treemap. I discussed UI flow with AI and documented it. Analyze, discuss, analyze again. Eventually I gave up on treemap. The data didn't fit.

Through this process I realized: conveying screen planning in text has limits.

---

## Background

Figma AI restricts most features on the free plan. I wanted to do screen planning with AI, but figured it would be difficult in Figma.

When drawing new screens, I mostly had AI write markdown with simple ASCII representations. When I needed more detailed drawings, I sometimes drew with SVG, but token consumption was high, so I also tried HTML.

But when I read them again during implementation, they weren't clear. There was room for different interpretations of the same description.

I was thinking "how can I explain better to AI?" Then looking at Mermaid, a thought suddenly struck me.

"Could wireframes work like this too?"

Write in separate syntax, with preview directly in markdown. That would be nice, I thought.

---

## Designing with AI-DLC

In the [AI Agent Pipeline series](/blog/2026/01/16/ai-agent-pipeline-10-final-review/), I covered my experience applying the AI-DLC methodology. The [e-torch series](/blog/2026/02/10/e-torch-intro/) is also progressing with this methodology.

While working on e-torch I felt the difficulty of screen planning, which led to this DSL project. Wireframe DSL also proceeded in order: create design documents, define DSL grammar, implement parser.

After design was done, conversations went like this:

"Shall I execute step by step?"

"Yes, proceed."

I just hit enter on prompts Claude Code suggested. Come back from doing other things, hit enter again. 3 days later I checked and the DSL core was complete.

---

## This Is the Wireframe I Wanted

You can draw wireframes with HTML or SVG. The problem is what comes next.

If you sketch simply, when AI implements referencing that code, it builds to sketch level. Conversely, to draw concretely you have to adjust by 1px, which is tedious in HTML or SVG. If you're going to be that detailed, you might as well implement directly in React. But when the picture in your head isn't clear yet and needs organizing, that's overkill.

I wanted to escape this dilemma. A wireframe that's sufficiently concrete without design, mapping 1:1. In a language one step simpler, like Mermaid.

### Simple Example: Mobile App

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

You can see the rendered screen in the Preview tab, source code in the Code tab.

### Complex Example: YouTube Home

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
          input placeholder="Search" w=full
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
          text "Home" size=sm
        }
        row gap=3 align=center p=2 {
          icon "zap" size=sm muted
          text "Shorts" size=sm muted
        }
        divider
        row justify=between align=center py=2 {
          text "Subscriptions" size=sm weight=semibold
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
            text "Show more" size=xs muted
          }
        }
      }
    }
    main p=0 scroll {
      col gap=0 {
        row gap=2 px=4 py=3 border align=center {
          badge "All" variant=primary
          badge "Podcasts" variant=outline
          badge "Live" variant=outline
          badge "Music" variant=outline
          badge "Mixes" variant=outline
          badge "Gaming" variant=outline
          icon "chevron-right" size=sm muted
        }
        col gap=6 p=4 {
          row gap=4 {
            col flex=1 gap=2 {
              placeholder "Wireweave Ad" h=200 w=full
              col gap=2 {
                text "Write wireframes with AI - Wireweave" size=sm weight=semibold
                text "Sponsored · Wireweave" size=xs muted
                row gap=2 {
                  button "Learn more" outline size=sm
                  button "Get started" primary size=sm
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
        }
      }
    }
  }
}
```

You can see the rendered screen in the Preview tab, source code in the Code tab.

The parser is built with Peggy. The renderer supports both HTML and SVG. There are 36 components.

### DSL in the AI Era

Actually, I don't really know this syntax well either. Because I made it assuming AI would write it.

Think about Mermaid. Before, you learned the syntax and wrote it yourself. Now you say to AI "draw this flowchart in Mermaid" and code comes out. I just check the result.

**Wireframe DSL** is the same. Describe a screen and AI writes the wireframe in DSL. I check the preview and give feedback.

However, for AI to write properly, systematic rules are needed. Grammar spec, component definitions, attribute guides. With these, AI can understand and draw what you want.

> "The combination of DSLs and AI technology has tremendous potential. DSLs provide clarity, predictability, and conciseness to LLM-powered applications."
> — [TypeFox, Langium AI](https://www.typefox.io/blog/langium-ai-the-fusion-of-dsls-and-llms/)

---

## What Was Built

For AI to write wireframe DSL well, it needs to reference grammar specs and verify rendering results. So I created **Wireweave MCP Server**. Connect and use it from Claude or other AI tools.

I also made a dashboard. You can check which tools were called, response times, status codes.

VSCode extension, documentation site, dashboard. First results came out in 3 days, and over a month I created 12 repos. Playground and landing were consolidated into the dashboard.

I also experienced areas different from typical web development. One was revenue structure. Wireweave is fine just releasing as open source, but I wanted to try building a structure that issues API keys, tracks usage by key, and bills. This approach is becoming the standard for modern SaaS. [As of 2025, 85% of SaaS leaders have adopted usage-based pricing](https://metronome.com/state-of-usage-based-pricing-2025), and credit model adoption increased 126% year-over-year.

To build a revenue structure, I needed a payment system. Paddle is a MOR (Merchant of Record) so they handle taxes too. I repeated the process of sending approval requests, getting feedback, fixing, and requesting again. What you see now at [wireweave.org](https://wireweave.org) is the result.

A few days ago I received the Paddle approval email. Payment integration is complete.

---

## Wrap Up

Previous projects took a long time. Pipeline took 6 months, e-torch is still in progress. This project was different. The purpose was clear. The problem "it's hard to explain UI to AI" was clear, and the direction "let's solve it with DSL" was also clear. The core came out in 3 days.

Ultimately, building tools is for people. For a person to see an AI-drawn wireframe and give feedback, that screen needs to be rendered. As AI helps with implementation, the role of planning and designing seems to have become more important. I think it's not about specific jobs disappearing and being replaced, but about the way of collaboration changing.

If there's an area where communicating with AI is difficult, how about creating a DSL as an intermediate step? Try it and the results are surprisingly good.
