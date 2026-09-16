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
│   ├── atoms/       # ExternalLink・IconLink
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
- ハイライトの仕組みはv1の`updateToc()`(scrollイベント + `offsetTop`比較)をそのまま`ResearchPortfolio.astro`のscriptに移植したもの。初期実装は移植元由来の`IntersectionObserver`+`intersectionRatio`を流用していたが、`intersectionRatio`は各セクション自身の高さに対する可視割合のため、丈の短い「Research Interests」が丈の長い「Publications」を可視区間で圧倒し、02のハイライトが実質スキップされたように見える不具合があった(詳細はdocs/DESIGN.md)。`offsetTop`比較はセクションの高さに左右されないため、この不具合を修正できた。CSSのクラス名・見た目(`.rp-toc-link.rp-toc-active`に下線)はv1の`.toc-link.toc-active::after`と揃えている。
- 結果として`Sidebar.astro`・`Avatar.astro`(顔写真が無いためのイニシャル表示)は使われなくなったため削除した。

## v3 の多言語化・アダプタ設計

v2と同じくURLベースの方式(`/v3` = ja、`/en/v3` = en)。`adapter.ts`の`getResearchPortfolio(lang)`が`getPortfolio(lang)`(v2)の出力を1回だけ組み替えて返し、その先のコンポーネントはすでに解決済みの文字列だけを受け取る(移植元が持っていた`{ja, en}`の`LocalizedText`型や`t()`ヘルパーは不要になった)。

対応関係:

- `research`配列(v2)のうち日付が無いもの → Research Interestsの1件(研究テーマの説明そのものが関心事だと解釈)。日付があるものはすべてPublicationsに入る。そのうち`kind`が`'journal'`(投稿中の論文誌など、発表を伴わないもの)以外 ― つまり既定値の学会発表 ― はPresentationsにも入る(移植元の「学会・研究会の成果はPresentationsにも自動掲載」という仕様をそのまま踏襲。`kind: 'journal'`は論文誌投稿がPresentationsに紛れ込まないためのv3独自の追加区分)。
- `profile.bio`/`profile.links`(v2) → Heroのみで表示(前述のとおりセクションとしては重複させない)。

## v1・v2・v3間の相互リンク

`src/components/layout/Header.astro`(v1)・v2の`PortfolioComputer.astro`・v3の`ResearchPortfolio.astro`は、いずれも自分自身を含む3モード全て(Home/Terminal/Research)へのアイコンリンクをヘッダーに持つ(v1は`IconButton`、v2は`Chip`、v3は`IconLink`)。表示順はどのモードでも同じ左からHome→Terminal→Research。`getLocalizedPath('/'|'/v2'|'/v3', currentLanguage)`相当の仕組みで表示言語に追従する。3モードともテキストではなくアイコン(house/square-terminal/graduation-cap)でリンクし、`aria-label`相当(`sr-only`テキストまたは`aria-label`)でアクセシブルな名前を持つ。v3はv1が使う`astro-icon`のローカルアイコン一式(`src/icons/`)に依存せず独自にインラインSVGで用意しているが、v2はv1と同じ`astro-icon`のアイコンをそのまま再利用している(新しい依存は増やしていない)。

v3の3つの`IconLink`(Home/Terminal/Research)は、`src/v3/components/atoms/IconLink.astro`という1つのアトムから生成する。元は`Header.astro`に`<a class='rp-icon-link'>...<svg viewBox='0 0 24 24' ...>`という同じラッパー構造(リンク要素+svgの共通属性)を3回コピー&ペーストしていた ― pathデータ(実際のアイコン形状)以外は3箇所とも完全に同一だったため、「同じ規則を2箇所目に書く前に共通化する」規約に反していた。`IconLink`は`href`/`label`だけを受け取り、アイコン形状はどれかを知らない(`<slot />`で`<path>`/`<rect>`をそのまま受け取る) ― 具体的な絵柄を知らずラッパーだけを知っているという点で、`ExternalLink.astro`(既存のv3アトム)と同じ設計。

