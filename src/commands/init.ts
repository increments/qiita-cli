import fs from "node:fs";
import path from "node:path";
import { config } from "../lib/config";

export const init = async () => {
  const rootDir = process.cwd();
  const workflowsDirectoryPath = path.join(rootDir, ".github/workflows");
  const publishWorkflowFilePath = path.join(
    workflowsDirectoryPath,
    "publish.yml"
  );
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
      - uses: increments/qiita-cli/actions/publish@v0
        with:
          qiita-token: \${{ secrets.QIITA_TOKEN }}
`;

  if (!fs.existsSync(workflowsDirectoryPath)) {
    fs.mkdirSync(workflowsDirectoryPath, { recursive: true });
  }
  writeFile(publishWorkflowFilePath, publishWorkflowFileContent);

  const gitignoreFilePath = path.join(rootDir, ".gitignore");
  const gitignoreFileContent = `.remote
node_modules
`;
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
};

const writeFile = (path: string, content: string) => {
  if (!fs.existsSync(path)) {
    fs.writeFile(path, content, { encoding: "utf8" }, (err) => {
      if (err) throw err;
      console.log(`Create ${path}`);
    });
  } else {
    console.log(`${path} is already exist`);
  }
};
