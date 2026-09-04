import { config } from "./config";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

export const getSlideFileSystemRepo = async () =>
  await SlideFileSystemRepo.build({
    dataRootDir: config.getItemsRootDir(),
  });
