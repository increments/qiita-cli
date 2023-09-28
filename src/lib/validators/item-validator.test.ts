import { validateItem } from "./item-validator";

describe("validateItem", () => {
  const item = {
    title: "Title",
    rawBody: "Item body",
    tags: ["Qiita", "Ruby"],
    secret: false,
    organizationUrlName: null,
  };

  it("returns no errors", () => {
    const errorMessages = validateItem(item);
    expect(errorMessages).toEqual([]);
  });

  describe("validateItemTitle", () => {
    describe("when title is null", () => {
      const errorMessages = validateItem({ ...item, title: null });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("タイトルを入力してください");
      });
    });

    describe("when title is empty", () => {
      const errorMessages = validateItem({ ...item, title: "" });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("タイトルを入力してください");
      });
    });
  });

  describe("validateItemBody", () => {
    describe("when body is null", () => {
      const errorMessages = validateItem({ ...item, rawBody: null });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("本文を入力してください");
      });
    });

    describe("when rawBody is empty", () => {
      const errorMessages = validateItem({ ...item, rawBody: "" });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("本文を入力してください");
      });
    });
  });

  describe("validateItemTags", () => {
    describe("when tags is empty string", () => {
      const errorMessages = validateItem({ ...item, tags: [""] });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("タグを入力してください");
      });
    });
  });

  describe("validateLengthItemTags", () => {
    describe("when tags are empty", () => {
      const errorMessages = validateItem({ ...item, tags: [] });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain(
          "タグは1つ以上、5つ以内で指定してください",
        );
      });
    });

    describe("when tags are more than 5", () => {
      const errorMessages = validateItem({
        ...item,
        tags: [...Array(6)].map((_, i) => `tag${i}`),
      });

      it("return validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain(
          "タグは1つ以上、5つ以内で指定してください",
        );
      });
    });
  });

  describe("validateOrganizationSecretItem", () => {
    describe("when organizationUrlName exists", () => {
      const organizationUrlName = "qiita-inc";

      describe("and secret is true", () => {
        const errorMessages = validateItem({
          ...item,
          secret: true,
          organizationUrlName,
        });

        it("returns validation error message", () => {
          expect(errorMessages.length).toEqual(1);
          expect(errorMessages[0]).toContain(
            "限定共有記事にOrganizationを紐付けることはできません",
          );
        });
      });

      describe("and secret is false", () => {
        const errorMessages = validateItem({
          ...item,
          secret: false,
          organizationUrlName,
        });

        it("returns no validation error message", () => {
          expect(errorMessages).toEqual([]);
        });
      });
    });

    describe("when organizationUrlName does not exist", () => {
      const organizationUrlName = null;

      describe("and secret is true", () => {
        const errorMessages = validateItem({
          ...item,
          secret: true,
          organizationUrlName,
        });

        it("returns no validation error message", () => {
          expect(errorMessages).toEqual([]);
        });
      });

      describe("and secret is false", () => {
        const errorMessages = validateItem({
          ...item,
          secret: false,
          organizationUrlName,
        });

        it("returns no validation error message", () => {
          expect(errorMessages).toEqual([]);
        });
      });
    });
  });
});
