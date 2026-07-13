import { checkFrontmatterType } from "./check-frontmatter-type";

describe("checkFrontmatterType", () => {
  const frontMatter = {
    title: "Title",
    tags: ["Qiita", "Ruby"],
    secret: false,
    updatedAt: "",
    id: null,
    organizationUrlName: null,
    slide: false,
    postingCampaignUuid: null,
    agreedPostingCampaignTerm: false,
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

  describe("checkPostingCampaignUuid", () => {
    describe("when postingCampaignUuid is null", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        postingCampaignUuid: null,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when postingCampaignUuid is undefined", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        postingCampaignUuid: undefined,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when postingCampaignUuid is string", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        postingCampaignUuid: "abcde12345fghij67890",
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when postingCampaignUuid is number", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        postingCampaignUuid: 123 as unknown as string,
      });

      it("returns errors", () => {
        expect(errorMessages.length).toEqual(1);
      });
    });
  });

  describe("checkAgreedPostingCampaignTerm", () => {
    describe("when agreedPostingCampaignTerm is boolean", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        agreedPostingCampaignTerm: true,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when agreedPostingCampaignTerm is undefined", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        agreedPostingCampaignTerm: undefined,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when agreedPostingCampaignTerm is String", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        agreedPostingCampaignTerm: "true" as unknown as boolean,
      });

      it("returns errors", () => {
        expect(errorMessages.length).toEqual(1);
      });
    });
  });

  describe("checkFrontmatterTypeSlide", () => {
    describe("when slide is String", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        slide: "true" as unknown as boolean,
      });

      it("returns errors", () => {
        expect(errorMessages.length).toEqual(1);
      });
    });

    describe("when slide is true", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        slide: true,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });

    describe("when slide is false", () => {
      const errorMessages = checkFrontmatterType({
        ...frontMatter,
        slide: false,
      });

      it("returns no errors", () => {
        expect(errorMessages).toEqual([]);
      });
    });
  });
});
