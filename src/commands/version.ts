import { PackageSettings } from "../lib/package-settings";

export const version = async () => {
  console.log(PackageSettings.version);
};
