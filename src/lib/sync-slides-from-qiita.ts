import type { QiitaApi } from "../qiita-api";
import type { SlideFileSystemRepo } from "./slide-file-system-repo";

export const syncSlidesFromQiita = async ({
  slideFileSystemRepo,
  qiitaApi,
  forceUpdate = false,
}: {
  slideFileSystemRepo: SlideFileSystemRepo;
  qiitaApi: QiitaApi;
  forceUpdate?: boolean;
}) => {
  const per = 100;
  for (let page = 1; page <= 100; page += 1) {
    const slides = await qiitaApi.authenticatedUserSlides(page, per);
    if (slides.length <= 0) {
      break;
    }

    await slideFileSystemRepo.saveSlides(slides, forceUpdate);
  }
};
