import { config } from "../lib/config";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { getUrlAddress } from "../lib/getUrlAddress";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { startLocalChangeWatcher, startServer } from "../server/app";

export const preview = async () => {
  const qiitaApi = await getQiitaApiInstance();
  const fileSystemRepo = await getFileSystemRepo();

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });

  const server = await startServer();

  const address = server.address();
  const url = getUrlAddress(address);

  if (url) {
    const open = (await import("open")).default;
    await open(url);
  }

  startLocalChangeWatcher({
    server,
    watchPath: config.getItemsRootDir(),
  });
};
