---
title: "[AIエージェントパイプライン #9] パイプラインの単純化"
date: "2026-01-13"
tags: ["AI", "Claude Code", "プロンプトエンジニアリング", "エージェント", "自動化"]
categories: AI-Agent
permalink: /ja/blog/:year/:month/:day/:title/
last_modified_at: "2026-01-13"
lang: ja
ref: ai-agent-pipeline-9
hidden: true
---

[前回の記事](/ja/blog/2026/01/09/ai-agent-pipeline-8-rollback-mechanism/)では、リトライとロールバックメカニズムを扱いました。

今回は、**パイプラインを運用しながら発見した改善点**をまとめました。

<!--more-->

8編までの過程を進めながら、約250個の学習コンテンツが生成されました。初期はパイプラインテストのために継続的に生成しました。そのため、トークン消費が速くて週間リセットの2-3日前にトークンを使い切ることが多かったです。そこで今はトークン使用量をモニタリングしながら、今週トークンが余りそうならスクリプトを回して週間使用量を埋める方式で運用しています。

一方、ブログシリーズを作成しながら設計ドキュメントとプロセスを再度点検することになり、その過程でいくつかの改善点を発見しました。

## 1. category-parserの追加

パイプラインを運用していて問題を発見しました。ハードコーディングされた10個のカテゴリがすべて処理されると、「残りはどこにある？」という疑問が生じました。

[2編](/ja/blog/2025/12/16/ai-agent-pipeline-2-what-to-generate/)で紹介したメタデータパイプラインは、トピックドキュメントからcategory.yamlと空のマークダウンファイルを生成します。しかしカテゴリリストがスクリプトにハードコーディングされていました。

```bash
# 既存方式：カテゴリリストがスクリプトにハードコーディング
get_topics() {
    local subject=$1
    case "$subject" in
        "javascript-core-concepts")
            echo "01-variables 02-type-system 03-operators ... 10-functions-basic"
            ;;
        ...
    esac
}
```

トピックドキュメントにはjavascript-core-conceptsだけでも42個のカテゴリがあります。しかしスクリプトには10個だけでした。10個の主題、合計169個のカテゴリをすべてハードコーディングするのは非現実的でした。

解決策はトピックドキュメントからカテゴリリストを自動的に抽出することでした。トピックドキュメントの`### N. タイトル`パターンをパースすれば、すべてのカテゴリを抽出できます。category-parserエージェントを追加してこのパターンを見つけ、各カテゴリにIDを付与した後、manifestファイルに保存するようにしました。

```json
{
  "categories": {
    "javascript-core-concepts": ["01-variables", "02-type-system", ..., "42-metaprogramming"]
  }
}
```

これでスクリプトはmanifestファイルからカテゴリを読み込みます。トピックドキュメントにカテゴリが追加されたら、category-parserを実行するだけです。

---

## 2. practice-writerの削除

パイプラインが完成した後、開発以外の他の主題でテストしてみました。歴史、言語、数学のような非プログラミング分野にも適用できるか確認したかったのです。

ドキュメント生成とパースは正常でした。しかしコンテンツを見てみると、practice-writerが生成する`Code Patterns`と`Experiments`セクションがぎこちなかったです。歴史や言語学習でコードブロックが必要でしょうか？そしてこのアプリはモバイル環境です。コードエディタもなく、実行環境もありません。

practice-writerを削除しました。

---

## 3. 連鎖的リファクタリング

1-8編までブログを作成しながら設計ドキュメントとプロセスを再度点検しました。その過程で連鎖的な改善が行われました。

### 3.1 IMPROVEMENT_NEEDEDの発見

content-validatorのプロンプトに`IMPROVEMENT_NEEDED`というフィールドを扱うルールがありました。検証スコアが90点未満ならどのエージェントが改善すべきかをファイルに記録し、そのエージェントから再開する方式でした。4編で言及した「各エージェントが独立してスコアを付けて修正を指示する」初期アプローチの痕跡でした。

すべて削除されたレガシーだと思っていましたが、確認してみるとcontent-validatorにのみ一部残っていました。問題は各エージェントでIMPROVEMENT_NEEDEDを処理する部分がなかったことです。content-validatorが改善指示を残しても、他のエージェントがこれを読んで処理するロジックがありませんでした。事実上動作しないコードでした。

なぜこれに気づかなかったのでしょうか？8編で実装したバックアップ/ロールバックメカニズムが効果的だったからです。各エージェント段階でpostcondition失敗時にバックアップにロールバックしてリトライする方式がほとんどの問題を解決しました。content-validatorまで到達したときにスコア未達のケースがほとんどなく、未達が出たらそのまま最初からやり直しました。事例がほとんどないため正確な原因に気づきませんでした。

