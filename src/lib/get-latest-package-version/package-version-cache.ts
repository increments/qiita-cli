import fs from "node:fs";
import path from "node:path";
import { config } from "../config";

export interface CacheData {
  lastCheckedAt: number;
  latestVersion: string;
}

const CACHE_FILE_NAME = "latest-package-version";

const cacheFilePath = () => {
  const cacheDir = config.getCacheDataDir();
  return path.join(cacheDir, CACHE_FILE_NAME);
};

export const getCacheData = () => {
  const filePath = cacheFilePath();
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = fs.readFileSync(filePath, { encoding: "utf-8" });
  return JSON.parse(data) as CacheData;
};

export const setCacheData = (data: CacheData) => {
  const cacheDir = config.getCacheDataDir();
  const filePath = cacheFilePath();

  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), {
    encoding: "utf-8",
    mode: 0o600,
  });
};
