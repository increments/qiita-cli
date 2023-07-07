import arg from "arg";
import process from "node:process";
import readline from "node:readline/promises";
import { config } from "../lib/config";
import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { QiitaApi } from "../qiita-api";

export const login = async (argv: string[]) => {
  const args = arg({}, { argv });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const token = await rl.question("Enter your token: ");
  rl.close();

  const qiitaApi = await getQiitaApiInstance({ token });
  const currentUser = await qiitaApi.authenticatedUser();

  await config.setCredential({
    name: "qiita",
    accessToken: token,
  });

  console.log(`Hi ${currentUser.id}!`);
};
