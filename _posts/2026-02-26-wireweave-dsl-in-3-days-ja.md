---
title: "バイブコーディング6ヶ月、Wireframe MCPを作ってみた"
date: "2026-02-26"
tags: ["AI", "Claude Code", "DSL", "Wireweave", "ワイヤーフレーム", "MCP"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-26"
lang: ja
locale: ja
ref: vibe-coding-wireweave-dsl
---

「いくら文章でうまく説明しても、画面の代わりにはなりませんでした。」

e-torchプロジェクトは順調に進んでいました。ただ、詳細な画面を説明するほどテキストの限界が感じられました。この不便さがDSLプロジェクトにつながりました。

<!--more-->

## 画面説明の難しさ

サイドプロジェクトでKOSISデータを扱っていました。ツリー構造でデータを探索し、項目を選択し、プレビューで様々なチャート形式で確認してから登録するフローです。

問題はツリー構造が単純ではないという点でした。最後のノードだけを選択するのではありませんでした。親ノードも選択でき、親に値がある場合もあればない場合もありました。子の合計が親と異なる場合もありました。

最初はツリーマップでこの構造を見せたいと思いました。UIフローをどうすべきかAIと議論しながら文書にまとめました。分析して、議論して、また分析して。結局ツリーマップは諦めました。データが合わなかったからです。

この過程で感じました。画面企画を文章で伝えるのには限界があると。

---

## 背景

Figma AIは無料プランでほとんどの機能が制限されます。AIで画面企画をしたかったのですが、Figmaでは難しそうだと思いました。

主に画面を新しく描くときはマークダウンでAIに書かせてASCIIコードで簡単に表現しました。より詳細な絵が必要な場合はSVGで描くこともありましたが、トークン消費が大きいのでHTMLで描いてみたこともあります。

しかし実際に実装するときに読み返すと明確ではありませんでした。同じ説明を異なるように解釈する余地がありました。

「どうすればAIにもっとうまく説明できるだろう」と悩んでいました。するとMermaidを見ていて突然思いました。

「ワイヤーフレームもこうできるんじゃないか？」

別の文法で書いて、マークダウンですぐプレビューできたらいいなと思いました。

---

## AI-DLCで設計する

[AIエージェントパイプラインシリーズ](/blog/2026/01/16/ai-agent-pipeline-10-final-review/)でAI-DLC方法論を適用した経験を扱いました。[e-torchシリーズ](/blog/2026/02/10/e-torch-intro/)もこの方法論で進めています。

e-torchを進める中で画面企画の難しさを感じ、それがこのDSLプロジェクトにつながりました。ワイヤーフレームDSLも同様に設計文書を作り、DSL文法を定義し、パーサーを実装する順序で進めました。

設計が終わってからはこんな会話の繰り返しでした。

「段階的に実行しましょうか？」

「はい、進めてください。」

Claude Codeが提案するプロンプトをエンターで実行する形でした。他のことをしていて画面に戻ってきたらまたエンター。3日後に確認したらDSLのコアが完成していました。

---

## これが私が望んだワイヤーフレーム

HTMLやSVGでワイヤーフレームを描くこともできます。問題はその次です。

簡単にスケッチすると、AIがそのコードを参考に実装するときスケッチレベルそのまま作ってしまいます。逆に具体的に描こうとすると1px単位で調整する必要がありますが、HTMLやSVGでは面倒です。そこまで細かくするなら、むしろReactコードで直接実装した方がいいです。しかし頭の中の絵がまだ明確でなく整理が必要な状況では過度な方法です。

このジレンマから脱したかったです。デザインはないが十分に具体的な、1:1でマッチングするワイヤーフレーム。Mermaidのようにもう一段階シンプルな言語で。

### 簡単な例：モバイルアプリ

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

Previewタブでレンダリングされた画面を、Codeタブでソースコードを見ることができます。

### 複雑な例：YouTubeホーム

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
          input placeholder="検索" w=full
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
          text "ホーム" size=sm
        }
        row gap=3 align=center p=2 {
          icon "zap" size=sm muted
          text "Shorts" size=sm muted
        }
        divider
        row justify=between align=center py=2 {
          text "登録チャンネル" size=sm weight=semibold
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
            text "もっと見る" size=xs muted
          }
        }
      }
    }
    main p=0 scroll {
      col gap=0 {
        row gap=2 px=4 py=3 border align=center {
          badge "すべて" variant=primary
          badge "ポッドキャスト" variant=outline
          badge "ライブ" variant=outline
          badge "音楽" variant=outline
          badge "ミックス" variant=outline
          badge "ゲーム" variant=outline
          icon "chevron-right" size=sm muted
        }
        col gap=6 p=4 {
          row gap=4 {
            col flex=1 gap=2 {
              placeholder "Wireweave Ad" h=200 w=full
              col gap=2 {
                text "AIと一緒にワイヤーフレームを作成 - Wireweave" size=sm weight=semibold
                text "スポンサー · Wireweave" size=xs muted
                row gap=2 {
                  button "詳細を見る" outline size=sm
                  button "始める" primary size=sm
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

Previewタブでレンダリングされた画面を、Codeタブでソースコードを見ることができます。

パーサーはPeggyで作りました。レンダラーはHTMLとSVGの両方をサポートします。コンポーネントは36個です。

### AI時代のDSL

実は私もこの文法をよく知りません。AIが書いてくれることを前提に作ったからです。

Mermaidを考えてみてください。以前は自分で文法を覚えて書いていました。今はAIに「Mermaidでこんなフローチャートを描いて」と言えばコードが出てきます。私は結果だけ確認すればいいです。

**Wireframe DSL**も同じです。画面を説明すればAIがDSLでワイヤーフレームを書きます。私はプレビューを確認してフィードバックします。

ただし、AIがちゃんと書くには体系的なルールが必要です。文法仕様、コンポーネント定義、属性ガイド。これらがあってこそAIも理解して望む形で描いてくれます。

> 「DSLとAI技術の組み合わせには驚異的な可能性がある。DSLがLLMを使用するアプリケーションに明確さ、予測可能性、簡潔さを提供する。」
> — [TypeFox, Langium AI](https://www.typefox.io/blog/langium-ai-the-fusion-of-dsls-and-llms/)

---

## できたもの

AIがワイヤーフレームDSLをうまく書くには、文法仕様を参照してレンダリング結果を確認できる必要があります。そこで**Wireweave MCPサーバー**を作りました。Claudeや他のAIツールから接続して使います。

ダッシュボードも作りました。どのツールが呼び出されたか、レスポンスタイムはどのくらいか、ステータスコードは何か確認できます。

VSCode拡張、ドキュメントサイト、ダッシュボードまで。最初の結果は3日で出て、1ヶ月かけて12個のリポジトリを作りました。プレイグラウンドとランディングはダッシュボードに統合しました。

既存のWeb開発とは異なる領域も経験しました。その一つが収益構造です。Wireweaveはオープンソースとして公開するだけでも十分ですが、APIキーを発行してキーベースで使用量を追跡して課金する構造を作ってみたかったです。このような方式が最近のSaaSの標準になっています。[2025年基準で85%のSaaSリーダーが使用量ベースの価格政策を採用](https://metronome.com/state-of-usage-based-pricing-2025)し、クレジットモデル採用企業は前年比126%増加しました。

収益構造を作るには決済システムが必要でした。PaddleはMOR（Merchant of Record）なので税金処理まで代行します。承認リクエストを送ってフィードバックを受けて、修正してまたリクエストする過程を繰り返しました。今[wireweave.org](https://wireweave.org)に行けばその結果物です。

数日前にPaddle承認メールを受け取りました。決済連携まで完了した状態です。

---

## まとめ

既存のプロジェクトは長くかかりました。パイプラインは6ヶ月、e-torchはまだ進行中です。このプロジェクトは違いました。目的が明確でした。「AIにUI説明するのが難しい」という問題が明確で、「DSLで解決しよう」という方向も明確でした。3日でコアができました。

結局ツールを作ったのは人のためです。AIが描いたワイヤーフレームを人が見てフィードバックするには、その画面がレンダリングされる必要があります。AIが実装を助けながら、企画して設計する役割がより重要になったようです。特定の職業がなくなって代替されるのではなく、協業の方式が変わるのだと思います。

AIとのコミュニケーションが難しい領域があれば、中間段階としてDSLを作ってみるのはいかがでしょうか。やってみると思ったより結果が良いです。
