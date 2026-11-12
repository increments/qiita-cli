import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { QiitaApi } from "../qiita-api";
import {
  UnsupportedImageTypeError,
  uploadImage,
  uploadImageFile,
} from "./upload-image";

describe("uploadImage", () => {
  const originalFetch = global.fetch;
  const originalQiitaDomain = process.env.QIITA_DOMAIN;
  const mockFetch = jest.fn();
  const qiitaApi = new QiitaApi({ token: "token" });
  const data = new Uint8Array(Buffer.from("image binary"));
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

  const jsonResponse = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 201,
      headers: { "Content-Type": "application/json" },
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

  it("requests an upload policy and posts the image to the storage", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(policy))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const downloadUrl = await uploadImage({
      qiitaApi,
      name: "screenshot.png",
      data,
    });

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

    await expect(
      uploadImage({ qiitaApi, name: "screenshot.png", data }),
    ).rejects.toThrow(
      "ExpiredToken: Invalid according to Policy: Policy expired.",
    );
  });

  it("reports the reason Qiita rejected the upload policy", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        '{"message":"Asset size too large","type":"asset_size_too_large"}',
        { status: 403 },
      ),
    );

    await expect(
      uploadImage({ qiitaApi, name: "screenshot.png", data }),
    ).rejects.toMatchObject({
      name: "ImageUploadRejectedError",
      message: "Asset size too large",
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("reports the reason Qiita rejected the upload policy for a monthly limit", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        '{"message":"Monthly upload size limit","type":"monthly_upload_size_limit"}',
        { status: 403 },
      ),
    );

    await expect(
      uploadImage({ qiitaApi, name: "screenshot.png", data }),
    ).rejects.toMatchObject({
      name: "ImageUploadRejectedError",
      message: "Monthly upload size limit",
    });
  });

  it("keeps a forbidden response unrelated to the image as it is", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        '{"message":"Forbidden in team only mode","type":"forbidden_in_team_only_mode"}',
        { status: 403 },
      ),
    );

    await expect(
      uploadImage({ qiitaApi, name: "screenshot.png", data }),
    ).rejects.toMatchObject({
      name: "QiitaForbiddenError",
    });
  });

  it("rejects an image whose type Qiita does not accept", async () => {
    await expect(
      uploadImage({ qiitaApi, name: "screenshot.webp", data }),
    ).rejects.toThrow(UnsupportedImageTypeError);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("uploadImageFile", () => {
  const originalFetch = global.fetch;
  const originalQiitaDomain = process.env.QIITA_DOMAIN;
  const mockFetch = jest.fn();
  const qiitaApi = new QiitaApi({ token: "token" });
  let dir: string;

  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "qiita-cli-upload-image-"));
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

  it("uploads the file on the disk under its basename", async () => {
    const filePath = path.join(dir, "screenshot.png");
    await fs.writeFile(filePath, "image binary");
    mockFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            bucket: "qiita-image-store",
            download_url: "https://qiita-image-store.s3.amazonaws.com/a.png",
            form_data: {
              "x-amz-credential":
                "AKIAEXAMPLE/20260907/ap-northeast-1/s3/aws4_request",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const downloadUrl = await uploadImageFile({ qiitaApi, filePath });

    expect(downloadUrl).toBe(
      "https://qiita-image-store.s3.amazonaws.com/a.png",
    );
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      content_type: "image/png",
      name: "screenshot.png",
      size: 12,
    });
  });

  it("reports the path of a file whose type Qiita does not accept", async () => {
    const filePath = path.join(dir, "screenshot.webp");
    await fs.writeFile(filePath, "image binary");

    await expect(uploadImageFile({ qiitaApi, filePath })).rejects.toThrow(
      filePath,
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
