import process from "node:process";
import { URL } from "node:url";

const getDomainName = () => {
  if (process.env.QIITA_DOMAIN) {
    return process.env.QIITA_DOMAIN;
  }

  return "qiita.com";
};

const getBaseUrl = () => {
  const domainName = getDomainName();
  return `https://${domainName}/`;
};

export const itemUrl = ({
  id,
  userId,
  secret = false,
}: {
  id: string;
  userId: string;
  secret?: boolean;
}) => {
  const baseUrl = getBaseUrl();
  const subdir = secret ? "private" : "items";
  const path = `/${userId}/${subdir}/${id}`;

  return new URL(path, baseUrl).toString();
};
