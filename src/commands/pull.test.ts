import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { pull } from "./pull";

jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/sync-articles-from-qiita");
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);

describe("pull", () => {
  const qiitaApi = {} as ReturnType<typeof getQiitaApiInstance>;
  const fileSystemRepo = {} as ReturnType<typeof getFileSystemRepo>;

  beforeEach(() => {
    mockGetQiitaApiInstance.mockReset();
    mockGetFileSystemRepo.mockReset();
    mockSyncArticlesFromQiita.mockReset();

    mockGetQiitaApiInstance.mockReturnValue(qiitaApi);
    mockGetFileSystemRepo.mockReturnValue(fileSystemRepo);
    mockSyncArticlesFromQiita.mockImplementation();
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
