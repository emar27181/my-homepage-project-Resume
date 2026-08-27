# PROJECT_RULES

チャットや議論で確定した、このプロジェクト固有の仕様・値・ルールを記録する。
汎用の開発ルールは `CLAUDE.md` を参照。

---

## パッケージ管理

- **npm に統一する**（2026-08-27 確定）
  - `pnpm-lock.yaml` はリポジトリに置かない
  - 依存を追加・削除したら `package-lock.json` を必ず同じコミットに含める

- **ビルドコマンドは `netlify.toml` で固定する**
  - Netlify の管理画面側の設定より `netlify.toml` が優先される
  - 管理画面の設定だけを変えても、リポジトリを見ただけでは分からないため

```toml
[build]
	command = "npm run build"
	publish = "dist"
```

## デプロイ

- 本番デプロイ: `netlify deploy --prod`
- 公開URL: https://emar27181-resume.netlify.app

## ページ構成

- セクションの表示順は **制作物 → 趣味**（日本語版）
- 上部の目次リンク（`toc-link`）の順序は、実際のセクション順と一致させる

## レイアウト

- **カードはスマホでも2列で表示する**（2026-08-27 確定）
  - グリッドは `grid grid-cols-2 gap-2 sm:gap-3`
  - `ProjectCard` の画像はスマホで正方形（`aspect-square sm:aspect-auto sm:h-48`）
  - 文字と余白はスマホで縮小する（見出し `text-base sm:text-lg` / 本文 `text-sm sm:text-base` / 余白 `px-3 sm:px-5`）

- **説明文はスマホ用に短縮版を用意する**
  - `Card` / `ProjectCard` の `subheadingShort` に2文程度の要約を渡す
  - スマホでは `subheadingShort`、PCでは `subheading` を表示する
  - `subheadingShort` を省略した場合は `subheading` にフォールバックするため、元から短い説明には付けなくてよい

- 以下は2列にせず **1列のまま** にする
  - 学会発表セクション（埋め込み動画とリンク一覧を含み、半分幅では窮屈になるため）
  - スキルセクションのGitHub統計画像（横長で読めなくなるため）

## 文章表現

- 制作物・趣味の説明で **「自身が〜」という言い回しは使わない**
  - 例: 「自身が描いたイラスト」→「制作したイラスト」

## 制作物セクション

- カードの表示順（2026-08-27 確定）

  1. ギャラリーポートフォリオ
  2. ポートフォリオ(このサイト)
  3. Flex Railway Map
  4. ゲーム用ポートフォリオ
  5. Music Atlas
  6. ThrowFlowDarts
  7. TAKUS
  8. Window Brain
  9. Way Point Map
  10. 色相・トーン推薦アプリ
  11. VALORANT Point Viewer
  12. 麻雀役ビジュアライザー
  13. Card Pocket（デモ）

- **非表示（コメントアウトして残している）**: JUQSマップ / p5.js演習ブラウザ

- 日本語版・英語版の両方に同じカードを追加する
  - 日本語版: `src/pages/index.astro`
  - 英語版: `src/pages/en/index.astro`

- **表記はサイト自身の名前に合わせる**（URLのスラッグではない）

  | 表記 | URL |
  | --- | --- |
  | TAKUS | `waste-tax.netlify.app` |
  | ThrowFlowDarts | `throw-frow-darts.netlify.app` |

## 制作物のスクリーンショット

- 保存先: `src/assets/`、形式は JPEG
- 撮影条件: ビューポート 1280x800 / `deviceScaleFactor: 2` / JPEG 品質 82
- 初回表示のモーダルやオンボーディングは閉じてから撮影する
