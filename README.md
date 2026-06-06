# iiiishii — Portfolio

黒ベース＋細い黄色アクセントの、エンジニア向けポートフォリオサイト。
フレームワーク・バンドラーなしの静的サイト（HTML / CSS / TypeScript）です。

## 構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | ページ本体（Hero / About / Skills / Projects / Experience / Contact） |
| `styles.css` | テーマ・レイアウト・アニメーション |
| `main.ts` | スクロール演出・ナビ・タイピング等のインタラクション（TypeScript ソース） |
| `main.js` | `main.ts` をコンパイルした成果物（`index.html` が読み込む） |
| `tsconfig.json` | TypeScript 設定 |
| `CNAME` | カスタムドメイン設定（GitHub Pages 用。自宅サーバー運用で不要なら削除可） |

## ビルド

`main.ts` を編集したら、TypeScript をコンパイルして `main.js` を生成します。

```sh
npx tsc
```

CSS / HTML はビルド不要です。

## ローカルで確認

静的ファイルなので、任意の HTTP サーバーで配信できます。

```sh
# Python
python -m http.server 8000
# または Node
npx serve
```

ブラウザで <http://localhost:8000> を開きます。

## デプロイ（自宅サーバー）

`index.html` / `styles.css` / `main.js` と、必要なら `CNAME` を
Web サーバー（nginx / Apache 等）の公開ディレクトリに置くだけです。

## 内容の差し替え

仮テキストには `<!-- TODO: 差し替え -->` コメントを付けています。主な編集箇所:

- **名前・肩書き・キャッチ**: `index.html` の Hero セクション
- **肩書きのタイピング候補**: `main.ts` の `phrases` 配列
- **自己紹介・プロフィール**: About セクション
- **スキル**: Skills セクションの `.tag`
- **制作物**: Projects セクションの各 `.project-card`（タイトル・説明・タグ・リンク）
- **経歴**: Experience セクションの `.timeline-item`
- **連絡先リンク**: Contact セクションの各 `href`（GitHub / X / Email）

### テーマカラー

色は `styles.css` 冒頭の `:root` 変数で一括変更できます（`--accent` がアクセントの黄色）。
