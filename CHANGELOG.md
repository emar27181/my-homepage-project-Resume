# Changelog

## 2026-09-16 (25)

- improve: v3ヘッダーのHome/Terminal/Researchアイコンリンクを`src/v3/components/atoms/IconLink.astro`という1つのアトムに共通化した。`Header.astro`に`<a class='rp-icon-link'>...<svg viewBox='0 0 24 24' ...>`というラッパー構造(pathデータ以外は完全に同一)を3回コピー&ペーストしていたのを、`href`/`label`だけを受け取り具体的なアイコン形状は`<slot />`で受け取る(既存の`ExternalLink.astro`アトムと同じ設計)アトム1つにまとめた。表示結果・DOM構造は変更していない(Playwrightで見た目・リンク先・コンソールエラー無しを変更前後で比較確認済み)。
- `npm run test`(54件、無変更)・`npm run build`で確認済み。

## 2026-09-16 (24)

- improve: v3ヘッダーのnav並び・間隔をv1に揃えた。v1は「EN/JAチップ→(gap-x-1で詰めた)Home/Terminal/Researchアイコン」の順だが、v3は元々「Home/Terminal/Research→EN/JA」の順で、`.rp-header-nav`全体が同じ16pxギャップだったため1つのグループに見えていなかった。EN/JAリンクをアイコン列より前に出し、3アイコンを`.rp-header-icons`という新しいラッパー(`gap: var(--rp-space-1)` = 4px)でくくって、v1と同じ「EN→詰まったアイコン列」の見た目に揃えた。テーマ切り替えボタン(v1には無い要素)はアイコン列の後ろに残している。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px)で並び順(EN→Home→Terminal→Research→テーマ切替)・間隔(アイコン間4px/グループ間16px)・コンソールエラー無しを確認済み。

## 2026-09-16 (23)

- improve: v3ヘッダーに自分自身(Research)へのアイコンリンクを追加し、v1/v2と同じHome→Terminal→Researchの並びに揃えた。それまではv1(house)・v2(square-terminal)の2アイコンしか無く、v1・v2が自分自身を含む3モード分のアイコンを持つのに対してv3だけ2つで揃っていなかった。`Header.astro`(v3)の`.rp-icon-link`をそのまま使い、新規の`v3Href`(そのページ自身のURL)/`v3Label`(新設の`ui.thisIsV3`文言)propsを追加しただけで、新しいCSS/コンポーネントは増やしていない。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px、ja/en)でアイコン順序・リンク先・コンソールエラー無しを確認済み。

## 2026-09-16 (22)

- improve: v2ヘッダーの`terminal`という英単語のテキストピルをsquare-terminalアイコンに差し替え、Home/Terminal/Researchの並び順もv1と同じ(左からHome→Terminal→Research)に揃えた。この3アイコンは`.pf-header__icons`という4pxギャップのラッパーでまとめ、v1の`gap-x-1`と同じく1グループとして詰めて配置している。Terminal(自分自身へのリンク)は`Chip`の`active`propで塗りつぶし、現在地を示す。これに伴い、選択肢が常に1つしかない(collageモード非表示中の)`SegmentedControl`呼び出しは削除し、他の2アイコンと同じ`Chip`直書きに統一した(`SegmentedControl.astro`自体は変更していないので、collageモード再有効化時にまた使える)。
- fix: 上記のアイコン化とv1と同じ44pxタッチターゲット拡大(560px未満)が組み合わさり、モバイル(390px)でヘッダーが2行に折り返っていた。プロンプト文字列(`emar27181@portfolio: ~`)のフォントサイズを860px未満で12pxに縮小し、ヘッダーの余白・ギャップを詰めることで1行に収まるようにした(実測: 390px幅でヘッダー高さ92.5px→61px)。320pxのような極端に狭い幅では引き続き2行になる。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px/320px、ja/en)でアイコン順序・リンク先・active状態・1行レイアウト・コンソールエラー無しを確認済み。

