import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { config } from "../lib/config";
import { newArticles } from "./newArticles";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/config");

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);
const mockConfig = jest.mocked(config);

describe("newArticles", () => {
  const fileSystemRepo = {
    createItem: jest.fn(),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const slideFileSystemRepo = {
    createSlide: jest.fn(),
  } as unknown as jest.Mocked<SlideFileSystemRepo>;

  class ProcessExitError extends Error {
    constructor(public readonly code: string | number | null | undefined) {
      super(`process.exit(${code})`);
    }
  }

  let exitSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetSlideFileSystemRepo.mockResolvedValue(slideFileSystemRepo);
    fileSystemRepo.createItem.mockResolvedValue("article");
    slideFileSystemRepo.createSlide.mockResolvedValue("deck");

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

  describe("--slide", () => {
    describe("when the experimental slide feature is disabled (default)", () => {
      beforeEach(() => {
        mockConfig.getUserConfig.mockResolvedValue({
          includePrivate: false,
          host: "localhost",
          port: 8888,
          experimentalSlideFeatureEnabled: false,
        });
      });

      it("exits with an error and does not create a slide", async () => {
        await expect(newArticles(["--slide"])).rejects.toThrow(
          ProcessExitError,
        );

        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining("experimentalSlideFeatureEnabled"),
        );
        expect(slideFileSystemRepo.createSlide).not.toHaveBeenCalled();
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

      it("creates a slide", async () => {
        await newArticles(["--slide"]);

        expect(slideFileSystemRepo.createSlide).toHaveBeenCalledWith(undefined);
        expect(logSpy).toHaveBeenCalledWith("created: deck.md");
        expect(exitSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe("without --slide", () => {
    beforeEach(() => {
      mockConfig.getUserConfig.mockResolvedValue({
        includePrivate: false,
        host: "localhost",
        port: 8888,
        experimentalSlideFeatureEnabled: false,
      });
    });

    it("creates an article regardless of the experimental slide feature flag", async () => {
      await newArticles([]);

      expect(fileSystemRepo.createItem).toHaveBeenCalledWith(undefined);
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });
});
