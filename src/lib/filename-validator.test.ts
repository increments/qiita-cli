import { validateFilename } from "./filename-validator";

describe("validateFilename", () => {
  it("should accept valid filenames", () => {
    const validNames = [
      "test",
      "test-article",
      "test_article",
      "test123",
      "記事テスト",
      "article.backup",
      "my-awesome-article",
    ];

    validNames.forEach((name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should reject empty or whitespace-only filenames", () => {
    const invalidNames = ["", " ", "  ", "\t", "\n"];

    invalidNames.forEach((name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Filename is empty");
    });
  });

  it("should reject filenames with invalid characters", () => {
    const invalidNames = [
      "test<file",
      "test>file",
      "test:file",
      'test"file',
      "test/file",
      "test\\file",
      "test|file",
      "test?file",
      "test*file",
      "test\x00file",
    ];

    invalidNames.forEach((name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Filename contains invalid characters: < > : " / \\ | ? * and control characters',
      );
    });
  });

  it("should reject filenames starting or ending with dots or spaces", () => {
    const invalidNames = [
      ".test",
      "test.",
      " test",
      "test ",
      "..test",
      "test..",
    ];

    invalidNames.forEach((name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Filename cannot start or end with a dot or space",
      );
    });
  });
});
