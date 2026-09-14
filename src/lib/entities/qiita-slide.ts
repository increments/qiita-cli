import matter from "gray-matter";

// The markdown Qiita stores for a slide, used for the preview API, for
// publishing and for comparing a local slide with its mirror. Only the Marp
// directives (theme, paginate, ...) belong in the frontmatter — qiita-cli's own
// bookkeeping fields (id/updated_at/title/description) are not Marp directives,
// so they are deliberately left out.
export const buildSlideMarkdown = (
  rawBody: string,
  marpFrontmatter: Record<string, unknown>,
): string => matter.stringify(rawBody, marpFrontmatter);

export class QiitaSlide {
  public readonly id: string | null;
  public readonly title: string;
  public readonly description: string | null;
  public readonly rawBody: string;
  public readonly updatedAt: string | null;
  public readonly name: string;
  public readonly slidesShowPath: string;
  public readonly published: boolean;
  public readonly modified: boolean;
  public readonly isOlderThanRemote: boolean;
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
    modified,
    isOlderThanRemote,
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
    modified: boolean;
    isOlderThanRemote: boolean;
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
    this.modified = modified;
    this.isOlderThanRemote = isOlderThanRemote;
    this.slidePath = slidePath;
    this.marpFrontmatter = marpFrontmatter;
  }

  toMarkdown(): string {
    return buildSlideMarkdown(this.rawBody, this.marpFrontmatter);
  }
}
