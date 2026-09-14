import arg from "arg";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepoIfEnabled } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";

export const pull = async (argv: string[]) => {
  const args = arg(
    {
      "--force": Boolean,
      "-f": "--force",
    },
    { argv },
  );

  const qiitaApi = await getQiitaApiInstance();
  const fileSystemRepo = await getFileSystemRepo();
  const slideFileSystemRepo = await getSlideFileSystemRepoIfEnabled();
  const forceUpdate = args["--force"];

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi, forceUpdate });
  console.log("Sync local articles from Qiita");

  if (slideFileSystemRepo) {
    await syncSlidesFromQiita({ slideFileSystemRepo, qiitaApi, forceUpdate });
    console.log("Sync local slides from Qiita");
  }

  console.log("Successful!");
};
