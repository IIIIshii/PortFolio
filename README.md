# iiiishii — Portfolio

プリメインアンプの前面パネルから着想した、エンジニア向けポートフォリオサイト。
黒のヘアライン金属 × 銀（IBM Plex Sans JP）× 銅のアクセントに、画面下部の操作できる
アンプ・フロントパネル（ドットマトリクスLCD ＋ SELECTOR ホイール）を備えた静的サイト
（HTML / CSS / TypeScript、フレームワークなし）です。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（トップレール / Hero / New Arrival / Projects / Blogs / Experience / フッター ＋ アンプ・フロントパネル） |
| `styles.css` | アンプ前面パネルのテーマ・コンポーネント・LCD・ホイールの見た目 |
| `main.ts` | SELECTOR ホイール制御・スクロール演出・ドットマトリクスLCD・時計（TypeScript ソース） |
| `main.js` | `main.ts` をコンパイルした成果物（`index.html` が読み込む） |
| `tsconfig.json` | TypeScript 設定 |
| `CNAME` | カスタムドメイン設定（自宅サーバー運用で不要なら削除可） |

## アンプ・フロントパネル（画面下部）

画面下部に固定されたアンプの前面パネルが、ナビゲーションと現在地表示を兼ねます。

- **ドットマトリクスLCD**: 現在表示中のセクション名（`NOW VIEWING`）を 5×7 の LED ドットで表示
- **金属パネル**: Contact ボタン（GitHub / X / Email）を配置
- **SELECTOR ホイール**（右側・上下2領域をまたぐ）でセクションを移動します
  - **ドラッグ**: ホイールを回すと、回転量に同期してページが連続スクロール
  - **ホイール（スクロール）**: ホイール上でスクロールするとページがスクロール
  - **クリック（min / max の目盛り）**: 先頭（Home）／末尾（Experience）へジャンプ
  - **キーボード**: ホイールにフォーカス → 矢印キー（前後のセクション）/ Home / End
  - ページを普通にスクロールすると、ホイールが現在地に合わせて回転します

トップレールには時計（`rail-clock`）とバージョン表示があります。

## ビルド

`main.ts` を編集したら、TypeScript をコンパイルして `main.js` を生成します。

```sh
npx tsc
```

CSS / HTML はビルド不要です。

## ローカルで確認

```sh
python -m http.server 8000   # → http://localhost:8000
# または: npx serve
```

## デプロイ（自宅サーバー）

`index.html` / `styles.css` / `main.js`（＋必要なら `CNAME`）を Web サーバーの公開ディレクトリに置くだけです。

## 内容の差し替え

仮テキストには `<!-- TODO: 差し替え -->` コメントを付けています。主な編集箇所:

- **名前・肩書き・キャッチ**: `index.html` の Hero セクション
- **最新トピック**: New Arrival セクションの `.arrival-panel`（日付・タイトル・説明）
- **制作物**: Projects セクションの各 `.project-card`（タイトル・説明・タグ・リンク）
- **ブログ記事**: Blogs セクションの各 `.blog-item`（日付・タイトル・説明・リンク）
- **経歴・イベント**: Experience セクションの各 `.timeline-item`
- **連絡先リンク**: アンプパネルの `.amp-contact` 内各 `href`（GitHub / X / Email）

> セクションを増減する場合は、`index.html` の `<section id="...">` と `.sr-nav` のリンク、
> `main.ts` 冒頭の `SECTIONS` / `NAMES` 配列、ホイールの `.knob-tick`（`data-index` / 角度 `--a`）を揃えてください。
> LCD に新しい文字を表示するときは、`main.ts` の `FONT_5x7` にその字形を追加します。

### テーマカラー

色は `styles.css` 冒頭の `:root` 変数で一括変更できます
（`--silver*` が銀、`--copper*` が銅のアクセント、`--metal-*` が金属の階調、`--glow` が発光色）。

## デザインの履歴

黒 × 黄のミニマル版（`v_1`）も残っています。戻したい場合:

```sh
git checkout v_1 -- index.html styles.css main.ts main.js README.md
```
