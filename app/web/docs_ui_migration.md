# UI部品置換計画（Buefy → 代替UI）

## 1. 現行使用部品と代替候補

| 現行相当 | 現行実装 | 主な使用箇所 | 代替候補（第一候補） |
|---|---|---|---|
| radio | `b-radio` | 検索条件の資料種別選択 | `input[type=radio]` + Bulmaクラス |
| switch | `b-switch` | 出現頻度/比率切替 | `input[type=checkbox]` + `role=switch` |
| slider | `b-slider` | 年代範囲、表示件数 | `input[type=range]`（範囲は2本構成） |
| button | `b-button` | 検索・編集・合算等 | `button` + Bulma `button` |
| modal | `b-modal`（呼び出し側） | 編集画面 | 自前 `dialog` または `div[role=dialog]` |
| collapse | `b-collapse` | 演算子一覧の折りたたみ | `details/summary` |
| icon | `b-icon` | ダウンロード/削除/開閉アイコン | Material Design Icons直接利用 or SVG |
| table | `b-table` | キーワード一覧・合算一覧 | `table` + 手動選択制御 |
| pagination相当 | `search-pagination` / `search-pagesize` | 検索結果一覧 | 既存カスタム部品維持（内部UIのみ置換） |

## 2. 互換要件（文言・状態・操作）

置換後も以下を維持する。

- ラベル文言: ボタン、テーブル見出し、モーダルタイトルを現行一致。
- disabled条件: 検索ボタンの空入力無効化、編集済み時ボタン無効化。
- loading表示: 検索中のローディング表示を継続。
- Enter操作: 検索入力で Enter 時に検索実行。

## 3. モーダル操作フロー（E2E観点）

再現対象フロー:

1. 検索結果編集モーダルを開く
2. 複数キーワードを選択
3. 「選択したキーワードを合算する」実行
4. 合算一覧から1件削除
5. 合算結果リンク/TSVの反映を確認

## 4. DOM依存挙動の確認方針

- `window.open`: 新規タブ遷移は opener 分離を維持する（`noopener,noreferrer` 指定）。
- `target="_blank"`: `rel="noopener noreferrer"` を明示付与して逆タブなびんぐを防止。

