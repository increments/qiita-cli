import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { FileSystemRepo } from "../../lib/file-system-repo";
import { getFileSystemRepo } from "../../lib/get-file-system-repo";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { QiitaItem } from "../../lib/entities/qiita-item";
import type { Item, QiitaApi } from "../../qiita-api";
import { ItemsRouter } from "./items";

jest.mock("../../lib/get-file-system-repo");
jest.mock("../../lib/get-qiita-api-instance");

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);

describe("ItemsRouter", () => {
  let server: Server;
  let baseUrl: string;

  const fileSystemRepo = {
    loadItemByBasename: jest.fn(),
    loadItemByItemId: jest.fn(),
    publishItem: jest.fn(),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const qiitaApi = {} as jest.Mocked<QiitaApi>;

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

  const postItemsUpdate = async (id: string, body: object) =>
    await fetch(`${baseUrl}/api/items/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/items", ItemsRouter);
    server = createServer(app);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    fileSystemRepo.loadItemByBasename.mockResolvedValue(null);
    fileSystemRepo.loadItemByItemId.mockResolvedValue(null);
  });

  describe("POST /api/items/post with a basename", () => {
    it("publishes the article looked up by basename and returns the new uuid", async () => {
      const item = buildItem();
      fileSystemRepo.loadItemByBasename.mockResolvedValue(item);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem(),
        posted: true,
      });

      const response = await postItemsUpdate("post", { basename: "article" });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        uuid: "new-item-id",
      });
      expect(fileSystemRepo.loadItemByBasename).toHaveBeenCalledWith("article");
      expect(fileSystemRepo.publishItem).toHaveBeenCalledWith(item, qiitaApi);
    });
  });

  describe("POST /api/items/:id for an already published article", () => {
    it("publishes the article looked up by uuid and returns the same uuid", async () => {
      const item = buildItem({ id: "existing-item-id", published: true });
      fileSystemRepo.loadItemByItemId.mockResolvedValue(item);
      fileSystemRepo.publishItem.mockResolvedValue({
        item: buildResponseItem({ id: "existing-item-id" }),
        posted: false,
      });

      const response = await postItemsUpdate("existing-item-id", {});

      expect(await response.json()).toEqual({
        success: true,
        uuid: "existing-item-id",
      });
      expect(fileSystemRepo.loadItemByItemId).toHaveBeenCalledWith(
        "existing-item-id",
      );
    });
  });

  describe("when the article is not found", () => {
    it("returns 404 without publishing", async () => {
      const response = await postItemsUpdate("unknown-id", {});

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ message: "Not found" });
      expect(fileSystemRepo.publishItem).not.toHaveBeenCalled();
    });
  });

  describe("when publishing fails", () => {
    it("returns success: false", async () => {
      fileSystemRepo.loadItemByItemId.mockResolvedValue(
        buildItem({ id: "existing-item-id", published: true }),
      );
      fileSystemRepo.publishItem.mockRejectedValue(new Error("Forbidden"));

      const response = await postItemsUpdate("existing-item-id", {});

      expect(await response.json()).toEqual({ success: false });
    });
  });
});
