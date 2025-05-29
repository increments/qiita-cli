import type Express from "express";
import { Router } from "express";

const redirect = (req: Express.Request, res: Express.Response) => {
  const cdnUrl = "https://cdn.qiita.com";
  res.redirect(`${cdnUrl}${req.baseUrl}${req.path}`);
};

export const EmojiRouter = Router().get("/{*q}", redirect);
