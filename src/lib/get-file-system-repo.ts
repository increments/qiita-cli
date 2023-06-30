import { config } from "./config";
import { FileSystemRepo } from "./file-system-repo";

export const getFileSystemRepo = async () =>
  await FileSystemRepo.build({
    dataRootDir: config.getItemsRootDir(),
  });