## 2026-09-16 (21)

- improve: v2(ターミナル表示)のヘッダーも、v1・v3と同じアイコンによるページ切り替え形式に揃えた。`v1`/`v3`への素のテキストChipを、v1と同じ`astro-icon`のhouse/graduation-capアイコンに差し替えた(v2はv1のローカルアイコン一式をそのまま再利用でき、新しい依存は増えていない)。アイコン1つだけだと`Chip`のテキスト用パディングで横長の楕円になるため、`.pf-chip--icon`という補助クラスを追加して幅を高さに揃え、正方形(丸)にした(`src/v2/styles/terminal.css`、`sm`=24px/`560px`未満で`md`=44pxへ育つ既存のブレークポイントにそのまま追従)。既存の`Chip`アトムを使い回しているだけで、新しいボタン部品は作っていない。v2はターミナル表示そのものなので、自分自身を指す3つ目のアイコンは置いていない。EN/JAの言語チップ・`terminal`モード表示はページ間ナビゲーションではないためテキストのまま。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px、ja/en)でアイコンの見た目・リンク先(`/`・`/v3`、`getLocalizedPath`で言語追従)・コンソールエラー無しを確認済み。

## 2026-09-16 (20)

- improve: v1ヘッダーのハンバーガーメニュー・ナイトモード切替の表示をオフにした。アイコン群はHome(自身)・Terminal(v2)・Research(v3)の3つに整理。`#toc-nav`はもともと`class='block'`で常時表示がデフォルトのため、開閉トグルが無くなった今は常に展開された状態になる(表示内容自体に変化は無い)。テーマは`ThemeProvider.astro`の初期値(既定はダーク)とOS設定追従がそのまま効くため、手動切り替えができなくなるだけで機能自体は残る。前回追加した`src/icons/menu.svg`・`sun.svg`・`moon.svg`はこれに伴い不要になったため削除した(`house.svg`は引き続き使用)。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px)でアイコン数(3つ)・ハンバーガー/ダークモード切替ボタンの不在・toc-navの常時表示を確認済み。

## 2026-09-16 (19)

- improve: v1ヘッダーの右上アイコン群を、右から順に「ハンバーガーメニュー・ナイトモード切替・研究(v3)・ターミナル(v2)・ホーム(自身)」の並びに揃え、`gap-x-1`で1つのグループとして詰めて配置した(ヘッダー内の他要素同士の間隔より狭くし、ページ間ナビゲーション+テーマ切替+モバイルメニューという同じ役割のグループであることを視覚的に示した)。ホームアイコン(`src/icons/house.svg`、v3で既に使っているものと同じpath)を新規追加し、v1の各ページ(index以外のblog/tags/tools等でも同じHeaderを使う)から`/`へすぐ戻れるようにした。ハンバーガー・ダークモード切替が手書きのインラインSVG(lucideの実際のpathとは微妙にずれた座標)だったのを、`src/icons/menu.svg`・`sun.svg`・`moon.svg`として実際のlucideアイコンのpathに差し替え、`astro-icon`経由の他アイコンと同じ仕組みに統一した。ハンバーガーもIconButton化し、行内の全アイコンが同じ寸法(`h-8 w-8`)に揃うようにした。各アイコンのリンク先(`/`・`/v2`・`/v3`、いずれも`getLocalizedPath`で表示言語に追従)を再確認済み。v2(ターミナル表示中)はこの構成への統一対象から外している。
- fix: 上記編集中に`src/pages/index.astro`の「最終更新」表記が更新漏れ(2026年9月9日のまま)だったため、当日日付(2026年9月16日)に修正(`/en`版も同様)。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、1280px/390px、ライト/ダーク)でアイコンの並び順・リンク先・ダークモード切替・ハンバーガーでのtoc-nav開閉を確認済み。

## 2026-09-16 (18)

