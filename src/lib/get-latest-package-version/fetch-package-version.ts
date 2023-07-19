import { PackageSettings } from "../package-settings";

export const fetchLatestPackageVersion = async () => {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${PackageSettings.name}/latest`
    );
    const json = await response.json();
    const latestVersion = json.version as string;

    return latestVersion;
  } catch {
    return null;
  }
};
