import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { QiitaApi, Slide } from "../qiita-api";
import { slidesShowPath } from "./qiita-cli-url";
import { buildSlideMarkdown, QiitaSlide } from "./entities/qiita-slide";

// Fields qiita-cli itself manages in the frontmatter. Everything else is an
// arbitrary Marp directive (theme, paginate, header, class, ...) that we don't
// need to know the shape of — it's just carried through to the slide preview.
const RESERVED_FRONTMATTER_KEYS = [
  "title",
  "id",
  "updated_at",
  "description",
  "ignorePublish",
];

const extractMarpFrontmatter = (data: { [key: string]: unknown }) =>
  Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => !RESERVED_FRONTMATTER_KEYS.includes(key),
    ),
  );

class SlideFileContent {
  public readonly title: string;
  public readonly id: string | null;
  public readonly updatedAt: string | null;
  public readonly description: string | null;
  public readonly ignorePublish: boolean;
  public readonly rawBody: string;
  public readonly marpFrontmatter: Record<string, unknown>;

  constructor({
    title,
    id,
    updatedAt,
    description,
    ignorePublish,
    rawBody,
    marpFrontmatter,
  }: {
    title: string;
    id: string | null;
    updatedAt: string | null;
    description: string | null;
    ignorePublish: boolean;
    rawBody: string;
    marpFrontmatter: Record<string, unknown>;
  }) {
    this.title = title;
    this.id = id;
    this.updatedAt = updatedAt;
    this.description = description;
    this.ignorePublish = ignorePublish;
    this.rawBody = rawBody;
    this.marpFrontmatter = marpFrontmatter;
  }

  static read(fileContent: string): SlideFileContent {
    const { data, content } = matter(fileContent);

    return new SlideFileContent({
      rawBody: content,
      title: data.title,
      id: data.id,
      updatedAt: data.updated_at,
      description: data.description,
      ignorePublish: data.ignorePublish ?? false,
      marpFrontmatter: extractMarpFrontmatter(data),
    });
  }

  static empty({ title }: { title: string }): SlideFileContent {
    return new SlideFileContent({
      rawBody: "# Title\n\n---\n\n# Page 2",
      title,
      id: null,
      updatedAt: null,
      description: "",
      ignorePublish: false,
      marpFrontmatter: { marp: true, theme: "default" },
    });
  }

  // ignorePublish is a local-only setting that Qiita does not store, so the
  // caller passes the local value to keep it across a sync.
  static fromSlide(slide: Slide, ignorePublish: boolean): SlideFileContent {
    // Qiita stores the markdown we posted verbatim, so splitting it back into
    // the body and the Marp directives is the exact inverse of toMarkdown().
    const { data, content } = matter(slide.markdown);

    return new SlideFileContent({
      rawBody: content,
      title: slide.title,
      id: slide.uuid,
      updatedAt: slide.updated_at,
      description: slide.description_markdown,
      ignorePublish,
      marpFrontmatter: extractMarpFrontmatter(data),
    });
  }

  static fromQiitaSlide(slide: QiitaSlide): SlideFileContent {
    return new SlideFileContent({
      rawBody: slide.rawBody,
      title: slide.title,
      id: slide.id,
      updatedAt: slide.updatedAt,
      description: slide.description,
      ignorePublish: slide.ignorePublish,
      marpFrontmatter: slide.marpFrontmatter,
    });
  }

  clone({
    id,
    updatedAt,
  }: {
    id: string;
    updatedAt: string;
  }): SlideFileContent {
    return new SlideFileContent({
      title: this.title,
      id,
      updatedAt,
      description: this.description,
      ignorePublish: this.ignorePublish,
      rawBody: this.rawBody,
      marpFrontmatter: this.marpFrontmatter,
    });
  }

  toSaveFormat(): string {
    return matter.stringify(this.rawBody, {
      title: this.title,
      id: this.id,
      updated_at: this.updatedAt,
      description: this.description,
      ignorePublish: this.ignorePublish,
      ...this.marpFrontmatter,
    });
  }

