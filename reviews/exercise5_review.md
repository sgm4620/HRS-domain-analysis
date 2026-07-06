# 演習5 レビュー結果

## レビュー対象

- docs/exercise5_implementation.md
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/index.html
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/css/style.css
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/js/domain.js
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/js/application.js
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/js/presentation.js
- implementation/HRS_grand_hotel_luxury_ui/hotel_homepage/js/datasource.js

## レビュー項目

| 項目 | 結果 |
|---|---|
| 演習4のパッケージ図・設計クラス図に対応している | OK |
| 予約機能が動作する | OK |
| チェックイン機能が動作する | OK |
| チェックアウト機能が動作する | OK |
| 宿泊料が計算される | OK |
| 予約番号と部屋番号が画面に表示される | OK |
| presentation、application、domain、datasourceの役割が分かれている | OK |
| デモで操作できるUIになっている | OK |
| 画面の文言と見た目がホテル公式サイトとして自然である | OK |

## 確認内容

### 1. 予約

宿泊日、人数、客室種別、姓、名、連絡先を入力すると予約が作成され、予約番号が表示されることを確認した。

### 2. チェックイン

作成された予約番号を入力すると、予約情報が確認され、空いている部屋番号が割り当てられることを確認した。

### 3. チェックアウト

チェックイン時に割り当てられた部屋番号を入力すると、宿泊料が表示され、支払い済みとして記録されることを確認した。

### 4. 設計との対応

`presentation.js` はバウンダリ、`application.js` はコントロール、`domain.js` はエンティティ、`datasource.js` は保存処理に対応している。
そのため、演習4の設計を実装へ落とし込めている。

## 修正点

最初の実装では、予約直後のチェックイン時に、チェックイン対象の予約自身が空室判定に含まれてしまい、部屋を割り当てられない場合があった。
修正後は、チェックイン対象の予約番号を空室判定から除外し、予約直後でも正しく部屋を割り当てられるようにした。

また、発表時に操作しやすいように、トップページ、客室画像、アクセス情報、予約照会、スクロール時の表示演出を追加した。
