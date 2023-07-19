import { fetchLatestPackageVersion } from "./fetch-package-version";
import { getCacheData, setCacheData } from "./package-version-cache";

const CACHE_EXPIRE_TIME = 1000 * 60 * 60 * 12; // 12 hours

export const getLatestPackageVersion = async () => {
  const cacheData = getCacheData();
  const now = Date.now();

  if (cacheData) {
    const { lastCheckedAt, latestVersion } = cacheData;

    if (now - lastCheckedAt < CACHE_EXPIRE_TIME) {
      return latestVersion;
    }
  }

  const latestVersion = await fetchLatestPackageVersion();
  if (latestVersion) {
    setCacheData({
      lastCheckedAt: now,
      latestVersion,
    });
  }

  return latestVersion;
};
