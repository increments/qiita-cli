import type { QiitaApi } from "../qiita-api";
import type { FileSystemRepo } from "./file-system-repo";
import { config } from "./config";

export const syncArticlesFromQiita = async ({
  fileSystemRepo,
  qiitaApi,
  forceUpdate = false,
}: {
  fileSystemRepo: FileSystemRepo;
  qiitaApi: QiitaApi;
  forceUpdate?: boolean;
}) => {
  const per = 100;
  const userConfig = await config.getUserConfig();
  for (let page = 1; page <= 100; page += 1) {
    const items = await qiitaApi.authenticatedUserItems(page, per);
    if (items.length <= 0) {
      break;
    }

    const result = userConfig.includePrivate
      ? items
      : items.filter((item) => !item.private);
    await fileSystemRepo.saveItems(result, forceUpdate);
  }
};
