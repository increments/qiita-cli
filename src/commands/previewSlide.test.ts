import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { QiitaSlide } from "../lib/entities/qiita-slide";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { getSlideFileSystemRepo } from "../lib/get-slide-file-system-repo";
import type { SlideFileSystemRepo } from "../lib/slide-file-system-repo";
import type { QiitaApi } from "../qiita-api";
import { previewSlide } from "./previewSlide";

jest.mock("../lib/get-slide-file-system-repo");
jest.mock("../lib/get-qiita-api-instance");

const mockGetSlideFileSystemRepo = jest.mocked(getSlideFileSystemRepo);
const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);

describe("previewSlide", () => {
  const slideFileSystemRepo = {
    loadSlideByBasename: jest.fn(),
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
      rawBody: "# Page 1\n\n---\n\n# Page 2\n",
      updatedAt: null,
      name: "deck",
      slidesShowPath: "/slides/show?basename=deck",
      published: false,
      modified: true,
      isOlderThanRemote: false,
      slidePath: "/data_root_dir/slides/deck.md",
      marpFrontmatter: { marp: true, theme: "gaia" },
      ignorePublish: false,
      visibility: { type: "public" },
      ...overrides,
    });

  let outputDir: string;
  let outputPath: string;

  beforeEach(async () => {
    jest.resetAllMocks();
    mockGetSlideFileSystemRepo.mockResolvedValue(slideFileSystemRepo);
    mockGetQiitaApiInstance.mockResolvedValue(qiitaApi);
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    outputDir = await mkdtemp(path.join(tmpdir(), "qiita-cli-preview-slide-"));
    outputPath = path.join(outputDir, "deck.html");
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("writes every page rendered by Qiita into the output HTML", async () => {
    const slide = buildSlide();
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(slide);
    qiitaApi.previewSlide.mockResolvedValue({
      pages: [
        { html: "<section><h1>Page 1</h1></section>", speaker_note: [] },
        { html: "<section><h1>Page 2</h1></section>", speaker_note: [] },
      ],
      css: "section { color: red; }",
    });

    await previewSlide(["deck", "--output", outputPath]);

    expect(slideFileSystemRepo.loadSlideByBasename).toHaveBeenCalledWith(
      "deck",
    );
    expect(qiitaApi.previewSlide).toHaveBeenCalledWith(slide.toMarkdown());

    const html = await readFile(outputPath, "utf8");
    expect(html).toContain("<title>Title</title>");
    expect(html).toContain("<section><h1>Page 1</h1></section>");
    expect(html).toContain("<section><h1>Page 2</h1></section>");
    expect(html.match(/<template shadowrootmode="open">/g)).toHaveLength(2);
    expect(html.match(/section \{ color: red; \}/g)).toHaveLength(2);
    expect(console.log).toHaveBeenCalledWith(outputPath);
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("escapes the title in the output HTML", async () => {
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(
      buildSlide({ title: "<A & B>" }),
    );
    qiitaApi.previewSlide.mockResolvedValue({ pages: [], css: "" });

    await previewSlide(["deck", "--output", outputPath]);

    const html = await readFile(outputPath, "utf8");
    expect(html).toContain("<title>&lt;A &amp; B&gt;</title>");
  });

  it("reports validation errors but still writes the preview", async () => {
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(
      buildSlide({ title: "" }),
    );
    qiitaApi.previewSlide.mockResolvedValue({
      pages: [{ html: "<section></section>", speaker_note: [] }],
      css: "",
    });

    await previewSlide(["deck", "--output", outputPath]);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("タイトルを入力してください"),
    );
    expect(await readFile(outputPath, "utf8")).toContain("<section></section>");
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("fails without calling the API when the frontmatter has invalid types", async () => {
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(
      buildSlide({ ignorePublish: "yes" as unknown as boolean }),
    );

    await previewSlide(["deck", "--output", outputPath]);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("ignorePublishは真偽値で入力してください"),
    );
    expect(qiitaApi.previewSlide).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("fails when the slide does not exist", async () => {
    slideFileSystemRepo.loadSlideByBasename.mockResolvedValue(null);

    await previewSlide(["missing", "--output", outputPath]);

    expect(console.error).toHaveBeenCalledWith(
      "Error: slide 'missing' is not found",
    );
    expect(qiitaApi.previewSlide).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("requires a basename", async () => {
    await previewSlide(["--output", outputPath]);

    expect(slideFileSystemRepo.loadSlideByBasename).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("requires an output path", async () => {
    await previewSlide(["deck"]);

    expect(slideFileSystemRepo.loadSlideByBasename).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
