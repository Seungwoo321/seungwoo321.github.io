---
title: "[AIエージェントパイプライン #5] プロンプト完成までの4段階"
date: "2025-12-30"
tags: ["AI", "Claude Code", "プロンプトエンジニアリング", "エージェント", "自動化"]
categories: AI-Agent
permalink: /ja/blog/:year/:month/:day/:title/
last_modified_at: "2025-12-30"
lang: ja
ref: ai-agent-pipeline-5
hidden: true
---

[前回の記事](/ja/blog/2025/12/26/ai-agent-pipeline-4-why-still-failed/)では、行き詰まった状況でAI-DLC方法論を適用することを決めた話を扱いました。

今回は、AI-DLCを適用しながらプロンプトをどのように完成させていったかをまとめました。

<!--more-->

## 1. プロンプト完成までの4段階

AI-DLC方法論を適用しながら、プロンプト作成方式を4回変更しました。

| 段階 | 時期 | 設計方式 | 結果 |
|:---:|:---|:---|:---|
| 1 | 10月初め | ユニット分解と設計 | AI-DLC基盤の体系的設計 |
| 2 | 10月中旬 | マークダウンプロンプト | マークダウン混同問題を発見 |
| 3 | 10月末 | Contract文書参照方式 | 改善されたが不安定 |
| 4 | 11月 | XMLタグ構造 | **100%安定** |

現在は`<role>`、`<input_contract>`、`<output_contract>`のようなXMLタグでプロンプトを構造化しています。この構造に切り替えた後、first-try成功率が100%に近づき、約1,400行のマークダウンコンテンツを安定して生成できるようになりました。

以下のセクションで各段階をまとめました。

---

## 2. 第1段階：ユニット分解と設計

AI-DLCでは、システムをユニットに分解し、各ユニットごとに設計ドキュメントを作成した後、それに基づいて実装します。このプロジェクトでは、エージェントプロンプトが実装対象なので、最終的にはプロンプト作成になります。5つのユニット（Pipe、Contract、Prompt、Orchestration、Quality）に分解され、プロンプト作成のための設計が進められました。

- **Pipe**：エージェント間のデータ転送メカニズム
- **Contract**：エージェントごとの入出力契約定義
- **Prompt**：エージェントプロンプト作成
- **Orchestration**：シェルスクリプトで実行順序管理
- **Quality**：品質検証基準

