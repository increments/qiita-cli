import { isLocalMarkdownFilename } from "./is-local-markdown-filename";

describe("isLocalMarkdownFilename", () => {
  it("ルートの Markdown ファイルを対象にする", () => {
    expect(isLocalMarkdownFilename("foo.md")).toBe(true);
  });

  it("サブディレクトリの Markdown ファイルを対象にする", () => {
    expect(isLocalMarkdownFilename("notes/foo.md")).toBe(true);
    expect(isLocalMarkdownFilename("notes\\foo.md")).toBe(true);
  });

  it("Markdown 以外のファイルを対象にしない", () => {
    expect(isLocalMarkdownFilename("foo.txt")).toBe(false);
    expect(isLocalMarkdownFilename(".remote/config.json")).toBe(false);
  });

  it(".remote ディレクトリのファイルを POSIX 区切りでも除外する", () => {
    expect(isLocalMarkdownFilename(".remote/abc.md")).toBe(false);
    expect(isLocalMarkdownFilename(".remote/nested/abc.md")).toBe(false);
  });

  it(".remote ディレクトリのファイルを Windows 区切りでも除外する", () => {
    expect(isLocalMarkdownFilename(".remote\\abc.md")).toBe(false);
    expect(isLocalMarkdownFilename(".remote\\nested\\abc.md")).toBe(false);
  });
});
