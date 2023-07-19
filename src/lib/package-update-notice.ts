import { getLatestPackageVersion } from "./get-latest-package-version";
import { PackageSettings } from "./package-settings";

export const packageUpdateNotice = async () => {
  const currentVersion = PackageSettings.version;
  const latestVersion = await getLatestPackageVersion();

  if (!latestVersion) {
    return null;
  }
  if (currentVersion === latestVersion) {
    return null;
  }

  const chalk = (await import("chalk")).default; // `chalk` supports only ESM.
  const boxen = (await import("boxen")).default; // `boxen` supports only ESM.

  let message = "新しいバージョンがあります! ";
  message += ` ${chalk.red(currentVersion)} -> ${chalk.green(latestVersion)}`;
  message += "\n";
  message += `${chalk.green(`npm install ${PackageSettings.name}@latest`)}`;
  message += " でアップデートできます!";

  message = boxen(message, { padding: 1, margin: 1, borderStyle: "round" });

  return message;
};
