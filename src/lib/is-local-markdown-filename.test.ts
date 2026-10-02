import { isLocalMarkdownFilename } from "./is-local-markdown-filename";

describe("isLocalMarkdownFilename", () => {
  it("includes a Markdown file in the root", () => {
    expect(isLocalMarkdownFilename("foo.md")).toBe(true);
  });

  it("includes a Markdown file in a subdirectory", () => {
    expect(isLocalMarkdownFilename("notes/foo.md")).toBe(true);
    expect(isLocalMarkdownFilename("notes\\foo.md")).toBe(true);
  });

  it("excludes non-Markdown files", () => {
    expect(isLocalMarkdownFilename("foo.txt")).toBe(false);
    expect(isLocalMarkdownFilename(".remote/config.json")).toBe(false);
  });

  it("excludes files under .remote with POSIX separators", () => {
    expect(isLocalMarkdownFilename(".remote/abc.md")).toBe(false);
    expect(isLocalMarkdownFilename(".remote/nested/abc.md")).toBe(false);
  });

  it("excludes files under .remote with Windows separators", () => {
    expect(isLocalMarkdownFilename(".remote\\abc.md")).toBe(false);
    expect(isLocalMarkdownFilename(".remote\\nested\\abc.md")).toBe(false);
  });
});
