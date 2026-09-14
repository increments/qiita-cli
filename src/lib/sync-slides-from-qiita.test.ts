import type { Slide, QiitaApi } from "../qiita-api";
import type { SlideFileSystemRepo } from "./slide-file-system-repo";
import { syncSlidesFromQiita } from "./sync-slides-from-qiita";

describe("syncSlidesFromQiita", () => {
  const qiitaApi = {
    authenticatedUserSlides: () => {},
  } as unknown as QiitaApi;
  const slideFileSystemRepo = {
    saveSlides: () => {},
  } as unknown as SlideFileSystemRepo;

  const mockAuthenticatedUserSlides = jest.spyOn(
    qiitaApi,
    "authenticatedUserSlides",
  );
  const mockSaveSlides = jest.spyOn(slideFileSystemRepo, "saveSlides");

  const slides = [{ uuid: "id-a" }, { uuid: "id-b" }] as Slide[];

  beforeEach(() => {
    mockAuthenticatedUserSlides.mockReset();
    mockSaveSlides.mockReset();

    mockAuthenticatedUserSlides.mockImplementation(async (page?: number) => {
      if (page && page < 2) return slides;
      return [];
    });
    mockSaveSlides.mockImplementation();
  });

  it("saves every page until an empty one is returned", async () => {
    await syncSlidesFromQiita({ slideFileSystemRepo, qiitaApi });

    expect(mockAuthenticatedUserSlides).toHaveBeenNthCalledWith(1, 1, 100);
    expect(mockAuthenticatedUserSlides).toHaveBeenNthCalledWith(2, 2, 100);
    expect(mockAuthenticatedUserSlides).toHaveBeenCalledTimes(2);
    expect(mockSaveSlides).toHaveBeenCalledWith(slides, false);
    expect(mockSaveSlides).toHaveBeenCalledTimes(1);
  });

  describe("with forceUpdate", () => {
    it("passes forceUpdate through to saveSlides", async () => {
      await syncSlidesFromQiita({
        slideFileSystemRepo,
        qiitaApi,
        forceUpdate: true,
      });

      expect(mockSaveSlides).toHaveBeenCalledWith(slides, true);
    });
  });
});
