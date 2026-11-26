import process from "node:process";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { uploadImageFile } from "../lib/upload-image";

export const upload = async (argv: string[]) => {
  if (argv.length === 0) {
    console.error("Error: no image file is specified");
    process.exit(1);
    return;
  }

  const qiitaApi = await getQiitaApiInstance();

  for (const filePath of argv) {
    console.log(await uploadImageFile({ filePath, qiitaApi }));
  }
};
