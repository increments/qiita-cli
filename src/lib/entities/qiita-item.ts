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
  public readonly itemsShowPath: string;
  public readonly published: boolean;
  public readonly itemPath: string;

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
    itemsShowPath,
    published,
    itemPath,
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
    itemsShowPath: string;
    published: boolean;
    itemPath: string;
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
    this.itemsShowPath = itemsShowPath;
    this.published = published;
    this.itemPath = itemPath;
  }
}
