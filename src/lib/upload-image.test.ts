import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { QiitaApi } from "../qiita-api";
import { UnsupportedImageTypeError, uploadImage } from "./upload-image";

describe("uploadImage", () => {
  const originalFetch = global.fetch;
  const originalQiitaDomain = process.env.QIITA_DOMAIN;
  const mockFetch = jest.fn();
  const qiitaApi = new QiitaApi({ token: "token" });
  const policy = {
    bucket: "qiita-image-store",
    download_url: "https://qiita-image-store.s3.amazonaws.com/0/1/9dd0b2fd.png",
    form_data: {
      key: "0/1/9dd0b2fd.png",
      acl: "public-read",
      "Content-Type": "image/png",
      policy: "BASE64ENCODEDPOLICY",
      "x-amz-credential": "AKIAEXAMPLE/20260907/ap-northeast-1/s3/aws4_request",
      "x-amz-algorithm": "AWS4-HMAC-SHA256",
      "x-amz-date": "20260907T000000Z",
      "x-amz-signature": "SIGNATURE",
    },
  };
  let dir: string;
  let filePath: string;

  const jsonResponse = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "qiita-cli-upload-image-"));
    filePath = path.join(dir, "screenshot.png");
    await fs.writeFile(filePath, "image binary");
  });

  beforeEach(() => {
    process.env.QIITA_DOMAIN = "qiita.example.com";
    global.fetch = mockFetch as unknown as typeof global.fetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalQiitaDomain === undefined) {
      delete process.env.QIITA_DOMAIN;
    } else {
      process.env.QIITA_DOMAIN = originalQiitaDomain;
    }
  });

  it("requests an upload policy and posts the file to the storage", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(policy))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const downloadUrl = await uploadImage({ qiitaApi, filePath });

    expect(downloadUrl).toBe(policy.download_url);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const [policyUrl, policyOptions] = mockFetch.mock.calls[0];
    expect(policyUrl).toBe("https://qiita.example.com/api/v2/upload_policies");
    expect(policyOptions.method).toBe("POST");
    expect(JSON.parse(policyOptions.body)).toEqual({
      content_type: "image/png",
      name: "screenshot.png",
      size: 12,
    });

    const [storageUrl, storageOptions] = mockFetch.mock.calls[1];
    expect(storageUrl).toBe(
      "https://qiita-image-store.s3.ap-northeast-1.amazonaws.com",
    );
    expect(storageOptions.method).toBe("POST");

    const entries = [
      ...(storageOptions.body as unknown as Iterable<
        [string, FormDataEntryValue]
      >),
    ];
    expect(entries.map(([key]) => key)).toEqual([
      ...Object.keys(policy.form_data),
      "file",
    ]);
    const file = entries[entries.length - 1][1] as File;
    expect(file.name).toBe("screenshot.png");
    expect(file.type).toBe("image/png");
    expect(file.size).toBe(12);
  });

  it("reports the reason the storage rejected the upload", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(policy))
      .mockResolvedValueOnce(
        new Response(
          "<?xml version='1.0' encoding='UTF-8'?><Error><Code>ExpiredToken</Code><Message>Invalid according to Policy: Policy expired.</Message></Error>",
          { status: 403 },
        ),
      );

    await expect(uploadImage({ qiitaApi, filePath })).rejects.toThrow(
      "ExpiredToken: Invalid according to Policy: Policy expired.",
    );
  });

  it("rejects a file whose type Qiita does not accept", async () => {
    const webpPath = path.join(dir, "screenshot.webp");
    await fs.writeFile(webpPath, "image binary");

    await expect(uploadImage({ qiitaApi, filePath: webpPath })).rejects.toThrow(
      UnsupportedImageTypeError,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
