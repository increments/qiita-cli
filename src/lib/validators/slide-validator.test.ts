import { validateSlide, validatePublishSlide } from "./slide-validator";

describe("validateSlide", () => {
  const slide = {
    title: "Title",
    rawBody: "Slide body",
  };

  it("returns no errors", () => {
    const errorMessages = validateSlide(slide);
    expect(errorMessages).toEqual([]);
  });

  describe("validateSlideTitle", () => {
    describe("when title is null", () => {
      const errorMessages = validateSlide({ ...slide, title: null });

      it("returns validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("タイトルを入力してください");
      });
    });

    describe("when title is empty", () => {
      const errorMessages = validateSlide({ ...slide, title: "" });

      it("returns validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("タイトルを入力してください");
      });
    });
  });

  describe("validateSlideRawBody", () => {
    describe("when rawBody is null", () => {
      const errorMessages = validateSlide({ ...slide, rawBody: null });

      it("returns validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("本文を入力してください");
      });
    });

    describe("when rawBody is empty", () => {
      const errorMessages = validateSlide({ ...slide, rawBody: "" });

      it("returns validation error message", () => {
        expect(errorMessages.length).toEqual(1);
        expect(errorMessages[0]).toContain("本文を入力してください");
      });
    });
  });
});

describe("validatePublishSlide", () => {
  const publishSlide = {
    title: "Title",
    rawBody: "# Title",
    id: null,
    updatedAt: null,
    description: null,
    ignorePublish: false,
    isOlderThanRemote: false,
  };

  it("returns no errors for a publishable slide", () => {
    expect(validatePublishSlide(publishSlide, { force: false })).toEqual([]);
  });

  describe("when the frontmatter type is wrong and the value is also invalid", () => {
    it("reports only the frontmatter error", () => {
      const errorMessages = validatePublishSlide(
        { ...publishSlide, title: 1 as unknown as string },
        { force: false },
      );

      expect(errorMessages).toEqual(["titleは文字列で入力してください"]);
    });
  });

  describe("when the slide is invalid and older than the remote", () => {
    it("reports only the validation error", () => {
      const errorMessages = validatePublishSlide(
        { ...publishSlide, rawBody: "", isOlderThanRemote: true },
        { force: false },
      );

      expect(errorMessages).toEqual(["本文を入力してください"]);
    });
  });

  describe("when the slide is only older than the remote", () => {
    it("reports it", () => {
      expect(
        validatePublishSlide(
          { ...publishSlide, isOlderThanRemote: true },
          { force: false },
        ),
      ).toEqual(["内容がQiita上のスライドより古い可能性があります"]);
    });

    it("reports nothing when force is given", () => {
      expect(
        validatePublishSlide(
          { ...publishSlide, isOlderThanRemote: true },
          { force: true },
        ),
      ).toEqual([]);
    });
  });
});
