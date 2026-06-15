# iiiishii — Portfolio

プリメインアンプの前面パネルから着想した、エンジニア向けポートフォリオサイト。
黒のヘアライン金属 × 銀の細字（Rajdhani）に、操作できるロータリーノブ・ナビを備えた静的サイト（HTML / CSS / TypeScript、フレームワークなし）です。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（Hero / About / Skills / Projects / Experience / Contact）＋ノブ・ナビ |
| `styles.css` | 金属パネルのテーマ・コンポーネント・ノブの見た目 |
| `main.ts` | ロータリーノブ制御・スクロール演出・スクロールスパイ（TypeScript ソース） |
| `main.js` | `main.ts` をコンパイルした成果物（`index.html` が読み込む） |
| `tsconfig.json` | TypeScript 設定 |
| `CNAME` | カスタムドメイン設定（自宅サーバー運用で不要なら削除可） |

## ロータリーノブ・ナビ

画面右（スマホは右下）のノブが操作可能なセクションセレクタです。

- **クリック**: 外周の目盛り（00–05）を押すと該当セクションへ
- **ドラッグ**: ノブを回して離すと最寄りセクションにスナップ
- **ホイール**: ノブ上でスクロールすると前後のセクションへ
- **キーボード**: ノブにフォーカス → 矢印キー / Home / End
- ページを普通にスクロールすると、ノブが現在地に合わせて回転します

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
- **自己紹介・プロフィール**: About セクション
- **スキル**: Skills セクションの `.chip`
- **制作物**: Projects セクションの各 `.project-card`（タイトル・説明・タグ・リンク）
- **経歴**: Experience セクションの `.timeline-item`
- **連絡先リンク**: Contact セクションの各 `href`（GitHub / X / Email）

> セクションを増減する場合は、`index.html` の `<section id="...">` と、`main.ts` 冒頭の
> `SECTIONS` / `NAMES` 配列、ノブの `.knob-tick`（角度 `--a`）を揃えてください。

### テーマカラー

色は `styles.css` 冒頭の `:root` 変数で一括変更できます
（`--silver*` がアクセントの銀、`--metal-*` が金属の階調、`--glow` が発光色）。

## デザインの履歴

黒 × 黄のミニマル版（`v_1`）も残っています。戻したい場合:

```sh
git checkout v_1 -- index.html styles.css main.ts main.js README.md
```
