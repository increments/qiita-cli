import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { slidesShowPath } from "./qiita-cli-url";
import { QiitaSlide } from "./entities/qiita-slide";

// Fields qiita-cli itself manages in the frontmatter. Everything else is an
// arbitrary Marp directive (theme, paginate, header, class, ...) that we don't
// need to know the shape of — it's just carried through to the slide preview.
const RESERVED_FRONTMATTER_KEYS = ["title", "id", "updated_at", "description"];

class SlideFileContent {
  public readonly title: string;
  public readonly id: string | null;
  public readonly updatedAt: string | null;
  public readonly description: string | null;
  public readonly rawBody: string;
  public readonly marpFrontmatter: Record<string, unknown>;

  constructor({
    title,
    id,
    updatedAt,
    description,
    rawBody,
    marpFrontmatter,
  }: {
    title: string;
    id: string | null;
    updatedAt: string | null;
    description: string | null;
    rawBody: string;
    marpFrontmatter: Record<string, unknown>;
  }) {
    this.title = title;
    this.id = id;
    this.updatedAt = updatedAt;
    this.description = description;
    this.rawBody = rawBody;
    this.marpFrontmatter = marpFrontmatter;
  }

  static read(fileContent: string): SlideFileContent {
    const { data, content } = matter(fileContent);
    const marpFrontmatter = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => !RESERVED_FRONTMATTER_KEYS.includes(key),
      ),
    );

    return new SlideFileContent({
      rawBody: content,
      title: data.title,
      id: data.id,
      updatedAt: data.updated_at,
      description: data.description,
      marpFrontmatter,
    });
  }

  static empty({ title }: { title: string }): SlideFileContent {
    return new SlideFileContent({
      rawBody: "# Title\n\n---\n\n# Page 2",
      title,
      id: null,
      updatedAt: null,
      description: "",
      marpFrontmatter: { marp: true, theme: "default" },
    });
  }

  toSaveFormat(): string {
    return matter.stringify(this.rawBody, {
      title: this.title,
      id: this.id,
      updated_at: this.updatedAt,
      description: this.description,
      ...this.marpFrontmatter,
    });
  }
}

export class SlideFileSystemRepo {
  private readonly dataRootDir: string;

  constructor({ dataRootDir }: { dataRootDir: string }) {
    this.dataRootDir = dataRootDir;
  }

  public static async build({ dataRootDir }: { dataRootDir: string }) {
    const slideFileSystemRepo = new SlideFileSystemRepo({ dataRootDir });
    await slideFileSystemRepo.setUp();

    return slideFileSystemRepo;
  }

  private async setUp() {
    await fs.mkdir(this.getRootPath(), { recursive: true });
  }

  public getRootPath() {
    const subdir = "slides";
    return path.join(this.dataRootDir, subdir);
  }

  private getFilename(basename: string) {
    return `${basename}.md`;
  }

  private parseFilename(filename: string) {
    return filename.replace(/\.md$/, "");
  }

  private getFilePath(basename: string) {
    return path.join(this.getRootPath(), this.getFilename(basename));
  }

  private async getSlideFilenames() {
    return (
      await fs.readdir(
        this.getRootPath(),
        SlideFileSystemRepo.fileSystemOptions(),
      )
    ).filter((filename) => /\.md$/.test(filename));
  }

  private async getNewBasename() {
    const prefix = "newSlide";
    const filenames = await this.getSlideFilenames();
    const limit = 999;
    for (let i = 1; i <= limit; ++i) {
      const suffix = i.toString().padStart(3, "0");
      const basename = `${prefix}${suffix}`;
      const filenameCandidate = this.getFilename(basename);
      const found = filenames.find(
        (filename) => filename === filenameCandidate,
      );
      if (!found) {
        return basename;
      }
    }
    return;
  }

  private static fileSystemOptions() {
    return {
      encoding: "utf8",
      withFileTypes: false,
      recursive: true,
    } as const;
  }

  private async getSlideData(
    filename: string,
  ): Promise<SlideFileContent | null> {
    try {
      const fileContent = await fs.readFile(
        path.join(this.getRootPath(), filename),
        SlideFileSystemRepo.fileSystemOptions(),
      );
      return SlideFileContent.read(fileContent);
    } catch {
      return null;
    }
  }

  async loadSlides(): Promise<QiitaSlide[]> {
    const filenames = await this.getSlideFilenames();

    const promises = filenames.map(async (filename) => {
      const basename = this.parseFilename(filename);
      return await this.loadSlideByBasename(basename);
    });

    return excludeNull(await Promise.all(promises));
  }

  async loadSlideByBasename(basename: string): Promise<QiitaSlide | null> {
    const filenames = await this.getSlideFilenames();
    const filename = this.getFilename(basename);

    if (!filenames.includes(filename)) {
      return null;
    }

    const slidePath = this.getFilePath(basename);
    const fileContent = await this.getSlideData(filename);
    if (!fileContent) {
      return null;
    }

    return new QiitaSlide({
      id: fileContent.id,
      title: fileContent.title,
      description: fileContent.description,
      rawBody: fileContent.rawBody,
      updatedAt: fileContent.updatedAt,
      name: basename,
      slidesShowPath: this.generateSlidesShowPath(fileContent.id, basename),
      published: fileContent.id !== null,
      slidePath,
      marpFrontmatter: fileContent.marpFrontmatter,
    });
  }

  async loadSlideById(id: string): Promise<QiitaSlide | null> {
    const filenames = await this.getSlideFilenames();

    for (const filename of filenames) {
      const fileContent = await this.getSlideData(filename);
      if (fileContent?.id === id) {
        return this.loadSlideByBasename(this.parseFilename(filename));
      }
    }

    return null;
  }

  async createSlide(basename?: string) {
    basename = basename || (await this.getNewBasename());
    if (!basename) return;
    const slide = await this.loadSlideByBasename(basename);
    if (slide) return;

    const filepath = this.getFilePath(basename);
    const newFileContent = SlideFileContent.empty({ title: basename });
    const data = newFileContent.toSaveFormat();
    await fs.writeFile(filepath, data, SlideFileSystemRepo.fileSystemOptions());
    return basename;
  }

  // FIXME: Move outside of "repository"
  private generateSlidesShowPath(slideId: string | null, basename: string) {
    return slideId
      ? slidesShowPath(slideId)
      : slidesShowPath("show", { basename });
  }
}

const excludeNull = <T>(array: (T | null)[]): T[] => {
  return array.filter((val): val is T => val !== null);
};
