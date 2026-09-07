import process from "node:process";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { uploadImage } from "../lib/upload-image";

export const upload = async (argv: string[]) => {
  if (argv.length === 0) {
    console.error("Error: アップロードする画像ファイルを指定してください");
    process.exit(1);
    return;
  }

  const qiitaApi = await getQiitaApiInstance();

  for (const filePath of argv) {
    console.log(await uploadImage({ filePath, qiitaApi }));
  }
};
