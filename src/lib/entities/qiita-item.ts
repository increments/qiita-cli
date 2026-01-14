import { dirname, sep } from "path";

export class QiitaItem {
  public readonly id: string | null;
  public readonly title: string;
  public readonly tags: string[];
  public readonly secret: boolean;
  public readonly updatedAt: string;
  public readonly organizationUrlName: string | null;
  public readonly rawBody: string;
  public readonly name: string;
  public readonly modified: boolean;
  public readonly isOlderThanRemote: boolean;
  public readonly itemsShowPath: string;
  public readonly published: boolean;
  public readonly itemPath: string;
  public readonly slide: boolean;
  public readonly ignorePublish: boolean;

  constructor({
    id,
    title,
    tags,
    secret,
    updatedAt,
    organizationUrlName,
    rawBody,
    name,
    modified,
    isOlderThanRemote,
    itemsShowPath,
    published,
    itemPath,
    slide,
    ignorePublish,
  }: {
    id: string | null;
    title: string;
    tags: string[];
    secret: boolean;
    updatedAt: string;
    organizationUrlName: string | null;
    rawBody: string;
    name: string;
    modified: boolean;
    isOlderThanRemote: boolean;
    itemsShowPath: string;
    published: boolean;
    itemPath: string;
    slide: boolean;
    ignorePublish: boolean;
  }) {
    this.id = id;
    this.title = title;
    this.tags = tags;
    this.secret = secret;
    this.updatedAt = updatedAt;
    this.organizationUrlName = organizationUrlName;
    this.rawBody = rawBody;
    this.name = name;
    this.modified = modified;
    this.isOlderThanRemote = isOlderThanRemote;
    this.itemsShowPath = itemsShowPath;
    this.published = published;
    this.itemPath = itemPath;
    this.slide = slide;
    this.ignorePublish = ignorePublish;
  }

  getParentDirNames() {
    return dirname(this.itemPath).split(sep).slice(0, -1);
  }
}
