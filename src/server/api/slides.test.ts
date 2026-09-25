import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { QiitaSlide } from "../../lib/entities/qiita-slide";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { getSlideFileSystemRepo } from "../../lib/get-slide-file-system-repo";
import type { SlideFileSystemRepo } from "../../lib/slide-file-system-repo";
import type { QiitaApi, Slide } from "../../qiita-api";
import { SlidesRouter } from "./slides";

jest.mock("../../lib/get-slide-file-system-repo");
jest.mock("../../lib/get-qiita-api-instance");

const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);

describe("SlidesRouter", () => {
  let server: Server;
  let baseUrl: string;

  const slideFileSystemRepo = {
    loadSlideByBasename: jest.fn(),
    loadSlideById: jest.fn(),
    publishSlide: jest.fn(),
  } as unknown as jest.Mocked<SlideFileSystemRepo>;

  const qiitaApi = {
    previewSlide: jest.fn(),
  } as unknown as jest.Mocked<QiitaApi>;

  const buildSlide = (
    overrides: Partial<ConstructorParameters<typeof QiitaSlide>[0]> = {},
  ) =>
    new QiitaSlide({
      id: null,
      title: "Title",
      description: null,
      rawBody: "# Title",
      updatedAt: null,
      name: "slide",
      slidesShowPath: "/slides/show?basename=slide",
      published: false,
      modified: true,
      isOlderThanRemote: false,
      slidePath: "/data_root_dir/slides/slide.md",
      marpFrontmatter: {},
      ignorePublish: false,
      ...overrides,
    });

  const buildResponseSlide = (overrides: Partial<Slide> = {}): Slide => ({
    uuid: "new-slide-uuid",
    title: "Title",
    markdown: "# Title",
    description_markdown: "",
    created_at: "2026-09-01T00:00:00+09:00",
    updated_at: "2026-09-01T00:00:00+09:00",
    url: "https://qiita.com/slides/new-slide-uuid",
    ...overrides,
  });

  const postSlidesUpdate = async (id: string, body: object) =>
    await fetch(`${baseUrl}/api/slides/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/slides", SlidesRouter);
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

    mockGetSlideFileSystemRepo.mockResolvedValue(slideFileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(null);
    slideFileSystemRepo.loadSlideById.mockResolvedValue(null);
  });

  describe("GET /api/slides/:id", () => {
    it("returns whether the slide is modified or older than the remote", async () => {
      slideFileSystemRepo.loadSlideById.mockResolvedValue(
        buildSlide({
          id: "existing-slide-uuid",
          published: true,
          modified: false,
          isOlderThanRemote: true,
        }),
      );
      qiitaApi.previewSlide.mockResolvedValue({ pages: [], css: "" });

      const response = await fetch(`${baseUrl}/api/slides/existing-slide-uuid`);

      expect(await response.json()).toMatchObject({
        modified: false,
        is_older_than_remote: true,
      });
    });
  });

  describe("POST /api/slides/post with a basename", () => {
    it("publishes the slide looked up by basename and returns the new uuid", async () => {
      const slide = buildSlide();
      slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide(),
        posted: true,
      });

      const response = await postSlidesUpdate("post", { basename: "slide" });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
        uuid: "new-slide-uuid",
      });
      expect(slideFileSystemRepo.loadSlideByBasename).toHaveBeenCalledWith(
        "slide",
      );
      expect(slideFileSystemRepo.publishSlide).toHaveBeenCalledWith(
        slide,
        qiitaApi,
      );
    });
  });

  describe("POST /api/slides/:id for an already published slide", () => {
    it("publishes the slide looked up by uuid and returns the same uuid", async () => {
      const slide = buildSlide({ id: "existing-slide-uuid", published: true });
      slideFileSystemRepo.loadSlideById.mockResolvedValue(slide);
      slideFileSystemRepo.publishSlide.mockResolvedValue({
        slide: buildResponseSlide({ uuid: "existing-slide-uuid" }),
        posted: false,
      });

      const response = await postSlidesUpdate("existing-slide-uuid", {});

      expect(await response.json()).toEqual({
        success: true,
        uuid: "existing-slide-uuid",
      });
      expect(slideFileSystemRepo.loadSlideById).toHaveBeenCalledWith(
        "existing-slide-uuid",
      );
    });
  });

  describe("when the slide is not found", () => {
    it("returns 404 without publishing", async () => {
      const response = await postSlidesUpdate("unknown-uuid", {});

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ message: "Not found" });
      expect(slideFileSystemRepo.publishSlide).not.toHaveBeenCalled();
    });
  });

  describe("when publishing fails", () => {
    it("returns success: false", async () => {
      slideFileSystemRepo.loadSlideById.mockResolvedValue(
        buildSlide({ id: "existing-slide-uuid", published: true }),
      );
      slideFileSystemRepo.publishSlide.mockRejectedValue(
        new Error("Forbidden"),
      );

      const response = await postSlidesUpdate("existing-slide-uuid", {});

      expect(await response.json()).toEqual({ success: false });
    });
  });
});
