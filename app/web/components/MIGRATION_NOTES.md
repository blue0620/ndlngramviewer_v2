# Vue 3 / Nuxt Components Migration Notes

## 手動確認シナリオ（段階移行中のE2E相当）

1. 検索入力: キーワードを入力し、検索を実行できること。
2. API呼び出し: URLクエリ（`keyword`, `size`, `from`）が更新されること。
3. 結果表示: 検索結果テーブルとページネーションが表示されること。
4. チャート描画: 編集モーダルまたは分布チャートで `LineChart` が描画されること。
5. 合算操作: 2件以上選択して合算・リンク取得・TSVダウンロードが動作すること。

## 外部ライブラリ import 抽出（`app/web/components/**`, `app/web/pages/index.vue`）

- `chart.js`
  - `app/web/components/chart/NChart.vue`
  - `app/web/components/chart/LineChart.vue`
- `vue-chartjs`
  - `app/web/components/chart/LineChart.vue`
- `axios`（`index.vue` 直参照ではなく、`search-service` 経由）
  - `app/web/src/service/search-service.ts`
- `buefy`
  - 旧実装で `SearchResultEditor.vue` の `DialogProgrammatic`、`b-table` / `b-button` / `b-icon` を利用
  - Nuxt3移行方針で廃止

## 互換性方針

- `LineChart.js` (Vue 2 + vue-chartjs v3 + chart.js v2) は `LineChart.vue` へ移植。
- Vue 3 側では `vue-chartjs` + `chart.js` の登録方式（`ChartJS.register`）を利用。
- 時系列は adapter 依存を避けるため `x: number (year)` の `linear` 軸で扱う。
- UI は `buefy` を使わず、Bulma の素のマークアップ（`button`, `table`, `pagination`）へ寄せる。
