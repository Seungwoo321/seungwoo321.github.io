---
title: "ハーネスエンジニアリング、Claude Codeリーク事件で知ったこと"
date: "2026-04-02"
tags: ["Harness Engineering", "Claude Code", "Agent", "AIDLC"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-04-02"
lang: ja
locale: ja
ref: harness-engineering-origin
series: "claude-code"
---

「もうハーネスエンジニアリングの時代だ」— LinkedInで誰かがこんな投稿をしているのを見ました。KakaoTalkのオープンチャットでも「ハーネスエンジニアリングを勉強しないといけないんですか？」というメッセージが流れていました。ハーネス？何だろう？と思いつつ、そのままスルーしました。

新しい技術やトレンドに関心があるように見えるかもしれませんが、実は私はそうでもありません。聞いてもスルーすることの方が多いです。

そんな中、2026年3月31日（UTC）にClaude Codeのソースコードリーク事件が起きました。最初は「モデルじゃなくてCLIがリークしただけでしょ？そんなに大事なの？」と思いました。でも実は、リークしたのはまさにその**ハーネス** — モデルを包む実行環境全体 — で、だからこそクリーンルーム方式で書き直した[claw-code](https://github.com/ultraworkers/claw-code)が1日でGitHub史上最速の100Kスターを記録したのでした。

そこでようやく、あぁ、ハーネスってそういうことか、とちゃんと調べ始めました。調べてみると、私たちがすでにやっていたことと結構重なっていました。この記事では、ハーネスエンジニアリングがどこから始まったのかを整理し、私が試している方法も紹介します。

<!--more-->

## ハーネスとは何か

ハーネス（Harness）は元々、馬に付ける馬具を意味します。鞍、手綱、轡 — 強力だが予測不能な動物を、望む方向にコントロールするための装備一式です。

AIエージェントにおけるハーネスも同じ役割です。**モデルは応答を生成し、ハーネスはそれ以外のすべてを管理します。**ツールオーケストレーション、ファイルシステムアクセス、サブエージェント管理、コンテキスト構成、人間の承認、障害復旧まで。モデルを包んで実際に「動くシステム」にするレイヤーです。

---

## パラダイムの変化

AI開発方法論は3つの段階を経て進化してきました。

| 時期 | パラダイム | 核心の問い |
|------|-----------|-----------|
| 2022-2024 | **Prompt Engineering** | モデルにどう上手く質問するか？ |
| 2025 | **Context Engineering** | モデルにどんなコンテキストを与えるか？ |
| 2026~ | **Harness Engineering** | モデルを包むシステムをどう設計するか？ |

プロンプトエンジニアリングは「AIに上手く話す技術」でした。コンテキストエンジニアリングは「モデルに必要な情報を上手く構成する技術」に拡張されました。ハーネスエンジニアリングはさらに一歩進んで、**モデルを取り巻く実行環境全体を設計する分野**です。

---

## 起源：Mitchell Hashimotoのブログ

ハーネスという用語が業界で本格的に使われ始めたきっかけがあります。

**Terraformの創設者Mitchell Hashimoto**が[ブログ](https://mitchellh.com/writing/my-ai-adoption-journey)でAIプログラミングの歩みを振り返りました。彼はAIと共にコードを書くプロセスをいくつかの段階に分けたのですが、その最後の段階を**「Engineer the Harness」**と呼びました。モデル自体を変えるよりも、モデルを包むハーネスを上手く設計する方がより大きな違いを生むという洞察でした。

その後、**OpenAI**がCodexベースの内部開発方法論を[Harness Engineering](https://openai.com/index/harness-engineering/)という記事で公開し、用語が正式化されました。**Martin Fowler**も[自身のブログ](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)でハーネスエンジニアリングを取り上げ、正式なエンジニアリング分野として認知され始めました。

---

## なぜ今注目されているのか

2025年にGPT-4.1、Claude Sonnet 4、Gemini 2.5 Proなどが次々と登場し、興味深い現象が生まれました。**モデル間の性能差はどんどん縮まっているのに、同じモデルでもどのハーネスで動かすかによって全く異なる結果が出る**ということをみんなが実感したのです。

Claude Codeが強力な理由は、Claudeモデル自体の性能だけではありません。セッション管理、ツール実行フレームワーク、コンテキストコンパクション、MCPオーケストレーションなど、**ハーネス設計が優れているから**です。

モデルはエンジン、ハーネスは車体です。どんなに良いエンジンでも、車体、ステアリング、ブレーキがなければ道路では役に立ちません。

---

## ハーネスが管理するもの

具体的にハーネスは何を担当するのでしょうか？どのツールをどの順番で呼び出すか、どのファイルを読み書きできるか、複雑なタスクを複数のエージェントにどう分配するか。会話履歴を圧縮して関連情報を選別し、危険な操作の前にはユーザーの確認を得て、エラーが発生すれば自動でリトライするか代替経路を探します。システムプロンプトとルールを注入し、タスク前後にカスタムロジックを実行するプラグイン/フックシステムまで。モデルの外側すべてがハーネスの領域です。

---

## 現在のハーネスエコシステム

こうした背景もあってか、2026年現在、ハーネスを巡るオープンソースエコシステムが急速に形成されています。「ハーネス戦争（Harness War）」という表現が出るほどです。

| プロジェクト | Stars | 説明 |
|-------------|-------|------|
| **OpenClaw** | 250K+ | マルチプラットフォームAIアシスタント |
| **superpowers** | 110K+ | エージェントスキルフレームワーク |
| **everything-claude-code** | 130K+ | Claude Codeハーネス最適化システム |
| **claw-code** | 128K+ | Claude Codeハーネスのクリーンルーム再実装 |
| **DeerFlow** | 37K+ | ByteDanceのSuperAgentハーネス |
| **revfactory/harness** | 1.5K+ | エージェントチームを設計するメタスキル |
| **oh-my-openagent** | - | マルチモデルエージェントハーネス |

---

## 私はどう使っているか

私はAWSワークショップで知った**[AI-DLC](https://aws.amazon.com/blogs/devops/ai-driven-development-life-cycle/)**方法論をClaude Codeスキルとして作って使っていたのですが、今回ハーネスを知ってから[revfactory/harness](https://github.com/revfactory/harness)の参照資料をほぼそのまま持ってきて組み合わせてみました。この2つを自分が使いやすい形に組み合わせて試しているところです。興味があれば[aidlc-plugin](https://github.com/Seungwoo321/aidlc-plugin)リポジトリを参考にしてください。

よくできたものをそのまま使うのも良い方法ですが、自分に合わせて少しずつカスタマイズする楽しさもあります。よく使うワークフローがあれば、ハーネスとして構成してみてはいかがでしょうか。

---

## おわりに

プロンプトエンジニアリングが「AIに上手く話す技術」だったとすれば、ハーネスエンジニアリングは「AIが上手く働ける環境を作る技術」です。モデルは進化し続けますが、同じモデルでもハーネスによって全く異なる結果が出る時代です。完成された正解はなく、それぞれのドメインとワークフローに合ったハーネスを見つけていくプロセス自体が大事だと思います。

---

**参考資料**

ハーネスエンジニアリングの理解に役立った記事：
- [2025 Was Agents. 2026 Is Agent Harnesses. — Aakash Gupta](https://aakashgupta.medium.com/2025-was-agents-2026-is-agent-harnesses-heres-why-that-changes-everything-073e9877655e)
- [What Is an Agent Harness? — Salesforce](https://www.salesforce.com/agentforce/ai-agents/agent-harness/?bc=OTH)
- [What is an agent harness? — Parallel Web Systems](https://parallel.ai/articles/what-is-an-agent-harness)

関連リポジトリ：
- [obra/superpowers](https://github.com/obra/superpowers) — エージェントスキルフレームワーク (110K+ Stars)
- [code-yeongyu/oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — マルチモデルエージェントハーネス
- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) — LangChainのエージェントハーネス
