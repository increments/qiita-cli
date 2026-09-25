import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepoIfEnabled } from "../lib/get-slide-file-system-repo";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { syncArticlesFromQiita } from "../lib/sync-articles-from-qiita";
import { syncSlidesFromQiita } from "../lib/sync-slides-from-qiita";
import { QiitaItem } from "../lib/entities/qiita-item";
import { QiitaSlide } from "../lib/entities/qiita-slide";
import type { QiitaApi, Item, Slide } from "../qiita-api";
import {
  QiitaForbiddenError,
  QiitaForbiddenOrBadRequestError,
} from "../qiita-api";
import { publish } from "./publish";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/get-qiita-api-instance");
jest.mock("../lib/sync-articles-from-qiita");
jest.mock("../lib/sync-slides-from-qiita");
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
const mockGetSlideFileSystemRepoIfEnabled = jest.mocked(
  getSlideFileSystemRepoIfEnabled,
);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);
const mockSyncArticlesFromQiita = jest.mocked(syncArticlesFromQiita);
const mockSyncSlidesFromQiita = jest.mocked(syncSlidesFromQiita);

describe("publish", () => {
  const fileSystemRepo = {
    loadPublishTargets: jest.fn(),
    loadItemByBasename: jest.fn(),
    publishItem: jest.fn(),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const slideFileSystemRepo = {
    loadPublishTargets: jest.fn(),
    loadSlideByBasename: jest.fn(),
    publishSlide: jest.fn(),
  } as unknown as jest.Mocked<SlideFileSystemRepo>;

  const qiitaApi = {} as jest.Mocked<QiitaApi>;

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

  const buildSlide = (
    overrides: Partial<ConstructorParameters<typeof QiitaSlide>[0]> = {},
  ) =>
    new QiitaSlide({
      id: null,
      title: "Title",
      description: null,
      rawBody: "# Title",
      updatedAt: null,
      name: "deck",
      slidesShowPath: "/slides/show?basename=deck",
      published: false,
      modified: true,
      isOlderThanRemote: false,
      slidePath: "/data_root_dir/public/deck.md",
      marpFrontmatter: { marp: true, theme: "gaia" },
      ignorePublish: false,
      ...overrides,
    });

  const buildResponseSlide = (overrides: Partial<Slide> = {}): Slide => ({
    uuid: "new-uuid",
    title: "Title",
    markdown: `---
marp: true
theme: gaia
---
# Title
`,
    description_markdown: "",
    created_at: "2026-09-01T00:00:00+09:00",
    updated_at: "2026-09-01T00:00:00+09:00",
    url: "https://qiita.com/Qiita/slides/new-uuid",
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetSlideFileSystemRepoIfEnabled.mockResolvedValue(slideFileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    mockSyncArticlesFromQiita.mockResolvedValue();
    mockSyncSlidesFromQiita.mockResolvedValue();
    fileSystemRepo.loadPublishTargets.mockResolvedValue([]);
    fileSystemRepo.loadItemByBasename.mockResolvedValue(null);
    slideFileSystemRepo.loadPublishTargets.mockResolvedValue([]);
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(null);

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

  describe("when both an article and a slide are given by basename", () => {
    it("publishes both", async () => {
      fileSystemRepo.loadItemByBasename.mockImplementation(async (basename) =>
        basename === "article" ? buildItem() : null,
      );
      slideFileSystemRepo.loadSlideByBasename.mockImplementation(
        async (basename) => (basename === "deck" ? buildSlide() : null),
      );
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem(),
        posted: true,
      });
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide(),
        posted: true,
      });

      await publish(["article", "deck"]);

      expect(fileSystemRepo.publishItem).toHaveBeenCalledTimes(1);
      expect(slideFileSystemRepo.publishSlide).toHaveBeenCalledTimes(1);
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("with --all for articles", () => {
    it("publishes every target the repository reports", async () => {
      fileSystemRepo.loadPublishTargets.mockResolvedValue([
        buildItem({ name: "item-a", id: "id-a", published: true }),
        buildItem({ name: "item-c" }),
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

  describe("when a new slide (id is null) is given by basename", () => {
    it("publishes it through the repository and reports it as posted", async () => {
      const slide = buildSlide();
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide(),
        posted: true,
      });

      await publish(["deck"]);

      expect(slideFileSystemRepo.publishSlide).toHaveBeenCalledWith(
        slide,
        qiitaApi,
      );
      expect(logSpy).toHaveBeenCalledWith("Posted (slide): deck -> new-uuid");
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("when an already published slide (id is present) is given by basename", () => {
    it("publishes it through the repository and reports it as updated", async () => {
      const slide = buildSlide({ id: "existing-uuid", published: true });
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide({ uuid: "existing-uuid" }),
        posted: false,
      });

      await publish(["deck"]);

      expect(slideFileSystemRepo.publishSlide).toHaveBeenCalledWith(
        slide,
        qiitaApi,
      );
      expect(logSpy).toHaveBeenCalledWith(
        "Updated (slide): deck -> existing-uuid",
      );
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("with --all for slides", () => {
    it("publishes every target the repository reports", async () => {
      slideFileSystemRepo.loadPublishTargets.mockResolvedValue([
        buildSlide({ name: "deck-a", id: "id-a", published: true }),
        buildSlide({ name: "deck-c" }),
      ]);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide(),
        posted: true,
      });

      await publish(["--all"]);

      expect(
        slideFileSystemRepo.publishSlide.mock.calls.map(
          ([slide]) => slide.name,
        ),
      ).toStrictEqual(["deck-a", "deck-c"]);
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("when the slide is older than the remote", () => {
    it("exits with an error and does not call the API", async () => {
      const slide = buildSlide({
        id: "existing-uuid",
        published: true,
        isOlderThanRemote: true,
      });
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);

      await expect(publish(["deck"])).rejects.toThrow(ProcessExitError);

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(slideFileSystemRepo.publishSlide).not.toHaveBeenCalled();
    });

    it("publishes anyway with --force", async () => {
      const slide = buildSlide({
        id: "existing-uuid",
        published: true,
        isOlderThanRemote: true,
      });
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide({ uuid: "existing-uuid" }),
        posted: false,
      });

      await publish(["deck", "--force"]);

      expect(slideFileSystemRepo.publishSlide).toHaveBeenCalledTimes(1);
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe("when the slide has no title", () => {
    it("exits with a validation error and does not call the API", async () => {
      const slide = buildSlide({ title: "" });
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);

      await expect(publish(["deck"])).rejects.toThrow(ProcessExitError);

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(slideFileSystemRepo.publishSlide).not.toHaveBeenCalled();
    });
  });

  describe("when there is nothing to publish", () => {
    it("logs and exits 0", async () => {
      await expect(publish(["--all"])).rejects.toThrow(ProcessExitError);

      expect(logSpy).toHaveBeenCalledWith("Nothing to publish");
      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe("when the slide repository is unavailable", () => {
    beforeEach(() => {
      mockGetSlideFileSystemRepoIfEnabled.mockResolvedValue(null);
    });

    it("does not sync slides", async () => {
      await expect(publish(["--all"])).rejects.toThrow(ProcessExitError);

      expect(mockSyncSlidesFromQiita).not.toHaveBeenCalled();
    });

    it("reports a slide basename as not found", async () => {
      await expect(publish(["deck"])).rejects.toThrow(ProcessExitError);

      expect(errorSpy).toHaveBeenCalledWith("Error: 'deck' is not found");
    });
  });
});
