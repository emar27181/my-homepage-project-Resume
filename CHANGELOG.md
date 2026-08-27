# CHANGELOG

このファイルは「いつ・何を・なぜ・どのように対応したか」を記録する。
新しい変更を上に追記する。

> 注: このファイルは 2026-08-27 に運用を開始した。それ以前の履歴は `git log` を参照。

---

## 2026-08-27

### カードをスマホで2列表示に対応

- **何を**: `Card` / `ProjectCard` をスマホでも2列で表示するようにし、説明文の短縮版を出し分けられるようにした。制作物・趣味・学会発表の各グリッドを2列化。
- **なぜ**: 1列だと縦に長くなり、スマホで一覧性が低かったため。ただし2列にすると説明文が長すぎて収まらないため、短縮版が必要になった。
- **どのように**: グリッドを `grid-cols-2 gap-2 sm:gap-3` に変更。`ProjectCard` の画像はスマホで正方形（`aspect-square`）にし、文字と余白も縮小した。説明文は `subheadingShort` プロパティを追加し、スマホでは短縮版、PCでは従来の文章を表示する。未指定なら `subheading` にフォールバックする。
- **対象外**: スキルセクションのGitHub統計画像は横長で読めなくなるため1列のまま。

### 制作物の表示順と説明文を調整

- **何を**: ゲーム用ポートフォリオを Flex Railway Map の下に移動。JUQSマップと p5.js演習ブラウザをコメントアウトして非表示化。説明文から「自身が〜」の言い回しを削除し、色相・トーン推薦アプリの説明を具体化した。
- **なぜ**: 見せたい制作物を上位に置き、表現を統一するため。非表示の2件は削除ではなくコメントアウトとし、戻せるようにした。
- **どのように**: `src/pages/index.astro` / `src/pages/en/index.astro` のカードを並び替え、英語版が参照する `src/utils/i18n.ts` の文言も合わせて修正した。

### 制作物の表記と表示順を変更

- **何を**: Waste Tax の表記を `TAKUS` に変更。制作物カードを指定順（ギャラリー / ポートフォリオ / Flex Railway Map / Music Atlas / ThrowFlowDarts / TAKUS / Window Brain / Way Point Map / 色相・トーン推薦アプリ / その他）に並び替え。日本語版で制作物セクションを趣味セクションの前に移動。
- **なぜ**: サイトの正式表記に合わせるため。また、見せたい制作物を上位に置くため。
- **どのように**: `src/pages/index.astro` と `src/pages/en/index.astro` の `ProjectCard` を並び替え。日本語版は `Section` ブロックごと移動し、上部の目次リンクも同じ順序に揃えた。英語版は元から制作物が先だったためカードの並び替えのみ。

### ビルドを npm に統一

- **何を**: `pnpm-lock.yaml` を削除し、`netlify.toml` を追加してビルドコマンドを `npm run build` に固定。
- **なぜ**: `package-lock.json` と `pnpm-lock.yaml` が混在し、普段の作業は npm・Netlify のビルドは pnpm という食い違いが起きていた。`pnpm-lock.yaml` が `package.json` と同期しておらず、`ERR_PNPM_OUTDATED_LOCKFILE` でデプロイが失敗した。
- **どのように**: `pnpm-lock.yaml` を削除。ビルドコマンドは Netlify の管理画面側で `pnpm run build` に設定されていたため、リポジトリ側から上書きするために `netlify.toml` を追加した。

### 制作物にサイトを5件追加

- **何を**: Music Atlas / ThrowFlowDarts / TAKUS / Way Point Map / Window Brain を制作物セクションに追加。あわせて最終更新日を更新。
- **なぜ**: 新しく公開した制作物をポートフォリオに反映するため。
- **どのように**: 各サイトのスクリーンショットを `src/assets/` に配置し、日本語版・英語版の両方に `ProjectCard` を追加した。
