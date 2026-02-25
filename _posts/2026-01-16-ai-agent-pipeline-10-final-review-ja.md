---
title: "[AIエージェントパイプライン #10] 完成したアプリと回顧"
date: "2026-01-16"
tags: ["AI", "Claude Code", "プロンプトエンジニアリング", "エージェント", "自動化"]
categories: AI-Agent
permalink: /ja/blog/:year/:month/:day/:title/
last_modified_at: "2026-01-16"
lang: ja
locale: ja
ref: ai-agent-pipeline-10
---

[前回の記事](/ja/blog/2026/01/13/ai-agent-pipeline-9-pipeline-complete/)では、パイプラインを運用しながら発見した改善点を扱いました。

今回は**最終回**です。2025年8月に始めて6ヶ月、ついに完成です。完成したアプリのUIと技術選択に関する回顧を扱います。

<!--more-->

## 1. 完成したコンテンツUI

エージェントパイプラインが生成したマークダウンがアプリでどのようにレンダリングされるかお見せします。

まずアプリで学習タブをクリックすると、全体タブですべての主題文書のカテゴリリストが表示されます。下のスクリーンショットではJavaScript Browser Conceptsが最初の主題として表示されています。カテゴリを選択すると10個のトピックが表示され、トピックを選択するとWebViewがコンテンツをレンダリングします。

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/01-learning-topics.png" alt="学習タブトピックリスト（モバイル）" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/01-learning-topics.png" alt="学習タブトピックリスト（タブレット）" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">学習タブ全体リスト - モバイル（左）とタブレット（右）</figcaption>
</figure>

「1. ブラウザアーキテクチャ完全制覇」カテゴリを選択すると10個のトピックリストが表示されます。ここで「ブラウザのマルチプロセスアーキテクチャはどのように構成されるか？」トピックを選択すると、WebViewがパイプラインが生成したコンテンツをレンダリングします。以下のスクリーンショットからがパイプラインの結果物です。

トピック画面は3つのセクションで構成されています：概要、核心概念、クイズ。上部の「選択された説明レベル」は環境設定で指定したデフォルト難易度です。下のスクリーンショットでは3段階の難易度をすべて見せるために一般、簡単、専門家タブを順番に選択しました。核心概念セクションではconcepts-writerが生成した3段階難易度の説明をタブで切り替えて見ることができます。「簡単」を選択するとコンテンツ下部に「中学生でも理解できる説明」バッジが表示され、「専門家」を選択すると「20年以上の専門家のための深い説明」バッジが表示されます。デフォルトの「一般」にはバッジがありません。

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/02-topic-concepts-normal.png" alt="核心概念 一般（モバイル）" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/02-topic-concepts-normal.png" alt="核心概念 一般（タブレット）" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">核心概念 - 一般難易度</figcaption>
</figure>

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/03-topic-concepts-easy.png" alt="核心概念 簡単（モバイル）" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/03-topic-concepts-easy.png" alt="核心概念 簡単（タブレット）" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">核心概念 - 簡単（中学生でも理解できる説明）</figcaption>
</figure>

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/04-topic-concepts-expert.png" alt="核心概念 専門家（モバイル）" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/04-topic-concepts-expert.png" alt="核心概念 専門家（タブレット）" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">核心概念 - 専門家（技術的に深い説明）</figcaption>
</figure>

クイズセクションではquiz-writerが生成した12問で学習内容を確認します。各問題の難易度は1-5の数字で表示され、難易度1-2が4問、難易度3が5問、難易度4-5が3問で固定配分されています。

<figure style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
  <div style="display: flex; gap: 16px; justify-content: center; align-items: center;">
    <img src="/assets/images/posts/2026/01/blog-10/mobile/05-topic-quiz.png" alt="クイズセクション（モバイル）" style="max-width: 25%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <img src="/assets/images/posts/2026/01/blog-10/tablet/05-topic-quiz.png" alt="クイズセクション（タブレット）" style="max-width: 65%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  </div>
  <figcaption style="text-align: center; margin-top: 12px; font-family: inherit;">クイズセクション - 12問で学習内容を確認</figcaption>
</figure>

9編で扱ったように、モバイル環境の限界と非開発主題との不調和によりpractice-writerを削除しました。元々実習セクション（Code Patterns、Experiments）がありましたが、モバイルアプリでコードを直接実行するのが難しく、非開発主題でもぎこちなかったためです。最終UIは概要、核心概念、クイズの3つのセクションで構成されています。

---

## 2. なぜClaude Codeだったのか

この作業を始めた2025年8月には、エージェントフレームワークについて知りませんでした。当時Max Planを購読していましたが、毎週使用可能なトークンを使い切れていませんでした。そこでこのトークンを活用する方法を探していたところ、Claude Code CLIドキュメントで`-p`オプションでプロンプトを渡せることを知りました。CLIベースの繰り返し作業を自動化するにはシェルスクリプトが自然な選択でした。

