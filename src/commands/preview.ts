import arg from "arg";
import { config } from "../lib/config";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { QiitaApi } from "../qiita-api";
import { startLocalChangeWatcher, startServer } from "../server/app";

export const preview = async (argv: string[]) => {
  const args = arg({}, { argv });

  const { accessToken } = await config.getCredential();

  const qiitaApi = new QiitaApi({
    token: accessToken,
  });
  const fileSystemRepo = await getFileSystemRepo();

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });

  const server = await startServer();
  startLocalChangeWatcher({
    server,
    watchPath: config.getItemsRootDir(),
  });
};
