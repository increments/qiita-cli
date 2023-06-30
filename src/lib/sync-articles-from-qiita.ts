import type { QiitaApi } from "../qiita-api";
import type { FileSystemRepo } from "./file-system-repo";

export const syncArticlesFromQiita = async ({
  fileSystemRepo,
  qiitaApi,
}: {
  fileSystemRepo: FileSystemRepo;
  qiitaApi: QiitaApi;
}) => {
  const per = 100;
  for (let page = 1; page <= 100; page += 1) {
    const items = await qiitaApi.authenticatedUserItems(page, per);
    if (items.length <= 0) {
      break;
    }

    await fileSystemRepo.saveItems(items);
  }
};
