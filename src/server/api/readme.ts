import type Express from "express";
import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../../lib/config";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { QiitaApi } from "../../qiita-api";

const readmeIndex = async (req: Express.Request, res: Express.Response) => {
  try {
    const fileContent = await fs.readFile(
      path.join(path.resolve(__dirname), "../../../", "README.md"),
      { encoding: "utf8" }
    );
    const qiitaApi = await getQiitaApiInstance();
    const renderedBody = await qiitaApi.preview(fileContent);

    res.json({
      renderedBody,
    });
  } catch (err: any) {
    res.status(404).json({
      message: "Not found",
    });
  }
};

export const ReadmeRouter = Router().get("/", readmeIndex);