  toMarkdown(): string {
    return buildSlideMarkdown(this.rawBody, this.marpFrontmatter);
  }

  equals(aFileContent: SlideFileContent | null): boolean {
    if (aFileContent === null) {
      return false;
    }

    // Compare the markdown Qiita stores instead of rawBody: gray-matter
    // normalizes the trailing newline, so comparing rawBody byte-wise reports
    // a diff right after a successful publish. `id` is not compared because
    // it is transit, as with articles. A missing local `description` means the
    // same as the empty string the API returns.
    return (
      this.title === aFileContent.title &&
      (this.description ?? "") === (aFileContent.description ?? "") &&
      this.ignorePublish === aFileContent.ignorePublish &&
      this.toMarkdown() === aFileContent.toMarkdown()
    );
  }

  isOlderThan(otherFileContent: SlideFileContent | null): boolean {
    if (!this.updatedAt || !otherFileContent?.updatedAt) return false;

    return new Date(this.updatedAt) < new Date(otherFileContent.updatedAt);
  }
}

export class SlideFileSystemRepo {
  private readonly dataRootDir: string;

  constructor({ dataRootDir }: { dataRootDir: string }) {
    this.dataRootDir = dataRootDir;
  }

  public static async build({ dataRootDir }: { dataRootDir: string }) {
    return new SlideFileSystemRepo({ dataRootDir });
  }

  public getRootPath() {
    const subdir = "slides";
    return path.join(this.dataRootDir, subdir);
  }

  private getRemotePath() {
    const subdir = ".remote";
    return path.join(this.getRootPath(), subdir);
  }

  private getRootOrRemotePath(remote: boolean = false) {
    return remote ? this.getRemotePath() : this.getRootPath();
  }

  private getFilename(basename: string) {
    return `${basename}.md`;
  }

  private parseFilename(filename: string) {
    return filename.replace(/\.md$/, "");
  }

  private getFilePath(basename: string, remote: boolean = false) {
    return path.join(
      this.getRootOrRemotePath(remote),
      this.getFilename(basename),
    );
  }

  private async getSlideFilenames(remote: boolean = false) {
    let filenames: string[];
    try {
      filenames = await fs.readdir(
        this.getRootOrRemotePath(remote),
        SlideFileSystemRepo.fileSystemOptions(),
      );
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }

    return filenames.filter(
      (filename) => /\.md$/.test(filename) && !filename.startsWith(".remote/"),
    );
  }

