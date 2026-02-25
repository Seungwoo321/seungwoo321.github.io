---
title: "バイブコーディング6ヶ月、6年放置したイシューを1週間で"
date: "2026-02-25"
tags: ["AI", "Claude Code", "Vue", "React", "vue-pivottable", "tailwind-grid-layout", "オープンソース"]
categories: Essay
permalink: /blog/:year/:month/:day/:title/
last_modified_at: "2026-02-25"
lang: ja
locale: ja
ref: vibe-coding-vue-pivottable-issues
---

「いつかやろう。」

6年間先延ばしにしていたイシューがありました。1週間で12個すべて解決しました。

<!--more-->

## 先延ばしにしていたもの

vue-pivottableは2019年に作ったプロジェクトです。PivotTable.jsをVueにポーティングしたものですが、その後GitHubイシュー対応がずっと遅れていました。

2020年2月、誰かが質問しました。「一つのピボットテーブルで複数の値にそれぞれ異なる集計関数を適用できますか？」オリジナルのPivotTable.jsにもない機能でした。実装難易度が高そうでした。保留。

2020年4月、Nuxt.jsでSSRエラーが発生するというイシューが上がりました。当時SSRへの理解度が低かったです。素早い解決策が思い浮かびませんでした。保留。

2021年6月、Subtotalプラグイン統合のリクエストが来ました。jQueryベースのsubtotal.jsをVueで再実装する作業でした。規模が大きそうでした。保留。

---

## 1週間

2026年2月17日から22日まで、12個のイシューをすべて解決しました。

最も古いイシューは2020年2月に登録されたものでした。6年が経ったわけです。

何が変わったのでしょうか？[自動化ツール](/blog/2026/02/24/automation-tools-after-vibe-coding/)を作りながら慣れた方式ができました。複雑に見える問題もとりあえず始めればいいのです。AIが初稿を作り、デバッグを手伝い、テストコードを書きます。

6年間「難しそう」と思っていたものが、実際にやってみるとそれほど難しくありませんでした。

---

## 新しく作ったパッケージ3つ

### 複数値集計（Issue #16）

売上は合計で、数量は平均で、利益率は加重平均で。一つのセルで複数の指標を異なる方法で集計したいというリクエストでした。

@vue-pivottable/multi-value-rendererを作りました。aggregatorMap propでフィールドごとの集計関数を指定します。「Sum over Sum」のような2-Input Aggregatorもサポートします。

最初はドロップダウンベースのUIで作りましたが、複数の値を管理するのが不便でした。タグベースのUIにモーダル編集方式に変えました。

### 小計と折りたたみ/展開（Issue #47）

オリジナルのPivotTable.jsにはnagarajanchinnnasamyが作ったsubtotal.jsプラグインがありました。階層的データの小計計算と折りたたみ/展開機能を提供していましたが、jQueryベースだったのでVueでは使えませんでした。

@vue-pivottable/subtotal-rendererで再実装しました。最も難しかったのはヘッダーのcolspan処理でした。初期バージョンはcolspanを全く処理しなかったのでヘッダーが重複出力されました。既存のvue-pivottableのspanSize関数を参考に全面再作成しました。

### Nuxt SSRサポート（Issue #20）

vue-pivottableはブラウザ環境を前提に開発されたため、SSR過程でwindow/documentアクセスエラーが発生していました。

@vue-pivottable/nuxtを作りました。nuxt.configに1行追加すればクライアントサイド専用ローディングが自動的に処理されます。Nuxt 2とNuxt 3の両方をサポートします。

---

## すでにあったのに知らなかったもの

12個のイシューのうち5個はすでに実装されている機能でした。ドキュメントが不足していてユーザーが解決方法を知らなかったのです。

セルにハイパーリンクを追加したい？clickCallbackがすでにありました。Plotlyチャートをレスポンシブにしたい？plotlyOptions propがありました。コントロールUIを隠したい？VuePivottableコンポーネントを使えばいいです。

機能を作ることと同じくらいドキュメント化が重要だと改めて感じました。

---

## バグもありました

config propにv-modelをバインドしても初期状態に反映されないバグがありました。ピボットテーブルの設定を保存して復元する機能が動作していませんでした。

原因は単純でした。initメソッドでconfig prop値を参照していませんでした。修正してテスト18個を追加しました。

CSSインポートエラーもありました。package.jsonのexportsフィールドにCSSパスが欠落していました。1行追加で解決しました。

---

## tailwind-grid-layoutも手を入れました

vue-pivottableだけではありません。tailwind-grid-layoutも一緒に整理しました。

tailwind-grid-layoutはreact-grid-layoutの代替として作ったプロジェクトです。Tailwind CSSベースでバンドルサイズが小さいです。機能はほぼ同じように実装しましたが、ドラッグ関連のバグが残っていました。

外部からアイテムをドラッグしてグリッドに置くとき、プレビューがマウスについてきませんでした。handleDragOverでフラグだけ設定して位置計算をしていなかったからです。ドロップ時点でやっと位置が計算されるので、ユーザーはアイテムがどこに置かれるか予測できませんでした。

DroppableGridContainerにリアルタイムマウス追跡ロジックを追加しました。60fps throttleでパフォーマンスを最適化し、衝突検査もリアルタイムで実行します。有効な位置なら緑、衝突すれば赤でプレビューが表示されます。

8方向リサイズハンドルも改善しました。staticアイテムと衝突するときリサイズがそのまま無視される問題がありました。今は各方向ごとに衝突を検査し、衝突時は赤い枠で視覚的フィードバックを提供します。

[ライブデモ](https://tailwind-grid-layout.pages.dev/)と[Storybook](https://tailwind-grid-layout-storybook.pages.dev/)もデプロイしました。テストは339個パスします。

---

## まとめ

6年間先延ばしにしていたイシューを1週間で解決しました。「難しそう」と思っていたものが、やってみるとそうでもありませんでした。先延ばしにする間に積もった心理的負担が実際の難易度より大きかったようです。

新しく作ったパッケージ3つ（multi-value-renderer、subtotal-renderer、nuxt-module）はすべてVue 2とVue 3をサポートします。npmに公開しており、デモサイトもあります。
