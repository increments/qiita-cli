import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";
import { Item } from "../qiita-api";
import { itemsShowPath } from "../lib/qiita-cli-url";
import { QiitaItem } from "./entities/qiita-item";

class FileContent {
  public readonly title: string;
  public readonly tags: string[];
  public readonly secret: boolean;
  public readonly updatedAt: string;
  public readonly id: string | null;
  public readonly organizationUrlName: string | null;
  public readonly rawBody: string;
  public readonly slide: boolean;
  public readonly ignorePublish: boolean;

  constructor({
    title,
    tags,
    secret,
    updatedAt,
    id,
    organizationUrlName,
    rawBody,
    slide,
    ignorePublish = false,
  }: {
    title: string;
    tags: string[];
    secret: boolean;
    updatedAt: string;
    id: string | null;
    organizationUrlName: string | null;
    rawBody: string;
    slide: boolean;
    ignorePublish: boolean;
  }) {
    this.title = title;
    this.tags = tags;
    this.secret = secret;
    this.updatedAt = updatedAt;
    this.id = id;
    this.organizationUrlName = organizationUrlName;
    this.rawBody = rawBody;
    this.slide = slide;
    this.ignorePublish = ignorePublish;
  }

  static read(fileContent: string): FileContent {
    const { data, content } = matter(fileContent);
    return new FileContent({
      rawBody: content,
      title: data.title,
      tags: data.tags,
      secret: data.private,
      updatedAt: data.updated_at,
      id: data.id,
      organizationUrlName: data.organization_url_name,
      slide: data.slide,
      ignorePublish: data.ignorePublish ?? false,
    });
  }

  static empty({
    title,
    id = null,
  }: {
    title: string;
    id?: string | null;
  }): FileContent {
    return new FileContent({
      rawBody: "# new article body",
      title,
      tags: [""],
      secret: false,
      updatedAt: "",
      id,
      organizationUrlName: null,
      slide: false,
      ignorePublish: false,
    });
  }

  static fromItem(item: Item): FileContent {
    return new FileContent({
      rawBody: item.body,
      title: item.title,
      tags: item.tags.map((tag) => tag.name),
      secret: item.private,
      updatedAt: item.updated_at,
      id: item.id,
      organizationUrlName: item.organization_url_name,
      slide: item.slide,
      ignorePublish: false,
    });
  }

  static fromQiitaItem(item: QiitaItem): FileContent {
    return new FileContent({
      rawBody: item.rawBody,
      title: item.title,
      tags: item.tags,
      secret: item.secret,
      updatedAt: item.updatedAt,
      id: item.id,
      organizationUrlName: item.organizationUrlName,
      slide: item.slide,
      ignorePublish: item.ignorePublish,
    });
  }

  toSaveFormat(): string {
    return matter.stringify(this.rawBody, {
      title: this.title,
      tags: this.tags,
      private: this.secret,
      updated_at: this.updatedAt,
      id: this.id,
      organization_url_name: this.organizationUrlName,
      slide: this.slide,
      ignorePublish: this.ignorePublish,
    });
  }

  equals(aFileContent: FileContent | null): boolean {
    if (aFileContent === null) {
      return false;
    }

    if (!Array.isArray(this.tags) || !Array.isArray(aFileContent.tags)) {
      return false;
    }

    // not check id because it is transit
    return (
      this.organizationUrlName === aFileContent.organizationUrlName &&
      this.title === aFileContent.title &&
      this.tags.sort().join() === aFileContent.tags.sort().join() &&
      this.secret === aFileContent.secret &&
      this.rawBody === aFileContent.rawBody &&
      this.slide === aFileContent.slide &&
      this.ignorePublish === aFileContent.ignorePublish
    );
  }

  isOlderThan(otherFileContent: FileContent | null): boolean {
    if (!otherFileContent) return false;
    const updatedAt = new Date(this.updatedAt);
    const otherUpdatedAt = new Date(otherFileContent.updatedAt);

    return updatedAt < otherUpdatedAt;
  }

  clone({ id }: { id: string }): FileContent {
    return new FileContent({
      title: this.title,
      tags: this.tags,
      secret: this.secret,
      updatedAt: this.updatedAt,
      id,
      organizationUrlName: this.organizationUrlName,
      rawBody: this.rawBody,
      slide: this.slide,
      ignorePublish: this.ignorePublish,
    });
  }
}

