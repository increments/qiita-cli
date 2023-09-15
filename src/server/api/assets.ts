import type Express from "express";
import { Router } from "express";

const redirectToArticleCss = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url =
    process.env.QIITA_ASSETS_ARTICLE_CSS ||
    (await resolveAssetsUrl("public/article.css"));
  res.redirect(url);
};

const redirectToEmbedInitJs = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url =
    process.env.QIITA_ASSETS_EMBED_INIT_JS ||
    (await resolveAssetsUrl("public/v3-embed-init.js"));
  res.redirect(url);
};

const redirectToFavicon = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url =
    process.env.QIITA_ASSETS_FAVICON ||
    (await resolveAssetsUrl("favicons/public/production.ico"));
  res.redirect(url);
};

const resolveAssetsUrl = async (key: string) => {
  const latest_manifest_url =
    "https://qiita.com/assets/.latest_client_manifest_name_production";

  const cdnAssetsUrl = "https://cdn.qiita.com/assets";

  const clientManifestFileName = await (
    await fetch(latest_manifest_url)
  ).text();
  const json = await (
    await fetch(`${cdnAssetsUrl}/${clientManifestFileName}`)
  ).json();

  const filename = json[key];
  if (filename === undefined) {
    throw new Error(`Asset not found: ${key}`);
  }

  return `${cdnAssetsUrl}/${filename}`;
};

export const AssetsRouter = Router()
  .get("/article.css", redirectToArticleCss)
  .get("/embed-init.js", redirectToEmbedInitJs)
  .get("/favicon.ico", redirectToFavicon);
