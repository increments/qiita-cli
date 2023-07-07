import { QiitaApi } from "../qiita-api";
import { config } from "./config";
import { PackageSettings } from "./package-settings";

let qiitaApi: QiitaApi;

export const getQiitaApiInstance = async (options?: { token?: string }) => {
  if (!qiitaApi) {
    qiitaApi = new QiitaApi({
      token: await accessToken(options),
      userAgent: userAgent(),
    });
  }
  return qiitaApi;
};

const accessToken = async (options?: { token?: string }) =>
  options?.token ?? (await config.getCredential()).accessToken;

const userAgent = () => {
  return `${PackageSettings.userAgentName}/${PackageSettings.version}`;
};
