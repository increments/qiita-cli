import fs from "node:fs/promises";
import { config } from "./config";
import { getSlideFileSystemRepoIfEnabled } from "./get-slide-file-system-repo";
import { SlideFileSystemRepo } from "./slide-file-system-repo";

jest.mock("node:fs/promises");
jest.mock("./config");

const mockConfig = jest.mocked(config);
const mockFs = fs as jest.Mocked<typeof fs>;

describe("getSlideFileSystemRepoIfEnabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig.getItemsRootDir.mockReturnValue("data_root_dir");
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

    it("returns null without creating the slide directory", async () => {
      expect(await getSlideFileSystemRepoIfEnabled()).toBeNull();
      expect(mockFs.mkdir).not.toHaveBeenCalled();
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

    it("returns a repository rooted at the slide directory", async () => {
      const slideFileSystemRepo = await getSlideFileSystemRepoIfEnabled();

      expect(slideFileSystemRepo).toBeInstanceOf(SlideFileSystemRepo);
      expect(slideFileSystemRepo?.getRootPath()).toBe("data_root_dir/slides");
      expect(mockFs.mkdir).toHaveBeenCalledWith("data_root_dir/slides", {
        recursive: true,
      });
    });
  });
});