export class FileSystemRepo {
  private readonly dataRootDir: string;

  constructor({ dataRootDir }: { dataRootDir: string }) {
    this.dataRootDir = dataRootDir;
  }

  public static async build({ dataRootDir }: { dataRootDir: string }) {
    const fileSystemRepo = new FileSystemRepo({ dataRootDir });
    await fileSystemRepo.setUp();

    return fileSystemRepo;
  }

  private async setUp() {
    await fs.mkdir(this.getRootPath(), { recursive: true });
    await fs.mkdir(this.getRemotePath(), { recursive: true });
  }

  public getRootPath() {
    const subdir = "public";
    return path.join(this.dataRootDir, subdir);
  }

  private getRemotePath() {
    const subdir = ".remote";
    return path.join(this.getRootPath(), subdir);
  }

  private getRootOrRemotePath(remote: boolean = false) {
    return remote ? this.getRemotePath() : this.getRootPath();
  }

  private getFilename(uuid: string) {
    return `${uuid}.md`;
  }

  private parseFilename(filename: string) {
    return filename.replace(/\.md$/, "");
  }

  private getFilePath(uuid: string, remote: boolean = false) {
    return path.join(this.getRootOrRemotePath(remote), this.getFilename(uuid));
  }

  private async getItemFilenames(remote: boolean = false) {
    return (
      await fs.readdir(
        this.getRootOrRemotePath(remote),
        FileSystemRepo.fileSystemOptions(),
      )
    ).filter(
      (itemFilename) =>
        /\.md$/.test(itemFilename) && !itemFilename.startsWith(".remote/"),
    );
  }

  private defaultBasename(fileContent: FileContent) {
    // TODO: Add article title to basename
    return fileContent.id as string;
  }

