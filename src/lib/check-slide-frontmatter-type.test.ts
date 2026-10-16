import type { SlideVisibility } from "../qiita-api";
import { checkSlideFrontmatterType } from "./check-slide-frontmatter-type";

describe("checkSlideFrontmatterType", () => {
  const frontMatter = {
    title: "Title",
    id: null,
    updatedAt: null,
    description: null,
    ignorePublish: false,
    visibility: { type: "public" as const },
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

  describe("checkIgnorePublish", () => {
    describe("when ignorePublish is true", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          ignorePublish: true,
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when ignorePublish is a string", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          ignorePublish: "true" as unknown as boolean,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });
  describe("checkVisibility", () => {
    describe("when visibility is members_only with url_names", () => {
      it("returns no errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          visibility: { type: "members_only", url_names: ["alice"] },
        });
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when visibility is missing", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          visibility: undefined as unknown as SlideVisibility,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });

    describe("when visibility is a string", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          visibility: "public" as unknown as SlideVisibility,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });

    describe("when visibility type is unknown", () => {
      it("returns errors", () => {
        const errorMessages = checkSlideFrontmatterType({
          ...frontMatter,
          visibility: { type: "private" } as unknown as SlideVisibility,
        });
        expect(errorMessages.length).toEqual(1);
      });
    });
  });
});
