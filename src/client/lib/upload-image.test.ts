import { uploadImage } from "./upload-image";

describe("uploadImage", () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  const file = new File(["image binary"], "スクリーンショット.png", {
    type: "image/png",
  });

  beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof global.fetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("posts the file to the preview server and returns its download URL", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ download_url: "https://image-store.example/a.png" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const downloadUrl = await uploadImage(file);

    expect(downloadUrl).toBe("https://image-store.example/a.png");
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "/api/images?name=%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88.png",
    );
    expect(options.method).toBe("POST");
    expect(options.body).toBe(file);
  });

  it("throws the message the preview server reported", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Asset size too large" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(uploadImage(file)).rejects.toThrow("Asset size too large");
  });

  it("throws a fallback message when the response is not a reported failure", async () => {
    mockFetch.mockResolvedValueOnce(new Response("", { status: 500 }));

    await expect(uploadImage(file)).rejects.toThrow(
      "画像のアップロードに失敗しました",
    );
  });
});
