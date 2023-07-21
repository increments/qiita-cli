import { getQiitaApiInstance } from "../../lib/get-qiita-api-instance";

let currentUser: { id: string } | undefined;

export const getCurrentUser = async () => {
  if (currentUser) {
    return currentUser;
  }

  const qiitaApi = await getQiitaApiInstance();
  currentUser = await qiitaApi.authenticatedUser();

  return currentUser;
};
