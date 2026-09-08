# Changelog

## 2026-09-05

- feat: `/v2` に「ポートフォリオ = 1台のコンピュータ」コンセプトの新レイアウトを追加。Terminal(コマンド操作でプロフィール/制作物/研究/スキル/趣味を探索)と Collage(カードベースのGUI)の2モードを実装。v1(`/`)はデフォルトのまま変更せず、ヘッダーの`v1`/`v2`ボタンで相互に行き来できるようにした。
  - データソースは `src/v2/data/portfolio.ts` に一元化し、Terminal/Collage両モードがここだけを参照する。
  - 詳細構成は `docs/ARCHITECTURE.md`、見た目のトークンは `docs/DESIGN.md` を参照。
