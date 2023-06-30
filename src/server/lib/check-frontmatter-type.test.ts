import { checkFrontmatterType } from "./check-frontmatter-type";

describe("checkFrontmatterType", () => {
  const frontMatter = {
    title: "Title",
    tags: ["Qiita", "Ruby"],
    secret: false,
    updatedAt: "",
    id: null,
    organizationUrlName: null,
  };

  it("returns no errors", () => {
    const errorMessages = checkFrontmatterType(frontMatter);
    expect(errorMessages).toEqual([]);
  });

  describe("checkFrontmatterTypeTitle", () => {
    describe("when title is null", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        title: null,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when title is empty", () => {
      const errorMessages = checkFrontmatterType({ ...frontMatter, title: "" });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });

  describe("checkFrontmatterTypeTags", () => {
    describe("when tags are empty", () => {
      const errorMessages = checkFrontmatterType({ ...frontMatter, tags: [] });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });

  describe("checkFrontmatterTypeSecret", () => {
    describe("when secret is true", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        secret: true,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });

  describe("checkFrontmatterTypeUpdatedAt", () => {
    describe("when updatedAt is null", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        updatedAt: null,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when updatedAt is date", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        updatedAt: "2023-06-13T10:01:44+09:00",
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });

  describe("checkFrontmatterTypeOrganizationUrlName", () => {
    describe("when id is empty", () => {
      const errorMessages = checkFrontmatterType({ ...frontMatter, id: "" });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when id is uuid", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        id: "42dc00fafa166fa73d01",
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });

  describe("checkFrontmatterTypeId", () => {
    describe("when organizationUrlName is empty", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        organizationUrlName: "",
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when organizationUrlName is qiita-inc", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        organizationUrlName: "qiita-inc",
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });
});
