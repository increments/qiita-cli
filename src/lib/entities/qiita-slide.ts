import matter from "gray-matter";

export class QiitaSlide {
  public readonly id: string | null;
  public readonly title: string;
  public readonly description: string | null;
  public readonly rawBody: string;
  public readonly updatedAt: string | null;
  public readonly name: string;
  public readonly slidesShowPath: string;
  public readonly published: boolean;
  public readonly slidePath: string;
  public readonly marpFrontmatter: Record<string, unknown>;

  constructor({
    id,
    title,
    description,
    rawBody,
    updatedAt,
    name,
    slidesShowPath,
    published,
    slidePath,
    marpFrontmatter,
  }: {
    id: string | null;
    title: string;
    description: string | null;
    rawBody: string;
    updatedAt: string | null;
    name: string;
    slidesShowPath: string;
    published: boolean;
    slidePath: string;
    marpFrontmatter: Record<string, unknown>;
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.rawBody = rawBody;
    this.updatedAt = updatedAt;
    this.name = name;
    this.slidesShowPath = slidesShowPath;
    this.published = published;
    this.slidePath = slidePath;
    this.marpFrontmatter = marpFrontmatter;
  }

  // The markdown handed to Qiita's slide preview API. Only the Marp
  // directives (theme, paginate, ...) belong here — qiita-cli's own
  // bookkeeping fields (id/updated_at/title/description) are not Marp
  // directives, so they're deliberately left out.
  toPreviewMarkdown(): string {
    return matter.stringify(this.rawBody, this.marpFrontmatter);
  }
}