  private async getNewBasename() {
    const prefix = "newArticle";
    const itemFilenames = await this.getItemFilenames();
    const limit = 999;
    for (let i = 1; i <= limit; ++i) {
      const suffix = i.toString().padStart(3, "0");
      const basename = `${prefix}${suffix}`;
      const filenameCandidate = this.getFilename(basename);
      const found = itemFilenames.find(
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

  private async setItemData(
    fileContent: FileContent,
    remote: boolean = false,
    basename: string | null = null,
  ) {
    if (!fileContent.id) {
      return;
    }
    const filepath = this.getFilePath(
      basename || this.defaultBasename(fileContent),
      remote,
    );
    const data = fileContent.toSaveFormat();
    await fs.writeFile(filepath, data, FileSystemRepo.fileSystemOptions());
  }

  private async getItemData(
    itemFilename: string,
    remote: boolean = false,
  ): Promise<FileContent | null> {
    try {
      const fileContent = await fs.readFile(
        path.join(this.getRootOrRemotePath(remote), itemFilename),
        FileSystemRepo.fileSystemOptions(),
      );
      return FileContent.read(fileContent);
    } catch (err: any) {
      return null;
    }
  }

  private async syncItem(
    item: Item,
    beforeSync: boolean = false,
    forceUpdate: boolean = false,
  ) {
    const fileContent = FileContent.fromItem(item);

    if (beforeSync) {
      await this.setItemData(fileContent, true);
    }
    const localResult = await this.loadItemByItemId(item.id);
    const data = localResult ? FileContent.fromQiitaItem(localResult) : null;
    const basename = localResult?.name || null;
    const remoteFileContent = await this.getItemData(
      this.getFilename(item.id),
      true,
    );

    if (data === null || remoteFileContent?.equals(data) || forceUpdate) {
      await this.setItemData(fileContent, true);
      await this.setItemData(fileContent, false, basename);
    } else {
      await this.setItemData(fileContent, true);
    }
  }

  async saveItems(items: Item[], forceUpdate: boolean = false) {
    const promises = items.map(async (item) => {
      await this.syncItem(item, false, forceUpdate);
    });

    await Promise.all(promises);
  }

  async saveItem(
    item: Item,
    beforeSync: boolean = false,
    forceUpdate: boolean = false,
  ) {
    await this.syncItem(item, beforeSync, forceUpdate);
  }

  async loadItems(): Promise<QiitaItem[]> {
    const itemFilenames = await this.getItemFilenames();

    const promises = itemFilenames.map(async (itemFilename) => {
      const basename = this.parseFilename(itemFilename);
      return await this.loadItemByBasename(basename);
    });

    const items = excludeNull(await Promise.all(promises));
    return items;
  }

  async loadItemByItemId(itemId: string): Promise<QiitaItem | null> {
    const items = await this.getItemFilenames();

    let localFileContent: FileContent | null = null;
    let itemFilename: string | null = null;

    for (const item of items) {
      const tmpLocalFileContent = await this.getItemData(item, false);
      if (tmpLocalFileContent?.id === itemId) {
        localFileContent = tmpLocalFileContent;
        itemFilename = item;
      }
      if (localFileContent) break;
    }

    if (!localFileContent || !itemFilename) {
      return null;
    }

    const basename = this.parseFilename(itemFilename);
    const itemPath = this.getFilePath(basename);
    const remoteFileContent = localFileContent.id
      ? await this.getItemData(this.getFilename(localFileContent.id), true)
      : null;

    return new QiitaItem({
      id: localFileContent.id,
      title: localFileContent.title,
      tags: localFileContent.tags,
      secret: localFileContent.secret,
      updatedAt: localFileContent.updatedAt,
      organizationUrlName: localFileContent.organizationUrlName,
      rawBody: localFileContent.rawBody,
      slide: localFileContent.slide,
      name: basename,
      modified: !localFileContent.equals(remoteFileContent),
      isOlderThanRemote: localFileContent.isOlderThan(remoteFileContent),
      itemsShowPath: this.generateItemsShowPath(localFileContent.id, basename),
      published: remoteFileContent !== null,
      ignorePublish: localFileContent.ignorePublish,
      itemPath,
    });
  }

  async loadItemByBasename(basename: string): Promise<QiitaItem | null> {
    const items = await this.getItemFilenames();
    const itemFilename = this.getFilename(basename);

    if (!items.includes(itemFilename)) {
      return null;
    }

    const itemPath = this.getFilePath(basename);
    const localFileContent = await this.getItemData(itemFilename, false);
    if (!localFileContent) {
      return null;
    }

    const remoteFileContent = localFileContent.id
      ? await this.getItemData(this.getFilename(localFileContent.id), true)
      : null;

    return new QiitaItem({
      id: localFileContent.id,
      title: localFileContent.title,
      tags: localFileContent.tags,
      secret: localFileContent.secret,
      updatedAt: localFileContent.updatedAt,
      organizationUrlName: localFileContent.organizationUrlName,
      rawBody: localFileContent.rawBody,
      slide: localFileContent.slide,
      name: basename,
      modified: !localFileContent.equals(remoteFileContent),
      isOlderThanRemote: localFileContent.isOlderThan(remoteFileContent),
      itemsShowPath: this.generateItemsShowPath(localFileContent.id, basename),
      published: remoteFileContent !== null,
      ignorePublish: localFileContent.ignorePublish,
      itemPath,
    });
  }

  async createItem(basename?: string) {
    basename = basename || (await this.getNewBasename());
    if (!basename) return;
    const item = await this.loadItemByBasename(basename);
    if (item) return;

    const filepath = this.getFilePath(basename);
    const newFileContent = FileContent.empty({ title: basename });
    const data = newFileContent.toSaveFormat();
    await fs.writeFile(filepath, data, FileSystemRepo.fileSystemOptions());
    return basename;
  }

  async updateItemUuid(basename: string, newItemId: string) {
    const item = await this.loadItemByBasename(basename);
    const data = item ? FileContent.fromQiitaItem(item) : null;
    if (!data) {
      return;
    }

    if (data.id === newItemId) {
      // skip
      return;
    }

    const newFilePath = this.getFilePath(basename);
    const newData = data.clone({ id: newItemId }).toSaveFormat();
    await fs.writeFile(
      newFilePath,
      newData,
      FileSystemRepo.fileSystemOptions(),
    );
  }

  // FIXME: Move outside of "repository"
  private generateItemsShowPath(itemId: string | null, basename: string) {
    return itemId ? itemsShowPath(itemId) : itemsShowPath("show", { basename });
  }
}

const excludeNull = <T>(array: (T | null)[]): T[] => {
  return array.filter((val): val is T => val !== null);
};
