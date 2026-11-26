import {
  apiImagesCreatePath,
  apiItemsShowPath,
  apiItemsUpdatePath,
  apiReadmeShowPath,
  apiSlidesShowPath,
  itemsIndexPath,
  itemsShowPath,
  slidesShowPath,
} from "./qiita-cli-url";

describe("apiItemsShowPath", () => {
  const itemId = "c686397e4a0f4f11683d";

  it("returns api items show path", () => {
    const url = apiItemsShowPath(itemId);
    expect(url).toEqual(`/api/items/${itemId}`);
  });

  describe("when itemId is 'show' and basename param exists", () => {
    const itemId = "show";
    const basename = "newArticle";

    it("returns api items show path", () => {
      const url = apiItemsShowPath(itemId, { basename: basename });
      expect(url).toEqual(`/api/items/${itemId}?basename=${basename}`);
    });
  });
});

describe("apiItemsUpdatePath", () => {
  const itemId = "c686397e4a0f4f11683d";

  it("returns api items update path", () => {
    const url = apiItemsUpdatePath(itemId);
    expect(url).toEqual(`/api/items/${itemId}`);
  });

  describe("when itemId is 'show'", () => {
    const itemId = "show";

    it("returns api items update path", () => {
      const url = apiItemsUpdatePath(itemId);
      expect(url).toEqual(`/api/items/post`);
    });
  });
});

describe("apiReadmeShowPath", () => {
  it("returns api readme show path", () => {
    const url = apiReadmeShowPath();
    expect(url).toEqual(`/api/readme`);
  });
});

describe("itemsIndexPath", () => {
  it("returns items index path", () => {
    const url = itemsIndexPath();
    expect(url).toEqual(`/`);
  });
});

describe("itemsShowPath", () => {
  const itemId = "c686397e4a0f4f11683d";

  it("returns items show path", () => {
    const url = itemsShowPath(itemId);
    expect(url).toEqual(`/items/${itemId}`);
  });

  describe("when itemId is 'show' and basename param exists", () => {
    const itemId = "show";
    const basename = "newArticle";

    it("returns items show path", () => {
      const url = itemsShowPath(itemId, { basename: basename });
      expect(url).toEqual(`/items/${itemId}?basename=${basename}`);
    });
  });
});

describe("slidesShowPath", () => {
  const slideId = "c686397e4a0f4f11683d";

  it("returns slides show path", () => {
    const url = slidesShowPath(slideId);
    expect(url).toEqual(`/slides/${slideId}`);
  });

  describe("when slideId is 'show' and basename param exists", () => {
    const slideId = "show";
    const basename = "newSlide";

    it("returns slides show path", () => {
      const url = slidesShowPath(slideId, { basename: basename });
      expect(url).toEqual(`/slides/${slideId}?basename=${basename}`);
    });
  });
});

describe("apiSlidesShowPath", () => {
  const slideId = "c686397e4a0f4f11683d";

  it("returns api slides show path", () => {
    const url = apiSlidesShowPath(slideId);
    expect(url).toEqual(`/api/slides/${slideId}`);
  });

  describe("when slideId is 'show' and basename param exists", () => {
    const slideId = "show";
    const basename = "newSlide";

    it("returns api slides show path", () => {
      const url = apiSlidesShowPath(slideId, { basename: basename });
      expect(url).toEqual(`/api/slides/${slideId}?basename=${basename}`);
    });
  });
});

describe("apiImagesCreatePath", () => {
  it("returns api images create path", () => {
    const url = apiImagesCreatePath("screenshot.png");
    expect(url).toEqual(`/api/images?name=screenshot.png`);
  });

  describe("when the name needs escaping", () => {
    it("escapes the name", () => {
      const url = apiImagesCreatePath("スクリーンショット 1.png");
      expect(url).toEqual(
        `/api/images?name=%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88+1.png`,
      );
    });
  });
});