v1のヘッダーアイコン(Home・Terminal(v2)・Research(v3)、`src/icons/`のhouse・square-terminal・graduation-cap)は、右上にまとめて`gap-x-1`の狭い間隔で並べている(ヘッダー全体の他の要素同士の間隔`gap-x-3`/`gap-x-4`より詰めている ― 同じ役割(ページ間ナビゲーション)を持つ1つのグループとして扱うため)。表示順は左から Home(自身、`/`) → Terminal(v2) → Research(v3)。全てIconButton(`h-8 w-8`の同じ寸法)に揃え、行内で寸法がバラつかないようにしている。

以前はこのグループにダークモード切替(`#toggleDarkMode`)とハンバーガー(`#toggleToc`、モバイルの`#toc-nav`開閉用)も含めていたが、表示をオフにする指示を受けて削除した。`#toc-nav`(`src/layouts/BaseLayout.astro`)は元々`class='block'`で常時表示がデフォルトのため、開閉トグルが無くなった今は常に展開された状態になる。テーマは`ThemeProvider.astro`の初期値(既定はダーク)とOS設定追従(`prefers-color-scheme`の変更監視)がそのまま効いているため、手動切り替えができなくなっただけで機能自体は残っている。手書きのハンバーガー/ダークモード切替アイコンを実際のlucideアイコンのpathに差し替える作業も一度行ったが(`src/icons/menu.svg`・`sun.svg`・`moon.svg`)、アイコン自体を削除したためこれらのファイルも不要になり削除した。

v2の`PortfolioComputer.astro`も同じアイコン切り替えの形式に揃えた。ヘッダーの`v1`/`v3`リンクは元々テキストの`Chip`(`v1`/`v3`という文字)だったが、v1の`Header.astro`と同じ`astro-icon`のhouse/graduation-capアイコンに差し替えた。新しいアトムは作らず、既存の`Chip`(`docs/DESIGN.md`が定める`sm`=24px/`md`=44pxの2段階のみを持つv2唯一のピル型アトム)にアイコンを入れているだけ。ただしテキスト用の左右パディング(`0 12px`)ではアイコン1つだと横長の楕円になってしまうため、`.pf-chip--icon`という補助クラスを追加し、幅を高さと揃えて正方形(丸)にした(`sm`=24px、`560px`未満でChipが`md`=44pxへ育つのと同じブレークポイントで`.pf-chip--icon`側の幅も44pxへ追従する)。表示順はv1と同じHome(v1)→Terminal(v2)→Research(v3)で、v1の`gap-x-1`と同じ意図で`.pf-header__icons`という4pxギャップのラッパーにまとめている。

Terminal(自分自身、`/v2`or`/en/v2`へのリンク)も同じ並びに含め、`Chip`の`active`propで塗りつぶし(`is-active`、`--pf-green`背景)にして「現在地」を示している。これは元々`SegmentedControl`(`terminal`という1択だけのモード切り替え)が担っていた役割の置き換え ― collageモードが非表示の今は選択肢が常に1つしか無く、複数択から選ぶという`SegmentedControl`本来の仕事が無くなっていたため、Home/Researchと同じ`Chip`直書きに統一した(`SegmentedControl.astro`自体は変更していないので、collageモードを再度有効にする際はそのまま使い直せる)。EN/JAの言語切り替えチップは元のままテキストで残している(ページ間ナビゲーションではないため)。

モバイルでヘッダーが2行に折り返っていた問題(操作可能な`Chip`が560px未満で`sm`→`md`(24→44px)へ育つ分、アクション列の幅が伸びる)は、`.pf-header`の余白・ギャップを詰め、装飾的なプロンプト文字列(`emar27181@portfolio: ~`)のフォントサイズを860px未満で12pxに縮小することで解消した(実測: 390px幅でヘッダー高さが92.5px→61pxに減り1行に収まることをPlaywrightで確認。320pxのような極端に狭い幅では2行のまま)。