選択肢は2つでした。各エージェントプロンプトを補完してIMPROVEMENT_NEEDEDが正常動作するようにするか、削除するか。バックアップ/ロールバックがすでに効果的に動作していたため、削除することにしました。

### 3.2 JSON Schemaの導入

IMPROVEMENT_NEEDEDを削除して終わりではありませんでした。新しい処理フローが必要でした。

各エージェント段階ではバックアップ/ロールバックでリトライします。しかしcontent-validatorでスコア未達になったらどうすべきでしょうか？この時点ではファイルバックアップがあるか確実ではありません。内容が残っている状態で「何のためにスコアが未達なのか」を把握し、該当エージェントにフィードバックを渡してリトライする必要がありました。

既存ではLLM応答をそのまま出力していました。問題エージェントをパースしようとしたら、出力形式が一定でなく正確に抽出するのが難しかったです。Claudeに聞いてみると`--output-format json`と`--json-schema`オプションを使えば出力形式を固定できると提案しました。

```bash
# JSON Schemaで構造化された出力
"$CLAUDE_PATH" -p "$prompt" \
    --output-format json \
    --json-schema "$json_schema" \
    ...

# jqで簡単に抽出
local problem_section=$(jq -r ".structured_output.problem_section" "$json_file")
local feedback=$(jq -r ".structured_output.feedback" "$json_file")
```

content-validatorだけでなく、すべてのエージェント出力にJSON Schemaを適用しました。出力ログが定型化されてパースが安定的に動作するようになりました。

### 3.3 content-initiatorの発見と削除

JSON Schema適用で出力ログがシンプルになりました。すると以前から知っていたが気にしていなかった問題が目に入りました。ログがいつも2/7で始まっていました。1段階がスキップされることは知っていました。当時はどうせ結果が同じなのであまり気にしませんでした。

今回は確実に解決することにしました。なぜスキップされるのか、なくしてもいいのか、メタデータパイプラインが生成するものとcontent-initiatorが生成するものに違いがあるか検証しました。

メタデータパイプラインですでにマークダウンファイルを生成していました。コンテンツパイプラインの1段階であるcontent-initiatorは、前提条件検査で「すでにファイルが存在する」と判断されてスキップされていました。content-initiatorの役割は空のマークダウンファイルを生成して基本front matterを作成することでした。メタデータパイプラインと同じ結果物でした。

LLMエージェントではなくシェル関数で十分でした。メタデータパイプラインですでに使っていた`initialize_markdown_file()`関数をコンテンツパイプラインにも適用しました。

### 3.4 最終リトライフロー

このような過程を経て完成したリトライフローです。

1. **各エージェント段階**：postcondition失敗時にバックアップにロールバックしてリトライ（最大3回）
2. **content-validatorスコア未達**：JSONから`problem_section`と`feedback`をパース → 該当エージェント1回再実行
3. **再検証成功**：パイプライン完了
4. **再検証失敗**：`reset_file_with_frontmatter()` → `initialize_markdown_file()`呼び出し → ファイル初期化後終了

```bash
# content-validatorスコア未達時revision mode
if [ "$agent_name" = "content-validator" ] && [ $postcond_result -eq 2 ]; then
    local problem_section=$(parse_agent_json "content-validator" "problem_section" "quiz")
    local feedback=$(parse_agent_json "content-validator" "feedback" "")
    local problem_agent=$(get_problem_agent "$problem_section")

    # 該当エージェント1回再実行
    execute_revision_with_json "$problem_agent" "$revision_prompt" "$session_id"

    # 再検証
    if [ $revalidate_result -eq 0 ]; then
        return 0  # 成功
    else
        reset_file_with_frontmatter "$file_path"  # 初期化
        return 1
    fi
fi
```

無限ループを防止するためリトライは1回に制限しました。それでも失敗したらファイルを初期化して終了します。次の実行時に最初からやり直しになります。

---

## まとめ

今回は、パイプラインを運用しながら発見した改善点をまとめました。

- **category-parser追加**：ハードコーディングされた169個のカテゴリリストの代わりにトピックドキュメントから動的にパース
- **practice-writer削除**：非プログラミング主題テストの結果不要と判断
- **連鎖的リファクタリング**：IMPROVEMENT_NEEDED削除 → JSON Schema導入 → content-initiator削除 → 最終フロー完成

7つだったコンテンツエージェントが5つに減りました。IMPROVEMENT_NEEDEDベースの複雑な改善ループの代わりに単純な失敗/リトライ構造になってデバッグも簡単になりました。

次回は、これまでの旅を振り返ってシリーズを締めくくる予定です。

---

> このシリーズはAI-DLC（AI-Driven Development Lifecycle）方法論を実際のプロジェクトに適用した経験を共有します。
> AI-DLCの詳細については、[経済指標ダッシュボード開発記シリーズ](/ja/blog/2025/10/06/economic-dashboard-1-why-started/)をご参照ください。
