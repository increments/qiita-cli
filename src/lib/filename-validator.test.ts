import {
  validateFilename,
  ERROR_FILENAME_EMPTY,
  ERROR_INVALID_CHARACTERS,
  ERROR_INVALID_START_END,
} from "./filename-validator";

describe("validateFilename", () => {
  it.each([
    "test",
    "test-article",
    "test_article",
    "test123",
    "記事テスト",
    "article.backup",
    "my-awesome-article",
    "test file",
  ])("should accept valid filename '%s'", (name) => {
    const result = validateFilename(name);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it.each(["", " ", "  ", "\t", "\n"])(
    "should reject empty or whitespace-only filename '%s'",
    (name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_FILENAME_EMPTY);
    },
  );

  it.each([
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
  ])("should reject filename with invalid characters '%s'", (name) => {
    const result = validateFilename(name);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(ERROR_INVALID_CHARACTERS);
  });

  it.each([".test", "test.", " test", "test ", "..test", "test.."])(
    "should reject filename starting or ending with dots or spaces '%s'",
    (name) => {
      const result = validateFilename(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_INVALID_START_END);
    },
  );
});
