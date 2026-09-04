import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { config } from "../lib/config";
import { startLocalChangeWatcher, startServer } from "../server/app";
import { preview } from "./preview";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/sync-articles-from-qiita");
jest.mock("../lib/config");
jest.mock("../server/app");

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);
const mockConfig = jest.mocked(config);
const mockStartServer = jest.mocked(startServer);
const mockStartLocalChangeWatcher = jest.mocked(startLocalChangeWatcher);

describe("preview", () => {
  const fileSystemRepo = {
    getRootPath: jest.fn().mockReturnValue("/data/public"),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const slideFileSystemRepo = {
    getRootPath: jest.fn().mockReturnValue("/data/slides"),
  } as unknown as jest.Mocked<SlideFileSystemRepo>;

  const qiitaApi = {} as ReturnType<typeof getQiitaApiInstance>;
  const server = { address: () => null } as unknown as ReturnType<
    typeof startServer
  > extends Promise<infer T>
    ? T
    : never;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetSlideFileSystemRepo.mockResolvedValue(slideFileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    mockSyncArticlesFromQiita.mockResolvedValue();
    mockStartServer.mockResolvedValue(server);
    mockStartLocalChangeWatcher.mockImplementation();
  });

  describe("when the experimental slide feature is disabled (default)", () => {
    beforeEach(() => {
      mockConfig.getUserConfig.mockResolvedValue({
        includePrivate: false,
        host: "localhost",
        port: 8888,
        experimentalSlideFeatureEnabled: false,
      });
    });

    it("does not build a slide file system repo and watches only the article root", async () => {
      await preview();

      expect(mockGetSlideFileSystemRepo).not.toHaveBeenCalled();
      expect(mockStartLocalChangeWatcher).toHaveBeenCalledWith({
        server,
        watchPaths: ["/data/public"],
      });
    });
  });

  describe("when the experimental slide feature is enabled", () => {
    beforeEach(() => {
      mockConfig.getUserConfig.mockResolvedValue({
        includePrivate: false,
        host: "localhost",
        port: 8888,
        experimentalSlideFeatureEnabled: true,
      });
    });

    it("also watches the slide root", async () => {
      await preview();

      expect(mockGetSlideFileSystemRepo).toHaveBeenCalled();
      expect(mockStartLocalChangeWatcher).toHaveBeenCalledWith({
        server,
        watchPaths: ["/data/public", "/data/slides"],
      });
    });
  });
});
