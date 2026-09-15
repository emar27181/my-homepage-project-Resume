# Astro Resume

## 注意事項

- このプロジェクトは[astro-theme-resume](https://github.com/srleom/astro-theme-resume)を基に作成したものです．

## v1 / v2 / v3

- `/` (v1): 従来のレジュメ形式のホームページ。デフォルトはこちら。
- `/v2` (v2): 「ポートフォリオ = 1台のコンピュータ」をコンセプトにした、ターミナルで自分自身を探索できる実験的な再実装。Terminal / Collage の2モードを切り替え可能。
- `/v3` (v3): 研究者ポートフォリオ風のデザイン。[emar27181/portfolio-taraba](https://github.com/emar27181/portfolio-taraba)というAstro製テーマを、このサイト自身の研究データ(研究テーマ・学会発表・論文誌)で動くように移植したもの。制作物・スキル・学歴などはv1で既に見られるため、v3では研究関連のセクションだけを表示する。v1と同じ「スクロール連動タブ+スティッキーヘッダー」の操作感、ライト/ダーク切り替えを持つ1ページ構成。
- 3モードとも、それぞれのヘッダーのボタン(`v1` / `v2` / `v3`)から相互に行き来できる。
- v1と同様にv2・v3も`/en/v2`・`/en/v3`で英語版を表示できる(ヘッダーの`JA`/`EN`チップで切り替え)。
- v2の設計・構成は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) と [docs/DESIGN.md](docs/DESIGN.md) を、v3は同じ2ファイル内のv3向けセクションを参照。

### v2の使い方

`/v2`を開くと、入力欄にすでに`./start.sh`が入力された状態で待ち受けている。そのままEnterを押すと起動ログが流れ、プロフィールカード(handle・GitHub等のリンク)とサイト概要・基本操作の案内を経てASCII artの後にシェルが使えるようになる(何もしなくても6秒後には同じ内容のヒントが再度出る)。起動ログの説明文は表示言語(`/v2`=ja、`/en/v2`=en)に追従する。

主なコマンド(`help`でも一覧を表示):

| コマンド                          | 内容                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `whoami`                          | プロフィールを表示                                                                             |
| `pwd`                             | 現在のディレクトリを表示                                                                       |
| `echo <text>`                     | テキストをそのまま出力                                                                         |
| `date`                            | 現在の日時を表示                                                                               |
| `ls [-l] [path]`                  | ファイル一覧(`ls -l projects`で詳細表示)                                                       |
| `cd <dir>` / `cd ..`              | ディレクトリ移動(`~`はホーム、`/`もホーム扱い)                                                 |
| `cat <file>`                      | ファイルの中身を表示                                                                           |
| `tree`                            | ファイルツリー全体を表示                                                                       |
| `projects` / `open <slug>`        | 制作物一覧 / 個別プロジェクトをプレビュー表示                                                  |
| `skills` / `research` / `hobbies` | 各セクションの内容を表示                                                                       |
| `history`                         | このセッションで打ったコマンドの履歴                                                           |
| `clear` / `reboot`                | 画面クリア / 起動シーケンスを最初からやり直す                                                  |
| `sudo rm -rf /`                   | 削除演出のあとカーネルパニック風に固まる(実データは消えない。ページを再読み込みすると元に戻る) |
| `sl`                              | `ls`の打ち間違いネタ。機関車のASCII artが横切っていく                                          |

`help`には出てこない小ネタもいくつか隠してある(`cowsay`、`sudo make me a sandwich`など)。

操作:

- `Tab`: コマンド/パスの補完(候補が複数あれば一覧表示)
- `↑` / `↓`: コマンド履歴を辿る
- `Ctrl + L`: 画面クリア、`Ctrl + C`: 入力中の行を中断
- スマホ幅(560px以下)では、物理キーボードにない`Tab`・`↑`/`↓`(コマンド履歴)・`←`/`→`(カーソル移動)・スマホの記号レイアウト切り替えなしで打てる`/` `.` `-` `~`・確実に効く`Enter`・`Ctrl+L`相当の`Clear`をオンスクリーンのボタンとして入力欄の下に表示する。これらは実際のキー操作と同じくタップした瞬間に実行される(`/` `.` `-` `~`はカーソル位置にその文字を挿入)。さらにその下に`ls`/`cd`/`cat`/`tree`/`open`/`whoami`/`help`のクイック起動ボタンを表示し、フルで打たなくても主要なコマンドをタップで使えるようにしている。こちらはタップするのは補完だけで、実行はしない(Tab補完と同じ扱い)。`cd`/`cat`/`open`は入力欄に`cmd `まで入り、`ls`等の引数無しコマンドはそのままの文字列が入る。実行するには続けて`Enter`(ボタンまたはキーボード)を押す必要がある。

現在Collageモード(カードベースのGUI表示)はヘッダーの切替から一時的に非表示にしている。コードはそのまま残っているので、`src/v2/PortfolioComputer.astro`のSegmentedControlのoptionsに戻せば再表示できる。

### v3の使い方

`/v3`はResearch Interests / Publications / Presentationsの3セクションだけを表示する1枚の縦スクロールページ。制作物・スキル・学歴・連絡先などは既にv1(`/`)のヘッダータブから見られるため、v3では重複させていない。ナビゲーションは移植元の左サイドバーではなく、v1のヘッダー(スティッキー+スクロール連動タブ)と同じパターンを採用しており、ヘッダー2段目のタブが現在見ているセクションに合わせてハイライトされる。ヘッダーの丸ボタンでライト/ダーク切り替え。Publicationsには学会発表と投稿中の論文誌をすべて含み、Presentationsには実際に発表を行ったものだけを表示する。コンテンツはv2と同じ`src/v2/data/portfolio.ts`から`src/v3/data/adapter.ts`が組み替えて表示しているだけで、v3専用のコンテンツファイルは無い(内容を直すときはv2側のファイルを編集する)。

## テスト

- `npm run test`(= `vitest run`)で、v2のターミナルロジック(仮想ファイルシステム・コマンド・エンジン)のユニットテストを実行する。
- v2に変更を加えたら、`npm run build`(型チェック含む)・`npm run test`の両方が通ることを確認してからコミットする。

## デプロイ方法

1. `npm run build`でdistを更新
2. `netlify login` でnetlifyのログインを確認
3. `netlify deploy`で公開前のデプロイ結果の確認
   - `Please provide a publish directory (e.g. "public" or "dist" or "."): `は`"dist"`を入力
4. `netlify deploy --prod`でデプロイ結果を公開
   - `Please provide a publish directory (e.g. "public" or "dist" or "."): `は`"dist"`を入力

## よく使うファイル(※下記に詳細あり)

- `src/pages/index.astro` : ホームの編集
- `src/components/layout/Header.astro` : ヘッダーの編集

## Features

- Astro v4
- TailwindCSS utility classes
- ESLint / Prettier pre-installed and pre-configured
- Accessible, semantic HTML markup
- Responsive & SEO-friendly
- Dark / Light mode, using Tailwind and CSS variables (referenced from shadcn)
- [Astro Assets Integration](https://docs.astro.build/en/guides/assets/) for optimised images
- MD & [MDX](https://docs.astro.build/en/guides/markdown-content/#mdx-only-features) posts
- Pagination
- [Automatic RSS feed](https://docs.astro.build/en/guides/rss)
- Auto-generated [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Expressive Code](https://expressive-code.com/) source code and syntax highlighter

## Credits

- [astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus) for blog design
- [minirezume-framer](https://minirezume.framer.website/) for resume homepage design

## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
    ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
|   ├── pages/
|   ├── styles/
|   ├── utils/
|   ├── site.config.ts
│   └── types.ts
├── .elintrc.cjs
├── .gitignore
├── .prettierignore
├── package.json
├── prettier.config.cjs
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Editing guide

### Site info

To edit site info such as site title and description, edit the `src/site.config.ts` file.

### Page contents

To edit the resume homepage content and design, edit the `src/pages/index.astro` file.

### Page components

To edit page components found site-wide such as the card used in the homepage, edit the files found in the `src/components/` directory.

### Layouts

To edit the base layouts of all pages, edit the `src/layouts/BaseLayout.astro` file.

To edit the layout of a blog article, edit the `src/layouts/BlogPost.astro` file.

### Blog content

To add blog content, insert `.md` files in the `src/content/` directory.

To add images in blog articles, insert a folder in the `src/content/` directory, add both the `.md` and image files into the new folder, and reference the image in your `.md` file.

## Theming

To change the theme colours of the site, edit the `src/styles/app.css` file.

To change the fonts of the site, add your font files into `/public`, add it as a `@font-face` in the `src/styles/app.css` file, as a `fontFamily` in the `tailwind.config.js` file, and apply the new font class to the `body` tag in the `src/layouts/BaseLayout.astro` file.
