import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepoIfEnabled } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";
import { pull } from "./pull";

jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/sync-articles-from-qiita");
jest.mock("../lib/sync-slides-from-qiita");
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetSlideFileSystemRepoIfEnabled = jest.mocked(
  getSlideFileSystemRepoIfEnabled,
);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);
const mockSyncSlidesFromQiita = jest.mocked(syncSlidesFromQiita);

describe("pull", () => {
  const qiitaApi = {} as ReturnType<typeof getQiitaApiInstance>;
  const fileSystemRepo = {} as ReturnType<typeof getFileSystemRepo>;
  const slideFileSystemRepo = {} as NonNullable<
    Awaited<ReturnType<typeof getSlideFileSystemRepoIfEnabled>>
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetQiitaApiInstance.mockReturnValue(qiitaApi);
    mockGetFileSystemRepo.mockReturnValue(fileSystemRepo);
    mockGetSlideFileSystemRepoIfEnabled.mockResolvedValue(null);
    mockSyncArticlesFromQiita.mockImplementation();
    mockSyncSlidesFromQiita.mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
  });

  it("pulls articles", async () => {
    await pull([]);

    expect(mockSyncArticlesFromQiita).toHaveBeenCalledWith({
      fileSystemRepo,
      qiitaApi,
      forceUpdate: undefined,
    });
    expect(mockSyncArticlesFromQiita).toHaveBeenCalledTimes(1);
  });

  describe("when the slide repository is unavailable", () => {
    it("does not sync slides", async () => {
      await pull([]);

      expect(mockSyncSlidesFromQiita).not.toHaveBeenCalled();
    });
  });

  describe("when the slide repository is available", () => {
    beforeEach(() => {
      mockGetSlideFileSystemRepoIfEnabled.mockResolvedValue(
        slideFileSystemRepo,
      );
    });

    it("pulls slides as well", async () => {
      await pull([]);

      expect(mockSyncSlidesFromQiita).toHaveBeenCalledWith({
        slideFileSystemRepo,
        qiitaApi,
        forceUpdate: undefined,
      });
      expect(mockSyncSlidesFromQiita).toHaveBeenCalledTimes(1);
    });

    it("pulls slides with forceUpdate", async () => {
      await pull(["--force"]);

      expect(mockSyncSlidesFromQiita).toHaveBeenCalledWith({
        slideFileSystemRepo,
        qiitaApi,
        forceUpdate: true,
      });
    });
  });

  describe('with "--force" option', () => {
    it("pulls articles with forceUpdate", async () => {
      await pull(["--force"]);

      expect(mockSyncArticlesFromQiita).toHaveBeenCalledWith({
        fileSystemRepo,
        qiitaApi,
        forceUpdate: true,
      });
      expect(mockSyncArticlesFromQiita).toHaveBeenCalledTimes(1);
    });

    it("pulls articles with forceUpdate", async () => {
      await pull(["-f"]);

      expect(mockSyncArticlesFromQiita).toHaveBeenCalledWith({
        fileSystemRepo,
        qiitaApi,
        forceUpdate: true,
      });
    });
  });
});
