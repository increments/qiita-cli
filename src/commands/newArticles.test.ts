import type { FileSystemRepo } from "../lib/file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import { getFileSystemRepo } from "../lib/get-file-system-repo";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import { newArticles } from "./newArticles";

jest.mock("../lib/get-file-system-repo");
jest.mock("../lib/get-slide-file-system-repo");

const mockGetFileSystemRepo = jest.mocked(getFileSystemRepo);
const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);

describe("newArticles", () => {
  const fileSystemRepo = {
    createItem: jest.fn(),
  } as unknown as jest.Mocked<FileSystemRepo>;

  const slideFileSystemRepo = {
    createSlide: jest.fn(),
  } as unknown as jest.Mocked<SlideFileSystemRepo>;

  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetFileSystemRepo.mockResolvedValue(fileSystemRepo);
    mockGetSlideFileSystemRepo.mockResolvedValue(slideFileSystemRepo);
    fileSystemRepo.createItem.mockResolvedValue("article");
    slideFileSystemRepo.createSlide.mockResolvedValue("deck");

    logSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe("--slide", () => {
    it("creates a slide", async () => {
      await newArticles(["--slide"]);

      expect(slideFileSystemRepo.createSlide).toHaveBeenCalledWith(undefined);
      expect(fileSystemRepo.createItem).not.toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith("created: deck.md");
    });

    it("creates a slide with the given basename", async () => {
      await newArticles(["--slide", "deck"]);

      expect(slideFileSystemRepo.createSlide).toHaveBeenCalledWith("deck");
    });
  });

  describe("without --slide", () => {
    it("creates an article", async () => {
      await newArticles([]);

      expect(fileSystemRepo.createItem).toHaveBeenCalledWith(undefined);
      expect(slideFileSystemRepo.createSlide).not.toHaveBeenCalled();
    });
  });
});
