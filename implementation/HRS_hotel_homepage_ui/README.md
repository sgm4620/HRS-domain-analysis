# HRS Grand Hotel

HRS Grand Hotel 公式サイト風のWeb予約システムです。`javac` は不要で、ブラウザだけで動作します。

## 実行方法

PowerShellで次を実行します。

```powershell
cd HRS_hotel_homepage_ui
.\run.bat
```

または、以下のファイルをブラウザで直接開いても動作します。

```text
hotel_homepage/index.html
```

## 主な内容

- ホテル名を `HRS Grand Hotel` に統一
- トップページに外観画像を大きく表示
- スタンダード、デラックス、スイートの客室画像を客室一覧・予約画面に表示
- アクセスタブを追加し、住所を `東京都新宿区大久保 3-4-1` に設定
- 予約フォームの氏名を「姓」「名」に分割
- 大隈講堂の雰囲気を抽象化したオリジナルSVGロゴを使用
- スクロール時にカードが浮き上がるように表示される演出を追加
- 黒・ネイビー・ゴールドを基調にした5つ星ホテル風UI

## 画面とコードの対応

```text
hotel_homepage/index.html        presentation層の画面構造
hotel_homepage/css/style.css     presentation層の見た目
hotel_homepage/js/presentation.js UIイベント処理
hotel_homepage/js/application.js application層の予約・チェックイン・チェックアウト処理
hotel_homepage/js/domain.js      domain層の Customer / Room / Reservation など
hotel_homepage/js/datasource.js  datasource層の localStorage 保存処理
hotel_homepage/assets/logo.svg   ホテルロゴ
```

## 操作の流れ

1. トップまたは予約画面から宿泊予約を作成する
2. 表示された予約番号をチェックイン欄へ入れる
3. チェックインすると部屋番号が割り当てられる
4. その部屋番号でチェックアウトすると宿泊料が計算される
