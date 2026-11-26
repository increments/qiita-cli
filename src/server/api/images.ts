import type Express from "express";
import { Router, raw } from "express";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import {
  ImageStorageError,
  ImageUploadRejectedError,
  UnsupportedImageTypeError,
  uploadImage,
} from "../../lib/upload-image";

const MAX_BODY_SIZE = "20mb";

const imagesCreate = async (req: Express.Request, res: Express.Response) => {
  const name = req.query.name;
  if (typeof name !== "string" || name === "") {
    res.status(400).json({ message: "画像のファイル名が指定されていません" });
    return;
  }

  const qiitaApi = await getQiitaApiInstance();

  try {
    const downloadUrl = await uploadImage({
      qiitaApi,
      name,
      data: new Uint8Array(req.body),
    });
    res.json({ download_url: downloadUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(uploadFailureStatus(error)).json({ message });
  }
};

const uploadFailureStatus = (error: unknown) => {
  switch (error instanceof Error ? error.name : "") {
    case UnsupportedImageTypeError.name:
      return 400;
    case ImageUploadRejectedError.name:
      return 422;
    case ImageStorageError.name:
      return 502;
    default:
      return 500;
  }
};

export const ImagesRouter = Router().post(
  "/",
  raw({ limit: MAX_BODY_SIZE, type: () => true }),
  imagesCreate,
);
