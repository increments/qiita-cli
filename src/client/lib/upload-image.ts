import { apiImagesCreatePath } from "../../lib/qiita-cli-url";

export const uploadImage = async (file: File) => {
  const response = await fetch(apiImagesCreatePath(file.name), {
    method: "POST",
    body: file,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "画像のアップロードに失敗しました");
  }

  return data.download_url as string;
};
