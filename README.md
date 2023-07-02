# Qiita CLI、Qiita Preview へようこそ！

Qiita CLI とは、手元の環境で記事の執筆・プレビュー・投稿ができるツールです。
Qiita CLI を使うことで、普段お使いのエディタなどを使って記事の執筆・投稿がしやすくなります。

> Qiita CLI、Qiita Preview は現在ベータ版です。<br>破壊的なアップデートなどが頻繁にされる可能性がございますのでご了承ください。<br>不具合やご意見などございましたら[Qiita Discussions](https://github.com/increments/qiita-discussions/discussions)へご投稿ください。

## ご利用の前に

Qiita CLI、Qiita Preview を利用されたら、[利用規約](https://qiita.com/terms)、[プライバシーポリシー](https://qiita.com/privacy)に同意したものとみなします。

[コミュニティガイドライン](https://help.qiita.com/ja/articles/qiita-community-guideline) をご確認ください。
みんながより良い体験をするためのマナーについて書かれています。

また、記事を書く上で意識すると望ましいもの、気をつけるべき点を[良い記事を書くためのガイドライン](https://help.qiita.com/ja/articles/qiita-article-guideline)にまとめています。

Qiita の Markdown 記法については[Markdown 記法 チートシート](https://qiita.com/Qiita/items/c686397e4a0f4f11683d)をご覧ください。

Qiita CLI、Qiita Preview は現在ベータ版です。
機能についても開発中のものがあります。
未実装の機能は以下の通りです。

- スライドモードのプレビュー

これらの機能に関しましては、正式版リリースまでに開発を行っていきます。
正式リリースまでは破壊的なアップデートなどが頻繁にされる可能性がございますのでご了承ください。

## Qiita CLI の導入方法について

### 1. 事前準備

Qiita CLI を使うには `Node.js 18.0.0` 以上が必要です。Node.js をはじめて使う場合はインストールする必要があります。

### 2. Qiita CLI をインストールする

Qiita のコンテンツを管理したいディレクトリで、以下のコマンドを実行します。

```console
npm install @qiita/qiita-cli
```

以下のコマンドでバージョンが表示されればインストール完了です。

```console
npx qiita version
```

### ３. Qiita CLI をアップデートする

Qiita CLI をアップデートする場合は以下のコマンドを実行します。

```console
npm install @qiita/qiita-cli@latest
```

## Qiita CLI のセットアップ方法について

### Qiita のトークンを発行する

以下の流れでトークンを発行してください。

- https://qiita.com/settings/applications へログインした状態でアクセスします。
- `設定 > アプリーケーション > 個人用アクセストークン` からトークンを発行します。
  - トークンの権限には「read_qiita」と「write_qiita」を設定します。

発行したトークンは`Qiita CLIのログイン`、`GitHubで記事を管理する`で利用します。

### Qiita CLI のログイン

以下のコマンドより発行したトークンの登録を行います。

```console
npx qiita login
```

```console
Enter your token: トークンを入力しEnterキーを押す
Hi ユーザー名!
```

トークンを登録することで、Qiita のアカウントと紐付けがされ、記事の取得や投稿、更新が行えるようになります。

## Qiita Preview の起動（プレビュー画面の表示）

本文の執筆は、ブラウザでプレビューしながら確認できます。ブラウザでプレビューするためには以下のコマンドを実行します。
コマンド実行時に、Qiita に投稿している記事がダウンロードされます。

```console
npx qiita preview
```

コマンド実行すると、Qiita Preview(プレビュー画面)にアクセスすることが可能になります。
プレビュー画面のデフォルトの URL は http://localhost:8888 です。

### 記事ファイルの配置について

1 つの記事の内容は、1 つの markdown ファイル（◯◯.md）で管理します。
記事ファイルは`public`ディレクトリ内に含める必要があります。

```console
.
└─ public
   ├── newArticle001.md
   └── newArticle002.md
```

## Qiita CLI で記事を管理する

### 記事の作成

Qiita Preview 上の「新規記事作成」ボタン、または以下のコマンドで新規記事を作成できます。

```console
npx qiita new 記事のファイルのベース名
```

記事のファイルのベース名は自由に変更が可能です。

:::note warn
記事のファイル名を`newArticle001.md`にしたい場合は`newArticle001`にします。

例): `$ npx qiita new newArticle001`
:::

作成された記事ファイルの中身は次のようになっています。

```yaml
---
title: newArticle001 # 記事のタイトル
tags:
  - "" # タグ（ブロックスタイルで複数タグを追加できます）
private: false # true: 限定共有記事 / false: 公開記事
updated_at: "" # 記事を投稿した際に自動的に記事の更新日時に変わります
id: null # 記事を投稿した際に自動的に記事のUUIDに変わります
organization_url_name: null # 関連付けるOrganizationのURL名
---
# new article body
```

ファイルの上部には`---`に挟まれる形で記事の設定（Front Matter）が含まれています。
ここに記事のタイトル（title）やタグ(tags)などを yaml 形式で指定します。

### 記事の投稿・更新

Qiita Preview 上の「記事を投稿する」ボタン、または以下のコマンドで投稿・更新ができます。

```console
npx qiita publish 記事のファイルのベース名
```

以下のコマンドで全ての記事を反映させることができます。

```console
npx qiita publish --all
```

### 記事の削除

Qiita CLI、Qiita Preview から記事の削除はできません。
`public`ディレクトリから markdown ファイルを削除しても Qiita 上では削除はされません。

[Qiita](https://qiita.com)上で記事の削除を行なえます。

## GitHub で記事を管理する

以下のコマンドを実行することで、

- .gitignore
- GitHub Actions のワークフローファイル
- public フォルダ

が生成されます。

```console
npx qiita init
```

### GitHub の設定について

以下の流れで設定を行うことで、GitHub の特定のブランチにコミットしたタイミングで記事の投稿や更新を行うことが可能になります。

1. GitHub にリポジトリを作成します。
1. https://github.com/[ユーザー名]/[リポジトリ名]/settings/secrets/actions から、シークレットに`QIITA_TOKEN`という名前で発行した Qiita のトークンを保存します。
1. qiita init を実行したディレクトリ全体を作成したリポジトリにプッシュします。

デフォルトは`main`または`master`ブランチにコミットがあった場合、自動で Qiita へ記事の投稿・更新がされます。
処理の実行の条件は`.github/workflows/publish.yml`から変更することが可能です。

## Qiita CLI のコマンド、オプションについて

### help

簡単なヘルプが見れます。

```console
npx qiita help
```

### pull

記事ファイルを Qiita と同期します。
Qiita 上で更新を行い、手元で変更を行っていない記事ファイルのみ同期されます。

```console
npx qiita pull
```

### version

qiita-cli のバージョンを確認できます。

```console
npx qiita version
```

## オプション

### --config \<config_dir>

qiita-cli の設定情報（`credentials.json`）を配置する・しているディレクトリを指定できます。

デフォルトでは`$XDG_CONFIG_HOME/qiita-cli`もしくは`$HOME/.config/qiita-cli`になっています。

例）

```console
npx qiita login --config ./my_conf/
npx qiita preview --config ./my_conf/
```

### --root \<root_dir>

記事ファイルがダウンロードされるディレクトリを指定できます。
デフォルトでは、カレントディレクトリになります。

例）

```console
npx qiita preview --root ./my_articles/
npx qiita publish c732657828b83976db47 --root ./my_articles/
```

### --verbose

詳細なログを出力できます。

```console
npx qiita login --verbose
npx qiita preview --verbose
```
