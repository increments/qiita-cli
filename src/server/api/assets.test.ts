import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { QiitaApi } from "../../qiita-api";
import { AssetsRouter } from "./assets";

jest.mock("../../lib/get-qiita-api-instance");

const mockGetQiitaApiInstance = jest.mocked(getQiitaApiInstance);

const assetEnvironmentVariables = [
  "QIITA_ASSETS_ARTICLE_CSS",
  "QIITA_ASSETS_EMBED_INIT_JS",
  "QIITA_ASSETS_FAVICON",
] as const;

describe("AssetsRouter", () => {
  let server: Server;
  let baseUrl: string;
  const originalEnvironment = Object.fromEntries(
    assetEnvironmentVariables.map((name) => [name, process.env[name]]),
  );

  beforeAll(async () => {
    const app = express();
    app.use("/assets", AssetsRouter);
    server = createServer(app);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, "127.0.0.1", () => resolve());
      server.once("error", reject);
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    for (const name of assetEnvironmentVariables) {
      const value = originalEnvironment[name];
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    for (const name of assetEnvironmentVariables) {
      delete process.env[name];
    }
  });

  it("uses each configured asset URL and falls back to the API URLs", async () => {
    const overrides = {
      QIITA_ASSETS_ARTICLE_CSS: "https://dev.example/article.css",
      QIITA_ASSETS_EMBED_INIT_JS: "https://dev.example/embed-init.js",
      QIITA_ASSETS_FAVICON: "https://dev.example/favicon.ico",
    };
    Object.assign(process.env, overrides);

    await expectRedirect(
      "/assets/article.css",
      overrides.QIITA_ASSETS_ARTICLE_CSS,
    );
    await expectRedirect(
      "/assets/embed-init.js",
      overrides.QIITA_ASSETS_EMBED_INIT_JS,
    );
    await expectRedirect("/assets/favicon.ico", overrides.QIITA_ASSETS_FAVICON);
    expect(mockGetQiitaApiInstance).not.toHaveBeenCalled();

    const getAssetUrls = jest.fn().mockResolvedValue({
      article_css_url: "https://cdn.example/article.css",
      v3_embed_init_js_url: "https://cdn.example/embed-init.js",
      favicon_url: "https://cdn.example/favicon.ico",
    });
    mockGetQiitaApiInstance.mockResolvedValue({
      getAssetUrls,
    } as unknown as QiitaApi);

    for (const name of assetEnvironmentVariables) {
      process.env[name] = "";
    }

    await expectRedirect(
      "/assets/article.css",
      "https://cdn.example/article.css",
    );
    await expectRedirect(
      "/assets/embed-init.js",
      "https://cdn.example/embed-init.js",
    );
    await expectRedirect(
      "/assets/favicon.ico",
      "https://cdn.example/favicon.ico",
    );
    expect(mockGetQiitaApiInstance).toHaveBeenCalledTimes(1);
    expect(getAssetUrls).toHaveBeenCalledTimes(1);

    process.env.QIITA_ASSETS_ARTICLE_CSS = "https://dev.example/partial.css";
    await expectRedirect(
      "/assets/article.css",
      "https://dev.example/partial.css",
    );
    await expectRedirect(
      "/assets/embed-init.js",
      "https://cdn.example/embed-init.js",
    );
    await expectRedirect(
      "/assets/favicon.ico",
      "https://cdn.example/favicon.ico",
    );
    expect(mockGetQiitaApiInstance).toHaveBeenCalledTimes(1);
  });

  const expectRedirect = async (path: string, location: string) => {
    const response = await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(location);
  };
});
