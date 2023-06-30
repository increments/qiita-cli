import type Express from "express";
import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../../lib/config";
import { QiitaApi } from "../../qiita-api";

const readmeIndex = async (req: Express.Request, res: Express.Response) => {
  try {
    const fileContent = await fs.readFile(
      path.join(path.resolve(__dirname), "../../../", "README.md"),
      { encoding: "utf8" }
    );
    const { accessToken } = await config.getCredential();
    const qiitaApi = new QiitaApi({ token: accessToken });
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
