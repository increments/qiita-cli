import type { FileSystemRepo } from "../lib/file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { QiitaItem } from "../lib/entities/qiita-item";
import type { QiitaApi, Item } from "../qiita-api";
import {
  QiitaForbiddenError,
  QiitaForbiddenOrBadRequestError,
} from "../qiita-api";
import { publish } from "./publish";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/sync-articles-from-qiita");
// chalk is ESM-only; stub it so the dynamic import() in the error path
// works under ts-jest's CommonJS transform.
jest.mock(
  "chalk",
  () => ({
    __esModule: true,
    default: {
      red: Object.assign((s: string) => s, { bold: (s: string) => s }),
    },
  }),
  { virtual: true },
);

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);

describe("publish", () => {
  const fileSystemRepo = {
    loadItems: jest.fn(),
    loadItemByBasename: jest.fn(),
    publishItem: jest.fn(),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const qiitaApi = {} as unknown as jest.Mocked<QiitaApi>;

  class ProcessExitError extends Error {
    constructor(public readonly code: string | number | null | undefined) {
      super(`process.exit(${code})`);
    }
  }

  let exitSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  const buildItem = (
    overrides: Partial<ConstructorParameters<typeof QiitaItem>[0]> = {},
  ) =>
    new QiitaItem({
      id: null,
      title: "Title",
      tags: ["qiita"],
      secret: false,
      updatedAt: "",
      organizationUrlName: null,
      rawBody: "# Title",
      name: "article",
      modified: true,
      isOlderThanRemote: false,
      itemsShowPath: "/items/show?basename=article",
      published: false,
      itemPath: "/data_root_dir/public/article.md",
      slide: false,
      ignorePublish: false,
      postingCampaignUuid: null,
      agreedPostingCampaignTerm: false,
      ...overrides,
    });

  const buildResponseItem = (overrides: Partial<Item> = {}): Item => ({
    id: "new-item-id",
    title: "Title",
    body: "# Title",
    tags: [{ name: "qiita" }],
    private: false,
    organization_url_name: null,
    coediting: false,
    created_at: "2026-09-01T00:00:00+09:00",
    updated_at: "2026-09-01T00:00:00+09:00",
    slide: false,
    posting_campaign_uuid: null,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    mockSyncArticlesFromQiita.mockResolvedValue();

    fileSystemRepo.loadItems.mockResolvedValue([]);
    fileSystemRepo.loadItemByBasename.mockResolvedValue(null);

    exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((code?: string | number | null) => {
        throw new ProcessExitError(code);
      });
    logSpy = jest.spyOn(console, "log").mockImplementation();
    errorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("when a new article (id is null) is given by basename", () => {
    it("publishes it through the repository and reports it as posted", async () => {
      const item = buildItem();
      fileSystemRepo.loadItemByBasename.mockResolvedValue(item);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem(),
        posted: true,
      });

      await publish(["article"]);

      expect(fileSystemRepo.publishItem).toHaveBeenCalledWith(item, qiitaApi);
      expect(logSpy).toHaveBeenCalledWith("Posted: article -> new-item-id");
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("when an already published article (id is present) is given by basename", () => {
    it("publishes it through the repository and reports it as updated", async () => {
      const item = buildItem({ id: "existing-item-id", published: true });
      fileSystemRepo.loadItemByBasename.mockResolvedValue(item);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem({ id: "existing-item-id" }),
        posted: false,
      });

      await publish(["article"]);

      expect(fileSystemRepo.publishItem).toHaveBeenCalledWith(item, qiitaApi);
      expect(logSpy).toHaveBeenCalledWith(
        "Updated: article -> existing-item-id",
      );
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("with --all", () => {
    it("publishes only the articles that differ from the remote or are unpublished", async () => {
      fileSystemRepo.loadItems.mockResolvedValue([
        buildItem({ name: "item-a", id: "id-a", published: true }),
        buildItem({
          name: "item-b",
          id: "id-b",
          published: true,
          modified: false,
        }),
        buildItem({ name: "item-c", modified: false }),
      ]);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem(),
        posted: true,
      });

      await publish(["--all"]);

      expect(
        fileSystemRepo.publishItem.mock.calls.map(([item]) => item.name),
      ).toStrictEqual(["item-a", "item-c"]);
    });

    it("skips an article whose ignorePublish is exactly true", async () => {
      fileSystemRepo.loadItems.mockResolvedValue([
        buildItem({ name: "item-a", id: "id-a", ignorePublish: true }),
      ]);

      await expect(publish(["--all"])).rejects.toThrow(ProcessExitError);

      expect(logSpy).toHaveBeenCalledWith("Nothing to publish");
      expect(fileSystemRepo.publishItem).not.toHaveBeenCalled();
    });

    it("does not skip an article whose ignorePublish is a truthy non-boolean", async () => {
      fileSystemRepo.loadItems.mockResolvedValue([
        buildItem({
          name: "item-a",
          id: "id-a",
          ignorePublish: "yes" as unknown as boolean,
        }),
      ]);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem({ id: "id-a" }),
        posted: false,
      });

      await publish(["--all"]);

      expect(fileSystemRepo.publishItem).toHaveBeenCalledTimes(1);
    });

    it("logs and exits 0 when there is nothing to publish", async () => {
      await expect(publish(["--all"])).rejects.toThrow(ProcessExitError);

      expect(logSpy).toHaveBeenCalledWith("Nothing to publish");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe("when the article is older than the remote", () => {
    it("exits with an error and does not call the API", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(
        buildItem({ id: "existing-item-id", isOlderThanRemote: true }),
      );

      await expect(publish(["article"])).rejects.toThrow(ProcessExitError);

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(fileSystemRepo.publishItem).not.toHaveBeenCalled();
    });

    it("publishes anyway with --force", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(
        buildItem({ id: "existing-item-id", isOlderThanRemote: true }),
      );
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem({ id: "existing-item-id" }),
        posted: false,
      });

      await publish(["article", "--force"]);

      expect(fileSystemRepo.publishItem).toHaveBeenCalledTimes(1);
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("when the article has no tags", () => {
    it("exits with a validation error and does not call the API", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(
        buildItem({ tags: [] }),
      );

      await expect(publish(["article"])).rejects.toThrow(ProcessExitError);

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(fileSystemRepo.publishItem).not.toHaveBeenCalled();
    });
  });

  describe("when the frontmatter has a wrong type", () => {
    it("reports the frontmatter error instead of the validation error", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(
        buildItem({ tags: "qiita" as unknown as string[] }),
      );

      await expect(publish(["article"])).rejects.toThrow(ProcessExitError);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("tagsは配列で入力してください"),
      );
      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("タグを入力してください"),
      );
    });
  });

  describe("when the API rejects the request with 403", () => {
    it("rethrows it as QiitaForbiddenOrBadRequestError", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(buildItem());
      fileSystemRepo.publishItem.mockRejectedValue(
        new QiitaForbiddenError("Forbidden"),
      );

      await expect(publish(["article"])).rejects.toThrow(
        QiitaForbiddenOrBadRequestError,
      );
    });
  });

  describe("when the basename is not found", () => {
    it("reports it as not found and exits 1", async () => {
      fileSystemRepo.loadItemByBasename.mockResolvedValue(null);

      await expect(publish(["unknown"])).rejects.toThrow(ProcessExitError);

      expect(errorSpy).toHaveBeenCalledWith("Error: 'unknown' is not found");
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
