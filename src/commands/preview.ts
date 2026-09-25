import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { getUrlAddress } from "../lib/getUrlAddress";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";
import { startLocalChangeWatcher, startServer } from "../server/app";

export const preview = async () => {
  const qiitaApi = await getQiitaApiInstance();
  const fileSystemRepo = await getFileSystemRepo();
  const slideFileSystemRepo = await getSlideFileSystemRepo();
  const watchPaths = [
    fileSystemRepo.getRootPath(),
    slideFileSystemRepo.getRootPath(),
  ];

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });
  await syncSlidesFromQiita({ slideFileSystemRepo, qiitaApi });

  const server = await startServer();

  const address = server.address();
  const url = getUrlAddress(address);

  if (url) {
    const open = (await import("open")).default;
    await open(url);
  }

  startLocalChangeWatcher({
    server,
    watchPaths,
  });
};
