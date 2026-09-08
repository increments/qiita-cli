import fs from "node:fs/promises";
import path from "node:path";
import { QiitaForbiddenError } from "../qiita-api";
import type { QiitaApi, UploadPolicy } from "../qiita-api";

const contentTypes: { [extension: string]: string } = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

export class UnsupportedImageTypeError extends Error {
  constructor(filePath: string) {
    super(
      `'${filePath}' はアップロードできない拡張子です (${Object.keys(
        contentTypes,
      ).join(", ")} のみアップロードできます)`,
    );
    this.name = "UnsupportedImageTypeError";
  }
}

export class ImageUploadRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadRejectedError";
  }
}

export class ImageStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageStorageError";
  }
}

export const supportedImageExtensions = Object.keys(contentTypes);

export const uploadImage = async ({
  qiitaApi,
  name,
  data,
}: {
  qiitaApi: QiitaApi;
  name: string;
  data: Uint8Array<ArrayBuffer>;
}) => {
  const contentType = requireImageContentType(name);
  const file = new Blob([data], { type: contentType });

  const policy = await requestUploadPolicy({
    contentType,
    name,
    qiitaApi,
    size: file.size,
  });
  await postToStorage({ file, name, policy });

  return policy.download_url;
};

export const uploadImageFile = async ({
  qiitaApi,
  filePath,
}: {
  qiitaApi: QiitaApi;
  filePath: string;
}) => {
  requireImageContentType(filePath);

  return await uploadImage({
    qiitaApi,
    name: path.basename(filePath),
    data: new Uint8Array(await fs.readFile(filePath)),
  });
};

const requireImageContentType = (fileName: string) => {
  const contentType = contentTypes[path.extname(fileName).toLowerCase()];
  if (!contentType) {
    throw new UnsupportedImageTypeError(fileName);
  }

  return contentType;
};

const requestUploadPolicy = async ({
  contentType,
  name,
  qiitaApi,
  size,
}: {
  contentType: string;
  name: string;
  qiitaApi: QiitaApi;
  size: number;
}) => {
  try {
    return await qiitaApi.uploadPolicy({ contentType, name, size });
  } catch (error) {
    if (error instanceof QiitaForbiddenError) {
      const rejection = imageRejection(error.message);
      if (rejection) {
        throw new ImageUploadRejectedError(rejection);
      }
    }
    throw error;
  }
};

const imageRejectionTypes = [
  "asset_size_too_large",
  "monthly_upload_size_limit",
];

const imageRejection = (responseBody: string) => {
  try {
    const { message, type } = JSON.parse(responseBody);
    return imageRejectionTypes.includes(type) ? (message as string) : undefined;
  } catch {
    return undefined;
  }
};

const postToStorage = async ({
  file,
  name,
  policy,
}: {
  file: Blob;
  name: string;
  policy: UploadPolicy;
}) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(policy.form_data)) {
    formData.append(key, value);
  }
  formData.append("file", file, name);

  const response = await fetch(storageUrl(policy), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ImageStorageError(storageErrorMessage(await response.text()));
  }
};

const storageUrl = ({ bucket, form_data }: UploadPolicy) => {
  const region = form_data["x-amz-credential"].split("/")[2];
  return `https://${bucket}.s3.${region}.amazonaws.com`;
};

const storageErrorMessage = (responseBody: string) => {
  const code = responseBody.match(/<Code>([^<]*)<\/Code>/)?.[1];
  const message = responseBody.match(/<Message>([^<]*)<\/Message>/)?.[1];
  return code ? `${code}: ${message}` : responseBody.slice(0, 100);
};