  private async writeSlideFile(filePath: string, data: string) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data, SlideFileSystemRepo.fileSystemOptions());
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
    remote: boolean = false,
  ): Promise<SlideFileContent | null> {
    try {
      const fileContent = await fs.readFile(
        path.join(this.getRootOrRemotePath(remote), filename),
        SlideFileSystemRepo.fileSystemOptions(),
      );
      return SlideFileContent.read(fileContent);
    } catch {
      return null;
    }
  }

  private async setSlideData(
    fileContent: SlideFileContent,
    remote: boolean = false,
    basename: string | null = null,
  ) {
    if (!fileContent.id) {
      return;
    }
    await this.writeSlideFile(
      this.getFilePath(basename || fileContent.id, remote),
      fileContent.toSaveFormat(),
    );
  }

  private async syncSlide(slide: Slide, forceUpdate: boolean) {
    const localSlide = await this.loadSlideById(slide.uuid);
    const fileContent = SlideFileContent.fromSlide(
      slide,
      localSlide?.ignorePublish ?? false,
    );
    const localFileContent = localSlide
      ? SlideFileContent.fromQiitaSlide(localSlide)
      : null;
    const remoteFileContent = await this.getSlideData(
      this.getFilename(slide.uuid),
      true,
    );

    await this.setSlideData(fileContent, true);
    if (
      localFileContent === null ||
      remoteFileContent?.equals(localFileContent) ||
      forceUpdate
    ) {
      await this.setSlideData(fileContent, false, localSlide?.name ?? null);
    }
  }

  async saveSlides(slides: Slide[], forceUpdate: boolean = false) {
    const promises = slides.map(async (slide) => {
      await this.syncSlide(slide, forceUpdate);
    });

    await Promise.all(promises);
  }

  async saveSlide(slide: Slide, forceUpdate: boolean = false) {
    await this.syncSlide(slide, forceUpdate);
  }

  async loadPublishTargets(): Promise<QiitaSlide[]> {
    const slides = await this.loadSlides();

    return slides.filter((slide) => {
      // Compared strictly because this filter runs before
      // checkSlideFrontmatterType validates ignorePublish.
      if (slide.ignorePublish === true) return false;

      return slide.modified || slide.id === null;
    });
  }

  async publishSlide(
    slide: QiitaSlide,
    qiitaApi: QiitaApi,
  ): Promise<{ slide: Slide; posted: boolean }> {
    const params = {
      title: slide.title,
      markdown: slide.toMarkdown(),
      description: slide.description ?? "",
    };

    if (slide.id) {
      const responseSlide = await qiitaApi.patchSlide({
        ...params,
        uuid: slide.id,
      });
      await this.saveSlide(responseSlide, true);

      return { slide: responseSlide, posted: false };
    }

    const responseSlide = await qiitaApi.postSlide(params);
    // The uuid has to reach the local file before the mirror is refreshed,
    // otherwise the sync cannot tell which file the returned slide belongs to
    // and would create a second one.
    await this.updateSlideFrontmatter(slide.name, {
      id: responseSlide.uuid,
      updatedAt: responseSlide.updated_at,
    });
    await this.saveSlide(responseSlide, true);

    return { slide: responseSlide, posted: true };
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

    const fileContent = await this.getSlideData(filename);
    if (!fileContent) {
      return null;
    }

    return await this.buildSlide(fileContent, basename);
  }

  async loadSlideById(id: string): Promise<QiitaSlide | null> {
    const filenames = await this.getSlideFilenames();

    for (const filename of filenames) {
      const fileContent = await this.getSlideData(filename);
      if (fileContent?.id === id) {
        return await this.buildSlide(fileContent, this.parseFilename(filename));
      }
    }

    return null;
  }

  async createSlide(basename?: string) {
    basename = basename || (await this.getNewBasename());
    if (!basename) return;
    const slide = await this.loadSlideByBasename(basename);
    if (slide) return;

    const newFileContent = SlideFileContent.empty({ title: basename });
    await this.writeSlideFile(
      this.getFilePath(basename),
      newFileContent.toSaveFormat(),
    );
    return basename;
  }

  async updateSlideFrontmatter(
    basename: string,
    { id, updatedAt }: { id: string; updatedAt: string },
  ) {
    const fileContent = await this.getSlideData(this.getFilename(basename));
    if (!fileContent) {
      return;
    }

    await this.writeSlideFile(
      this.getFilePath(basename),
      fileContent.clone({ id, updatedAt }).toSaveFormat(),
    );
  }

  private async buildSlide(
    fileContent: SlideFileContent,
    basename: string,
  ): Promise<QiitaSlide> {
    const remoteFileContent = fileContent.id
      ? await this.getSlideData(this.getFilename(fileContent.id), true)
      : null;

    return new QiitaSlide({
      id: fileContent.id,
      title: fileContent.title,
      description: fileContent.description,
      rawBody: fileContent.rawBody,
      updatedAt: fileContent.updatedAt,
      name: basename,
      slidesShowPath: this.generateSlidesShowPath(fileContent.id, basename),
      published: fileContent.id !== null,
      modified: !fileContent.equals(remoteFileContent),
      isOlderThanRemote: fileContent.isOlderThan(remoteFileContent),
      slidePath: this.getFilePath(basename),
      marpFrontmatter: fileContent.marpFrontmatter,
      ignorePublish: fileContent.ignorePublish,
    });
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
