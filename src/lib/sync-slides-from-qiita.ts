import { QiitaBetaFeatureRequiredError } from "../qiita-api";
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
    let slides;
    try {
      slides = await qiitaApi.authenticatedUserSlides(page, per);
    } catch (err) {
      if (err instanceof QiitaBetaFeatureRequiredError) return false;
      throw err;
    }
    if (slides.length <= 0) {
      break;
    }

    await slideFileSystemRepo.saveSlides(slides, forceUpdate);
  }
  return true;
};
