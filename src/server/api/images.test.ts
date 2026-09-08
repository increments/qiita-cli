import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { QiitaApi } from "../../qiita-api";
import { ImagesRouter } from "./images";

jest.mock("../../lib/get-qiita-api-instance");

const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);

describe("ImagesRouter", () => {
  let server: Server;
  let baseUrl: string;
  const originalFetch = global.fetch;
  const originalQiitaDomain = process.env.QIITA_DOMAIN;
  const mockFetch = jest.fn();
  const policy = {
    bucket: "qiita-image-store",
    download_url: "https://qiita-image-store.s3.amazonaws.com/0/1/9dd0b2fd.png",
    form_data: {
      key: "0/1/9dd0b2fd.png",
      "x-amz-credential": "AKIAEXAMPLE/20260907/ap-northeast-1/s3/aws4_request",
    },
  };

  beforeAll(async () => {
    const app = express();
    app.use("/api/images", ImagesRouter);
    server = createServer(app);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.QIITA_DOMAIN = "qiita.example.com";
    mockGetQiitaApiInstance.mockResolvedValue(new QiitaApi({ token: "token" }));
    mockFetch.mockReset();
    global.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
      String(input).startsWith(baseUrl)
        ? originalFetch(input, init)
        : mockFetch(String(input), init)) as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalQiitaDomain === undefined) {
      delete process.env.QIITA_DOMAIN;
    } else {
      process.env.QIITA_DOMAIN = originalQiitaDomain;
    }
  });

  const postImage = async (query: string) =>
    await fetch(`${baseUrl}/api/images${query}`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: new Uint8Array(Buffer.from("image binary")),
    });

  it("uploads the posted image and returns its download URL", async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify(policy), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const response = await postImage("?name=screenshot.png");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      download_url: policy.download_url,
    });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      content_type: "image/png",
      name: "screenshot.png",
      size: 12,
    });
  });

  it("reports the reason Qiita rejected the image", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        '{"message":"Asset size too large","type":"asset_size_too_large"}',
        { status: 403 },
      ),
    );

    const response = await postImage("?name=screenshot.png");

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ message: "Asset size too large" });
  });

  it("reports the reason the storage rejected the image", async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify(policy), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          "<Error><Code>ExpiredToken</Code><Message>Policy expired.</Message></Error>",
          { status: 403 },
        ),
      );

    const response = await postImage("?name=screenshot.png");

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      message: "ExpiredToken: Policy expired.",
    });
  });

  it("rejects an image whose type Qiita does not accept", async () => {
    const response = await postImage("?name=screenshot.webp");

    expect(response.status).toBe(400);
    expect((await response.json()).message).toContain("screenshot.webp");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("requires the name of the image", async () => {
    const response = await postImage("");

    expect(response.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
