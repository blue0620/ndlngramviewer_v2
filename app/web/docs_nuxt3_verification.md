# Nuxt3移行 検証メモ（コード読解ベース）

本メモは `app/web/src/main.vue`（旧画面）と `app/web/pages/index.vue`（Nuxt3画面）および関連コンポーネント/サービスの実装比較により確認した結果。

## 1) 初回表示/直アクセス/検索/種別変更/ページング/ページサイズ

- 初回表示とクエリ直アクセス:
  - Nuxt3では `onBeforeMount` と `route.query` watch で `keyword`, `materialtype`, `groupstr`, `size`, `from` を取り込み、`runSearch()` を実行する。
- 検索:
  - 検索ボタンで `searchbutton()` が `groupstr` をクリアし `from=0` でルーター遷移し、watch 経由で再検索する。
- 種別変更:
  - `watch(radiomtype, runSearch)` により資料種別変更時に即時再検索する。
- ページング:
  - `search-pagination` は `keyword/size/from/materialtype/groupstr` をクエリに乗せてルーター遷移する。
- ページサイズ変更:
  - `search-pagesize` は `size` と `from=0` でルーター遷移する。

## 2) グラフ条件変更時の即時反映

- Nuxt3は `NgramChart.vue` 側で `props.ss/isRate/visibleValue/yearRange/yearfrequency` を watch し、データセットを再構築している。
- したがって、頻度/比率・年代レンジ・表示件数は再検索なしでグラフへ即時反映される。

## 3) モーダル合算/groupstr再検索/ダウンロードリンク

- モーダル合算:
  - `search-result-editor` で選択行から `groupstr` を生成し、`/?...&groupstr=...` を `window.open(..., "_blank", "noopener,noreferrer")` で実行。
- groupstr付き再検索:
  - Nuxt3トップ画面は `route.query.groupstr` を受けて `runSearch()` の API 呼び出しに `groupstr` を渡す。
- ダウンロードリンク生成:
  - 一覧: `downloadurl(keyword, materialtype, groupstr)` で `/download?keyword=...&size=10000...` を生成。
  - 年代総数TSV: `yearfrequency_${materialtype}.tsv`。
  - モーダル合算ダウンロード: 同じ `downloadurl(..., null, groupstr)` を `window.open` で呼ぶ。

## 4) エラー通知/リンクURL/文言/アクセシビリティ属性

- エラー通知:
  - `useSearchService` は Axiosエラーを `SearchServiceError` に正規化。
  - Nuxt3 `runSearch()` は `SearchServiceError` を捕捉して `Dialog.alert(error.message)` を表示。
- リンク先URL:
  - 外部リンクは `target="_blank" rel="noopener noreferrer"` を主に付与。
  - ただし Nuxt3の「検索結果の出現頻度をダウンロード」リンクは `target="_blank"` のみで `rel` 未付与（旧画面では付与済み）
- 文言:
  - ヒーロー、説明、検索UI、資料種別、編集導線は旧画面と同等。
- アクセシビリティ属性:
  - 演算子一覧トグルに `aria-controls/aria-expanded`。
  - ページネーションに `role="navigation"` と `aria-label`。
  - モーダルに `aria-role/aria-label/close-button-aria-label/aria-modal`。

## 5) 旧画面 vs Nuxt3 主要レスポンス差分（クエリ→API→表示）

- 共通:
  - どちらもクエリをURLに保持し、クエリ変化で検索APIを呼び、結果表示を更新する流れ。
  - `groupstr` を検索条件に含める挙動、ページング/ページサイズのルーター駆動は同等。
- 差分:
  - APIサービス層:
    - 旧画面は `src/service/search-service.ts` の関数群を直接利用。
    - Nuxt3は `composables/useSearchService.ts` に移行し、`runtimeConfig.public.apiBase` を基準にURL生成。
  - 返却値取り扱い:
    - 旧画面は `search(...).data` を使用。
    - Nuxt3は composable 側で `response.data` を返すため呼び出し側は `await search(...)` をそのまま使用。
  - グラフ描画:
    - 旧画面は `main.vue` 内で `datacollection` を組み立て `line-chart` に渡す。
    - Nuxt3は `NgramChart.vue` に責務を分離し、props watch で再構築。
