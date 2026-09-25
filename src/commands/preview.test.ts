import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";
import { startLocalChangeWatcher, startServer } from "../server/app";
import { preview } from "./preview";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/sync-articles-from-qiita");
jest.mock("../lib/sync-slides-from-qiita");
jest.mock("../server/app");

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);
const mockSyncSlidesFromQiita = jest.mocked(syncSlidesFromQiita);
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
    mockSyncSlidesFromQiita.mockResolvedValue();
    mockStartServer.mockResolvedValue(server);
    mockStartLocalChangeWatcher.mockImplementation();
  });

  it("watches both the article and slide roots and syncs slides", async () => {
    await preview();

    expect(mockSyncSlidesFromQiita).toHaveBeenCalledWith({
      slideFileSystemRepo,
      qiitaApi,
    });
    expect(mockStartLocalChangeWatcher).toHaveBeenCalledWith({
      server,
      watchPaths: ["/data/public", "/data/slides"],
    });
  });
});
