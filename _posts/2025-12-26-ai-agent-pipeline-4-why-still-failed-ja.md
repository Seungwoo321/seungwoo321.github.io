---
title: "[AIエージェントパイプライン #4] 分離したのになぜまだうまくいかなかったのか"
date: "2025-12-26"
tags: ["AI", "Claude Code", "プロンプトエンジニアリング", "エージェント", "自動化"]
categories: AI-Agent
permalink: /ja/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-26"
lang: ja
ref: ai-agent-pipeline-4
hidden: true
---

[前回の記事](/ja/blog/2025/12/23/ai-agent-pipeline-3-why-seven-agents/)では、一つのプロンプトがなぜうまくいかなかったか、そして7つのエージェントに分離した過程を扱いました。

今回は、エージェントを分離した後に何を試したか、そしてそれでもなぜうまくいかなかったかを扱います。

<!--more-->

## 1. プロンプト汚染

パイプラインを実行してパースエラーが発生すると、エラー内容とサンプルマークダウンをClaudeに渡して修正を要求しました。Claudeは「解決した」と言いながら、新しい禁止ルールとやるべきルールを追加しました。

```markdown
## 絶対禁止事項
1. マークダウンヘッダーレベル混同禁止
2. コードブロック内に不要なコメント禁止
3. 絵文字使用禁止
4. 空行2行以上連続禁止
5. ...
```

最初は効果があるように見えました。しかしエラーの種類が多様化するにつれ、ルールが増え続けました。プロンプトがどんどん長くなり、新しいルールが既存のルールと衝突し始めました。結局、LLMがすべてのルールを同時に守れない状況になりました。

振り返ってみると、このアプローチにはいくつかの根本的な問題がありました。

### 1.1 否定指示の限界

「〜するな」という指示はLLMに効果的ではありません。
「してはいけないこと」を先に思い浮かべ、それをしてしまいます。

```markdown
# Bad
「コードブロック内に韓国語コメントを入れないでください」

# Better
「コードブロックには英語コメントのみ使用します」
```

### 1.2 ルール間の衝突

異なるエラーを防ごうとしてルールが衝突します。

```markdown
ルールA: 「必ず実行可能な完全なコードを作成してください」
ルールB: 「コードは10行以内で簡潔に作成してください」
```

### 1.3 コンテキスト汚染

プロンプトが長くなりすぎると、LLMは前半を忘れてしまいます。
ルールが多くなるほど、本当に重要な指示に従えなくなります。

---

## 2. ハンドオフガイドの導入

プロンプトとは別に、もう一つの問題がありました。エージェントは順次実行されますが、前のエージェントの作業が正常でないのに次のエージェントが実行され続けるとどうなるでしょうか？中間が抜けた文書は修正も難しく、トークンの無駄遣いが続きます。各エージェントがどこまで作業したかを追跡し、次のエージェントに状態を渡す方法が必要でした。そこで280行のハンドオフガイドドキュメントを作りました：

```markdown
# ハンドオフガイド

## 概要
このドキュメントはエージェント間の作業引き継ぎ（ハンドオフ）ルールを定義します。

## ハンドオフマーカーの位置
Markdownファイル上部、フロントマターの次の位置：

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: [エージェント名] -->
<!-- PROGRESS: [進行中|待機中|完了] -->
<!-- VALIDATION_SCORE: [スコア/100] -->
<!-- IMPROVEMENT_NEEDED:
  - [エージェント名]: [改善事項] ([減点]点減点)
-->
<!-- STARTED: [YYYY-MM-DD HH:MM] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
エージェント別作業記録
-->

## エージェント実行順序
1. content-initiator: 作業対象ファイル発見およびパイプライン開始マーカー生成
2. overview-writer: 概要セクション作成
3. concepts-writer: 核心概念セクション作成 + ビジュアライゼーション要件定義
4. visualization-writer: ビジュアライゼーションコンポーネント生成
5. practice-writer: 実習セクション作成
6. quiz-writer: クイズセクション作成
7. content-validator: 全コンテンツ品質検証および最終完了処理

## リトライメカニズム
- シェルスクリプト: 全エージェント順次実行（最大3回）
- content-validatorスコア確認: 100点即完了、90-99点リトライ
...
```

