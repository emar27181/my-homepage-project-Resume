# Architecture

## v1 / v2 の分離

- **v1** (`/`, `src/pages/index.astro` + `src/components/**`): 既存のレジュメ形式ホームページ。今回の再実装では一切変更していない（デフォルトのまま）。
- **v2** (`/v2`, `src/pages/v2/index.astro` + `src/v2/**`): 「ポートフォリオ = 1台のコンピュータ」というコンセプトの再実装。v1とは見た目・構造ともに独立しており、`src/components/layout/Header.astro`（v1側）と v2ページ内のヘッダーに置いた相互リンクだけで行き来する。
- v2はv1の`BaseLayout`/`Header`/`Footer`/`ThemeProvider`を使わない。自前のダーク/グリーンの世界観を持つ、独立した1ページとして実装している（`BaseHead`のみ共用してSEO/メタタグを揃えている）。

## v2 のディレクトリ構成と責務

```
src/v2/
├── PortfolioComputer.astro # v2ページの実体。langをpropで受け取る唯一のマークアップ。
├── data/
│   └── portfolio.ts       # 唯一のコンテンツソース。プロフィール/制作物/研究/スキル/趣味/経歴。
├── terminal/
│   ├── filesystem.ts      # portfolio.ts から仮想ファイルツリーを構築。パス解決(cd/ls/cat/tree用)。
│   ├── commands.ts        # コマンド実装(help/whoami/ls/cd/cat/tree/...)。portfolio.ts と filesystem.ts のみを知る。
│   ├── engine.ts           # TerminalEngine: cwd/履歴/Tab補完などの状態を持つvanilla TSクラス。DOMを知らない。
│   ├── asciiFont.ts        # 5行ブロックフォント。ASCII artを1つのグリフ表から生成する(手描きの重複を避ける)。
│   ├── boot.ts              # 起動ログの行と表示間隔、ASCII artの選択(幅で切り替え)。
│   └── app.ts               # DOM側。TerminalEngineとページのDOM要素を繋ぐ、唯一のブラウザ依存コード。
└── styles/
    └── terminal.css        # `.pf-*` 名前空間の独自スタイル(黒背景+緑アクセント)。v1のCSSと衝突しない。
```

**依存の向き**: `app.ts`(DOM) → `engine.ts`(状態) → `commands.ts`(コマンド) → `filesystem.ts` / `data/portfolio.ts`(データ)。逆方向の依存はない。Collageモードは `PortfolioComputer.astro` から直接 `data/portfolio.ts` を読んでサーバーサイドでカード表示を組み立てており、Terminalモードと表示方法が違うだけで参照するデータソースは同じ1つ。

## v2 の多言語化(ja/en)

v1と同じURLベースの方式(`/` = ja, `/en` = en)を踏襲し、`/v2` = ja、`/en/v2` = en とした。ページの実体は `PortfolioComputer.astro` の1ファイルのみで、`src/pages/v2/index.astro`と`src/pages/en/v2/index.astro`はそれぞれ`lang="ja"`/`lang="en"`を渡すだけ。マークアップが2箇所に分岐することはない。

- `data/portfolio.ts`: 自然言語のフィールド(bio/summary/concept/heading等)だけを`Record<Language, T>`で言語ごとに保持し、`getPortfolio(lang)`で解決する。スラッグ・年・技術名・URLなど言語に依存しない値は1回だけ書く。`skills`も技術名(固有名詞)のため言語非依存で共有。
- `filesystem.ts`: `getRoot(lang)`が言語ごとの仮想ファイルツリーを遅延生成してキャッシュする。既存コード(テスト含む)向けに`root`(ja固定)は互換のため残している。
- `commands.ts` / `engine.ts`: `CommandContext.lang` / `TerminalEngine(lang)` を受け取り、`getPortfolio(lang)`・`getRoot(lang)`を参照する。ただし`help`のコマンド一覧やエラーメッセージなど「シェルそのものの言葉」は実際のUnixシェル同様に英語のまま統一し、翻訳しない設計にしている(翻訳するのはポートフォリオの中身のみ)。
- `app.ts`: `document.documentElement.lang`(サーバーでPortfolioComputer.astroが`<html lang>`に設定)から`Language`を判定し、`TerminalEngine`とプレビューパネルの少数のUI文言に渡す。
- ヘッダーの言語切り替えチップ(`JA`/`EN`)は、現在の`lang`から逆側の`/v2`↔`/en/v2`へのリンクを`PortfolioComputer.astro`内で組み立てる。v1側の`Header.astro`もターミナルアイコンのリンク先を`getLocalizedPath('/v2', currentLanguage)`で言語追従させてあるので、`/en`から遷移すると`/en/v2`に着地する。

## テストによる品質担保

`filesystem.ts` / `commands.ts` / `engine.ts` はDOMに依存しない純粋なTypeScriptなので、Vitest(`*.test.ts`、`npm run test`)でブラウザなしに検証できる。app.tsとastroのマークアップはユニットテスト対象にしていない(DOM組み立てとイベント配線のみで、分岐が少ない)ため、見た目や実機での挙動はこれまで通りPlaywrightでの目視確認を都度行う。

- `filesystem.test.ts`: パス解決(`cd`/`..`/`~`/`/`)とファイルツリーの構造。`getRoot('en')`がja版と同じ構造・別内容であることも検証。
- `commands.test.ts`: 各コマンドの出力と、`cd`/`open`/`clear`/`reboot`/`rm -rf /`が返す制御シグナルの型。`lang: 'en'`を渡した場合の出力内容も検証。
- `engine.test.ts`: プロンプトの更新、コマンド履歴の↑↓、Tab補完。`TerminalEngine('en')`の挙動も検証。

v2のロジックに変更を加えるときは、まずここに落ちるテストを書く(または既存のテストを直す)。`npm run build`(型チェック)と`npm run test`の両方が通ってからコミットする。

## テーマ切り替えとの関係

v1はTailwindの`dark:`クラス切り替え(`ThemeProvider`がlocalStorageと`<html class="dark">`を同期)で1つの色関数相当を実現している。v2はそもそも常時ダーク基調の別世界という設定のため、v1のライト/ダーク切り替えとは独立している(v2ページはv1のテーマ状態を読み書きしない)。
