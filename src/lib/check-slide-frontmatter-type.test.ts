import { checkSlideFrontmatterType } from "./check-slide-frontmatter-type";

describe("checkSlideFrontmatterType", () => {
  const frontMatter = {
    title: "Title",
    id: null,
    updatedAt: null,
    description: null,
  };

  it("returns no errors", () => {
    const errorMessages = checkSlideFrontmatterType(frontMatter);
    expect(errorMessages).toEqual([]);
  });

  describe("checkTitle", () => {
    describe("when title is null", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          title: null,
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when title is a number", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          title: 123 as unknown as string,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });

  describe("checkId", () => {
    describe("when id is a string", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          id: "42dc00fafa166fa73d01",
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when id is a number", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          id: 123 as unknown as string,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });

  describe("checkUpdatedAt", () => {
    describe("when updatedAt is null", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          updatedAt: null,
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when updatedAt is a number", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          updatedAt: 123 as unknown as string,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });

  describe("checkDescription", () => {
    describe("when description is null", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          description: null,
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when description is a number", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          description: 123 as unknown as string,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });
});