各エージェントが作業を始める前にマークダウンファイル上部の状態マーカー（Work Status Markers）を確認し、作業が終わると次のエージェントのためにマーカーを更新します。検証エージェント（content-validator）が90点未満をつけると最初からリトライし、90点以上なら通過させるメカニズムも定義しました。これで十分だと思いました。

---

## 3. 英語版の試み

Claudeは主に英語で学習され、[多言語学習データは約10%程度](https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf)です。そこで「英語プロンプトがより効果的だ」という話を聞いて、英語版も試してみました：

```markdown
---
name: concepts-writer
version: 6.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
---

You are an expert educator specializing in explaining complex technical concepts to learners at various levels.

## Core Mission

Autonomously identify the next content file requiring a Core Concepts section by examining Work Status Markers, then create high-quality, multi-level concept explanations with visualizations.

## Operational Workflow

### Work Status Marker Verification and File Selection

#### Automatic File Discovery

When no specific file is provided by the orchestration script, automatically discover your target file.

Use the Grep tool to search for files containing the `CURRENT_AGENT: concepts-writer` marker.

#### Work Status Marker Verification

Check the Work Status Markers at the top of each file to determine if you should work on it:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: concepts-writer -->
<!-- PROGRESS: 대기중 -->

**Execution Conditions**:

- ONLY proceed if `CURRENT_AGENT` is set to `concepts-writer`
- If another agent is specified, skip this file

**Improvement Mode Detection**:

- Check for `IMPROVEMENT_NEEDED` field containing feedback for `concepts-writer`
- Example: `- concepts-writer: Rewrite Easy explanations completely (-6 points)`
- If improvement needed, modify ONLY the specified sections
- Remove the improvement item from `IMPROVEMENT_NEEDED` after completion

### Work Initiation and Marker Updates

#### On Work Start

Update markers to indicate you've begun work:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: concepts-writer -->
<!-- PROGRESS: 진행중 -->
<!-- STARTED: [original-time] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
[previous logs]
[WAITING] concepts-writer: 진행중 - [YYYY-MM-DD HH:MM]
-->

## Core Concepts Writing Specifications

Maintain this exact structure:

Line 1: # Core Concepts (once per file)
Line 2: Empty line
Line 3: ## Concept: [Concept Name]
Line 4: Empty line
Line 5: **ID**: [identifier]

- Use kebab-case
- Meaningful name that encapsulates the concept

### Easy Section Writing Rules

**Required Components**:

1. **One-line concept summary** (first sentence)
2. **🎈🏃‍♂️🎭 Analogy-centered explanation** (main part)
3. **🤔💡 Problem/advantage explanation** (why it matters)
4. **🆚 Comparison with other concepts** (differences)

**Writing Principles**:

- Emojis as **supporting aids** only
- **Everyday analogies** are key (drawers, balloons, traffic lights, etc.)
- Technical terms → **immediately explain in simple words**
- **Absolutely NO code** (Easy is for pure concept understanding)
- Each subsection follows **question-answer structure**

### Normal Section Writing Rules

#### #### Text and #### Code Alternating Structure Required

Exact pattern:

1. #### Text - Technical explanation

2. #### Code: [Descriptive Title] - Code example

3. #### Text - Additional explanation (if needed)

4. #### Code: [Another Example] (if needed)

**Code Writing Rules**:

- **3-8 executable statements** (never exceed 10)
- Comments only on **key parts** (less than 20% of total)
- **More Text than Code** (explanation first)
- Split complex logic into **multiple Code blocks**
- Use ES6+ syntax (const, let, arrow functions)
- Verifiable results with console.log

Text Writing Rules:

- Use technical terms as-is
- Focus on cause-effect relationships
- Summarize key points with bullet points

### Expert Section Writing Rules

Required Components:

1. **ECMAScript Specification Perspective** subsection
2. Specification section numbers and content citations
3. **V8 Engine Implementation** subsection (optional)
4. **Performance and Optimization** subsection

#### Code: [Pseudocode/API] Usage

- Not executable code, but explanatory code
- Express ECMAScript internal operations
- C++ code or assembly also acceptable

Text Writing Rules:

- Add definitions immediately after using specialized terms
- Always mention performance implications
- Include memory usage or execution speed metrics

## Critical Constraints

1. **UTF-8 Encoding (CRITICAL)**: All files MUST be written in UTF-8 encoding.
2. All required fields must be included (parser fails if any missing)
3. Strictly follow header levels and formats (##, ###, ####)
4. Easy/Normal/Expert sections all required
5. Normal must start with #### Text, use #### Code: format
6. Expert code uses #### Code: format

## Work Status Marker Management and Handoff

### On Work Completion

Update markers to hand off to the next agent:

<!-- WORK STATUS MARKERS -->
<!-- CURRENT_AGENT: visualization-writer -->
<!-- PROGRESS: 대기중 -->
<!-- STARTED: [original-time] -->
<!-- UPDATED: [YYYY-MM-DD HH:MM] -->
<!-- HANDOFF LOG:
[previous logs]
[DONE] concepts-writer: 완료 - [YYYY-MM-DD HH:MM]
[WAITING] visualization-writer: 대기중 - [YYYY-MM-DD HH:MM]
-->

### Handoff Rules

1. **Change CURRENT_AGENT to "visualization-writer"**
2. **Change PROGRESS to "대기중"**
3. **Update UPDATED timestamp**
4. **Add completion record to HANDOFF LOG**

### Agent Chain

**content-initiator** → overview-writer → **concepts-writer** → visualization-writer → practice-writer → quiz-writer → content-validator

- Previous Agent: overview-writer
- Next Agent: visualization-writer
```

