import fs from "node:fs";
import path from "node:path";
import { config } from "../lib/config";

const publishWorkflowFileContent = `# Please set 'QIITA_TOKEN' secret to your repository
name: Publish articles

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: false

jobs:
  publish_articles:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: increments/qiita-cli/actions/publish@v1
        with:
          qiita-token: \${{ secrets.QIITA_TOKEN }}
          root: "."
`;

const rootDir = process.cwd();
const workflowsDirectoryPath = path.join(rootDir, ".github/workflows");
const publishWorkflowFilePath = path.join(
  workflowsDirectoryPath,
  "publish.yml"
);

const gitignoreFilePath = path.join(rootDir, ".gitignore");
const gitignoreFileContent = `.remote
node_modules
`;

export const init = async () => {
  console.log("設定ファイルを生成します。\n");

  if (!fs.existsSync(workflowsDirectoryPath)) {
    fs.mkdirSync(workflowsDirectoryPath, { recursive: true });
  }
  writeFile(publishWorkflowFilePath, publishWorkflowFileContent);
  writeFile(gitignoreFilePath, gitignoreFileContent);

  const userConfigFilePath = config.getUserConfigFilePath();
  const userConfigDir = config.getUserConfigDir();
  if (!fs.existsSync(userConfigFilePath)) {
    fs.mkdirSync(userConfigDir, { recursive: true });
  }
  const userConfigFileContent = JSON.stringify(
    await config.getUserConfig(),
    null,
    2
  );
  writeFile(userConfigFilePath, userConfigFileContent);

  await printNextSteps();
};

const writeFile = (path: string, content: string) => {
  console.log(`  Creating ${path}`);
  if (!fs.existsSync(path)) {
    fs.writeFile(path, content, { encoding: "utf8" }, (err) => {
      if (err) throw err;
    });
    console.log(`     Created!\n`);
  } else {
    console.log(`     Already exists.\n`);
  }
};

const printNextSteps = async () => {
  const chalk = (await import("chalk")).default;
  console.log(`Success! ✨

次のステップ:

  1. トークンを作成してログインをしてください。
    ${chalk.bold("npx qiita login")}

  2. 記事のプレビューができるようになります。
    ${chalk.bold("npx qiita preview")}
  `);
};
