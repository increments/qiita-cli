import { config } from "../lib/config";
import { getHelpText, help } from "./help";

jest.mock("../lib/config");

const mockConfig = jest.mocked(config);

describe("getHelpText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    it("does not mention slides on the publish and pull lines", async () => {
      const helpText = await getHelpText();

      expect(helpText).toContain("publish <basename> ...  記事を投稿、更新\n");
      expect(helpText).toContain(
        "publish --all           全ての記事を投稿、更新\n",
      );
      expect(helpText).toContain(
        "pull                    記事ファイルをQiitaと同期\n",
      );
    });

    it("tells how to enable the slide feature on the new --slide line", async () => {
      const helpText = await getHelpText();

      expect(helpText).toContain("実験的機能");
      expect(helpText).toContain("experimentalSlideFeatureEnabled");
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

    it("mentions slides on the publish and pull lines", async () => {
      const helpText = await getHelpText();

      expect(helpText).toContain(
        "publish <basename> ...  記事、スライドを投稿、更新\n",
      );
      expect(helpText).toContain(
        "publish --all           全ての記事、スライドを投稿、更新\n",
      );
      expect(helpText).toContain(
        "pull                    記事、スライドファイルをQiitaと同期\n",
      );
    });

    it("does not explain how to enable the already enabled feature", async () => {
      const helpText = await getHelpText();

      expect(helpText).not.toContain("実験的機能");
      expect(helpText).not.toContain("experimentalSlideFeatureEnabled");
    });
  });
});

describe("help", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.getUserConfig.mockResolvedValue({
      includePrivate: false,
      host: "localhost",
      port: 8888,
      experimentalSlideFeatureEnabled: false,
    });
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("prints the help text", async () => {
    await help();

    expect(logSpy).toHaveBeenCalledWith(await getHelpText());
  });
});
