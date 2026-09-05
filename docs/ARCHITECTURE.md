# Architecture

## v1 / v2 の分離

- **v1** (`/`, `src/pages/index.astro` + `src/components/**`): 既存のレジュメ形式ホームページ。今回の再実装では一切変更していない（デフォルトのまま）。
- **v2** (`/v2`, `src/pages/v2/index.astro` + `src/v2/**`): 「ポートフォリオ = 1台のコンピュータ」というコンセプトの再実装。v1とは見た目・構造ともに独立しており、`src/components/layout/Header.astro`（v1側）と v2ページ内のヘッダーに置いた相互リンクだけで行き来する。
- v2はv1の`BaseLayout`/`Header`/`Footer`/`ThemeProvider`を使わない。自前のダーク/グリーンの世界観を持つ、独立した1ページとして実装している（`BaseHead`のみ共用してSEO/メタタグを揃えている）。

## v2 のディレクトリ構成と責務

```
src/v2/
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

**依存の向き**: `app.ts`(DOM) → `engine.ts`(状態) → `commands.ts`(コマンド) → `filesystem.ts` / `data/portfolio.ts`(データ)。逆方向の依存はない。Collageモードは `src/pages/v2/index.astro` から直接 `data/portfolio.ts` を読んでサーバーサイドでカード表示を組み立てており、Terminalモードと表示方法が違うだけで参照するデータソースは同じ1つ。

## テーマ切り替えとの関係

v1はTailwindの`dark:`クラス切り替え(`ThemeProvider`がlocalStorageと`<html class="dark">`を同期)で1つの色関数相当を実現している。v2はそもそも常時ダーク基調の別世界という設定のため、v1のライト/ダーク切り替えとは独立している(v2ページはv1のテーマ状態を読み書きしない)。
