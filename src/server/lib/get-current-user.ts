import { config } from "../../lib/config";
import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";
import { QiitaApi } from "../../qiita-api";

let currentUser: { id: string } | undefined;

export const getCurrentUser = async () => {
  if (currentUser) {
    return currentUser;
  }

  const qiitaApi = await getQiitaApiInstance();
  currentUser = await qiitaApi.authenticatedUser();

  return currentUser;
};