- improve: v1の言語切り替えボタンの表示を「English」/「日本語」の全角文言から、v2/v3のヘッダーチップと同じ「EN」/「JA」の短い表記に揃えた。挙動(1つのボタンで表示言語をトグルする)は変更していない。アクセシビリティのため`title`属性(`Switch to English`/`日本語に切り替え`)を新たに追加した。

## 2026-09-16 (17)

- fix: v3のセクションタブで「02 Publications」が実質スキップされたように見える不具合を修正。スクロール位置の検出に使っていた`IntersectionObserver`+`intersectionRatio`(可視割合が一番高いセクションをアクティブにする方式)は、各セクション自身の高さに対する比率で判定するため、丈の短い「Research Interests」(約375px)が丈の長い「Publications」(1000px超)を可視区間で圧倒し、01→(実質スキップ)→03と遷移して見えていた。v1の`updateToc()`(`src/layouts/BaseLayout.astro`)が実際に使っている`offsetTop`比較(スクロール位置がどのセクションの開始位置を最後に通過したか)へ実装を置き換え、セクションの高さに左右されない判定にした。Playwrightでスクロール位置ごとのアクティブタブをサンプリングし、1280×800/390×844の両方で01→02→03と単調に遷移することを確認済み。docs/DESIGN.md・docs/ARCHITECTURE.mdの「既存のIntersectionObserver実装をそのまま流用」という記述も実態に合わせて更新した。

## 2026-09-15 (16)

- improve: v3ヘッダーのv1/v2リンクをテキストからアイコンに変更。v1のヘッダー(`Header.astro`)がIconButton+アイコンでv2/v3を切り替えている慣習に合わせ、house(v1)・square-terminal(v2、v1側が実際に使っているのと同じ絵柄)のインラインSVGアイコンに差し替えた。`aria-label`/`title`でアクセシブルな名前は維持。
- fix: ヘッダー2段目のタブや`#section`アンカーへジャンプすると、対象セクションの見出しがsticky headerの下に隠れる不具合を修正。移植元テーマが持つ「ヘッダー実測高さをResizeObserverで追跡し`scroll-padding-top`へ反映する」仕組み(`--page-scroll-offset`)の移植が漏れていたため、同じ考え方で`--rp-scroll-offset`を追加し、`.rp-single-section`の`scroll-margin-top`に使うようにした。
- style: `:focus-visible`のアウトラインと`::selection`の配色をv3に追加(移植元にあったが未移植だった)。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright)でアイコン表示・タブジャンプ後に見出しが隠れないこと・ライト/ダーク両方でのアイコン視認性を確認済み。

## 2026-09-15 (15)

