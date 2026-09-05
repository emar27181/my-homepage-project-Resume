# Design (v2: Portfolio Terminal)

v1のデザイン規約(Tailwindのデフォルトスケール、shadcn由来のCSS変数)は変更していない。ここではv2 (`/v2`) だけで使う独自トークンを記録する。実体は `src/v2/styles/terminal.css` の `.pf-computer` 内のCSS変数1箇所のみ。

## カラー

| 用途               | 変数                       | 値                                      | 備考                                   |
| ------------------ | -------------------------- | --------------------------------------- | -------------------------------------- |
| 背景               | `--pf-bg`                  | `#0a0d0b`                               | ほぼ黒                                 |
| パネル/ウィンドウ  | `--pf-panel`               | `#0f1310`                               |                                        |
| 枠線               | `--pf-border`              | `#1f2b23`                               |                                        |
| アクセント(緑)     | `--pf-green`               | `#3ddc84`                               | プロンプト・見出し・アクティブなチップ |
| アクセント(暗い緑) | `--pf-green-dim`           | `#2a9d5c`                               | hover時の枠線など                      |
| 本文               | `--pf-text`                | `#d7ded9`                               |                                        |
| 補助テキスト       | `--pf-muted`               | `#7c8a80`                               |                                        |
| 信号(赤/黄)        | `--pf-red` / `--pf-yellow` | macOS風ウィンドウの信号ドットのみに使用 |

## タイポグラフィ

- フォントは全面的にmonospace(`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`)。
- 本文14px、入力欄は16px固定(iOS Safariの自動拡大を防ぐため。§05参照)。
- ASCII artは幅560px未満で3文字の"RYU"、560px以上で"NODOAME"を表示(`boot.ts#asciiArtFor`)。2つとも `asciiFont.ts` の同じ5行ブロックフォントから生成しており、手描きのASCII artを2つ持って食い違わせない設計。

## 操作部品の高さ

- ヘッダーのチップ(v1/collage/terminalの切り替えボタン)は24px高さ(補助操作の段階)。ターミナル入力欄は44pxのタッチ領域は取っていない(キーボード操作前提のテキスト入力のため)。

## 角の丸み

- ウィンドウ・カード・プレビューパネル: 8px (`border-radius: 8px`、v1の`--radius: 0.5rem`と同じ値に合わせている)。
- チップ・信号ドット: 完全な円(`border-radius: 9999px`)。

## レスポンシブ

- 860px未満でターミナルとプレビューパネルを縦積みに切り替え(`.pf-terminal-layout`)。
- `body`に`overflow-x: hidden`を明示し、入力欄・ウィンドウ・プレビューパネルすべてに`min-width: 0`を指定。実測: 390px幅で`document.documentElement.scrollWidth === clientWidth`を確認済み(横スクロールが出ない)。

## 出典

- 44px/24pxの操作部品の2段階、16px固定の入力欄という一般則はCLAUDE運用ルールの持ち歩くフロントエンド規約(Apple HIG 44pt / WCAG 2.2 AA 2.5.8 / iOS Safariのズーム挙動)に準拠しており、v2でも同じ下限だけは踏襲している(ただしv2はキーボード入力中心のUIのため、タッチ領域44pxを機械的に全部品へ適用してはいない)。
