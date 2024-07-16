import { URL, URLSearchParams } from "node:url";
import {
  QiitaBadRequestError,
  QiitaFetchError,
  QiitaForbiddenError,
  QiitaInternalServerError,
  QiitaNotFoundError,
  QiitaRateLimitError,
  QiitaUnauthorizedError,
  QiitaUnknownError,
} from "./errors";
import { qiitaApiDebugger } from "./lib/debugger";

export * from "./errors";

export interface Item {
  body: string;
  id: string;
  private: boolean;
  tags: {
    name: string;
  }[];
  title: string;
  organization_url_name: string | null;
  coediting: boolean;
  created_at: string;
  updated_at: string;
  slide: boolean;
}

export class QiitaApi {
  private readonly token: string;
  private readonly userAgent: string;

  static agentName = "QiitaApi";
  static version = "0.0.1";

  constructor({ token, userAgent }: { token: string; userAgent?: string }) {
    this.token = token;
    this.userAgent = userAgent ? userAgent : QiitaApi.defaultUserAgent();
  }

  static defaultUserAgent() {
    return `${QiitaApi.agentName}/${QiitaApi.version}`;
  }

  private getUrlScheme() {
    return "https";
  }

  private getDomainName() {
    return process.env.QIITA_DOMAIN ? process.env.QIITA_DOMAIN : "qiita.com";
  }

  private getBaseUrl() {
    const hostname = this.getDomainName();
    return `${this.getUrlScheme()}://${hostname}/`;
  }

  private getPreviewUrl() {
    return `${this.getUrlScheme()}://${this.getDomainName()}`;
  }

  private async request<T = unknown>(url: string, options: RequestInit) {
    let response;

    try {
      qiitaApiDebugger(`request to`, url, JSON.stringify(options));

      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          "User-Agent": this.userAgent,
        },
        ...options,
      });
    } catch (err) {
      console.error(err);
      throw new QiitaFetchError((err as Error).message);
    }

    if (response.ok) {
      const body = await response.text();

      try {
        return JSON.parse(body) as T;
      } catch {
        return body as T;
      }
    }

    const responseBody = await response.text();
    if (qiitaApiDebugger.enabled) {
      qiitaApiDebugger(
        "request failed",
        JSON.stringify({
          status: response.status,
          responseBody,
        }),
      );
    }

    const errorMessage = responseBody.slice(0, 100);
    switch (response.status) {
      case 400:
        throw new QiitaBadRequestError(errorMessage);
      case 401:
        throw new QiitaUnauthorizedError(errorMessage);
      case 403:
        throw new QiitaForbiddenError(errorMessage);
      case 404:
        throw new QiitaNotFoundError(errorMessage);
      case 429:
        throw new QiitaRateLimitError(errorMessage);
      case 500:
        throw new QiitaInternalServerError(errorMessage);
      default:
        throw new QiitaUnknownError(errorMessage);
    }
  }

  private generateApiUrl(path: string) {
    const baseUrl =
      path === "/api/preview" ? this.getPreviewUrl() : this.getBaseUrl();
    return new URL(path, baseUrl).toString();
  }

  private async get<T = unknown>(path: string, options?: RequestInit) {
    const url = this.generateApiUrl(path);
    return await this.request<T>(url, {
      ...options,
      method: "GET",
    });
  }

  private async post<T = unknown>(path: string, options?: RequestInit) {
    const url = this.generateApiUrl(path);
    return await this.request<T>(url, {
      ...options,
      method: "POST",
    });
  }

  private async patch<T = unknown>(path: string, options?: RequestInit) {
    const url = this.generateApiUrl(path);
    return await this.request<T>(url, {
      ...options,
      method: "PATCH",
    });
  }

  async authenticatedUser() {
    return await this.get<{ id: string }>("/api/v2/authenticated_user");
  }

  async authenticatedUserItems(page?: number, per?: number) {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.set("page", page.toString());
    }
    if (per !== undefined) {
      params.set("per_page", per.toString());
    }

    const path = `/api/v2/authenticated_user/items?${params}`;

    return await this.get<Item[]>(path);
  }

  async preview(rawBody: string) {
    const body = JSON.stringify({
      parser_type: "qiita_cli",
      raw_body: rawBody,
    });

    return await this.post<string>("/api/preview", {
      body,
    });
  }

  async items(page?: number, per?: number, query?: string) {
    const params = new URLSearchParams();
    if (page !== undefined) {
      params.set("page", page.toString());
    }
    if (per !== undefined) {
      params.set("per_page", per.toString());
    }
    if (query !== undefined) {
      params.set("query", query);
    }

    const path = `/api/v2/items?${params}`;

    return await this.get<Item[]>(path);
  }

  async postItem({
    rawBody,
    tags,
    title,
    isPrivate,
    organizationUrlName,
    slide,
  }: {
    rawBody: string;
    tags: string[];
    title: string;
    isPrivate: boolean;
    organizationUrlName: string | null;
    slide: boolean;
  }) {
    const data = JSON.stringify({
      body: rawBody,
      title,
      tags: tags.map((name) => {
        return {
          name,
          versions: [],
        };
      }),
      private: isPrivate,
      organization_url_name: organizationUrlName,
      slide,
    });

    const path = `/api/v2/items`;

    return await this.post<Item>(path, {
      body: data,
    });
  }

  async patchItem({
    uuid,
    rawBody,
    title,
    tags,
    isPrivate,
    organizationUrlName,
    slide,
  }: {
    uuid: string;
    rawBody: string;
    title: string;
    tags: string[];
    isPrivate: boolean;
    organizationUrlName: string | null;
    slide: boolean;
  }) {
    const data = JSON.stringify({
      body: rawBody,
      title,
      tags: tags.map((name) => {
        return {
          name,
          versions: [],
        };
      }),
      private: isPrivate,
      organization_url_name: organizationUrlName,
      slide,
    });

    const path = `/api/v2/items/${uuid}`;

    return await this.patch<Item>(path, {
      body: data,
    });
  }

  async getAssetUrls() {
    return await this.get<{ [key: string]: string }>("/api/qiita-cli/assets");
  }
}
