import type Express from "express";
import { Router } from "express";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";

const redirectToArticleCss = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url = await resolveAssetsUrl("article_css_url");
  res.redirect(url);
};

const redirectToEmbedInitJs = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url = await resolveAssetsUrl("v3_embed_init_js_url");
  res.redirect(url);
};

const redirectToFavicon = async (
  req: Express.Request,
  res: Express.Response,
) => {
  const url = await resolveAssetsUrl("favicon_url");
  res.redirect(url);
};

const resolveAssetsUrl = (() => {
  let cachedAssetUrls: { [key: string]: string } | null = null;

  return async (key: string) => {
    if (cachedAssetUrls === null) {
      const qiitaApi = await getQiitaApiInstance();
      const assetUrls = await qiitaApi.getAssetUrls();

      cachedAssetUrls = assetUrls;
    }

    const url = cachedAssetUrls[key];
    if (!url) {
      throw new Error(`Asset not found: ${key}`);
    }

    return url;
  };
})();

export const AssetsRouter = Router()
  .get("/article.css", redirectToArticleCss)
  .get("/embed-init.js", redirectToEmbedInitJs)
  .get("/favicon.ico", redirectToFavicon);
