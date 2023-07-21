import process from "node:process";
import readline from "node:readline/promises";
import { config } from "../lib/config";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";

export const login = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const chalk = (await import("chalk")).default;
  console.log(`
以下のURLにアクセスしてトークンを発行してください。（「read_qiita」と「write_qiita」にチェックを入れてください）
  ${chalk.bold(
    "https://qiita.com/settings/tokens/new?read_qiita=1&write_qiita=1&description=qiita-cli"
  )}
  `);
  const token = await rl.question("発行したトークンを入力: ");
  rl.close();

  const qiitaApi = await getQiitaApiInstance({ token });
  const currentUser = await qiitaApi.authenticatedUser();

  await config.setCredential({
    name: "qiita",
    accessToken: token,
  });

  console.log(`Hi ${currentUser.id}!\n`);

  await printAvailableCommands();
};

const printAvailableCommands = async () => {
  const chalk = (await import("chalk")).default;
  console.log(`ログインが完了しました 🎉
以下のコマンドを使って執筆を始めましょう！

🚀 コンテンツをブラウザでプレビューする
  ${chalk.bold("npx qiita preview")}

🚀 新しい記事を追加する
  ${chalk.bold("npx qiita new (記事のファイルのベース名)")}

🚀 記事を投稿、更新する
  ${chalk.bold("npx qiita publish (記事のファイルのベース名)")}

💁 コマンドのヘルプを確認する
  ${chalk.bold("npx qiita help")}
  `);
};