[AI-DLCプロンプト](https://github.com/Seungwoo321/aidlc-docs/tree/main/frontend-learning-webview.v2/prompts)を段階的に実行しながら、次のようなドキュメント構造が作られました。ただし、18個のプロンプトのうち15番（unit-05計画生成）までのみ実行しました。14番までにコア機能の実装が完了した状態で、15番で品質検証ユニットの計画だけを生成しておき、実際のパイプラインテストに移行しました。以降のセクションで扱うXMLタグ構造などの改善事項は、テスト過程で発見して適用したものです。

```
docs/aidlc-docs/
├── system-intent.md                      # システム開発意図
├── methodology-comparison-report.md      # アーキテクチャ比較レポート
├── prompts/                              # AI-DLCプロンプト（18個、15番まで実行）
│   ├── 01-system-architect-role.md
│   ├── 02-inception-unit-decomposition.md
│   ├── 03-construction-unit1-domain.md
│   ├── ...
│   └── 018-operations-quality-monitoring.md
├── inception/
│   ├── plan.md                           # 実行計画
│   └── units/
│       ├── unit-01-pipe-mechanism.md     # パイプメカニズムユニット
│       ├── unit-02-filter-contracts.md   # フィルター契約ユニット
│       ├── unit-03-agent-prompts.md      # エージェントプロンプトユニット
│       ├── unit-04-orchestration.md      # オーケストレーションユニット
│       ├── unit-05-quality-metrics.md    # 品質検証ユニット
│       └── integration_plan.md           # 統合計画
├── specifications/
│   ├── work-status-markers-spec.md       # WSM仕様
│   └── contracts/                        # エージェント別契約ドキュメント
│       ├── content-initiator-contract.md
│       ├── overview-writer-contract.md
│       ├── concepts-writer-contract.md
│       ├── visualization-writer-contract.md
│       ├── practice-writer-contract.md
│       ├── quiz-writer-contract.md
│       └── content-validator-contract.md
├── guides/
│   └── agent-handoff-guide.md            # エージェントハンドオフガイド
├── construction/
│   ├── unit-02-filter-contracts/
│   │   ├── domain_design.md
│   │   ├── logical_design.md
│   │   └── plan.md
│   └── unit-04-orchestration/
│       ├── domain_design.md
│       ├── logical_design.md
│       ├── implementation.md
│       └── src/
│           ├── content-generator-v7.sh   # オーケストレーションスクリプト
│           └── lib/
│               └── common-utils.sh       # 共通ユーティリティ
└── logs/
    └── content-generator-v7.log          # 実行ログ
```

`inception/`フォルダには実行計画と5つのユニット定義が入っています。各ユニットはパイプラインのコア構成要素を担当します。`specifications/`フォルダにはエージェント間のデータ転送のための状態マーカー（Work Status Markers）仕様と7つのエージェントそれぞれの契約ドキュメントが定義されています。`guides/`フォルダにはエージェント間のハンドオフルールをまとめたガイドがあります。

`construction/`フォルダが実際の設計が行われる場所です。各ユニットごとにドメイン設計（`domain_design.md`）と論理設計（`logical_design.md`）が作成されました。ドメイン設計ではそのユニットが解決すべき問題とコア概念を定義し、論理設計では具体的な実装方式を設計します。`unit-04-orchestration/src/`にはシェルスクリプトで実装されたオーケストレーションコードが入っています。

---

## 3. 第2段階：マークダウンプロンプト生成

前のセクションで、AI-DLCを通じてContractドキュメントが作成されました。これらのドキュメントをプロンプトに変換しながら、4編のv6とは完全に異なる構造が作られました。

Input ContractとOutput Contractが明示的なセクションとして分離されました。エージェントが何を入力として受け取り、何を出力すべきかが契約形式で定義され、Execution Instructionsには段階別実行指示がチェックリストとして作成されました。このようにContractドキュメントの内容をマークダウンヘッダーで構造化してプロンプトに直接含めたのです。

```markdown
---
name: concepts-writer
version: 7.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
model: sonnet
---

## Role & Responsibility

**Role**: Generate the Core Concepts section with multi-level explanations (Easy/Normal/Expert) for 3-5 key concepts related to the learning topic.

**Responsibility**:

- Write `# Core Concepts` section with 3-5 Concept blocks
- Each Concept has 3 difficulty levels (Easy, Normal, Expert)
- Easy: Middle school level, emojis, everyday analogies, NO code
- Normal: #### Text and #### Code: alternating structure, executable code
- Expert: ECMAScript specs with section numbers, performance impact
- Add optional Code Snippet and Visualization metadata
- Update Work Status Markers for handoff to visualization-writer

**Bounded Context**: Core Concepts Section Generation

---

## Input Contract

### File State

| 項目 | 要件 |
|------|----------|
| Required Files | Target markdown file with Overview section |
| File Encoding | UTF-8 |
| Frontmatter | Required (populated by content-initiator) |
| Existing Sections | Work Status Markers, `# Overview` |

### Work Status Markers

| フィールド | 必須値 |
|------|---------|
| CURRENT_AGENT | concepts-writer |
| STATUS | IN_PROGRESS |
| HANDOFF LOG | Contains [DONE] overview-writer entry |

### Section Dependencies

- Overview section (read-only, for reference to understand topic context)

---

## Output Contract

### File Modifications

- Modified Files: Target markdown file
- New Sections:
  - `# Core Concepts` section (added after Overview)

### Work Status Markers Updates

| フィールド | 更新値 |
|------|------------|
| CURRENT_AGENT | visualization-writer |
| STATUS | IN_PROGRESS (unchanged) |
| UPDATED | Current timestamp (ISO 8601: YYYY-MM-DDTHH:MM:SS+09:00) |
| HANDOFF LOG | Add: `[DONE] concepts-writer \| Core concepts section completed \| [timestamp]` |

### Content Guarantees

- 3-5 Concept blocks per file
- Each Concept contains:
  - **ID** field in kebab-case
  - Easy section (emoji-friendly, no code, everyday analogies, 4-5 subsections)
  - Normal section (#### Text and #### Code: alternating pattern, MUST start with #### Text)
  - Expert section (ECMAScript specs with section numbers, performance notes)
  - Optional: Code Snippet section (3-5 lines, essentials only)
  - Optional: Visualization metadata
- All code examples use ES6+ syntax (const, let, arrow functions)
- Code is executable and verifiable with console.log
- Normal Code blocks: 3-8 lines each
- Code Snippet: 3-5 lines total

---

## Execution Instructions

### Step 1: Read file and verify preconditions

Read the target markdown file and verify:

- [ ] CURRENT_AGENT == "concepts-writer"
- [ ] STATUS == IN_PROGRESS
- [ ] `# Overview` section exists
- [ ] HANDOFF LOG contains [DONE] overview-writer entry

**If precondition fails**: EXIT 1 with error message (see Error Handling section)

...
```

AI-DLCを通じて作成された設計ドキュメントに基づいてプロンプトが実装されました。**しかし結果は依然として不安定でした。**

原因を見つけるために失敗ログを分析しました。上のプロンプトを見てください。`## Role & Responsibility`、`## Input Contract`、`### File State`のようなマークダウンヘッダーがたくさんあります。しかしエージェントが生成すべきコンテンツも`## Concept:`、`### Easy`、`### Normal`のようなマークダウンヘッダーです。プロンプトもマークダウン、生成するコンテンツもマークダウン。AIが両者を混同していました。

---

## 4. 第3段階：Contract文書参照

マークダウン混同問題を解決する必要がありました。最初の試みとして、プロンプトからContract内容を削除し、ドキュメントパスのみを参照するようにしました。

v7ではInput/Output Contractをプロンプトに直接含めました。v8では`**Contract**: See contracts/concepts-writer-contract.md`の1行で置き換え、実行指示（Instructions）のみをプロンプトに残しました。エージェントが必要なときにContractドキュメントを読むようにしたのです。

```markdown
---
name: concepts-writer
version: 8.0.0
description: When concepts need 3-level difficulty explanations (Easy/Normal/Expert) and visualizations
tools: Read, MultiEdit, Grep
model: sonnet
---

# Concepts Writer - Execution Prompt

You are the **concepts-writer** agent in the multi-agent content generation pipeline.

**Your job**: Generate the Core Concepts section with 3-level difficulty explanations (Easy/Normal/Expert) for 3-5 key concepts related to the learning topic.

**Contract**: See `docs/aidlc-docs/specifications/contracts/concepts-writer-contract.md` for detailed specifications.

---

## Instructions

Follow these steps exactly:

### 1. Read file and verify preconditions

**Use the Read tool** to read the target markdown file:

Read("{target-file-path}")

**Verify these preconditions**:

- [ ] `CURRENT_AGENT` == `concepts-writer`
- [ ] `STATUS` == `IN_PROGRESS`
- [ ] `# Overview` section exists
- [ ] `HANDOFF LOG` contains `[DONE] overview-writer` entry

**If any precondition fails**:

- Output error: "Precondition failed: {details}"
- EXIT 1

...
```

結果は失敗でした。LLMが外部ドキュメントを一貫して参照しませんでした。あるときはContractドキュメントをよく読み、あるときは無視しました。そして振り返って考えてみると、たとえ一貫して参照したとしても、LLMが外部ドキュメントを読むとその内容がコンテキストに含まれるので、マークダウン混同問題は依然として残ったでしょう。

---

## 5. 第4段階：XMLタグ構造

Contract文書参照方式の問題は、LLMが外部ドキュメントを一貫して参照しないことでした。最初からもう一度方法を探し始めました。

### XMLタグを発見するまで

Anthropic公式動画とプロンプト関連のYouTube動画を探し始め、Claude Code公式ドキュメントのプロンプト関連内容を**もう一度**精読しました。そして共通して目に留まったのがXMLタグでした。

実は以前も「XMLタグの使用を推奨する」という内容を見たことがありましたが、慣れていなかったので無視していました。

しかし今回もう一度見て考えが変わりました。推奨かどうかとは別に、**マークダウンプロンプトでマークダウンコンテンツを生成するこのプロジェクトでは、`<>`で構造を区別するのは試してみる価値がある**と思いました。

### 出典

- [Anthropic公式ドキュメント - Use XML tags](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/use-xml-tags): "Claude is particularly skilled at interpreting XML tags"
- [Claude Code公式ドキュメント - Be specific about output format](https://docs.anthropic.com/en/docs/claude-code/best-practices#be-specific-about-output-format): XMLタグで構造化された出力形式の例
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview): 全般的なプロンプトエンジニアリングガイド

解決策は**Contract内容をプロンプトに直接含める**が、XMLタグで構造化することでした。

そこでまず、AI-DLC設計ドキュメントをXMLタグを含む形式に更新しました。`<input_contract>`、`<output_contract>`のようなXMLタグでContract内容を構造化し、これをプロンプトに直接インライン化しました。

```markdown
---
name: concepts-writer
description: Generate Core Concepts section with 3-level adaptive learning (Easy/Normal/Expert)
tools: Read, Edit
model: sonnet
---

# concepts-writer

<role>
Primary Role: Core Conceptsセクション作成（3段階難易度説明）

Responsibilities:

1. # Core Conceptsセクション作成（3-5個の核心概念）

2. 各概念ごとに3段階難易度（Easy、Normal、Expert）説明作成

3. ### Visualizationメタデータ生成（オプション）

4. HANDOFF LOG更新（[DONE]イベント追加）
5. CURRENT_AGENT設定（visualization-writer）

Unique Characteristics:

- システムの核心差別点：3段階適応型学習実装
- Easy：中学生レベル（日常の比喩、絵文字、コード絶対禁止）
- Normal：一般開発者（技術用語 + 簡単なコード）
- Expert：20年以上の専門家（ECMAScript仕様、エンジン実装）
- Visualizationメタデータ：オプション、概念の視覚化が必要な場合のみ
</role>

<input_contract>
File State:

- Required files: Target markdown file with frontmatter, WSM, and Overview section
- File encoding: UTF-8
- Frontmatter: Required (populated by content-initiator)
- Existing sections: WSM + # Overview (completed by overview-writer)

Work Status Markers:

- CURRENT_AGENT: concepts-writer
- STATUS: IN_PROGRESS
- HANDOFF LOG: Contains [START], [DONE] content-initiator, [DONE] overview-writer entries

Section Dependencies:

- # Overview (completed by overview-writer)

</input_contract>

<output_contract>
File State:

- Modified files: Target markdown file
- New sections: # Core Concepts section added

Section Structure:

# Core Concepts

### Concept 1: [Title]

#### Easy 🌱
[日常の比喩中心の説明 - 4-5個のsubsections]
- コード絶対禁止
- 中学生でも理解可能
- 絵文字活用

#### Normal 💼
[技術用語 + コード交差説明]
##### Text Subsection
[説明]

##### Code: [Title]
[簡単なコード]

#### Expert 🚀

##### ECMAScript Specification

[仕様引用と説明]

##### Performance and Optimization

[エンジン実装と最適化]

Work Status Markers:
- CURRENT_AGENT: visualization-writer
- STATUS: IN_PROGRESS
- UPDATED: Current timestamp (ISO 8601)
- HANDOFF LOG: Add [DONE] concepts-writer | Core Concepts section completed | {timestamp}

Content Guarantees:
- 3-5 concepts
- Each concept has 3 difficulty levels (Easy, Normal, Expert)
- Easy：絶対にコードなし、日常の比喩のみ
- Normal：Text/Code交差
- Expert：ECMAScript Specification + Performanceセクション
- Visualizationメタデータ：オプション、概念の視覚化が必要な場合のみ
</output_contract>

<execution>
Follow these steps exactly:

<step number="1">
Read and validate file

Use the Read tool to open the target markdown file:

Read("{target-file-path}")

Validate:
- Frontmatter exists and is populated
- WSM exists with CURRENT_AGENT: concepts-writer
- STATUS: IN_PROGRESS
- # Overview section exists (completed by overview-writer)
- No existing # Core Concepts section (to prevent duplicates)

Error Handling:
- If CURRENT_AGENT != "concepts-writer" → EXIT 1 with error: "Precondition failed: CURRENT_AGENT is not concepts-writer"
- If # Core Concepts already exists → EXIT 1 with error: "Core Concepts section already exists"
- If # Overview missing → EXIT 1 with error: "Overview section missing (prerequisite)"
</step>

<step number="4">
Generate Core Concepts section - Easy Level

For each concept, create Easy 🌱 level:

核心原則：プログラミング経験のない中学生でも理解可能

対象：プログラミング経験のない中学生

言語：日常用語、技術用語は即座に説明

方法：日常の物の比喩（引き出し、風船、信号、教室、手紙、図書館など）

構造：
- 絵文字使用（🌱 Easyヘッダーに）
- 4-5個の質問-回答subsections
- ##### 質問形式のsubsectionタイトル
- 回答：2-3文、日常の比喩中心

禁止事項：
- ❌ コード例絶対禁止
- ❌ 技術用語の単独使用禁止（説明なしに）
- ❌ 抽象的概念のみでの説明禁止
</step>

<step number="5">
Generate Core Concepts section - Normal Level

For each concept, create Normal 💼 level:

核心原則：技術用語使用 + 簡単なコードで検証

対象：1-3年目の開発者

言語：技術用語をそのまま使用（簡単な説明を併記）

方法：説明（Text）+ 検証（Code）交差

構造：

- ##### Text Subsection（説明）

- ##### Code: [Title]（コード検証）

- Text > Codeパターン繰り返し（説明がより多い）

コード特徴：

- 簡単なコード（5-15行）
- 実行可能
- コメントで説明
- 結果予測可能
</step>

<step number="6">
Generate Core Concepts section - Expert Level

For each concept, create Expert 🚀 level:

核心原則：ECMAScript仕様 + エンジン実装分析

対象：20年以上の経歴の専門家、言語設計者、エンジン開発者

言語：ECMAScript仕様用語をそのまま

方法：仕様引用 + エンジン実装分析

必須構造（2つのsubsection）：

1. ##### ECMAScript Specification - 仕様引用と説明

2. ##### Performance and Optimization - エンジン実装と最適化

仕様引用形式：

- 「ECMAScript 2023, Section X.Y.Z」形式で引用
- 実際の仕様文言を引用（英語そのままか韓国語翻訳）
- 仕様の意味解釈

Performance分析：

- V8、SpiderMonkeyなどエンジン実装言及
- メモリレイアウト、最適化技法
- 性能差、ベンチマーク結果
</step>
</execution>

<constraints>
<do>
- ALWAYS validate CURRENT_AGENT == "concepts-writer" before proceeding
- ALWAYS check that Core Concepts section doesn't already exist
- ALWAYS check that Overview section exists (prerequisite)
- ALWAYS generate 3-5 concepts (based on difficulty level)
- ALWAYS include all 3 difficulty levels for each concept (Easy, Normal, Expert)
- ALWAYS use 日常の比喩 for Easy level
- ALWAYS use Text/Code 交差 for Normal level
- ALWAYS include ECMAScript Specification + Performance for Expert level
- ALWAYS generate Visualization metadata if needs_visualization: true
- ALWAYS update UPDATED timestamp when modifying WSM
- ALWAYS add [DONE] entry to HANDOFF LOG
- ALWAYS set CURRENT_AGENT to "visualization-writer"
- ALWAYS use UTF-8 encoding
</do>

<do_not>
- NEVER include コード in Easy level（絶対禁止）
- NEVER skip any of the 3 difficulty levels
- NEVER use 技術用語 alone in Easy level（常に説明を併記）
- NEVER skip ECMAScript Specification in Expert level
- NEVER skip Performance and Optimization in Expert level
- NEVER generate less than 3 concepts
- NEVER generate more than 5 concepts
- NEVER modify frontmatter
- NEVER remove or modify existing HANDOFF LOG entries
- NEVER set CURRENT_AGENT to any agent other than "visualization-writer"
- NEVER change STATUS field
</do_not>

<critical>
ALWAYS use UTF-8 encoding for all file operations
Korean content（韓国語）must be properly encoded
Verify encoding after file modification

3-Level Difficulty Guidelines:

Easy 🌱（中学生レベル）：

- ❌ コード例絶対禁止
- ✅ 日常の物の比喩必須（引き出し、風船、信号、教室など）
- ✅ 絵文字活用
- ✅ 4-5個の質問-回答subsections
- ✅ 技術用語は即座に説明

Normal 💼（一般開発者）：

- ✅ 技術用語をそのまま使用（簡単な説明を併記）
- ✅ Text ↔ Code 交差パターン
- ✅ 簡単な実行可能なコード（5-15行）
- ✅ 説明 > コード（説明がより多い）

Expert 🚀（20年以上の専門家）：

- ✅ ECMAScript Specificationセクション必須
- ✅ Performance and Optimizationセクション必須
- ✅ 仕様引用（Section番号を含む）
- ✅ エンジン実装分析（V8、SpiderMonkeyなど）
- ✅ 最適化技法、メモリレイアウト
</critical>
</constraints>

...
```

結果は成功でした。XMLタグでプロンプト構造と生成するコンテンツを明確に区別すると、first-try成功率が約33%からほぼ100%に近づきました。もちろん失敗時にロールバックしてリトライするメカニズムも最終成功率に寄与しましたが、これは後でまとめる予定です。

`<role>`、`<input_contract>`、`<output_contract>`タグで役割/入力/出力を分離し、Contract内容をプロンプトに直接含めつつXMLタグで構造化したのが効果的でした。

---

## 6. まとめ

今回は、プロンプト完成までの4段階の過程をまとめました。AI-DLCで設計し（第1段階）、マークダウンプロンプトに変換しましたが混同問題が発生し（第2段階）、Contract文書参照で解決しようとしましたが失敗し（第3段階）、最終的にXMLタグで構造化して成功しました（第4段階）。

2編で扱ったメタデータパイプラインのような簡単な場合は、メタプロンプティングだけでも十分でした。しかし7つのエージェントが複雑なコンテンツを生成するこのパイプラインでは、明確な契約方式で入力/出力を定義し、XMLタグでプロンプトを構造化する方式が私には効果的でした。

次回は、このように完成したエージェントたちがどのように協業するかをまとめます。

---

> このシリーズはAI-DLC（AI-Driven Development Lifecycle）方法論を実際のプロジェクトに適用した経験を共有します。
> AI-DLCの詳細については、[経済指標ダッシュボード開発記シリーズ](/ja/blog/2025/10/06/economic-dashboard-1-why-started/)をご参照ください。
