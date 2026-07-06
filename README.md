# HRS-domain-analysis

## 概要

このリポジトリは、ソフトウェア工学Aのチーム開発課題における
演習1「HRSのドメイン分析」の成果物を管理するためのものである。

対象システムはホテル予約システム（HRS）である。

## 演習1：ドメイン分析

HRSの問題領域を分析し、主要な概念と概念間の関係をUMLクラス図として表現した。
また、具体的な状況をUMLオブジェクト図として表現し、クラス図の妥当性を確認した。

## 成果物

- [ドメイン分析説明](docs/exercise1_domain_analysis.md)
- [UMLクラス図 PlantUML](diagrams/class_diagram.puml)
- [UMLオブジェクト図 PlantUML](diagrams/object_diagram.puml)
- [レビュー結果](reviews/exercise1_review.md)

## 作成した主な図

### UMLクラス図

HRSにおける利用者、予約、部屋、ホテル受付係、宿泊、宿泊料、支払いなどの主要概念と、それらの関係を表した。

### UMLオブジェクト図

具体例として、山田太郎が予約番号012345で101号室を予約し、宿泊につながる状況を表した。

## レビュー

レビューでは、主要な概念が網羅されているか、関係が自然に読めるか、実装寄りの内容になっていないかを確認した。
その結果、予約と部屋の多重度、宿泊料と支払いの関係を明確にした。

---

## 演習2：要求分析

HRSに期待される重要な動作として、以下の3つのユースケースを特定した。

1. 空室を確認して部屋を予約する
2. 予約番号でチェックインする
3. 宿泊料を精算してチェックアウトする

これらについて、UMLユースケース図、ユースケース記述、アクティビティ図を作成した。

## 演習2の成果物

- [ユースケース図 PlantUML](diagrams/usecase_diagram.puml)
- [ユースケース記述](docs/exercise2_usecase_descriptions.md)
- [予約のアクティビティ図 PlantUML](diagrams/activity_reservation.puml)
- [チェックインのアクティビティ図 PlantUML](diagrams/activity_checkin.puml)
- [チェックアウトのアクティビティ図 PlantUML](diagrams/activity_checkout.puml)
- [演習2レビュー結果](reviews/exercise2_review.md)

## 演習2の工夫点

ユースケース名を「予約」「チェックイン」「チェックアウト」のような単語だけにせず、
「空室を確認して部屋を予約する」「予約番号でチェックインする」「宿泊料を精算してチェックアウトする」のように、利用者にとって意味のある動詞句にした。

また、基本系列だけでなく、空室がない場合、予約番号が存在しない場合、支払いが完了しない場合などの代替・例外系列も記述した。

---

## 演習3：システム分析

演習2で作成したユースケースをもとに、HRSのシステム分析を行った。

本演習では、以下の3つのユースケースを対象に、UMLコラボレーション図とシステム分析クラス図を作成した。

1. 空室を確認して部屋を予約する
2. 予約番号でチェックインする
3. 宿泊料を精算してチェックアウトする

## 演習3の成果物

- [システム分析説明](docs/exercise3_system_analysis.md)
- [予約コラボレーション図 PlantUML](diagrams/collaboration_reservation.puml)
- [チェックインコラボレーション図 PlantUML](diagrams/collaboration_checkin.puml)
- [チェックアウトコラボレーション図 PlantUML](diagrams/collaboration_checkout.puml)
- [システム分析クラス図 PlantUML](diagrams/analysis_class_diagram.puml)
- [演習3レビュー結果](reviews/exercise3_review.md)

## 演習3の工夫点

バウンダリ、コントロール、エンティティを区別して分析した。

予約画面、チェックイン画面、チェックアウト画面をバウンダリクラスとし、利用者やホテル受付係とHRSのやり取りを表した。

また、予約処理、チェックイン処理、チェックアウト処理をコントロールクラスとして分けることで、各ユースケースの処理の責任を明確にした。

---

## 演習4：アーキテクチャ設計

演習3で作成したシステム分析モデルをもとに、HRSのアーキテクチャ設計を行った。

本演習では、変更容易性と保守性を考慮し、HRSを以下の3層を中心に分割した。

1. ユーザインタフェース層
2. アプリケーション層
3. ドメイン層

また、演習5の実装で必要になる保存処理は、実装上の補助としてデータソース相当の処理に分けた。

## 演習4の成果物

- [アーキテクチャ設計説明](docs/exercise4_architecture_design.md)
- [パッケージ図 PlantUML](diagrams/exercise4_package_diagram.puml)
- [設計クラス図 PlantUML](diagrams/exercise4_design_class_diagram.puml)
- [演習4レビュー結果](reviews/exercise4_review.md)

## 演習4の工夫点

演習3のバウンダリ、コントロール、エンティティの役割を保ちながら、実装しやすいパッケージ構成に整理した。

予約、チェックイン、チェックアウトの各処理を別々のコントロールクラスとして残すことで、処理の責任を分かりやすくした。

また、画面に関する変更がドメイン層に直接影響しにくいように、ユーザインタフェース層からアプリケーション層、アプリケーション層からドメイン層へ依存する構造にした。

---

## 演習5：詳細設計・実装

演習4で作成したパッケージ図と設計クラス図をもとに、HRSの実装を行った。

本演習では、予約、チェックイン、チェックアウトを実際に操作できるWebアプリケーションとして実装した。
画面は高級ホテルの公式サイトを想定し、ホテル名を HRS Grand Hotel とした。

## 演習5の成果物

- [詳細設計・実装説明](docs/exercise5_implementation.md)
- [実装プログラム](implementation/HRS_grand_hotel_luxury_ui)
- [演習5レビュー結果](reviews/exercise5_review.md)

## 演習5の工夫点

演習4の設計に対応するように、実装を presentation、application、domain、datasource の役割に分けた。

予約画面、チェックイン画面、チェックアウト画面に相当する処理は `presentation.js` にまとめ、予約処理、チェックイン処理、チェックアウト処理は `application.js` にまとめた。

利用者、予約、部屋、宿泊、宿泊料、支払いなどのデータは `domain.js` にまとめ、保存処理は `datasource.js` に分けた。

また、実行時にブラウザ上で予約、チェックイン、チェックアウトまでデモできるようにした。