パイプラインがある程度完成した後にエージェントフレームワークを知りました。

| フレームワーク | 特徴 |
|:---|:---|
| **LangGraph** | LangChainベースのグラフワークフロー。状態管理とチェックポインティング内蔵、条件分岐サポート |
| **CrewAI** | ロールベースのマルチエージェント。エージェント間協業パターンがよく定義されている、学習曲線が低い |
| **AutoGen** | Microsoftの対話型エージェント。コード実行環境内蔵、マルチエージェント対話サポート |

これらのフレームワークは体系的な状態管理とチェックポインティングを提供し、エージェント間協業パターンもよく定義されていました。6編で扱ったWSM（Work Status Markers）やContractのPrecondition/Postcondition検証のようにシェルスクリプトで直接実装したものがすでにフレームワークに内蔵されていました。

マイグレーションを少し考えました。しかしすでにMax Planを購読しており、余ったトークンを活用すれば追加費用なしでパイプラインを実行できました。エージェントフレームワークを知った時には、すでにClaude Codeサブエージェントで十分に動作するパイプラインを完成した状態だったので、今すぐ新しいフレームワークで再構築する必要はありませんでした。後で機会があれば実際の費用を比較してAPI呼び出し方式へのマイグレーションも検討してみようと思います。

「シェルスクリプトの代わりにPythonやNode.jsで書いた方がきれいじゃないか？」と思うかもしれません。その通りです。しかしすでに最適化して安定的に動作しているため、わざわざ書き直す理由がありませんでした。

---

## 3. 全シリーズまとめ

10編にわたって扱った内容をまとめました。

| # | タイトル | キーポイント |
|:---:|:---|:---|
| 1 | [学習アプリを作り始めた理由](/ja/blog/2025/12/09/ai-agent-pipeline-1-why-learning-app/) | 動機と目標 |
| 2 | [何を生成するか](/ja/blog/2025/12/16/ai-agent-pipeline-2-what-to-generate/) | トピック文書設計 |
| 3 | [なぜ単一プロンプトではダメだったのか](/ja/blog/2025/12/23/ai-agent-pipeline-3-why-seven-agents/) | 単一プロンプト失敗 |
| 4 | [分離してもなぜまだダメだったのか](/ja/blog/2025/12/26/ai-agent-pipeline-4-why-still-failed/) | プロンプト汚染 |
| 5 | [プロンプト完成までの4段階](/ja/blog/2025/12/30/ai-agent-pipeline-5-prompt-evolution/) | XMLタグ導入 |
| 6 | [7つのエージェントはどのように協業するか](/ja/blog/2026/01/02/ai-agent-pipeline-6-seven-agents-collaboration/) | WSMとContract |
| 7 | [シェルスクリプトでエージェントを実行する](/ja/blog/2026/01/06/ai-agent-pipeline-7-shell-orchestration/) | 正常実行フロー |
| 8 | [リトライとロールバック](/ja/blog/2026/01/09/ai-agent-pipeline-8-rollback-mechanism/) | 失敗処理フロー |
| 9 | [改善点の発見とリファクタリング](/ja/blog/2026/01/13/ai-agent-pipeline-9-pipeline-complete/) | エージェント単純化 |
| 10 | **完成したアプリと回顧**（今回） | UIと技術選択回顧 |

---

## 4. まとめ

2025年8月から2026年1月まで、約6ヶ月間の旅でした。

メタデータパイプラインは最初からうまく動作しました。問題はコンテンツ生成でした。約1,400行のマークダウンを安定的に生成するのは簡単ではありませんでした。単一プロンプトで試して失敗し、7つのエージェントに分離しましたがまだ不安定でした。エラーが出たらルールを追加し、ルールが増えるほど悪化しました。

AI-DLC方法論を適用しながらContractパターンを導入しました。各エージェントが何を入力として受け取り、何を出力すべきか明確に定義しました。しかしマークダウンプロンプトでマークダウンコンテンツを生成するとLLMが両者を混同しました。XMLタグでプロンプト構造とコンテンツ構造を分離するとfirst-try成功率が100%に近づきました。

エージェントフレームワークを知ったのは、すでにClaude Codeサブエージェントでパイプラインを完成した後でした。LangGraphやCrewAIにマイグレーションすればより体系的な構造を持てますが、今すぐは必要ありませんでした。

1,690以上のトピックのためのパイプラインが完成しました。あとは時間を投資すれば残りのコンテンツも生成できます。

このシリーズが似たような試みをする方々の助けになれば幸いです。

---

> このシリーズはAI-DLC（AI-Driven Development Lifecycle）方法論を実際のプロジェクトに適用した経験を共有します。
> AI-DLCの詳細については、[経済指標ダッシュボード開発記シリーズ](/ja/blog/2025/10/06/economic-dashboard-1-why-started/)をご参照ください。