- improve: v3のヘッダー2段目のセクションタブに番号(`01`/`02`/`03`)バッジを追加し、幅700px未満(移植元テーマ[aihara-yasuto-portfolio.netlify.app](https://aihara-yasuto-portfolio.netlify.app/)の実際のブレークポイントに合わせた)では見出し文字列を隠して番号だけを丸いバッジで表示するようにした。移植元のCSSが持つ`.header-tabs strong { display: none }`と同じ挙動をv1由来のタブ実装に取り入れた形。ラベル文字列はDOMからは消さず、リンクの`aria-label`で常に読み上げられるようにしている。アクティブなタブはデスクトップでは下線、モバイルではアクセントカラーの塗りつぶしバッジで示す。`npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、390px/1280px)で番号のみ表示への切り替わりを確認済み。

## 2026-09-15 (14)

- feat: エンターテインメントコンピューティング2026特集号(情報処理学会論文誌、申請中)をresearchデータに追加。v1(`src/pages/index.astro`)には既にプレースホルダとして掲載されていた内容(タイトル・日付「2026年2月（申請中）」・学会リンク・動画)をそのままv2/data/portfolio.tsに転記した(en版も新規に対応する形で追加)。
- fix: `ResearchEntry`に`kind?: 'presentation' | 'journal'`を追加し、v3(研究者ポートフォリオ)のPublications/Presentations振り分けを修正。論文誌投稿(発表を伴わない)がPresentationsセクションに紛れ込んでいた挙動を直し、`kind: 'journal'`のものはPublicationsのみに表示されるようにした。
- improve: v3から引用情報コピーボタン(`CitationCopyButton.astro`/`lib/citation.ts`)を削除。不要と判断したため、関連コンポーネント・スクリプト・CSS・UI文言をまとめて削除した。
- `npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright)でPublications 4件(学会発表3件+論文誌1件)・Presentations 3件(学会発表のみ)・引用コピーボタンが表示されないことを確認済み。

## 2026-09-15 (13)

- improve: v3(研究者ポートフォリオ)を研究関連セクションだけに絞り、ナビゲーションをv1と同じパターンに揃えた。v1のヘッダーには既に全カテゴリ(制作物/趣味/研究テーマ/学会発表/スキル/学歴/資格・免許/作品集)のタブがあるため、v3で移植元の全セクション構成をそのまま再現すると内容が重複してしまう。`SectionId`を`interests`/`publications`/`presentations`の3つに絞り、Featured Projects・Skills・Education/History・Contactの各セクションとそれ専用のコンポーネント(`ProjectList`/`SkillGroup`/`Timeline`)を削除した。プロフィール本文・連絡先リンクはHero(常時表示の導入部)だけに一本化し、独立したAbout/Contactセクションとの重複表示を解消した。ナビゲーションは移植元の左サイドバーをやめ、v1自身が既に持つパターン(`src/layouts/BaseLayout.astro`の`sticky`ヘッダー+`toc-nav`、`.toc-link`/`.toc-active`のスクロール連動ハイライト)を`Header.astro`の2段構成(ブランド行+セクションタブ行)として移植した。これに伴い`Sidebar.astro`・`Avatar.astro`(顔写真の代わりのイニシャル表示)は不要になったため削除。`npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright)でセクション数・タブのスクロール連動ハイライト・スティッキーヘッダーの固定・デスクトップ/モバイル双方の表示を確認済み。

## 2026-09-15 (12)

- feat: 研究者ポートフォリオ風のデザインに切り替えられる`/v3`を追加。[emar27181/portfolio-taraba](https://github.com/emar27181/portfolio-taraba)というAstro製の研究者ポートフォリオテーマ(Atomic Design構成)を、このサイト自身のコンテンツで動くように移植した。新しいコンテンツファイルは作らず、`src/v3/data/adapter.ts`が既存の`src/v2/data/portfolio.ts`(v2と共有する唯一のソース)を研究者ポートフォリオ向けの形に組み替える。研究発表2件(インタラクション2024・EC2024)はPublications/Presentations両方に、日付の無い研究概要はResearch Interestsに、学歴/資格の履歴はタイムラインに、制作物はFeatured Projectsにそれぞれ対応させた。移植元にあるAwards/パレット選択/虹色モード/セクション別個別ページ/クライアントサイド言語切り替えは、実データが無い・このサイトの既存方式と食い違う等の理由で意図的に持ち込んでいない(理由はdocs/DESIGN.md参照)。サイドバー目次のスクロール連動ハイライト・ライト/ダーク切り替え・引用情報コピーは移植した。顔写真アセットがどこにも存在しないため、捏造せずイニシャル表示のAvatarで代替。v1ヘッダーに`graduation-cap`アイコンのリンクを、v2ヘッダーに`v3`チップを追加し、3モード間を相互リンクできるようにした。`tsconfig.json`に`@/v3/*`のパスエイリアスを追加。`npm run test`(54件、無変更)・`npm run build`・実ブラウザ(Playwright、デスクトップ/モバイル390px、ja/en、ライト/ダーク)で確認済み。

## 2026-09-15 (11)

- feat: モバイル用オンスクリーンキーに`/`・`.`・`-`・`~`を追加。絶対パス・`cd ..`・プロジェクトのslug・ホームディレクトリの表記に頻出するがスマホの記号レイアウト切り替えが要る記号を、既存の`.pf-mobile-keys`行(Tab・矢印・Enter・Clear)にまとめた。`app.ts`側は名前付きアクションに一致しない`data-key`をカーソル位置への文字挿入として扱う`insertAtCursor()`+`default`分岐を追加しただけで、記号ごとの個別処理や別リストは持たない(ボタンの`data-key`自体が挿入対象の文字)。実ブラウザ(390px幅)でカーソル位置(先頭・中間・末尾)への挿入が正しく行われること、行が折り返しても`Enter`が引き続き右端に来ることを確認済み。

## 2026-09-15 (10)

- fix: `sl`の機関車アニメーションが速すぎた(合計1.2秒程度)。`buildSlFrames`のフレーム間隔(`step`)を4→2、`app.ts`側の1フレームあたりの待ち時間を55ms→90msにし、合計で約4秒かけて横切るようにした。
- improve: モバイルのオンスクリーンキーで`Enter`だけ行の右端に単独で来るようにした(`.pf-mobile-keys__enter { margin-left: auto }`)。物理キーボードでEnterが右側の独立したキーであることに寄せた配置で、`Tab`・矢印・`Clear`は左側にまとまる。実ブラウザ(390px幅)でslの所要時間とEnterボタンの右端揃えを確認済み。

## 2026-09-15 (9)

- feat: モバイル用オンスクリーンキーに`←`/`↑`/`↓`/`→`(カーソル移動・コマンド履歴)と`Clear`(`Ctrl+L`相当)を追加。既存の`Tab`/`Enter`と同じ`.pf-mobile-keys`行にまとめ、下の「クイック起動ボタン」(`ls`等、タップは補完のみ)とは区別して、実際のキー操作の代替としてタップした瞬間に実行されるようにした。`app.ts`側は`historyUp()`/`historyDown()`/`moveCursor()`を新設し、キーボードの`ArrowUp`/`ArrowDown`ハンドラと共有することでロジックの重複を避けている。`.pf-mobile-keys`は均等幅の2ボタン列から、`.pf-mobile-commands`と同じ内容幅+折り返しのレイアウトに変更した。実ブラウザ(390px幅)でコマンド履歴の往復・カーソル移動・Clearの3つの挙動とデスクトップでの非表示を確認済み。

## 2026-09-15 (8)

- feat: `sl`イースターエッグを追加(`ls`を打ち間違えた定番ジョーク)。機関車のASCII art(`sl.ts`)が`.pf-ascii`のブロックを1つ使い回して横断アニメーションする。あわせて`cowsay`(吹き出しは英語固定・メッセージ文字数から罫線幅を計算)と`sudo make me a sandwich`/`make me a sandwich`(xkcdの定番ネタ)も追加した。いずれも`help`一覧には出さない隠しコマンドとして、既存の`coffee`/`vim`/`fortune`等と同じ扱いにしている。`sl`/`cowsay`/`sudo make me a sandwich`にユニットテストを追加(計54件)。実ブラウザでアニメーションの見た目のずれが無いことを確認済み。

## 2026-09-15 (7)

- improve: `rm -rf /`/`sudo rm -rf /`の削除演出を、本当に壊れたように見えるリアルな挙動に作り直した。従来は削除ログ→グリッチ→ブラックアウトのあと数秒で「just kidding.」と自動復旧していたが、実際の破壊的操作は自己修復しない。削除演出のあとは自動復旧をやめ、カーネルパニック風のダンプ画面(`showCrashScreen()`)を`.pf-window`全体に重ねて表示し、入力欄を`disabled`にしてモバイルのボタン類も隠す。JS側からは何も元に戻さず、実際にページを再読み込みするまでその状態が続く。削除ログの対象パスも決め打ちの文字列ではなく`getRoot(lang).children`(実際の仮想ファイルシステム)から動的に生成するようにした。あわせて、この変更で使われなくなった`.pf-window--blackout`のCSSを削除した。実ブラウザでrm実行〜クラッシュ画面〜(入力が効かないこと)〜ページ再読み込みでの復帰までを一通り確認し、ja/en両方でメッセージが正しく出ることも確認済み。

## 2026-09-15 (6)

- fix: モバイルのクイック起動ボタンのうち`ls`/`tree`/`whoami`/`help`(引数不要なもの)がタップした瞬間に実行されてしまっていた。`cd`/`cat`/`open`(引数が要るもの)と挙動が分かれていて一貫していなかったため、全ボタンをTab補完と同じ「入力欄を埋めるだけ」に統一した。実行するには常に`Enter`(ボタンまたはキーボード)を押す必要がある。実ブラウザでタップ直後は実行されず、続けて`Enter`を押すと実行されることを確認済み。

## 2026-09-15 (5)

- improve: ターミナルの入力欄が出力と別の固定バーになっており、実際のターミナルのように「最後の出力行の直後で入力する」感覚になっていなかった。`.pf-window__input-row`(プロンプト+入力欄)を`#pf-output`(スクロールする出力領域)の最後の子要素として配置し、`app.ts`の`printRaw()`が新しい行を常に入力行の手前に挿入する(`insertBefore`)ことで、入力行が常に最下段に固定されるようにした。`clear`コマンド・起動シーケンス・削除演出のリセットで使っていた`output.innerHTML = ''`は入力行ごと消してしまうため、入力行だけ残す`clearOutput()`に置き換えた。実ブラウザで起動〜コマンド実行〜`clear`〜`sudo rm -rf /`演出〜モバイルのクイック起動ボタンまで一通り確認し、入力行が常に最後に残ることを確認済み。

## 2026-09-15 (4)

- fix: v2の趣味・スキルがv1の最新内容から取り残されていた。v1(`src/pages/index.astro`)の趣味は現在7件(イラスト・スポーツ・アニメ漫画・ラーメン・猫・ゲーム・音楽)あるのに対し、v2の`data/portfolio.ts`は3件(イラスト・スポーツ・ゲーム)のみだった。v1の内容に合わせて残り4件を追加し(EN訳も追加)、スキルにも`Next.js`(way-point-mapプロジェクト自体が使っている技術なのに一覧から漏れていた)を追加した。あわせてイラスト趣味のInstagramリンクが誤ったハンドル(`amen27181`)になっていたのを`emar27181`(v1側で使われている正しいハンドル)に修正した。実ブラウザ(ja/en)で`hobbies`コマンドの出力を確認済み。

## 2026-09-15 (3)

- feat: スマホ幅(560px以下)の入力欄下に、`ls`/`cd`/`cat`/`tree`/`open`/`whoami`/`help`のクイック起動ボタンを追加。既存の`Tab`/`Enter`ボタンの下に配置し、`ls`/`tree`/`whoami`/`help`はタップで即実行、引数が要る`cd`/`cat`/`open`はタップで入力欄に`"cmd "`まで入れてカーソルを残す(続けて`Tab`ボタンで補完候補を出せる)。実ブラウザ(390px幅)で両方の挙動とデスクトップでの非表示を確認済み。

## 2026-09-15 (2)

- fix: モバイル幅(560px未満)の起動ログで、ASCII artが`EMAR`のみ表示され`27181`が欠けていた。`asciiArtFor(width)`の幅判定を撤廃し、常に`EMAR27181`をフルで描画するようにした(identityカードと同じく`.pf-ascii`はもともと折り返さず横スクロールする設計だったため、真に幅が足りない場合もスクロールで見える。実際は狭い幅ではフォントサイズ自体が12pxに縮むため、390px幅でもスクロール無しでフル表示できることを実機で確認)。

## 2026-09-15

- improve: start.shの起動ログを拡充し、ja/enの表示言語に追従するようにした。`boot.ts`の`bootLines`を`getBootLines(lang)`関数化し、`whoami`風のidentityカード(handle・GitHub/Mail/Labリンク。`profile.links`が唯一の情報源で、値自体は言語非依存なのでbox本体は1つだけ構築)、ポートフォリオの概要説明、基本操作の一覧を表示言語で出し分ける。装飾として`portfolio-shell v1.0.0`等の見出し行を緑強調(`pf-line-banner`)、`[ OK ]`のロード行を控えめな緑(`pf-line-ok`)、identityカードをbox-drawing文字の罫線(`pf-line-box`、ASCII artと同様に折り返さず横スクロール)で表示するようにterminal.cssにクラスを追加した。実ブラウザ(ja/en × desktop/mobile)でbox罫線のずれが無いこと・コンソールエラーが無いことを確認済み。

## 2026-09-10

- fix: v2ヘッダーの`v1`/`EN`/`terminal`チップ群が、狭い画面で`.pf-header`が折り返した際に左寄せになり「右上」から外れていた。`.pf-header__actions`に`margin-left: auto`を追加し、折り返し後の自分の行でも右端に固定されるようにした。

## 2026-09-09 (3)

- feat: v2ターミナルに基本コマンド`pwd`/`echo <text>`/`date`を追加。`help`とTab補完の一覧にも反映し、READMEのコマンド表も更新した(テスト4件追加、計51件)。

## 2026-09-09 (2)

- feat: v2にja/enの多言語切り替えを追加。v1と同じURL方式(`/v2`=ja、`/en/v2`=en)で、ヘッダーに`JA`/`EN`チップを設置した。`data/portfolio.ts`のプロフィール/制作物/研究/趣味/経歴を言語ごとに保持し`getPortfolio(lang)`で解決、`filesystem.ts`/`commands.ts`/`engine.ts`は`lang`を受け取って参照するだけにして翻訳データの二重管理を避けた(help一覧やエラーメッセージなど「シェルの言葉」自体は実機のUnixシェルに倣い英語のまま統一し、翻訳対象はポートフォリオの中身のみとした)。v1ヘッダーのターミナルアイコンも現在の言語に追従して`/v2`または`/en/v2`へ遷移するようにした。テスト13件を追加(計47件)。
- improve: start.shのブート完了メッセージに、サイトの正体(スクロールするページではなく操作するコンピュータであること、プロフィール等が実際のファイル/ディレクトリとして存在すること)を説明する行を追加した。

## 2026-09-09

- chore: 作業ブランチ `edit` を `feature/portfolio-update` に改名し(CLAUDE.mdの`feature/xxx`規約に合わせる)、2025-05-07以来分岐していた`main`をマージした。`pnpm-lock.yaml`は`main`側で同期する修正が入っていたが、`edit`側で確定した「npmに統一する」方針を優先して削除を採用した。

## 2026-09-08 (5)

- fix: v1の「このサイトについて」「私について」「学歴」が2025年5月から更新されておらず、「在学中の大学院生」という現状と食い違う内容になっていた(v1のgit履歴自体はこのセッションで一切変更していないことを確認済み)。v2側で確認済みの実情報(明治大学大学院理工学研究科情報科学専攻を2026年3月に修了、現在ITエンジニア)に合わせて本文と学歴を更新した。

## 2026-09-08 (4)

- improve: v1ヘッダーのv2切替リンクを、テキスト「v2」からLucideの`square-terminal`アイコンに変更。`src/icons/square-terminal.svg`をastro-iconのローカルアイコンとして追加し、`currentColor`でダーク/ライト両テーマに追従する。アクセシブルな名前は`sr-only`テキストとtitle属性で維持。

## 2026-09-08 (3)

- improve: start.shのブート完了メッセージを、単なるローディング演出から「ポートフォリオ=探索できるファイルシステム」というコンセプトが伝わる内容に変更。`whoami · ls · cd projects · open <slug> · help`という具体的な例コマンドを最初から提示するようにした。

## 2026-09-08 (2)

- improve: v2の起動導線を改善。入力欄に`./start.sh`をあらかじめ入力・選択した状態で表示し、ヒントも「Enterを押して起動」に変更(コマンドを自分で打つ必要がない)。スマホ幅(560px以下)では`Tab`/`Enter`のオンスクリーンボタンを追加(仮想キーボードに物理Tabキーがないため)。READMEにv2の使い方(コマンド一覧・操作方法)を追記。

## 2026-09-08

- test: v2のターミナルロジック(仮想ファイルシステム・コマンド・エンジン)にVitestのユニットテストを追加(37件)。`npm run test`で実行。以後のv2の変更はこれを品質担保の土台として、build/lint/testが全て通ることを確認してからコミットする。

## 2026-09-05

- feat: `/v2` に「ポートフォリオ = 1台のコンピュータ」コンセプトの新レイアウトを追加。Terminal(コマンド操作でプロフィール/制作物/研究/スキル/趣味を探索)と Collage(カードベースのGUI)の2モードを実装。v1(`/`)はデフォルトのまま変更せず、ヘッダーの`v1`/`v2`ボタンで相互に行き来できるようにした。
  - データソースは `src/v2/data/portfolio.ts` に一元化し、Terminal/Collage両モードがここだけを参照する。
  - 詳細構成は `docs/ARCHITECTURE.md`、見た目のトークンは `docs/DESIGN.md` を参照。

## 2026-08-27 (5)

- fix: 学会発表セクションはスマホでは1列に戻した。埋め込みYouTube動画とリンク一覧を含むため、半分幅では動画が小さくなり見づらいため。制作物・趣味は2列のまま維持する。

## 2026-08-27 (4)

- style: `Card`/`ProjectCard`をスマホでも2列表示に対応。`ProjectCard`の画像はスマホで正方形(`aspect-square`)にし、文字と余白も縮小した。説明文は`subheadingShort`を追加し、スマホでは短縮版、PCでは従来の文章を表示する(未指定なら`subheading`にフォールバック)。スキルセクションのGitHub統計画像は横長で読めなくなるため1列のまま。

## 2026-08-27 (3)

- update: 制作物カードを指定順に並び替え、ゲーム用ポートフォリオをFlex Railway Mapの下に移動。JUQSマップとp5.js演習ブラウザは削除せずコメントアウトして非表示にした。説明文から「自身が〜」の言い回しを削除し、色相・トーン推薦アプリの説明を「イラスト制作における色の推薦のデモ」と具体化した。

## 2026-08-27 (2)

- fix: `package-lock.json`と`pnpm-lock.yaml`が混在し、普段の作業はnpm・Netlifyのビルドはpnpmという食い違いが起きていた。`pnpm-lock.yaml`が`package.json`と同期しておらず`ERR_PNPM_OUTDATED_LOCKFILE`でデプロイが失敗したため、npmに統一して`pnpm-lock.yaml`を削除し、`netlify.toml`でビルドコマンドを`npm run build`に固定した。

## 2026-08-27

- add: 制作物セクションに Music Atlas / ThrowFlowDarts / TAKUS / Way Point Map / Window Brain の5サイトを追加。各サイトのスクリーンショットを`src/assets/`に配置し、日本語版・英語版の両方に反映した。あわせて最終更新日を更新。
- update: 制作物カードの表記をサイト自身の名前に合わせた(Waste Tax → TAKUS)。日本語版では制作物セクションを趣味セクションの前に移動し、上部の目次リンクも同じ順序に揃えた。
