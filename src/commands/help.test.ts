import { help, helpText } from "./help";

describe("helpText", () => {
  it("mentions slides on the new, publish and pull lines", () => {
    expect(helpText).toContain(
      "new --slide [<basename>] ...\n                          新しいスライドを追加\n",
    );
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

  it("does not describe the slide feature as experimental", () => {
    expect(helpText).not.toContain("実験的機能");
    expect(helpText).not.toContain("experimentalSlideFeatureEnabled");
  });
});

describe("help", () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("prints the help text", () => {
    help();

    expect(logSpy).toHaveBeenCalledWith(helpText);
  });
});
