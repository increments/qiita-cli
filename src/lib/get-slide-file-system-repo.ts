import { config } from "./config";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

export const getSlideFileSystemRepo = async () =>
  await SlideFileSystemRepo.build({
    dataRootDir: config.getItemsRootDir(),
  });

export const getSlideFileSystemRepoIfEnabled = async () => {
  const userConfig = await config.getUserConfig();
  if (!userConfig.experimentalSlideFeatureEnabled) return null;

  return await getSlideFileSystemRepo();
};
