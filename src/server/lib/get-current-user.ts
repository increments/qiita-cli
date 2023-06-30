import { config } from "../../lib/config";
import { QiitaApi } from "../../qiita-api";

let currentUser: { id: string } | undefined;

export const getCurrentUser = async () => {
  if (currentUser) {
    return currentUser;
  }

  const { accessToken } = await config.getCredential();
  const qiitaApi = new QiitaApi({ token: accessToken });
  currentUser = await qiitaApi.authenticatedUser();

  return currentUser;
};
