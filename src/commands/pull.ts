import arg from "arg";
import { config } from "../lib/config";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { QiitaApi } from "../qiita-api";
import { startLocalChangeWatcher, startServer } from "../server/app";

export const pull = async (argv: string[]) => {
  const args = arg(
    {
      "--force": Boolean,
      "-f": "--force",
    },
    { argv }
  );

  const qiitaApi = await getQiitaApiInstance();
  const fileSystemRepo = await getFileSystemRepo();
  const isLocalUpdate = args["--force"];

  await syncArticlesFromQiita({ fileSystemRepo, qiitaApi, isLocalUpdate });
  console.log("Sync local articles from Qiita");
  console.log("Successful!");
};
