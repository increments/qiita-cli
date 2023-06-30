import { itemUrl } from "./qiita-url";

describe("itemUrl", () => {
  const id = "c686397e4a0f4f11683d";
  const userId = "Qiita";

  it("returns item url", () => {
    const url = itemUrl({ id, userId });
    expect(url).toEqual(`https://qiita.com/${userId}/items/${id}`);
  });
});
