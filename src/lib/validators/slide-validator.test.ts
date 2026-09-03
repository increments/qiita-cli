import { validateSlide } from "./slide-validator";

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