英語に変えても結果は似ていました。Anthropicの[Context Engineeringガイド](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)によると、モデルが発展するほどプロンプトの正確な文言よりも**どんな情報を提供するか**がより重要になっています。言語が問題ではなさそうでした。しかしそれなら何が問題で、どう解決すべきかは依然としてわかりませんでした。

---

## 4. 「なぜうまくいかないのかわからない」

プロンプトは数百行に達するほど詳細でした。エージェントも7つに分離し、各エージェントごとに具体的なルールを定義しました。エラーが出ればルールを追加し、ハンドオフガイドも作り、英語版も試しました。しかし実行するたびに異なる結果が出ました。何も根本的な解決にはなりませんでした。

---

## 5. 転換点：AI-DLCの適用

行き詰まった状況で、AI-DLC（AI-Driven Development Lifecycle）方法論を適用してみることにしました。

AI-DLCはAIと協力してソフトウェアを開発する方法論です。ただし、[AI-DLCホワイトペーパー](https://github.com/Seungwoo321/aidlc-docs/blob/main/ai-dlc-whitepaper-ko.md)はDDD変形ベースでバックエンドとインフラの概念を含んでいるため、現在のプロジェクト（エージェントプロンプトをシェルでオーケストレーションするパイプライン）にそのまま適用するのは難しかったです。

そこで[アーキテクチャ比較レポート](https://github.com/Seungwoo321/aidlc-docs/blob/main/frontend-learning-webview.v2/methodology-comparison-report.md)を作成しました。5つのアーキテクチャを比較した結果、**Modular Monolithic Pipeline Architecture**を選択しました。7つのエージェントが順次実行される構造がPipelineのフィルター概念と自然にマッチしたからです。

AI-DLCで開発プロセスを進めつつ、実際のシステムアーキテクチャはプロジェクトに合わせて選択したのです。

次回は、その結果がどうだったかを扱います。

---

> このシリーズはAI-DLC（AI-Driven Development Lifecycle）方法論を実際のプロジェクトに適用した経験を共有します。
> AI-DLCの詳細については、[経済指標ダッシュボード開発記シリーズ](/ja/blog/2025/10/06/economic-dashboard-1-why-started/)をご参照ください。
