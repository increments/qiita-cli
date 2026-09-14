import { config } from "../lib/config";
import { buildHelpText, getHelpText, help } from "./help";

jest.mock("../lib/config");

const mockConfig = jest.mocked(config);

describe("buildHelpText", () => {
  it("returns the same help text regardless of experimentalSlideFeatureEnabled", () => {
    expect(buildHelpText({ experimentalSlideFeatureEnabled: false })).toEqual(
      buildHelpText({ experimentalSlideFeatureEnabled: true }),
    );
  });

  it("does not change the currently visible help text", () => {
    const helpText = buildHelpText({ experimentalSlideFeatureEnabled: false });

    expect(helpText).toContain("publish <basename> ...  記事を投稿、更新\n");
    expect(helpText).toContain(
      "publish --all           全ての記事を投稿、更新\n",
    );
    expect(helpText).toContain(
      "pull                    記事ファイルをQiitaと同期\n",
    );
  });
});

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

    it("returns the help text built from the user config", async () => {
      const helpText = await getHelpText();

      expect(helpText).toEqual(
        buildHelpText({ experimentalSlideFeatureEnabled: false }),
      );
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

    it("returns the help text built from the user config", async () => {
      const helpText = await getHelpText();

      expect(helpText).toEqual(
        buildHelpText({ experimentalSlideFeatureEnabled: true }),
      );
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
