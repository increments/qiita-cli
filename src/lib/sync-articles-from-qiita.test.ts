import type { Item, QiitaApi } from "../qiita-api";
import type { FileSystemRepo } from "./file-system-repo";
import { syncArticlesFromQiita } from "./sync-articles-from-qiita";
import { config } from "./config";

jest.mock("./config");
const mockConfig = jest.mocked(config);

describe("syncArticlesFromQiita", () => {
  const qiitaApi = {
    authenticatedUserItems: () => {},
  } as unknown as QiitaApi;
  const fileSystemRepo = {
    saveItems: () => {},
  } as unknown as FileSystemRepo;

  const mockAuthenticatedUserItems = jest.spyOn(
    qiitaApi,
    "authenticatedUserItems",
  );
  const mockSaveItems = jest.spyOn(fileSystemRepo, "saveItems");
  const mockGetUserConfig = jest.spyOn(mockConfig, "getUserConfig");

  const items = [{ private: false }, { private: true }] as Item[];

  beforeEach(() => {
    mockAuthenticatedUserItems.mockReset();
    mockSaveItems.mockReset();
    mockGetUserConfig.mockReset();

    mockAuthenticatedUserItems.mockImplementation(async (page?: number) => {
      if (page && page < 2) return items;
      return [];
    });
    mockSaveItems.mockImplementation();
  });

  describe("with userConfig", () => {
    describe("when includePrivate is true", () => {
      it("called saveItems with all item", async () => {
        mockGetUserConfig.mockImplementation(async () => ({
          includePrivate: true,
        }));

        await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });

        expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(1, 1, 100);
        expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(2, 2, 100);
        expect(mockAuthenticatedUserItems).toBeCalledTimes(2);
        expect(mockSaveItems).toHaveBeenCalledWith(items, false);
        expect(mockSaveItems).toBeCalledTimes(1);
      });
    });

    describe("when includePrivate is false", () => {
      it("called saveItems with only public item", async () => {
        mockGetUserConfig.mockImplementation(async () => ({
          includePrivate: false,
        }));

        await syncArticlesFromQiita({ fileSystemRepo, qiitaApi });

        expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(1, 1, 100);
        expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(2, 2, 100);
        expect(mockAuthenticatedUserItems).toBeCalledTimes(2);
        expect(mockSaveItems).toHaveBeenCalledWith([items[0]], false);
        expect(mockSaveItems).toBeCalledTimes(1);
      });
    });
  });

  describe("with forceUpdate", () => {
    const expectSaveItemsToBeCalledWithForceUpdate = async (
      forceUpdate: boolean,
    ) => {
      mockGetUserConfig.mockImplementation(async () => ({
        includePrivate: true,
      }));

      await syncArticlesFromQiita({
        fileSystemRepo,
        qiitaApi,
        forceUpdate,
      });

      expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(1, 1, 100);
      expect(mockAuthenticatedUserItems).toHaveBeenNthCalledWith(2, 2, 100);
      expect(mockAuthenticatedUserItems).toBeCalledTimes(2);
      expect(mockSaveItems).toHaveBeenCalledWith(items, forceUpdate);
      expect(mockSaveItems).toBeCalledTimes(1);
    };

    describe("when forceUpdate is true", () => {
      it("called saveItems without forceUpdate", async () => {
        await expectSaveItemsToBeCalledWithForceUpdate(true);
      });
    });

    describe("when forceUpdate is false", () => {
      it("called saveItems without forceUpdate", async () => {
        await expectSaveItemsToBeCalledWithForceUpdate(false);
      });
    });
  });
});
