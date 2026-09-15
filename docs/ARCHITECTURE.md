# Architecture

## v1 / v2 / v3 の分離

- **v1** (`/`, `src/pages/index.astro` + `src/components/**`): 既存のレジュメ形式ホームページ。今回の再実装では一切変更していない（デフォルトのまま）。
- **v2** (`/v2`, `src/pages/v2/index.astro` + `src/v2/**`): 「ポートフォリオ = 1台のコンピュータ」というコンセプトの再実装。v1とは見た目・構造ともに独立しており、`src/components/layout/Header.astro`（v1側）と v2ページ内のヘッダーに置いた相互リンクだけで行き来する。
- **v3** (`/v3`, `src/pages/v3/index.astro` + `src/v3/**`): 研究者ポートフォリオ風のデザイン（[emar27181/portfolio-taraba](https://github.com/emar27181/portfolio-taraba)から移植）。v1・v2とヘッダーの相互リンクで行き来する。詳細は後述。
- v2・v3はいずれもv1の`BaseLayout`/`Header`/`Footer`/`ThemeProvider`を使わない。それぞれ自前の世界観を持つ、独立した1ページとして実装している（`BaseHead`のみ共用してSEO/メタタグを揃えている）。

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
│   ├── boot.ts              # 起動ログの行と表示間隔、`whoami`風identityカード、ASCII artの選択(幅で切り替え)。`getBootLines(lang)`で表示言語に応じた文言を返す。
│   ├── sl.ts                # `sl`イースターエッグ(機関車のASCII art)。`buildSlFrames()`が横断アニメーションのフレーム列を返す。
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

v1はTailwindの`dark:`クラス切り替え(`ThemeProvider`がlocalStorageと`<html class="dark">`を同期)で1つの色関数相当を実現している。v2はそもそも常時ダーク基調の別世界という設定のため、v1のライト/ダーク切り替えとは独立している(v2ページはv1のテーマ状態を読み書きしない)。v3も同様に自前のライト/ダーク切り替え(後述)を持ち、v1・v2どちらのテーマ状態とも独立している。

## v3(研究者ポートフォリオ)のディレクトリ構成と責務

[emar27181/portfolio-taraba](https://github.com/emar27181/portfolio-taraba)というAstro製の研究者ポートフォリオ用テーマ(Atomic Design構成)を、このサイト自身のコンテンツで動くように移植したもの。コンテンツの実体は増やしていない — `src/v2/data/portfolio.ts`(v2と共有する唯一のコンテンツソース)を研究者ポートフォリオ向けの形に組み替えるアダプタとして実装している。

```
src/v3/
├── components/
│   ├── atoms/       # ExternalLink
│   ├── molecules/   # LinkList・PublicationItem
│   ├── organisms/   # Header(ブランド行+セクションタブ行)・Hero・Footer・PublicationList
│   └── ResearchPortfolio.astro # v3ページの実体。langをpropで受け取る唯一のマークアップ(v2のPortfolioComputer.astroと同じ役割)。
├── data/
│   ├── types.ts     # 移植先コンポーネントが要求する型(ResearchProfile/ResearchOutput等)。
│   ├── ui.ts         # UI文言とセクション定義(getUi(lang)/getSectionDefinitions(lang))。
│   └── adapter.ts    # 唯一のロジック本体。getPortfolio(lang)(v2)の出力をResearchPortfolioDataへ組み替える。
└── styles/
    └── research.css  # `.rp-*` 名前空間の独自スタイル(紫アクセント、ライト基調)。v1・v2のCSSと衝突しない。
```

**v3は研究関連セクションだけを表示する**: v1のヘッダーには既にすべてのカテゴリ(制作物/趣味/研究テーマ/学会発表/スキル/学歴/資格・免許/作品集)のタブがある。v3を移植元テーマの全セクション(Featured Projects・Skills・Education/History・Awards・Contactなど)でそのまま再現すると、v1と同じ内容を別デザインで重複表示するだけになってしまう。そこでv3は研究に関するセクション ― Research Interests・Publications・Presentations ― だけを表示する設計にした。`SectionId`型を`'interests' | 'publications' | 'presentations'`の3つに絞り、`ProjectList.astro`/`SkillGroup.astro`/`Timeline.astro`など元テーマのAwards以外の非研究セクション用コンポーネントも(Awardsと同じ理由で)作らなかった。プロフィール本文・連絡先リンクはセクションではなくHero(常に表示される導入部)にまとめている ― 元の実装ではHeroとAbout/Contactセクションの両方に同じ内容(`profile.about`・`profile.links`)を出しており「同じ内容を2箇所に書く」規約違反になっていたため、Hero側だけに一本化した。

**移植元からの意図的な縮小**(docs/DESIGN.mdに詳細):

- 単一のスクロールページのみ。セクションごとの個別ページ(`/about`等)やmulti/single表示切り替えは実装していない。
- アクセントカラーは紫1色固定。パレット選択・虹色モードは移植していない。
- 表示言語はこのサイトの既存の方式(`/v3` = ja、`/en/v3` = en のURLベース切り替え)に統一し、移植元が持っていたクライアントサイドでのDOM文字列置換による言語切り替えは採用していない。
- **ナビゲーションは移植元の左サイドバーではなくv1自身のパターンを踏襲**(後述)。
- 保持した機能: セクションタブのスクロール連動ハイライト、ライト/ダーク切り替え。引用コピーボタンは一度移植したが不要と判断し削除した。

## v3のヘッダー/ナビゲーションはv1のパターンを踏襲

移植元(portfolio-taraba)は幅260pxの固定左サイドバーにプロフィールと目次を置く設計だが、v3では採用していない。代わりに、このサイトのv1が既に持っているパターン(`src/layouts/BaseLayout.astro`の`sticky top-0`なラッパーに`Header`と`toc-nav`を重ね、`src/styles/app.css`の`.toc-link`/`.toc-active`でスクロール位置に応じてハイライトする、`src/pages/index.astro`の`slot="toc"`)をv3にもそのまま適用した。

- `src/v3/components/organisms/Header.astro`が1つのコンポーネントで両方の行を持つ: 1行目はブランド名+v1/v2/言語切替/テーマ切替、2行目(`.rp-toc-row`)が各研究セクションへのタブ(`.rp-toc-link`)。
- ハイライトの仕組みはv1の`updateToc()`(scrollイベント + `offsetTop`比較)ではなく、既存の`IntersectionObserver`実装(`ResearchPortfolio.astro`のscript)をそのまま流用している ― 挙動(現在の見えているセクションのタブに`active`相当のクラスを付ける)はv1と同じだが、実装手段は元々v3にあったものを活かした。CSSのクラス名・見た目(`.rp-toc-link.rp-toc-active`に下線)はv1の`.toc-link.toc-active::after`と揃えている。
- 結果として`Sidebar.astro`・`Avatar.astro`(顔写真が無いためのイニシャル表示)は使われなくなったため削除した。

## v3 の多言語化・アダプタ設計

v2と同じくURLベースの方式(`/v3` = ja、`/en/v3` = en)。`adapter.ts`の`getResearchPortfolio(lang)`が`getPortfolio(lang)`(v2)の出力を1回だけ組み替えて返し、その先のコンポーネントはすでに解決済みの文字列だけを受け取る(移植元が持っていた`{ja, en}`の`LocalizedText`型や`t()`ヘルパーは不要になった)。

対応関係:

- `research`配列(v2)のうち日付が無いもの → Research Interestsの1件(研究テーマの説明そのものが関心事だと解釈)。日付があるものはすべてPublicationsに入る。そのうち`kind`が`'journal'`(投稿中の論文誌など、発表を伴わないもの)以外 ― つまり既定値の学会発表 ― はPresentationsにも入る(移植元の「学会・研究会の成果はPresentationsにも自動掲載」という仕様をそのまま踏襲。`kind: 'journal'`は論文誌投稿がPresentationsに紛れ込まないためのv3独自の追加区分)。
- `profile.bio`/`profile.links`(v2) → Heroのみで表示(前述のとおりセクションとしては重複させない)。

## v1・v2・v3間の相互リンク

`src/components/layout/Header.astro`(v1)には`v2`・`v3`へのIconButtonリンクがあり、`getLocalizedPath('/v2'|'/v3', currentLanguage)`で表示言語に追従する。v2の`PortfolioComputer.astro`・v3の`ResearchPortfolio.astro`はそれぞれのヘッダーに残り2モードへのリンクを持つ(v2はChip、v3は`.rp-header-nav`のリンク)。v3のv1/v2リンクはテキストではなくアイコン(house/square-terminal、v3独自にインラインSVGで用意。v1が使う`astro-icon`のローカルアイコン一式(`src/icons/`)には依存していない)で、`aria-label`でアクセシブルな名前を持つ。
