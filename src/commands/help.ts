export const helpText = `USAGE:
qiita <COMMAND> [<OPTIONS>]

COMMAND:
  init                    記事をGitHubで管理するための初期設定
  login                   Qiita APIの認証認可
  new [<basename>] ...    新しい記事を追加
  preview                 コンテンツをブラウザでプレビュー
  publish <basename> ...  記事を投稿、更新
  publish --all           全ての記事を投稿、更新
  pull                    記事ファイルをQiitaと同期
  version                 qiita-cliのバージョンを表示
  help                    ヘルプを表示

OPTIONS:
  --config <config_dir>
    qiita-cliの設定情報を配置するディレクトリを指定

  --root <root_dir>
    記事ファイルをダウンロードするディレクトリを指定

  --verbose
    詳細表示オプションを有効

詳細についてはReadme(https://github.com/increments/qiita-cli)をご覧ください
`;

export const help = () => {
  console.log(helpText);
};
